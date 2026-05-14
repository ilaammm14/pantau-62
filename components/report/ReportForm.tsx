'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Loader2, CheckCircle, Brain, Sparkles, ImageIcon, AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import LocationPicker from '@/components/location/LocationPicker'
import { createClient } from '@/lib/supabase/client'
import { calculateAIScore, analyzeImageMeta } from '@/lib/ai-scoring'
import { categoryLabels, priorityConfig } from '@/lib/utils'
import type { ReportCategory, LocationData } from '@/types'

export default function ReportForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<ReportCategory | ''>('')
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [aiPreview, setAiPreview] = useState<{ score: number; priority: string } | null>(null)
  const [imageAnalyzing, setImageAnalyzing] = useState(false)
  const [imageAnalysis, setImageAnalysis] = useState<{
    detectedCategory: string | null
    severityHint: 'high' | 'medium' | 'low'
    scoreBonus: number
    notes: string[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Re-run AI preview whenever any relevant field changes
  useEffect(() => {
    updateAIPreview()
  }, [image, category, description, locationData]) // eslint-disable-line react-hooks/exhaustive-deps

  const processImage = useCallback(async (file: File) => {
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
    setImageAnalyzing(true)
    setImageAnalysis(null)

    // Simulate analysis delay (feels like real processing)
    await new Promise(r => setTimeout(r, 1200))

    const result = analyzeImageMeta(file)
    setImageAnalysis(result)
    setImageAnalyzing(false)

    // Auto-suggest category if detected and not yet set
    if (result.detectedCategory && !category) {
      setCategory(result.detectedCategory as ReportCategory)
    }
  }, [category])

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) processImage(file)
  }, [processImage])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processImage(file)
  }

  const handleRemoveImage = () => {
    setImage(null)
    setImagePreview(null)
    setImageAnalysis(null)
    setImageAnalyzing(false)
  }

  const updateAIPreview = (
    desc = description,
    cat = category,
    loc = locationData?.full_address || '',
    hasImg = !!image
  ) => {
    if (desc || cat || hasImg) {
      const result = calculateAIScore(desc, loc, hasImg, cat)
      // Add image score bonus if analysis is done
      if (imageAnalysis && hasImg) {
        result.score += imageAnalysis.scoreBonus - 1 // -1 because calculateAIScore already adds 1 for hasImage
        if (result.score >= 6) result.priority = 'high'
        else if (result.score >= 3) result.priority = 'medium'
        else result.priority = 'low'
      }
      setAiPreview(result)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category) return
    if (!locationData) { setError('Silakan pilih lokasi terlebih dahulu.'); return }
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { score, priority } = calculateAIScore(
        description, locationData.full_address, !!image, category
      )

      let imageUrl = null
      if (image) {
        const ext = image.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('report-images').upload(fileName, image)
        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('report-images').getPublicUrl(fileName)
          imageUrl = publicUrl
        }
      }

      const basePayload = {
        user_id: user.id,
        title,
        description,
        category,
        image_url: imageUrl,
        location: locationData.full_address,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        priority,
        status: 'pending',
        ai_score: score,
      }

      const extendedPayload = {
        ...basePayload,
        province: locationData.province,
        city: locationData.city,
        district: locationData.district,
        subdistrict: locationData.subdistrict,
        postal_code: locationData.postal_code,
        full_address: locationData.full_address,
      }

      let { error: insertError } = await supabase.from('reports').insert(extendedPayload)
      if (insertError?.message?.includes('schema cache') || insertError?.message?.includes('column')) {
        const fallback = await supabase.from('reports').insert(basePayload)
        insertError = fallback.error
      }

      if (insertError) throw insertError

      await supabase.from('notifications').insert({
        user_id: user.id,
        message: `Laporan "${title}" berhasil dikirim dengan prioritas ${priority.toUpperCase()} di ${locationData.city || locationData.full_address}.`,
      })

      setSuccess(true)
      setTimeout(() => router.push('/my-reports'), 2000)
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Laporan Terkirim!</h3>
        <p className="text-slate-400">AI sedang menganalisis laporan Anda...</p>
        {locationData && (
          <p className="text-xs text-slate-500 mt-2">
            📍 {locationData.city}, {locationData.province}
          </p>
        )}
      </motion.div>
    )
  }

  const severityColors = {
    high: 'text-red-400 border-red-500/30 bg-red-500/5',
    medium: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5',
    low: 'text-green-400 border-green-500/30 bg-green-500/5',
  }

  const severityIcons = {
    high: <AlertTriangle className="w-3.5 h-3.5" />,
    medium: <Info className="w-3.5 h-3.5" />,
    low: <CheckCircle className="w-3.5 h-3.5" />,
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Foto Masalah</Label>
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleImageDrop}
          onClick={() => !imagePreview && fileInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden ${
            imagePreview ? 'cursor-default' : 'cursor-pointer'
          } ${
            isDragging ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-600 hover:border-slate-500 bg-slate-800/30'
          }`}
        >
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          <AnimatePresence mode="wait">
            {imagePreview ? (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                {/* Analyzing overlay */}
                <AnimatePresence>
                  {imageAnalyzing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3"
                    >
                      <div className="relative">
                        <Brain className="w-8 h-8 text-cyan-400" />
                        <motion.div
                          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                          className="absolute inset-0 rounded-full bg-cyan-400/20"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-cyan-400">AI menganalisis gambar...</p>
                        <p className="text-xs text-slate-400 mt-1">Mendeteksi kondisi & tingkat keparahan</p>
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                            className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); handleRemoveImage() }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/80 flex items-center justify-center hover:bg-red-500 transition-colors z-10"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </motion.div>
            ) : (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-10">
                <Upload className="w-10 h-10 text-slate-500 mb-3" />
                <p className="text-slate-400 text-sm">Drag & drop foto atau klik untuk upload</p>
                <p className="text-slate-600 text-xs mt-1">PNG, JPG, WEBP (max 10MB)</p>
                <div className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs text-cyan-400">AI akan menganalisis foto secara otomatis</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Image Analysis Result */}
        <AnimatePresence>
          {imageAnalysis && !imageAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`rounded-xl border p-3 ${severityColors[imageAnalysis.severityHint]}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Hasil Analisis Gambar AI</span>
                <div className="ml-auto flex items-center gap-1">
                  {severityIcons[imageAnalysis.severityHint]}
                  <span className="text-xs font-bold uppercase">{imageAnalysis.severityHint}</span>
                </div>
              </div>
              <ul className="space-y-1">
                {imageAnalysis.notes.map((note, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                    <span className="mt-0.5 text-current opacity-60">•</span>
                    {note}
                  </li>
                ))}
              </ul>
              {imageAnalysis.detectedCategory && (
                <div className="mt-2 pt-2 border-t border-current/10 text-xs">
                  Kategori terdeteksi:{' '}
                  <span className="font-semibold">{categoryLabels[imageAnalysis.detectedCategory as ReportCategory] ?? imageAnalysis.detectedCategory}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Judul Laporan</Label>
        <Input
          id="title"
          placeholder="Contoh: Sampah menumpuk di Jl. Sudirman"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Kategori Masalah</Label>
        <Select value={category} onValueChange={v => setCategory(v as ReportCategory)}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih kategori..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          placeholder="Jelaskan masalah secara detail. Semakin detail, semakin akurat analisis AI..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="min-h-[120px]"
          required
        />
      </div>

      {/* Smart Location */}
      <div className="space-y-2">
        <Label>Lokasi Masalah</Label>
        <LocationPicker
          onLocationChange={(loc) => setLocationData(loc)}
        />
      </div>

      {/* AI Preview */}
      <AnimatePresence>
        {aiPreview && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">AI Score Preview</span>
              {image && (
                <span className="ml-auto flex items-center gap-1 text-xs text-cyan-500/70">
                  <ImageIcon className="w-3 h-3" />
                  Foto diperhitungkan
                </span>
              )}
            </div>
            <div className="flex items-center gap-6">
              <div>
                <div className="text-xs text-slate-500">AI Score</div>
                <div className="text-lg font-bold text-white">{aiPreview.score}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Prioritas</div>
                <div className={`text-sm font-bold ${priorityConfig[aiPreview.priority as keyof typeof priorityConfig]?.color}`}>
                  {aiPreview.priority.toUpperCase()}
                </div>
              </div>
              {locationData?.province && (
                <div>
                  <div className="text-xs text-slate-500">Wilayah</div>
                  <div className="text-sm text-slate-300">{locationData.city || locationData.province}</div>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-3">
              Skor dihitung dari deskripsi, kategori, lokasi, dan foto yang diunggah.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Mengirim Laporan...</> : 'Kirim Laporan'}
      </Button>
    </form>
  )
}
