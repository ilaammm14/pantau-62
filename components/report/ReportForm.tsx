'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, X, Loader2, CheckCircle, Brain, Sparkles,
  AlertTriangle, Info, Shield, Zap, Eye, Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import LocationPicker from '@/components/location/LocationPicker'
import { createClient } from '@/lib/supabase/client'
import { analyzeImageVisual } from '@/lib/ai-scoring'
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
  const [imageAnalyzing, setImageAnalyzing] = useState(false)

  // ── AI result is LOCKED after image upload — never changes from text input ──
  const [lockedAI, setLockedAI] = useState<{
    score: number
    priority: string
    confidence: number
    detectedCategory: ReportCategory | null
    visualSummary: string
    detectedObjects: string[]
    severityLevel: string
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const processImage = useCallback(async (file: File) => {
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
    setImageAnalyzing(true)
    setLockedAI(null)

    // Realistic analysis delay
    await new Promise(r => setTimeout(r, 1800))

    const result = await analyzeImageVisual(file)

    // LOCK the AI result — will not change regardless of other form fields
    setLockedAI({
      score: result.score,
      priority: result.priority,
      confidence: result.confidence,
      detectedCategory: result.detectedCategory,
      visualSummary: result.visualSummary,
      detectedObjects: result.detectedObjects,
      severityLevel: result.severityLevel,
    })

    // Auto-suggest category if detected and not yet set
    if (result.detectedCategory && !category) {
      setCategory(result.detectedCategory)
    }

    setImageAnalyzing(false)
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
    setLockedAI(null)
    setImageAnalyzing(false)
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

      // Use LOCKED AI score if available, otherwise fallback
      const finalScore = lockedAI?.score ?? 30
      const finalPriority = lockedAI?.priority ?? 'low'

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
        priority: finalPriority,
        status: 'pending',
        ai_score: finalScore,
        // Extended AI fields
        ai_confidence: lockedAI?.confidence ?? null,
        ai_detected_category: lockedAI?.detectedCategory ?? null,
        ai_visual_summary: lockedAI?.visualSummary ?? null,
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
        message: `Laporan "${title}" berhasil dikirim dengan prioritas ${String(finalPriority).toUpperCase()} di ${locationData.city || locationData.full_address}.`,
      })

      setSuccess(true)
      setTimeout(() => router.push('/my-reports'), 2500)
    } catch (err: unknown) {
      setError((err as Error).message || 'Terjadi kesalahan. Coba lagi.')
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
        <div className="relative mb-6">
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full bg-green-500/20 blur-xl"
          />
          <div className="relative w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Laporan Terkirim!</h3>
        <p className="text-slate-400">AI sedang memproses laporan Anda...</p>
        {lockedAI && (
          <div className="mt-4 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <span className="text-xs text-cyan-400">
              AI Score: {lockedAI.score}/100 · Priority: {String(lockedAI.priority).toUpperCase()}
            </span>
          </div>
        )}
      </motion.div>
    )
  }

  const severityGlow = {
    critical: 'shadow-red-500/20 border-red-500/40 bg-red-500/5',
    high: 'shadow-orange-500/20 border-orange-500/40 bg-orange-500/5',
    medium: 'shadow-yellow-500/20 border-yellow-500/40 bg-yellow-500/5',
    low: 'shadow-green-500/20 border-green-500/40 bg-green-500/5',
  }

  const severityTextColor = {
    critical: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-yellow-400',
    low: 'text-green-400',
  }

  const severityBg = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Image Upload ─────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Foto Masalah
          <span className="text-xs text-cyan-400 font-normal flex items-center gap-1">
            <Brain className="w-3 h-3" /> AI akan menganalisis foto ini
          </span>
        </Label>
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleImageDrop}
          onClick={() => !imagePreview && fileInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden ${
            imagePreview ? 'cursor-default' : 'cursor-pointer'
          } ${
            isDragging
              ? 'border-cyan-400 bg-cyan-500/10'
              : 'border-slate-600 hover:border-slate-500 bg-slate-800/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <AnimatePresence mode="wait">
            {imagePreview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative"
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-52 object-cover"
                />

                {/* Analyzing overlay */}
                <AnimatePresence>
                  {imageAnalyzing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
                    >
                      {/* Scanning grid effect */}
                      <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                          animate={{ y: ['-100%', '200%'] }}
                          transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                          className="w-full h-1/3 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent"
                        />
                      </div>

                      <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className="relative">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                            className="w-14 h-14 rounded-full border-2 border-cyan-500/30 border-t-cyan-400"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Brain className="w-6 h-6 text-cyan-400" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-cyan-400">
                            SMART VISUAL AI
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Menganalisis tingkat keparahan...
                          </p>
                        </div>
                        <div className="flex gap-1.5">
                          {['Deteksi objek', 'Analisis severity', 'Hitung score'].map(
                            (step, i) => (
                              <motion.div
                                key={step}
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 1.2,
                                  delay: i * 0.4,
                                }}
                                className="text-xs text-cyan-500/70 font-mono"
                              >
                                {step}
                                {i < 2 && (
                                  <span className="mx-1 text-slate-600">›</span>
                                )}
                              </motion.div>
                            )
                          )}
                        </div>
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
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-700/50 border border-slate-600 flex items-center justify-center mb-3">
                  <Upload className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-300 text-sm font-medium">
                  Drag & drop foto atau klik untuk upload
                </p>
                <p className="text-slate-600 text-xs mt-1">PNG, JPG, WEBP (max 10MB)</p>
                <div className="flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs text-cyan-400">
                    AI menganalisis foto secara otomatis
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── AI Analysis Result Card (LOCKED) ─────────────────────────── */}
        <AnimatePresence>
          {lockedAI && !imageAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={`relative rounded-2xl border shadow-lg overflow-hidden ${
                severityGlow[lockedAI.severityLevel as keyof typeof severityGlow] ??
                severityGlow.low
              }`}
            >
              {/* Animated glow border */}
              <motion.div
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className={`absolute inset-0 rounded-2xl border ${
                  lockedAI.severityLevel === 'critical'
                    ? 'border-red-500/50'
                    : lockedAI.severityLevel === 'high'
                    ? 'border-orange-500/50'
                    : lockedAI.severityLevel === 'medium'
                    ? 'border-yellow-500/50'
                    : 'border-green-500/50'
                } pointer-events-none`}
              />

              <div className="relative p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Brain className="w-4 h-4 text-cyan-400" />
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 rounded-full bg-cyan-400/30"
                      />
                    </div>
                    <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase">
                      Smart Visual AI Analysis
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700">
                    <Shield className="w-3 h-3 text-cyan-400" />
                    <span className="text-xs text-slate-400 font-mono">LOCKED</span>
                  </div>
                </div>

                {/* Main metrics */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {/* AI Score */}
                  <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">AI Score</div>
                    <div
                      className={`text-2xl font-black ${
                        severityTextColor[
                          lockedAI.severityLevel as keyof typeof severityTextColor
                        ] ?? 'text-white'
                      }`}
                    >
                      {lockedAI.score}
                    </div>
                    <div className="text-xs text-slate-600">/100</div>
                  </div>

                  {/* Priority */}
                  <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">Priority</div>
                    <div
                      className={`text-sm font-black uppercase ${
                        severityTextColor[
                          lockedAI.severityLevel as keyof typeof severityTextColor
                        ] ?? 'text-white'
                      }`}
                    >
                      {lockedAI.severityLevel === 'critical'
                        ? 'CRITICAL'
                        : String(lockedAI.priority).toUpperCase()}
                    </div>
                    <div className="flex justify-center mt-1">
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className={`w-1.5 h-1.5 rounded-full ${
                          severityBg[
                            lockedAI.severityLevel as keyof typeof severityBg
                          ] ?? 'bg-slate-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">Confidence</div>
                    <div className="text-2xl font-black text-cyan-400">
                      {lockedAI.confidence}
                    </div>
                    <div className="text-xs text-slate-600">%</div>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>AI Confidence Level</span>
                    <span className="text-cyan-400">{lockedAI.confidence}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${lockedAI.confidence}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Detected category */}
                {lockedAI.detectedCategory && (
                  <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-slate-900/40 border border-slate-700/30">
                    <Target className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="text-xs text-slate-400">Kategori terdeteksi:</span>
                    <span className="text-xs font-semibold text-white">
                      {categoryLabels[lockedAI.detectedCategory] ??
                        lockedAI.detectedCategory}
                    </span>
                    <span className="ml-auto text-xs text-slate-600">auto-detect</span>
                  </div>
                )}

                {/* Visual summary */}
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-700/30 mb-3">
                  <div className="flex items-start gap-2">
                    <Eye className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {lockedAI.visualSummary}
                    </p>
                  </div>
                </div>

                {/* Detected objects */}
                <div className="flex flex-wrap gap-1.5">
                  {lockedAI.detectedObjects.map((obj, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400"
                    >
                      {obj}
                    </span>
                  ))}
                </div>

                {/* Lock notice */}
                <div className="mt-3 pt-3 border-t border-slate-700/30 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-cyan-500/60" />
                  <p className="text-xs text-slate-600">
                    Score dikunci berdasarkan analisis visual — tidak berubah saat mengisi form
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Title ────────────────────────────────────────────────────────── */}
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

      {/* ── Category ─────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label>
          Kategori Masalah
          {lockedAI?.detectedCategory && (
            <span className="ml-2 text-xs text-cyan-400 font-normal">
              (AI mendeteksi:{' '}
              {categoryLabels[lockedAI.detectedCategory] ?? lockedAI.detectedCategory})
            </span>
          )}
        </Label>
        <Select value={category} onValueChange={v => setCategory(v as ReportCategory)}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih kategori..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Description ──────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          placeholder="Jelaskan masalah secara detail. AI score sudah dikunci dari foto — deskripsi hanya sebagai informasi tambahan."
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="min-h-[120px]"
          required
        />
      </div>

      {/* ── Location ─────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label>Lokasi Masalah</Label>
        <LocationPicker onLocationChange={loc => setLocationData(loc)} />
      </div>

      {/* ── AI Score Summary (compact, shown when no full card) ──────────── */}
      {!lockedAI && image && !imageAnalyzing && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-3 flex items-center gap-3">
          <Brain className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-500">
            Upload foto untuk mendapatkan AI analysis
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={loading || imageAnalyzing}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Mengirim Laporan...
          </>
        ) : imageAnalyzing ? (
          <>
            <Brain className="w-4 h-4 animate-pulse mr-2" />
            AI sedang menganalisis...
          </>
        ) : (
          'Kirim Laporan'
        )}
      </Button>
    </form>
  )
}
