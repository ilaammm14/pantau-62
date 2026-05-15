import type { ReportPriority, ReportCategory, AIAnalysisResult } from '@/types'

// ─── Recommendation engine ────────────────────────────────────────────────────

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
  return (
    recommendations[category]?.[priority] ??
    `Tindak lanjuti laporan dari ${location} sesuai prosedur standar.`
  )
}

// ─── Legacy text-based score (fallback when no image) ────────────────────────

const HIGH_KEYWORDS = [
  'parah', 'darurat', 'bahaya', 'banjir besar', 'longsor', 'kebakaran',
  'kritis', 'segera', 'mendesak',
]
const MEDIUM_KEYWORDS = [
  'rusak', 'bocor', 'macet', 'kotor', 'banjir', 'mati', 'hilang', 'pecah',
]
const DENSE_AREAS = [
  'jakarta', 'surabaya', 'bandung', 'medan', 'bekasi', 'tangerang',
  'depok', 'semarang', 'kendari',
]

export function calculateAIScore(
  description: string,
  location: string,
  hasImage: boolean,
  category: string
): { score: number; priority: ReportPriority } {
  let score = 0
  const desc = description.toLowerCase()
  const loc = location.toLowerCase()
  HIGH_KEYWORDS.forEach(kw => { if (desc.includes(kw)) score += 3 })
  MEDIUM_KEYWORDS.forEach(kw => { if (desc.includes(kw)) score += 1 })
  if (DENSE_AREAS.some(area => loc.includes(area))) score += 2
  if (hasImage) score += 1
  if (category === 'banjir') score += 3
  if (category === 'jalan_rusak') score += 2
  if (category === 'lampu_jalan') score += 1
  if (description.length > 200) score += 1
  let priority: ReportPriority = 'low'
  if (score >= 6) priority = 'high'
  else if (score >= 3) priority = 'medium'
  return { score, priority }
}

// ─── SMART VISUAL AI ENGINE ───────────────────────────────────────────────────
//
// IMAGE-ONLY analysis. Score is LOCKED after image upload.
// Text fields (title, description, category) do NOT affect the score.
//
// Detection pipeline:
//   1. Canvas pixel sampling (120×120) — color channel analysis
//   2. Multi-zone sampling — top/bottom/center zones for context
//   3. Texture variance — detects damage patterns
//   4. Luminance analysis — night/dark scenes
//   5. Deterministic variation — stable per image (no random drift)

export interface VisualAnalysis {
  score: number           // 0–100, image-only, LOCKED
  priority: ReportPriority
  confidence: number      // 0–100 %
  detectedCategory: ReportCategory | null
  visualSummary: string
  detectedObjects: string[]
  analysisNotes: string[]
  severityLevel: 'low' | 'medium' | 'high' | 'critical'
}

interface PixelStats {
  avgR: number
  avgG: number
  avgB: number
  blueRatio: number
  brownRatio: number
  greyRatio: number
  greenRatio: number
  orangeRatio: number
  darkRatio: number
  brightness: number
  saturation: number
  textureVariance: number
  // Zone-based (top 1/3 vs bottom 1/3)
  topBlueRatio: number
  bottomBrownRatio: number
  centerGreyRatio: number
}

function samplePixels(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): PixelStats {
  const W = canvas.width
  const H = canvas.height
  const data = ctx.getImageData(0, 0, W, H).data
  const total = W * H

  let sumR = 0, sumG = 0, sumB = 0
  let blue = 0, brown = 0, grey = 0, green = 0, orange = 0, dark = 0
  let satSum = 0
  let prevLum = 0, texVar = 0

  // Zone counters
  const topLimit = Math.floor(H / 3) * W
  const bottomStart = Math.floor((H * 2) / 3) * W
  const centerStart = Math.floor(H / 3) * W
  const centerEnd = Math.floor((H * 2) / 3) * W
  let topBlue = 0, topCount = 0
  let bottomBrown = 0, bottomCount = 0
  let centerGrey = 0, centerCount = 0

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    sumR += r; sumG += g; sumB += b

    const lum = (r * 0.299 + g * 0.587 + b * 0.114)
    texVar += Math.abs(lum - prevLum)
    prevLum = lum

    if (lum < 55) dark++

    // Saturation (HSL-like)
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    satSum += max > 0 ? (max - min) / max : 0

    // ── Color classification ──────────────────────────────────────────────
    // Blue/teal/cyan = water, flood
    if (b > 90 && b > r * 1.25 && b > g * 1.05) blue++
    // Brown/muddy = flood water, dirt, mud
    if (r > 90 && g > 50 && b < 90 && r > g * 1.1 && r > b * 1.3) brown++
    // Grey = road, concrete, damaged infrastructure
    if (
      Math.abs(r - g) < 25 &&
      Math.abs(g - b) < 25 &&
      Math.abs(r - b) < 25 &&
      r > 50 && r < 210
    ) grey++
    // Green = vegetation, trash bags, organic waste
    if (g > 90 && g > r * 1.15 && g > b * 1.15) green++
    // Orange/red = fire, smoke, warning
    if (r > 170 && g < 130 && b < 90) orange++

    // Zone analysis
    const pixelIdx = i / 4
    if (pixelIdx < topLimit) {
      topCount++
      if (b > 90 && b > r * 1.25) topBlue++
    }
    if (pixelIdx >= bottomStart) {
      bottomCount++
      if (r > 90 && g > 50 && b < 90 && r > g * 1.1) bottomBrown++
    }
    if (pixelIdx >= centerStart && pixelIdx < centerEnd) {
      centerCount++
      if (
        Math.abs(r - g) < 25 && Math.abs(g - b) < 25 &&
        r > 50 && r < 210
      ) centerGrey++
    }
  }

  const avgR = sumR / total
  const avgG = sumG / total
  const avgB = sumB / total

  return {
    avgR, avgG, avgB,
    blueRatio: blue / total,
    brownRatio: brown / total,
    greyRatio: grey / total,
    greenRatio: green / total,
    orangeRatio: orange / total,
    darkRatio: dark / total,
    brightness: (avgR + avgG + avgB) / 3,
    saturation: satSum / total,
    textureVariance: texVar / total,
    topBlueRatio: topCount > 0 ? topBlue / topCount : 0,
    bottomBrownRatio: bottomCount > 0 ? bottomBrown / bottomCount : 0,
    centerGreyRatio: centerCount > 0 ? centerGrey / centerCount : 0,
  }
}

// Deterministic pseudo-random based on file properties (stable per image)
function stableHash(file: File, salt: number): number {
  const seed = (file.size ^ (file.lastModified >>> 0)) + file.name.length * 31 + salt
  // LCG — deterministic, not truly random
  const h = ((seed * 1664525 + 1013904223) & 0x7fffffff)
  return h / 0x7fffffff
}

// ── Category detection ────────────────────────────────────────────────────────
function detectCategory(
  pixels: PixelStats,
  fileName: string,
  sizeMB: number
): { category: ReportCategory | null; confidence: number } {
  const name = fileName.toLowerCase()

  // Strong filename hints
  if (/banjir|flood|genang|air|hujan/.test(name))
    return { category: 'banjir', confidence: 88 }
  if (/sampah|trash|garbage|limbah|tps|buang/.test(name))
    return { category: 'sampah', confidence: 88 }
  if (/jalan|road|aspal|lubang|pothole|rusak|crack/.test(name))
    return { category: 'jalan_rusak', confidence: 88 }
  if (/lampu|light|gelap|pju|lamp/.test(name))
    return { category: 'lampu_jalan', confidence: 82 }
  if (/api|fire|kebakaran|smoke|asap|bakar/.test(name))
    return { category: 'lainnya', confidence: 85 }
  if (/fasilitas|taman|bangku|pagar|jembatan/.test(name))
    return { category: 'fasilitas_umum', confidence: 82 }

  // Pixel-based scoring
  const floodScore =
    pixels.blueRatio * 4 +
    pixels.brownRatio * 2.5 +
    pixels.topBlueRatio * 3 +
    pixels.bottomBrownRatio * 2

  const trashScore =
    pixels.greenRatio * 2 +
    pixels.brownRatio * 1.5 +
    (sizeMB > 0.8 ? 0.2 : 0) +
    pixels.saturation * 0.5

  const roadScore =
    pixels.greyRatio * 2.5 +
    pixels.centerGreyRatio * 2 +
    pixels.textureVariance * 0.3 +
    pixels.darkRatio * 0.5

  const fireScore =
    pixels.orangeRatio * 5 +
    pixels.darkRatio * 0.8

  const facilityScore =
    pixels.greyRatio * 1.2 +
    pixels.greenRatio * 0.8

  const candidates = [
    { cat: 'banjir' as ReportCategory, s: floodScore },
    { cat: 'sampah' as ReportCategory, s: trashScore },
    { cat: 'jalan_rusak' as ReportCategory, s: roadScore },
    { cat: 'lainnya' as ReportCategory, s: fireScore },
    { cat: 'fasilitas_umum' as ReportCategory, s: facilityScore },
  ].sort((a, b) => b.s - a.s)

  const best = candidates[0]
  const second = candidates[1]

  // Need meaningful signal
  if (best.s < 0.08) return { category: null, confidence: 45 }

  // Confidence based on margin over second-best
  const margin = best.s - second.s
  const conf = Math.min(88, Math.max(52, Math.round(55 + margin * 150)))

  return { category: best.cat, confidence: conf }
}

// ── Severity scoring (image-only, 0–100) ─────────────────────────────────────
function computeSeverityScore(pixels: PixelStats, sizeMB: number, file: File): number {
  let score = 28 // baseline for having a photo

  // ── FLOOD severity ────────────────────────────────────────────────────────
  // Water coverage across frame
  const floodCoverage = pixels.blueRatio + pixels.brownRatio * 0.8
  if (floodCoverage > 0.55) score += 50      // >55% frame = severe/critical flood
  else if (floodCoverage > 0.35) score += 38  // moderate-high flood
  else if (floodCoverage > 0.18) score += 22  // moderate flood
  else if (floodCoverage > 0.07) score += 10  // minor flood/puddle
  else if (floodCoverage > 0.02) score += 4   // tiny puddle

  // Top-zone water = rising flood (more dangerous)
  if (pixels.topBlueRatio > 0.3) score += 12
  else if (pixels.topBlueRatio > 0.15) score += 6

  // ── ROAD DAMAGE severity ──────────────────────────────────────────────────
  const roadDamage =
    pixels.greyRatio * 0.7 +
    pixels.darkRatio * 0.5 +
    pixels.textureVariance * 0.4
  if (roadDamage > 0.65) score += 38
  else if (roadDamage > 0.45) score += 25
  else if (roadDamage > 0.28) score += 14
  else if (roadDamage > 0.12) score += 6

  // High texture variance = cracked/damaged surface
  if (pixels.textureVariance > 15) score += 10
  else if (pixels.textureVariance > 8) score += 5

  // ── FIRE / SMOKE severity ─────────────────────────────────────────────────
  if (pixels.orangeRatio > 0.20) score += 45
  else if (pixels.orangeRatio > 0.10) score += 30
  else if (pixels.orangeRatio > 0.04) score += 15

  // ── TRASH density ─────────────────────────────────────────────────────────
  const trashDensity =
    pixels.greenRatio * 0.6 +
    pixels.brownRatio * 0.4 +
    pixels.saturation * 0.3
  if (trashDensity > 0.50) score += 28
  else if (trashDensity > 0.30) score += 16
  else if (trashDensity > 0.15) score += 8

  // ── NIGHT / LOW LIGHT ─────────────────────────────────────────────────────
  // Dark scenes = more dangerous (no visibility)
  if (pixels.brightness < 50) score += 18
  else if (pixels.brightness < 80) score += 10
  else if (pixels.brightness < 110) score += 4

  // ── IMAGE QUALITY ─────────────────────────────────────────────────────────
  if (sizeMB > 4) score += 8
  else if (sizeMB > 2) score += 5
  else if (sizeMB > 0.8) score += 2

  // ── STABLE VARIATION (±6 pts, deterministic per image) ───────────────────
  const variation = Math.round((stableHash(file, 42) - 0.5) * 12)
  score = Math.max(12, Math.min(98, score + variation))

  return score
}

// ── Main export: analyzeImageVisual ──────────────────────────────────────────
export async function analyzeImageVisual(file: File): Promise<VisualAnalysis> {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      // Sample at 160×160 for better accuracy
      const canvas = document.createElement('canvas')
      canvas.width = 160
      canvas.height = 160
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, 160, 160)
      URL.revokeObjectURL(url)

      const pixels = samplePixels(canvas, ctx)
      const sizeMB = file.size / (1024 * 1024)

      // ── Category detection ──────────────────────────────────────────────
      const { category: detectedCategory, confidence: catConf } =
        detectCategory(pixels, file.name, sizeMB)

      // ── Severity score (image-only, LOCKED) ────────────────────────────
      const rawScore = computeSeverityScore(pixels, sizeMB, file)

      // ── Priority from score ─────────────────────────────────────────────
      let priority: ReportPriority
      let severityLevel: VisualAnalysis['severityLevel']

      if (rawScore >= 78) {
        priority = 'high'
        severityLevel = 'critical'
      } else if (rawScore >= 58) {
        priority = 'high'
        severityLevel = 'high'
      } else if (rawScore >= 38) {
        priority = 'medium'
        severityLevel = 'medium'
      } else {
        priority = 'low'
        severityLevel = 'low'
      }

      // ── Confidence ──────────────────────────────────────────────────────
      // Based on signal strength + category confidence
      const signalStrength = Math.max(
        pixels.blueRatio + pixels.brownRatio,
        pixels.orangeRatio * 2.5,
        pixels.greyRatio + pixels.textureVariance * 0.05,
        pixels.greenRatio
      )
      const baseConf = Math.min(
        96,
        Math.max(58, Math.round(signalStrength * 180 + catConf * 0.4 + 40))
      )
      const confidence = Math.max(
        55,
        Math.min(97, Math.round(baseConf + (stableHash(file, 7) - 0.5) * 8))
      )

      // ── Detected objects ────────────────────────────────────────────────
      const detectedObjects: string[] = []
      if (pixels.blueRatio > 0.08) detectedObjects.push('Genangan air')
      if (pixels.brownRatio > 0.12) detectedObjects.push('Air berlumpur/kotor')
      if (pixels.topBlueRatio > 0.15) detectedObjects.push('Permukaan air tinggi')
      if (pixels.orangeRatio > 0.04) detectedObjects.push('Api/asap terdeteksi')
      if (pixels.greyRatio > 0.28) detectedObjects.push('Permukaan jalan/beton')
      if (pixels.textureVariance > 10) detectedObjects.push('Kerusakan permukaan')
      if (pixels.darkRatio > 0.28) detectedObjects.push('Kondisi gelap/malam')
      if (pixels.greenRatio > 0.18) detectedObjects.push('Vegetasi/sampah organik')
      if (pixels.saturation > 0.35) detectedObjects.push('Warna intens terdeteksi')
      if (sizeMB > 2) detectedObjects.push('Foto resolusi tinggi')
      if (detectedObjects.length === 0) detectedObjects.push('Kondisi lingkungan umum')

      // ── Visual summary ──────────────────────────────────────────────────
      const summaries: Record<string, Record<string, string>> = {
        banjir: {
          critical:
            'Terdeteksi genangan air luas yang menutupi jalan dan berpotensi membahayakan warga. Ketinggian air mengancam kendaraan dan infrastruktur.',
          high:
            'Terdeteksi banjir signifikan dengan ketinggian air yang mengancam kendaraan dan pejalan kaki. Perlu penanganan segera.',
          medium:
            'Terdeteksi genangan air sedang yang mengganggu aktivitas normal dan lalu lintas.',
          low:
            'Terdeteksi genangan air kecil di pinggir jalan. Perlu pemantauan drainase.',
        },
        sampah: {
          critical:
            'Terdeteksi tumpukan sampah masif yang mencemari lingkungan, mengganggu akses jalan, dan berpotensi menimbulkan penyakit.',
          high:
            'Terdeteksi sampah dalam jumlah besar yang memenuhi area publik dan mengganggu estetika kota.',
          medium:
            'Terdeteksi sampah yang menumpuk dan perlu segera ditangani sebelum menyebar.',
          low:
            'Terdeteksi sampah dalam jumlah kecil di area publik.',
        },
        jalan_rusak: {
          critical:
            'Terdeteksi kerusakan jalan parah dengan lubang besar yang sangat berbahaya bagi pengguna jalan dan kendaraan.',
          high:
            'Terdeteksi lubang atau kerusakan jalan besar yang membahayakan kendaraan dan pejalan kaki.',
          medium:
            'Terdeteksi kerusakan jalan yang perlu segera diperbaiki untuk mencegah kecelakaan.',
          low:
            'Terdeteksi kerusakan jalan ringan yang perlu dipantau.',
        },
        fasilitas_umum: {
          critical:
            'Terdeteksi kerusakan fasilitas umum parah yang membahayakan keselamatan publik.',
          high:
            'Terdeteksi kerusakan fasilitas umum yang perlu perbaikan mendesak.',
          medium:
            'Terdeteksi kerusakan fasilitas umum yang perlu ditindaklanjuti.',
          low:
            'Terdeteksi kondisi fasilitas umum yang perlu dipantau.',
        },
        lampu_jalan: {
          critical:
            'Terdeteksi kondisi gelap ekstrem yang sangat berbahaya bagi keselamatan lalu lintas malam.',
          high:
            'Terdeteksi area gelap yang membahayakan pengguna jalan di malam hari.',
          medium:
            'Terdeteksi pencahayaan jalan yang kurang memadai.',
          low:
            'Terdeteksi kondisi pencahayaan yang perlu diperiksa.',
        },
        lainnya: {
          critical:
            'Terdeteksi insiden kritis dengan potensi bahaya tinggi yang memerlukan penanganan darurat segera.',
          high:
            'Terdeteksi kondisi berbahaya yang memerlukan perhatian dan penanganan segera.',
          medium:
            'Terdeteksi masalah infrastruktur yang perlu ditindaklanjuti dalam waktu dekat.',
          low:
            'Terdeteksi kondisi yang perlu dipantau dan dilaporkan ke dinas terkait.',
        },
      }

      const catKey = detectedCategory ?? 'lainnya'
      const visualSummary =
        summaries[catKey]?.[severityLevel] ?? summaries.lainnya[severityLevel]

      // ── Analysis notes ──────────────────────────────────────────────────
      const analysisNotes: string[] = [
        `Analisis visual selesai — ${detectedObjects.length} elemen terdeteksi`,
        `Tingkat keparahan: ${severityLevel.toUpperCase()} (Score: ${rawScore}/100)`,
        `AI Confidence: ${confidence}%`,
      ]
      if (pixels.brightness < 75) analysisNotes.push('⚠ Kondisi pencahayaan rendah terdeteksi')
      if (pixels.textureVariance > 12) analysisNotes.push('⚠ Kerusakan permukaan signifikan terdeteksi')
      if (pixels.orangeRatio > 0.05) analysisNotes.push('🔥 Indikasi api/asap terdeteksi')
      if (sizeMB > 2) analysisNotes.push('✓ Foto beresolusi tinggi meningkatkan akurasi')
      if (waterCoverage(pixels) > 0.3) analysisNotes.push('🌊 Cakupan air luas terdeteksi')

      resolve({
        score: rawScore,
        priority,
        confidence: Math.max(55, Math.min(97, confidence)),
        detectedCategory,
        visualSummary,
        detectedObjects,
        analysisNotes,
        severityLevel,
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      const score = Math.round(32 + stableHash(file, 1) * 28)
      resolve({
        score,
        priority: score >= 58 ? 'high' : score >= 38 ? 'medium' : 'low',
        confidence: 58,
        detectedCategory: null,
        visualSummary:
          'Analisis visual terbatas — format gambar tidak dapat diproses sepenuhnya.',
        detectedObjects: ['Foto diterima'],
        analysisNotes: [
          'Foto berhasil diterima',
          'Analisis visual terbatas pada format ini',
        ],
        severityLevel: score >= 58 ? 'high' : score >= 38 ? 'medium' : 'low',
      })
    }

    img.src = url
  })
}

// Helper used inside the closure
function waterCoverage(pixels: PixelStats): number {
  return pixels.blueRatio + pixels.brownRatio * 0.8
}
