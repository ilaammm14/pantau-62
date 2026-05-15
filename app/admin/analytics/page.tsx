'use client'

export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity } from 'lucide-react'
import { useRealtimeReports } from '@/hooks/useRealtimeReports'
import { categoryLabels } from '@/lib/utils'
import type { Report } from '@/types'

const COLORS = ['#ef4444', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6']

export default function AdminAnalyticsPage() {
  const { reports } = useRealtimeReports()

  const categoryData = Object.entries(categoryLabels).map(([key, label]) => ({
    name: label.split(' ')[0],
    total: reports.filter(r => r.category === key).length,
    resolved: reports.filter(r => r.category === key && r.status === 'resolved').length,
  }))

  const priorityData = [
    { name: 'HIGH', value: reports.filter(r => r.priority === 'high').length, color: '#ef4444' },
    { name: 'MEDIUM', value: reports.filter(r => r.priority === 'medium').length, color: '#eab308' },
    { name: 'LOW', value: reports.filter(r => r.priority === 'low').length, color: '#22c55e' },
  ]

  const statusData = [
    { name: 'Pending', value: reports.filter(r => r.status === 'pending').length },
    { name: 'Processing', value: reports.filter(r => r.status === 'processing').length },
    { name: 'Resolved', value: reports.filter(r => r.status === 'resolved').length },
  ]

  const trendData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    const dayReports = reports.filter(r => new Date(r.created_at).toDateString() === date.toDateString())
    return {
      date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      laporan: dayReports.length,
      high: dayReports.filter(r => r.priority === 'high').length,
    }
  })

  const radarData = Object.entries(categoryLabels).map(([key, label]) => ({
    category: label.split(' ')[0],
    laporan: reports.filter(r => r.category === key).length,
    resolved: reports.filter(r => r.category === key && r.status === 'resolved').length,
  }))

  return (
    <div className="p-4 lg:p-8 min-h-screen grid-bg">
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Analisis mendalam data laporan publik</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* 30-day trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
              <TrendingUp className="w-4 h-4 text-cyan-400" /> Tren 30 Hari Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 lg:p-6">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="gL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gH" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 9 }} interval={6} />
                <YAxis stroke="#475569" tick={{ fontSize: 9 }} width={25} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                <Area type="monotone" dataKey="laporan" stroke="#06b6d4" fill="url(#gL)" strokeWidth={2} name="Total" />
                <Area type="monotone" dataKey="high" stroke="#ef4444" fill="url(#gH)" strokeWidth={2} name="High Priority" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4 text-blue-400" /> Per Kategori
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 lg:p-6">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 9 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 9 }} width={25} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="total" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="resolved" fill="#22c55e" radius={[4, 4, 0, 0]} name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <PieIcon className="w-4 h-4 text-purple-400" /> Distribusi Prioritas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 lg:p-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" outerRadius={75} paddingAngle={4} dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                  {priorityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-cyan-400" /> Radar Kategori
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 lg:p-6">
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Radar name="Laporan" dataKey="laporan" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                <Radar name="Resolved" dataKey="resolved" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm lg:text-base">Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            <div className="space-y-4">
              {statusData.map((s, i) => {
                const total = reports.length || 1
                const pct = Math.round((s.value / total) * 100)
                const colors = ['#94a3b8', '#3b82f6', '#22c55e']
                return (
                  <div key={s.name}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">{s.name}</span>
                      <span className="text-slate-400">{s.value} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: colors[i] }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

