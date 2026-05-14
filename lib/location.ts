import type { LocationData } from '@/types'

export async function reverseGeocode(lat: number, lng: number): Promise<LocationData> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=id`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'PANTAU62-SmartCity/1.0' },
  })

  if (!res.ok) throw new Error('Gagal mengambil data lokasi')

  const data = await res.json()
  const addr = data.address || {}

  const province =
    addr.state || addr.province || addr.region || ''
  const city =
    addr.city || addr.regency || addr.county || addr.town || addr.municipality || ''
  const district =
    addr.suburb || addr.district || addr.subdistrict || addr.quarter || ''
  const subdistrict =
    addr.village || addr.neighbourhood || addr.hamlet || ''
  const postal_code = addr.postcode || ''

  const parts = [subdistrict, district, city, province].filter(Boolean)
  const full_address = data.display_name || parts.join(', ')

  return {
    province,
    city,
    district,
    subdistrict,
    postal_code,
    full_address,
    latitude: lat,
    longitude: lng,
  }
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation tidak didukung browser ini'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    })
  })
}

export async function detectLocation(): Promise<LocationData> {
  const position = await getCurrentPosition()
  const { latitude, longitude } = position.coords
  return reverseGeocode(latitude, longitude)
}
