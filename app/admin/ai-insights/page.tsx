'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Zap, TrendingUp, AlertTriangle, MapPin, BarChart3, Wifi } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRealtimeReports } from '@/hooks/useRealtimeReports'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { getAIRecommendation } from '@/lib/ai-scoring'
import { categoryLabels } from '@/lib/utils'
import type { Report } from '@/types'

export default function AIInsightsPage() {
  const { reports } = useRealtimeReports()

  const highRiskReports = reports.filter(r => r.priority === 'high' && r.status !== 'resolved')
  const topCategories = Object.entries(categoryLabels)
    .map(([key, label]) => ({ key, label, count: reports.filter(r => r.category === key).length }))
    .sort((a, b) => b.count - a.count)

  const locationCounts: Record<string, number> = {}
  reports.forEach(r => {
    const area = r.location.split(',')[0].trim()
    locationCounts[area] = (locationCounts[area] || 0) + 1
  })
  const hotspots = Object.entries(locationCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const avgScore = reports.length ? Math.round(reports.reduce((s, r) => s + r.ai_score, 0) / reports.length) : 0
  const resolutionRate = reports.length ? Math.round((reports.filter(r => r.status === 'resolved').length / reports.length) * 100) : 0

  return (
    <div className="p-4 lg:p-8 min-h-screen grid-bg">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          <h1 className="text-xl lg:text-2xl font-bold text-white">AI Insights</h1>
          <div className="flex items-center gap-1 ml-auto">
            <Wifi className="w-3 h-3 text-cyan-400" />
            <span className="text-xs text-cyan-400 font-mono">LIVE</span>
          </div>
        </div>
        <p className="text-slate-400 text-sm">Analisis cerdas dan rekomendasi berbasis AI</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Avg AI Score', value: avgScore, icon: Brain, color: 'text-cyan-400', bg: 'border-cyan-500/20 bg-cyan-500/5' },
          { label: 'High Risk', value: highRiskReports.length, icon: AlertTriangle, color: 'text-red-400', bg: 'border-red-500/20 bg-red-500/5' },
          { label: 'Resolution', value: `${resolutionRate}%`, icon: TrendingUp, color: 'text-green-400', bg: 'border-green-500/20 bg-green-500/5' },
          { label: 'Hotspots', value: hotspots.length, icon: MapPin, color: 'text-yellow-400', bg: 'border-yellow-500/20 bg-yellow-500/5' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className={`border ${card.bg}`}>
              <CardContent className="p-4">
                <card.icon className={`w-4 h-4 ${card.color} mb-2`} />
                <div className={`text-xl lg:text-2xl font-bold ${card.color}`}>{card.value}</div>
                <div className="text-xs text-slate-500 mt-0.5 leading-tight">{card.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
              <Zap className="w-4 h-4 text-red-400" /> Rekomendasi Prioritas Tinggi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 lg:p-6">
            {highRiskReports.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Tidak ada laporan prioritas tinggi aktif</p>
            ) : (
              <div className="space-y-3">
                {highRiskReports.slice(0, 5).map(report => (
                  <div key={report.id} className="p-3 rounded-xl bg-slate-900/50 border border-red-500/20">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="font-medium text-white text-sm truncate flex-1">{report.title}</div>
                      <Badge className="bg-cyan-500/20 border-cyan-500/30 text-cyan-400 border text-xs flex-shrink-0">
                        AI:{report.ai_score}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-400 mb-2 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 flex-shrink-0" /> {report.location}
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed bg-slate-800/50 rounded-lg p-2">
                      {getAIRecommendation({ category: report.category, priority: report.priority, location: report.location, ai_score: report.ai_score })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
              <MapPin className="w-4 h-4 text-yellow-400" /> Area Hotspot
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 lg:p-6">
            <div className="space-y-3">
              {hotspots.map(([area, count], i) => (
                <div key={area} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400 flex-shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white truncate">{area}</span>
                      <span className="text-slate-400 flex-shrink-0 ml-2">{count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-red-500" style={{ width: `${(count / (hotspots[0]?.[1] || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
              {hotspots.length === 0 && <p className="text-slate-400 text-sm text-center py-8">Belum ada data hotspot</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
              <BarChart3 className="w-4 h-4 text-blue-400" /> Insight Kategori
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 lg:p-6">
            <div className="space-y-3">
              {topCategories.filter(c => c.count > 0).map(cat => (
                <div key={cat.key} className="flex items-center gap-3">
                  <div className="text-lg flex-shrink-0">{cat.key === 'sampah' ? '🗑️' : cat.key === 'banjir' ? '🌊' : cat.key === 'jalan_rusak' ? '🚧' : cat.key === 'lampu_jalan' ? '💡' : '⚠️'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white truncate">{cat.label}</span>
                      <span className="text-slate-400 flex-shrink-0 ml-2">{cat.count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${(cat.count / (topCategories[0]?.count || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
              <Brain className="w-4 h-4 text-cyan-400" /> Top AI Score
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 lg:p-6">
            <div className="space-y-3">
              {reports.slice(0, 6).map(report => (
                <div key={report.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-cyan-400">{report.ai_score}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{report.title}</div>
                    <div className="text-xs text-slate-500 truncate">{report.location}</div>
                  </div>
                  <PriorityBadge priority={report.priority} showAnimation={false} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
