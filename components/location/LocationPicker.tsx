'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Loader2, AlertCircle, Navigation, RefreshCw, Search, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { detectLocation, reverseGeocode } from '@/lib/location'
import type { LocationData } from '@/types'

interface LocationPickerProps {
  onLocationChange: (location: LocationData | null) => void
  initialLocation?: LocationData | null
}

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address: {
    road?: string
    suburb?: string
    village?: string
    subdistrict?: string
    city_district?: string
    district?: string
    city?: string
    county?: string
    state?: string
    postcode?: string
    country?: string
  }
  type: string
  class: string
}

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function LocationPicker({ onLocationChange, initialLocation }: LocationPickerProps) {
  const [mode, setMode] = useState<'auto' | 'manual'>('auto')
  const [status, setStatus] = useState<'idle' | 'detecting' | 'success' | 'denied' | 'error'>('idle')
  const [location, setLocation] = useState<LocationData | null>(initialLocation || null)

  // Manual search state
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<NominatimResult | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Map state
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  const debouncedQuery = useDebounce(searchQuery, 400)

  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation)
      setStatus('success')
    }
  }, [])

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Fetch Nominatim suggestions
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 3 || mode !== 'manual') {
      setSuggestions([])
      return
    }
    const fetchSuggestions = async () => {
      setSearchLoading(true)
      try {
        // Bias search toward Indonesia (Sulawesi Tenggara / Kendari area)
        const params = new URLSearchParams({
          q: debouncedQuery,
          format: 'json',
          addressdetails: '1',
          limit: '8',
          countrycodes: 'id',
          'accept-language': 'id',
        })
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          { headers: { 'User-Agent': 'Pantau62App/1.0' } }
        )
        const data: NominatimResult[] = await res.json()
        setSuggestions(data)
        setShowSuggestions(data.length > 0)
      } catch {
        setSuggestions([])
      } finally {
        setSearchLoading(false)
      }
    }
    fetchSuggestions()
  }, [debouncedQuery, mode])

  // Init map only once when location first becomes available
  useEffect(() => {
    if (status === 'success' && location && mapRef.current && !mapInstanceRef.current) {
      initMap(location.latitude, location.longitude)
    }
  }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update marker + view when location changes but map already exists
  useEffect(() => {
    if (location && mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([location.latitude, location.longitude])
      mapInstanceRef.current.setView([location.latitude, location.longitude], 16)
      // Force Leaflet to recalculate tile layout after any DOM reflow
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 50)
    }
  }, [location])

  const initMap = async (lat: number, lng: number) => {
    if (typeof window === 'undefined' || !mapRef.current) return
    const L = (await import('leaflet')).default
    await import('leaflet/dist/leaflet.css')

    // Guard: don't init twice
    if (mapInstanceRef.current) return

    const map = L.map(mapRef.current, { center: [lat, lng], zoom: 16, zoomControl: true })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map)

    const icon = L.divIcon({
      html: `<div style="width:20px;height:20px;background:#06b6d4;border:3px solid white;border-radius:50%;box-shadow:0 0 12px #06b6d480;cursor:grab"></div>`,
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })

    const marker = L.marker([lat, lng], { icon, draggable: true }).addTo(map)
    markerRef.current = marker
    mapInstanceRef.current = map

    // After map is mounted, invalidate size so tiles render correctly
    setTimeout(() => map.invalidateSize(), 100)

    marker.on('dragend', async () => {
      const pos = marker.getLatLng()
      try {
        const newLoc = await reverseGeocode(pos.lat, pos.lng)
        // Update state without changing status (keeps map visible)
        setLocation(newLoc)
        onLocationChange(newLoc)
        if (mode === 'manual') setSearchQuery(newLoc.full_address)
      } catch {
        // silently ignore — marker stays at dragged position
      }
    })

    map.on('click', async (e: any) => {
      marker.setLatLng(e.latlng)
      try {
        const newLoc = await reverseGeocode(e.latlng.lat, e.latlng.lng)
        setLocation(newLoc)
        onLocationChange(newLoc)
        if (mode === 'manual') setSearchQuery(newLoc.full_address)
      } catch {
        // silently ignore
      }
    })
  }

  const handleDetect = async () => {
    setStatus('detecting')
    try {
      const loc = await detectLocation()
      setLocation(loc)
      onLocationChange(loc)
      setStatus('success')
    } catch (err: any) {
      if (err.code === 1) {
        setStatus('denied')
      } else {
        setStatus('error')
      }
    }
  }

  const handleSelectSuggestion = async (result: NominatimResult) => {
    setShowSuggestions(false)
    setSelectedSuggestion(result)
    setSearchQuery(result.display_name)

    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    const addr = result.address

    // Build structured LocationData from Nominatim address
    const loc: LocationData = {
      province: addr.state || '',
      city: addr.city || addr.county || addr.district || '',
      district: addr.city_district || addr.district || addr.subdistrict || '',
      subdistrict: addr.suburb || addr.village || addr.subdistrict || '',
      postal_code: addr.postcode || '',
      full_address: result.display_name,
      latitude: lat,
      longitude: lng,
    }

    setLocation(loc)
    onLocationChange(loc)
    setStatus('success')
    // Map init or pan is handled by useEffect watchers above
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSuggestions([])
    setSelectedSuggestion(null)
    setShowSuggestions(false)
    setLocation(null)
    onLocationChange(null)
    setStatus('idle')
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
      markerRef.current = null
    }
  }

  const switchMode = (newMode: 'auto' | 'manual') => {
    setMode(newMode)
    setStatus('idle')
    setLocation(null)
    onLocationChange(null)
    setSearchQuery('')
    setSuggestions([])
    setSelectedSuggestion(null)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
      markerRef.current = null
    }
  }

  // Format suggestion label for display
  const formatSuggestionLabel = (result: NominatimResult) => {
    const addr = result.address
    const parts = [
      addr.road,
      addr.suburb || addr.village,
      addr.city_district || addr.district,
      addr.city || addr.county,
      addr.state,
    ].filter(Boolean)
    return parts.join(', ') || result.display_name
  }

  const formatSuggestionSub = (result: NominatimResult) => {
    const addr = result.address
    return [addr.city || addr.county, addr.state].filter(Boolean).join(', ')
  }

  return (
    <div className="space-y-3">
      {/* Mode Toggle */}
      <div className="flex rounded-xl overflow-hidden border border-slate-700/50 bg-slate-800/30">
        <button
          type="button"
          onClick={() => switchMode('auto')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all ${
            mode === 'auto'
              ? 'bg-cyan-500/20 text-cyan-400 border-r border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-300 border-r border-slate-700/50'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          Deteksi Otomatis
        </button>
        <button
          type="button"
          onClick={() => switchMode('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all ${
            mode === 'manual'
              ? 'bg-cyan-500/20 text-cyan-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          Input Manual
        </button>
      </div>

      {/* AUTO MODE */}
      {mode === 'auto' && (
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                onClick={handleDetect}
              >
                <Navigation className="w-4 h-4" />
                Deteksi Lokasi Otomatis
              </Button>
            </motion.div>
          )}

          {status === 'detecting' && (
            <motion.div
              key="detecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5"
            >
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0" />
              <span className="text-sm text-cyan-400">📍 Mengambil lokasi Anda...</span>
            </motion.div>
          )}

          {status === 'denied' && (
            <motion.div
              key="denied"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3 px-4 py-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5"
            >
              <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-400">
                Lokasi tidak diizinkan. Gunakan <button type="button" onClick={() => switchMode('manual')} className="underline font-medium">Input Manual</button>.
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-400">Gagal mengambil lokasi.</span>
              <button type="button" onClick={handleDetect} className="ml-auto text-xs text-cyan-400 hover:underline">
                Coba lagi
              </button>
            </motion.div>
          )}

          {status === 'success' && location && (
            <LocationResult location={location} onReset={handleDetect} mapRef={mapRef} />
          )}
        </AnimatePresence>
      )}

      {/* MANUAL MODE */}
      {mode === 'manual' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {/* Search input with autocomplete */}
          <div ref={searchRef} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari jalan, kelurahan, kecamatan, kota..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 animate-spin" />
              )}
              {searchQuery && !searchLoading && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-50 w-full mt-1 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
                >
                  <div className="max-h-64 overflow-y-auto">
                    {suggestions.map((result, i) => (
                      <button
                        key={result.place_id}
                        type="button"
                        onClick={() => handleSelectSuggestion(result)}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors flex items-start gap-3 ${
                          i < suggestions.length - 1 ? 'border-b border-slate-800' : ''
                        }`}
                      >
                        <MapPin className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm text-slate-200 font-medium truncate">
                            {formatSuggestionLabel(result)}
                          </div>
                          <div className="text-xs text-slate-500 truncate mt-0.5">
                            {formatSuggestionSub(result)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/80">
                    <p className="text-xs text-slate-600">Data lokasi dari OpenStreetMap</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hint text */}
          {!searchQuery && (
            <p className="text-xs text-slate-500 text-center">
              Ketik nama jalan, kelurahan, kecamatan, atau kota untuk mencari lokasi
            </p>
          )}

          {/* Status feedback */}
          {status === 'detecting' && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="text-sm text-cyan-400">Memuat lokasi...</span>
            </div>
          )}

          {/* Result */}
          {status === 'success' && location && (
            <LocationResult
              location={location}
              onReset={handleClearSearch}
              mapRef={mapRef}
              resetLabel="Ganti Lokasi"
            />
          )}
        </motion.div>
      )}
    </div>
  )
}

// Shared location result display + map
function LocationResult({
  location,
  onReset,
  mapRef,
  resetLabel = 'Deteksi Ulang',
}: {
  location: LocationData
  onReset: () => void
  mapRef: React.RefObject<HTMLDivElement | null>
  resetLabel?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Address summary */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-green-500/20 bg-green-500/5">
        <MapPin className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm text-green-400 font-medium">
            📍 {[location.subdistrict, location.district, location.city, location.province].filter(Boolean).join(', ')}
          </div>
          <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{location.full_address}</div>
          <div className="text-xs text-slate-600 mt-0.5 font-mono">
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-slate-500 hover:text-cyan-400 transition-colors flex-shrink-0"
          title={resetLabel}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Location detail grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          { label: 'Provinsi', value: location.province },
          { label: 'Kota/Kab', value: location.city },
          { label: 'Kecamatan', value: location.district },
          { label: 'Kelurahan', value: location.subdistrict },
        ].map(item => item.value ? (
          <div key={item.label} className="px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="text-slate-500">{item.label}</div>
            <div className="text-slate-300 font-medium truncate">{item.value}</div>
          </div>
        ) : null)}
      </div>

      {/* Map */}
      <div
        ref={mapRef}
        className="w-full h-52 rounded-xl border border-slate-700/50 overflow-hidden"
      />
      <p className="text-xs text-slate-500 text-center">
        Klik peta atau geser marker untuk menyesuaikan titik lokasi
      </p>
    </motion.div>
  )
}
