'use client'

export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, CheckCircle, Clock, AlertTriangle, TrendingUp, Activity, Brain, Zap } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { statusConfig, categoryLabels, formatDate } from '@/lib/utils'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { getAIRecommendation } from '@/lib/ai-scoring'
import type { Report, DashboardStats } from '@/types'

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<DashboardStats>({ total: 0, pending: 0, processing: 0, resolved: 0, high_priority: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      // Temporary: fetch without join to avoid RLS error
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching reports:', error)
      }

      if (data) {
        setReports(data)
        setStats({
          total: data.length,
          pending: data.filter(r => r.status === 'pending').length,
          processing: data.filter(r => r.status === 'processing').length,
          resolved: data.filter(r => r.status === 'resolved').length,
          high_priority: data.filter(r => r.priority === 'high').length,
        })
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const categoryChartData = Object.entries(categoryLabels).map(([key, label]) => ({
    name: label.split(' ')[0],
    count: reports.filter(r => r.category === key).length,
  }))

  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dayReports = reports.filter(r => new Date(r.created_at).toDateString() === date.toDateString())
    return {
      day: date.toLocaleDateString('id-ID', { weekday: 'short' }),
      laporan: dayReports.length,
      selesai: dayReports.filter(r => r.status === 'resolved').length,
    }
  })

  const highPriorityReports = reports.filter(r => r.priority === 'high' && r.status !== 'resolved').slice(0, 3)

  const statCards = [
    { label: 'Total Reports', value: stats.total, icon: FileText, color: 'text-cyan-400', bg: 'border-cyan-500/20 bg-cyan-500/5' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-400', bg: 'border-yellow-500/20 bg-yellow-500/5' },
    { label: 'Processing', value: stats.processing, icon: Activity, color: 'text-blue-400', bg: 'border-blue-500/20 bg-blue-500/5' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-green-400', bg: 'border-green-500/20 bg-green-500/5' },
    { label: 'High Priority', value: stats.high_priority, icon: AlertTriangle, color: 'text-red-400', bg: 'border-red-500/20 bg-red-500/5' },
  ]

  return (
    <div className="p-4 lg:p-8 grid-bg min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-slate-500 font-mono">SYSTEM ONLINE</span>
        </div>
        <h1 className="text-xl lg:text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm">Smart City Monitoring & Decision Support</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className={`border ${card.bg}`}>
              <CardContent className="p-4">
                <card.icon className={`w-4 h-4 ${card.color} mb-2`} />
                <div className={`text-xl lg:text-2xl font-bold ${card.color}`}>{loading ? '—' : card.value}</div>
                <div className="text-xs text-slate-500 mt-0.5 leading-tight">{card.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* Trend */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
                <TrendingUp className="w-4 h-4 text-cyan-400" /> Tren Laporan Mingguan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 lg:p-6">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="gLaporan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10 }} width={25} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="laporan" stroke="#06b6d4" fill="url(#gLaporan)" strokeWidth={2} name="Laporan" />
                  <Area type="monotone" dataKey="selesai" stroke="#22c55e" fill="none" strokeWidth={2} strokeDasharray="4 4" name="Selesai" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Category Bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm lg:text-base">Per Kategori</CardTitle>
          </CardHeader>
          <CardContent className="p-3 lg:p-6">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={categoryChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#475569" tick={{ fontSize: 9 }} />
                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fontSize: 9 }} width={45} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Laporan" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="mb-4 border-cyan-500/20 bg-cyan-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
            <Brain className="w-4 h-4 text-cyan-400" /> AI Recommendations
            <Badge className="ml-auto text-xs">Live</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 lg:p-6">
          {highPriorityReports.length === 0 ? (
            <p className="text-slate-400 text-sm">Tidak ada laporan prioritas tinggi saat ini. ✅</p>
          ) : (
            <div className="space-y-3">
              {highPriorityReports.map(report => (
                <div key={report.id} className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                  <Zap className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white mb-1 truncate">{report.title}</div>
                    <div className="text-xs text-slate-400 leading-relaxed">
                      {getAIRecommendation({ category: report.category, priority: report.priority, location: report.location, ai_score: report.ai_score })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reports — mobile card layout, desktop table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm lg:text-base">Laporan Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile: card list */}
          <div className="lg:hidden divide-y divide-slate-800/50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4"><div className="h-14 rounded-xl skeleton" /></div>
              ))
            ) : reports.slice(0, 8).map(report => (
              <div key={report.id} className="p-4 flex gap-3 items-start">
                {report.image_url ? (
                  <img src={report.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-base flex-shrink-0">
                    {report.category === 'sampah' ? '🗑️' : report.category === 'banjir' ? '🌊' : '⚠️'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm truncate">{report.title}</div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">{report.location}</div>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <Badge className={`${statusConfig[report.status].bg} ${statusConfig[report.status].color} border text-xs`}>
                      {statusConfig[report.status].label}
                    </Badge>
                    <span className="text-xs text-cyan-400 font-mono">AI:{report.ai_score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['Laporan', 'Kategori', 'Lokasi', 'Priority', 'Status', 'Waktu'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs text-slate-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="py-3 px-4"><div className="h-8 rounded skeleton" /></td></tr>
                  ))
                ) : reports.slice(0, 10).map(report => (
                  <tr key={report.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-white truncate max-w-[180px]">{report.title}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">{categoryLabels[report.category as keyof typeof categoryLabels]}</td>
                    <td className="py-3 px-4 text-slate-400 text-xs truncate max-w-[120px]">{report.location}</td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={report.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={`${statusConfig[report.status].bg} ${statusConfig[report.status].color} border text-xs`}>
                        {statusConfig[report.status].label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{formatDate(report.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

