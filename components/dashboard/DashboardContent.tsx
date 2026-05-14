'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, CheckCircle, Clock, AlertTriangle, TrendingUp, MapPin } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { categoryLabels, statusConfig } from '@/lib/utils'
import { PriorityBadge } from '@/components/ui/priority-badge'
import type { Report, DashboardStats } from '@/types'
import dynamic from 'next/dynamic'

const ReportsMap = dynamic(() => import('@/components/map/ReportsMap'), { ssr: false })

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

export default function DashboardContent() {
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<DashboardStats>({ total: 0, pending: 0, processing: 0, resolved: 0, high_priority: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('reports')
        .select('*, users(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(50)

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

  // Chart data
  const categoryData = Object.entries(categoryLabels).map(([key, label]) => ({
    name: label.split(' ')[0],
    value: reports.filter(r => r.category === key).length,
  })).filter(d => d.value > 0)

  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dayReports = reports.filter(r => {
      const d = new Date(r.created_at)
      return d.toDateString() === date.toDateString()
    })
    return {
      day: date.toLocaleDateString('id-ID', { weekday: 'short' }),
      total: dayReports.length,
      resolved: dayReports.filter(r => r.status === 'resolved').length,
    }
  })

  const statCards = [
    { label: 'Total Reports', value: stats.total, icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    { label: 'High Priority', value: stats.high_priority, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-slate-500 font-mono">LIVE MONITORING</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Public Dashboard</h1>
        <p className="text-slate-400 mt-1">Monitoring masalah publik secara real-time</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`border ${card.bg}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                  <TrendingUp className="w-3 h-3 text-slate-600" />
                </div>
                <div className={`text-2xl font-bold ${card.color}`}>{loading ? '—' : card.value}</div>
                <div className="text-xs text-slate-500 mt-1">{card.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" /> Tren Laporan 7 Hari
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                  <Area type="monotone" dataKey="total" stroke="#06b6d4" fill="url(#colorTotal)" strokeWidth={2} name="Total" />
                  <Area type="monotone" dataKey="resolved" stroke="#22c55e" fill="url(#colorResolved)" strokeWidth={2} name="Resolved" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Category Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Kategori Laporan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" /> Peta Monitoring Real-time
            <div className="ml-auto flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> HIGH</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> MEDIUM</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> LOW</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReportsMap reports={reports.filter(r => r.status !== 'resolved')} height="400px" showDetailButton={false} />
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Laporan Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl skeleton" />
              ))
            ) : reports.slice(0, 8).map(report => (
              <div key={report.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-slate-600 transition-all">
                {report.image_url ? (
                  <img src={report.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0 text-xl">
                    {report.category === 'sampah' ? '🗑️' : report.category === 'banjir' ? '🌊' : report.category === 'jalan_rusak' ? '🚧' : '⚠️'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm truncate">{report.title}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {report.location}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <PriorityBadge priority={report.priority} />
                  <Badge className={`${statusConfig[report.status].bg} ${statusConfig[report.status].color} border text-xs`}>
                    {statusConfig[report.status].label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
