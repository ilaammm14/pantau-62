'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, MapPin, Brain, Clock, CheckCircle, Loader2,
  User, Mail, Shield, Target, Eye, Zap, BarChart3, Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { statusConfig, categoryLabels, formatDate } from '@/lib/utils'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { getAIRecommendation } from '@/lib/ai-scoring'
import type { Report, ReportStatus } from '@/types'
import dynamicImport from 'next/dynamic'

const ReportsMap = dynamicImport(() => import('@/components/map/ReportsMap'), { ssr: false })

export default function ReportDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const fetchReport = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('reports')
        .select(`
          *,
          users (
            id,
            full_name,
            email,
            role,
            avatar_url
          )
        `)
        .eq('id', id)
        .single()
      setReport(data as Report)
      setLoading(false)
    }
    fetchReport()
  }, [id])

  const updateStatus = async (status: ReportStatus) => {
    if (!report) return
    setUpdating(true)
    const supabase = createClient()
    await supabase.from('reports').update({ status }).eq('id', report.id)
    if (report.user_id) {
      await supabase.from('notifications').insert({
        user_id: report.user_id,
        message: `Laporan "${report.title}" telah diperbarui ke status: ${status}.`,
      })
    }
    setReport({ ...report, status })
    setUpdating(false)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="p-8 text-center text-slate-400">Laporan tidak ditemukan</div>
    )
  }

  const recommendation = getAIRecommendation({
    category: report.category,
    priority: report.priority,
    location: report.location,
    ai_score: report.ai_score,
  })

  // Determine severity level from ai_score (0–100 scale)
  const severityLevel =
    report.ai_score >= 78
      ? 'critical'
      : report.ai_score >= 58
      ? 'high'
      : report.ai_score >= 38
      ? 'medium'
      : 'low'

  const severityColor = {
    critical: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-yellow-400',
    low: 'text-green-400',
  }

  const severityBorder = {
    critical: 'border-red-500/30 bg-red-500/5',
    high: 'border-orange-500/30 bg-orange-500/5',
    medium: 'border-yellow-500/30 bg-yellow-500/5',
    low: 'border-green-500/30 bg-green-500/5',
  }

  const reporter = report.users

  return (
    <div className="p-4 lg:p-8 min-h-screen grid-bg">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 gap-2 -ml-2">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </Button>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* ── Main Column ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {report.image_url && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <img
                src={report.image_url}
                alt={report.title}
                className="w-full h-52 lg:h-72 object-cover rounded-2xl border border-slate-700/50"
              />
            </motion.div>
          )}

          {/* Report Info */}
          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <h1 className="text-lg lg:text-xl font-bold text-white mb-2 leading-tight">
                    {report.title}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{report.location}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <PriorityBadge priority={report.priority} />
                  <Badge
                    className={`${statusConfig[report.status].bg} ${statusConfig[report.status].color} border text-xs`}
                  >
                    {statusConfig[report.status].label}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Kategori</div>
                  <div className="text-xs lg:text-sm text-white">
                    {categoryLabels[report.category as keyof typeof categoryLabels]}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">AI Score</div>
                  <div className={`text-sm font-bold ${severityColor[severityLevel]}`}>
                    {report.ai_score}/100
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Dilaporkan</div>
                  <div className="text-xs text-white">{formatDate(report.created_at)}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-2">Deskripsi</div>
                <p className="text-sm text-slate-300 leading-relaxed">{report.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* ── Reporter Info Card ─────────────────────────────────────── */}
          <Card className="border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
                <User className="w-4 h-4 text-cyan-400" />
                Informasi Pelapor
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 lg:p-6">
              {reporter ? (
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {reporter.avatar_url ? (
                      <img
                        src={reporter.avatar_url}
                        alt={reporter.full_name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-600"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                        <span className="text-xl font-bold text-cyan-400">
                          {reporter.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <div className="font-semibold text-white text-sm">
                        {reporter.full_name || 'Pengguna Anonim'}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Shield className="w-3 h-3 text-slate-500" />
                        <span className="text-xs text-slate-500 capitalize">
                          {reporter.role || 'user'}
                        </span>
                      </div>
                    </div>

                    {reporter.email && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{reporter.email}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span>Dilaporkan: {formatDate(report.created_at)}</span>
                    </div>

                    {report.location && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{report.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Data pelapor tidak tersedia</div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      User ID: {report.user_id?.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Map */}
          {report.latitude && report.longitude && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
                  <MapPin className="w-4 h-4 text-cyan-400" /> Lokasi Kejadian
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 lg:p-6">
                <ReportsMap
                  reports={[report]}
                  height="220px"
                  showDetailButton={false}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* ── Smart AI Analysis Card ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className={`border ${severityBorder[severityLevel]} relative overflow-hidden`}>
              {/* Animated glow */}
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className={`absolute inset-0 pointer-events-none ${
                  severityLevel === 'critical'
                    ? 'bg-red-500/5'
                    : severityLevel === 'high'
                    ? 'bg-orange-500/5'
                    : severityLevel === 'medium'
                    ? 'bg-yellow-500/5'
                    : 'bg-green-500/5'
                }`}
              />

              <CardHeader className="pb-2 relative">
                <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
                  <div className="relative">
                    <Brain className="w-4 h-4 text-cyan-400" />
                    <motion.div
                      animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2.5 }}
                      className="absolute inset-0 rounded-full bg-cyan-400/30"
                    />
                  </div>
                  Smart AI Analysis
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 lg:p-6 relative space-y-4">
                {/* Score + Severity */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">AI Score</div>
                    <div className={`text-3xl font-black ${severityColor[severityLevel]}`}>
                      {report.ai_score}
                    </div>
                    <div className="text-xs text-slate-600">/100</div>
                  </div>
                  <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">Severity</div>
                    <div className={`text-sm font-black uppercase ${severityColor[severityLevel]}`}>
                      {severityLevel}
                    </div>
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className={`w-2 h-2 rounded-full mx-auto mt-1 ${
                        severityLevel === 'critical'
                          ? 'bg-red-500'
                          : severityLevel === 'high'
                          ? 'bg-orange-500'
                          : severityLevel === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Confidence */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-500 flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" /> AI Confidence
                    </span>
                    <span className="text-cyan-400 font-mono">
                      {report.ai_confidence ?? Math.min(97, report.ai_score + 12)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${report.ai_confidence ?? Math.min(97, report.ai_score + 12)}%`,
                      }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Detected category */}
                {report.ai_detected_category && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/50 border border-slate-700/30">
                    <Target className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-slate-500">Kategori Terdeteksi AI</div>
                      <div className="text-xs font-semibold text-white">
                        {categoryLabels[report.ai_detected_category as keyof typeof categoryLabels] ??
                          report.ai_detected_category}
                      </div>
                    </div>
                  </div>
                )}

                {/* Visual summary */}
                {report.ai_visual_summary && (
                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-700/30">
                    <div className="flex items-start gap-2">
                      <Eye className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Visual Analysis</div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {report.ai_visual_summary}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Recommendation */}
                <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                  <div className="flex items-start gap-2">
                    <Zap className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-cyan-400 font-semibold mb-1">
                        Rekomendasi AI
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Update Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm lg:text-base">Update Status</CardTitle>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 space-y-3">
              <Button
                className="w-full gap-2 text-sm"
                variant={report.status === 'processing' ? 'secondary' : 'default'}
                onClick={() => updateStatus('processing')}
                disabled={
                  report.status === 'processing' ||
                  report.status === 'resolved' ||
                  updating
                }
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
                Mark as Processing
              </Button>
              <Button
                className="w-full gap-2 text-sm bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30"
                onClick={() => updateStatus('resolved')}
                disabled={report.status === 'resolved' || updating}
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Resolve Report
              </Button>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm lg:text-base">Timeline Status</CardTitle>
            </CardHeader>
            <CardContent className="p-4 lg:p-6">
              <div className="space-y-4">
                {[
                  { status: 'pending', label: 'Laporan Diterima', done: true },
                  {
                    status: 'processing',
                    label: 'Sedang Diproses',
                    done:
                      report.status === 'processing' || report.status === 'resolved',
                  },
                  {
                    status: 'resolved',
                    label: 'Selesai Ditangani',
                    done: report.status === 'resolved',
                  },
                ].map(step => (
                  <div key={step.status} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.done
                          ? 'bg-green-500/20 border border-green-500/30'
                          : 'bg-slate-700/50 border border-slate-600'
                      }`}
                    >
                      {step.done ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-600" />
                      )}
                    </div>
                    <div className={`text-sm ${step.done ? 'text-white' : 'text-slate-500'}`}>
                      {step.label}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
