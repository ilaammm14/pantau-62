'use client'

export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { MapPin, Plus, Bell, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { statusConfig, categoryLabels, formatDate } from '@/lib/utils'
import { PriorityBadge } from '@/components/ui/priority-badge'
import type { Report, Notification } from '@/types'

export default function MyReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const [{ data: rData }, { data: nData }] = await Promise.all([
        supabase.from('reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      ])

      if (rData) setReports(rData)
      if (nData) setNotifications(nData)
      setLoading(false)
    }
    fetch()
  }, [])

  const markRead = async (id: string) => {
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    processing: reports.filter(r => r.status === 'processing').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  }

  return (
    <main className="min-h-screen bg-[#020817] grid-bg">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Laporan Saya</h1>
            <p className="text-slate-400 text-sm mt-1">Pantau status semua laporan Anda</p>
          </div>
          <Link href="/report">
            <Button className="gap-2"><Plus className="w-4 h-4" /> Buat Laporan</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'text-cyan-400', bg: 'border-cyan-500/20 bg-cyan-500/5' },
            { label: 'Pending', value: stats.pending, color: 'text-yellow-400', bg: 'border-yellow-500/20 bg-yellow-500/5' },
            { label: 'Processing', value: stats.processing, color: 'text-blue-400', bg: 'border-blue-500/20 bg-blue-500/5' },
            { label: 'Resolved', value: stats.resolved, color: 'text-green-400', bg: 'border-green-500/20 bg-green-500/5' },
          ].map(s => (
            <Card key={s.label} className={`border ${s.bg}`}>
              <CardContent className="p-5 text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Reports list */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-2xl skeleton" />)
            ) : reports.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <div className="text-4xl mb-4">📋</div>
                <p>Belum ada laporan. Buat laporan pertama Anda!</p>
                <Link href="/report" className="mt-4 inline-block">
                  <Button className="mt-4 gap-2"><Plus className="w-4 h-4" /> Buat Laporan</Button>
                </Link>
              </div>
            ) : reports.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="hover:border-slate-600 transition-all">
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      {report.image_url ? (
                        <img src={report.image_url} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-700 flex items-center justify-center text-2xl flex-shrink-0">
                          {report.category === 'sampah' ? '🗑️' : report.category === 'banjir' ? '🌊' : report.category === 'jalan_rusak' ? '🚧' : '⚠️'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-white truncate">{report.title}</h3>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <PriorityBadge priority={report.priority} />
                            <Badge className={`${statusConfig[report.status].bg} ${statusConfig[report.status].color} border text-xs`}>
                              {statusConfig[report.status].label}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                          <MapPin className="w-3 h-3" /> {report.location}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-600">{formatDate(report.created_at)}</span>
                          <span className="text-xs text-cyan-400 font-mono">AI Score: {report.ai_score}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Notifications */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="w-4 h-4 text-yellow-400" /> Notifikasi
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <span className="ml-auto text-xs bg-red-500 text-white rounded-full px-2 py-0.5">
                      {notifications.filter(n => !n.is_read).length}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">Tidak ada notifikasi</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => markRead(notif.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          notif.is_read
                            ? 'border-slate-700/50 bg-slate-800/30 opacity-60'
                            : 'border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10'
                        }`}
                      >
                        <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                        <p className="text-xs text-slate-600 mt-1">{formatDate(notif.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

