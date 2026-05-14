'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Brain, Clock, CheckCircle, Loader2, AlertTriangle } from 'lucide-react'
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
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('reports').select('*, users(full_name, email)').eq('id', id).single()
      setReport(data)
      setLoading(false)
    }
    fetch()
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

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
    </div>
  )

  if (!report) return (
    <div className="p-8 text-center text-slate-400">Laporan tidak ditemukan</div>
  )

  const recommendation = getAIRecommendation({ category: report.category, priority: report.priority, location: report.location, ai_score: report.ai_score })

  return (
    <div className="p-8 min-h-screen grid-bg">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          {report.image_url && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <img src={report.image_url} alt={report.title} className="w-full h-64 object-cover rounded-2xl border border-slate-700/50" />
            </motion.div>
          )}

          {/* Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-xl font-bold text-white mb-2">{report.title}</h1>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <MapPin className="w-4 h-4" /> {report.location}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <PriorityBadge priority={report.priority} />
                  <Badge className={`${statusConfig[report.status].bg} ${statusConfig[report.status].color} border`}>
                    {statusConfig[report.status].label}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Kategori</div>
                  <div className="text-sm text-white">{categoryLabels[report.category as keyof typeof categoryLabels]}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">AI Score</div>
                  <div className="text-sm font-bold text-cyan-400">{report.ai_score}</div>
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

          {/* Map */}
          {report.latitude && report.longitude && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="w-4 h-4 text-cyan-400" /> Lokasi</CardTitle></CardHeader>
              <CardContent>
                <ReportsMap reports={[report]} height="250px" showDetailButton={false} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Recommendation */}
          <Card className="border-cyan-500/20 bg-cyan-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="w-4 h-4 text-cyan-400" /> AI Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300 leading-relaxed">{recommendation}</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="text-xs text-slate-500">Confidence Score:</div>
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                    style={{ width: `${Math.min(100, report.ai_score * 10)}%` }}
                  />
                </div>
                <div className="text-xs text-cyan-400">{Math.min(100, report.ai_score * 10)}%</div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader><CardTitle className="text-base">Update Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full gap-2"
                variant={report.status === 'processing' ? 'secondary' : 'default'}
                onClick={() => updateStatus('processing')}
                disabled={report.status === 'processing' || report.status === 'resolved' || updating}
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                Mark as Processing
              </Button>
              <Button
                className="w-full gap-2 bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30"
                onClick={() => updateStatus('resolved')}
                disabled={report.status === 'resolved' || updating}
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Resolve Report
              </Button>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader><CardTitle className="text-base">Timeline Status</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { status: 'pending', label: 'Laporan Diterima', done: true },
                  { status: 'processing', label: 'Sedang Diproses', done: report.status === 'processing' || report.status === 'resolved' },
                  { status: 'resolved', label: 'Selesai Ditangani', done: report.status === 'resolved' },
                ].map((step, i) => (
                  <div key={step.status} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-green-500/20 border border-green-500/30' : 'bg-slate-700/50 border border-slate-600'}`}>
                      {step.done ? <CheckCircle className="w-4 h-4 text-green-400" /> : <div className="w-2 h-2 rounded-full bg-slate-600" />}
                    </div>
                    <div className={`text-sm ${step.done ? 'text-white' : 'text-slate-500'}`}>{step.label}</div>
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
