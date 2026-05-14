import { ReportPriority } from '@/types'

const HIGH_KEYWORDS = ['parah', 'darurat', 'bahaya', 'banjir besar', 'longsor', 'kebakaran', 'kritis', 'segera', 'mendesak']
const MEDIUM_KEYWORDS = ['rusak', 'bocor', 'macet', 'kotor', 'banjir', 'mati', 'hilang', 'pecah']
const DENSE_AREAS = ['jakarta', 'surabaya', 'bandung', 'medan', 'bekasi', 'tangerang', 'depok', 'semarang', 'kendari']

export function calculateAIScore(
  description: string,
  location: string,
  hasImage: boolean,
  category: string
): { score: number; priority: ReportPriority } {
  let score = 0
  const desc = description.toLowerCase()
  const loc = location.toLowerCase()

  // Keyword scoring
  HIGH_KEYWORDS.forEach(kw => { if (desc.includes(kw)) score += 3 })
  MEDIUM_KEYWORDS.forEach(kw => { if (desc.includes(kw)) score += 1 })

  // Dense area bonus
  if (DENSE_AREAS.some(area => loc.includes(area))) score += 2

  // Image bonus
  if (hasImage) score += 1

  // Category scoring
  if (category === 'banjir') score += 3
  if (category === 'jalan_rusak') score += 2
  if (category === 'lampu_jalan') score += 1

  // Description length (detail = more serious)
  if (description.length > 200) score += 1

  // Determine priority
  let priority: ReportPriority = 'low'
  if (score >= 6) priority = 'high'
  else if (score >= 3) priority = 'medium'

  return { score, priority }
}

/**
 * Simulate AI image analysis based on file metadata.
 * Returns detected hints about the image content to enrich the AI preview.
 */
export function analyzeImageMeta(file: File): {
  detectedCategory: string | null
  severityHint: 'high' | 'medium' | 'low'
  scoreBonus: number
  notes: string[]
} {
  const name = file.name.toLowerCase()
  const sizeMB = file.size / (1024 * 1024)
  const notes: string[] = []
  let detectedCategory: string | null = null
  let severityHint: 'high' | 'medium' | 'low' = 'low'
  let scoreBonus = 1 // base bonus for having an image

  // Detect category hints from filename
  if (/banjir|flood|genang/.test(name)) { detectedCategory = 'banjir'; severityHint = 'high'; scoreBonus += 2 }
  else if (/sampah|trash|garbage|limbah/.test(name)) { detectedCategory = 'sampah'; severityHint = 'medium'; scoreBonus += 1 }
  else if (/jalan|road|aspal|lubang|pothole/.test(name)) { detectedCategory = 'jalan_rusak'; severityHint = 'medium'; scoreBonus += 1 }
  else if (/lampu|light|gelap/.test(name)) { detectedCategory = 'lampu_jalan'; severityHint = 'low'; scoreBonus += 1 }
  else if (/rusak|damage|hancur|parah|kritis/.test(name)) { severityHint = 'high'; scoreBonus += 2 }

  // Large file = likely high-res / detailed photo = more credible
  if (sizeMB > 2) { notes.push('Foto resolusi tinggi terdeteksi'); scoreBonus += 1 }
  else if (sizeMB > 0.5) { notes.push('Kualitas foto baik') }
  else { notes.push('Foto berhasil diproses') }

  // Severity notes
  if (severityHint === 'high') notes.push('Indikasi kondisi kritis terdeteksi')
  else if (severityHint === 'medium') notes.push('Kondisi memerlukan perhatian')
  else notes.push('Kondisi perlu ditindaklanjuti')

  notes.push('Bukti visual meningkatkan kredibilitas laporan')

  return { detectedCategory, severityHint, scoreBonus, notes }
}

export function getAIRecommendation(report: {
  category: string
  priority: ReportPriority
  location: string
  ai_score: number
}): string {
  const { category, priority, location } = report

  const recommendations: Record<string, Record<ReportPriority, string>> = {
    sampah: {
      high: `Area ${location} membutuhkan penanganan sampah SEGERA. Rekomendasikan pengerahan tim kebersihan darurat dalam 24 jam.`,
      medium: `Jadwalkan pengangkutan sampah tambahan di ${location} dalam 2-3 hari ke depan.`,
      low: `Masukkan ${location} dalam jadwal rutin pengangkutan sampah mingguan.`,
    },
    banjir: {
      high: `PERINGATAN KRITIS: Banjir di ${location} memerlukan evakuasi dan penanganan pompa air segera.`,
      medium: `Aktifkan tim siaga banjir di ${location}. Pantau debit air secara berkala.`,
      low: `Monitor kondisi drainase di ${location} dan lakukan pembersihan saluran air.`,
    },
    jalan_rusak: {
      high: `Jalan di ${location} dalam kondisi kritis. Pasang rambu peringatan dan perbaiki dalam 48 jam.`,
      medium: `Jadwalkan perbaikan jalan di ${location} dalam minggu ini.`,
      low: `Masukkan perbaikan jalan ${location} dalam anggaran pemeliharaan rutin.`,
    },
    fasilitas_umum: {
      high: `Fasilitas umum di ${location} perlu perbaikan mendesak untuk keselamatan publik.`,
      medium: `Koordinasikan perbaikan fasilitas umum di ${location} dengan dinas terkait.`,
      low: `Catat kerusakan fasilitas di ${location} untuk perbaikan terjadwal.`,
    },
    lampu_jalan: {
      high: `Lampu jalan mati di ${location} membahayakan keselamatan. Perbaiki dalam 24 jam.`,
      medium: `Jadwalkan penggantian lampu jalan di ${location} dalam 3 hari.`,
      low: `Masukkan penggantian lampu ${location} dalam jadwal pemeliharaan.`,
    },
    lainnya: {
      high: `Masalah di ${location} memerlukan perhatian segera dari dinas terkait.`,
      medium: `Koordinasikan penanganan masalah di ${location} dengan instansi terkait.`,
      low: `Catat dan tindaklanjuti laporan dari ${location} sesuai prosedur.`,
    },
  }

  return recommendations[category]?.[priority] ?? `Tindak lanjuti laporan dari ${location} sesuai prosedur standar.`
}
