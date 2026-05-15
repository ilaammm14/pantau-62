'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { MapPin, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { priorityConfig } from '@/lib/utils'
import type { Report } from '@/types'
import dynamicImport from 'next/dynamic'

const ReportsMap = dynamicImport(() => import('@/components/map/ReportsMap'), { ssr: false })

export default function AdminMapPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [filtered, setFiltered] = useState<Report[]>([])
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('reports')
        .select('*')
        .not('latitude', 'is', null)
        .neq('status', 'resolved') // hide resolved reports from map
      if (data) { setReports(data as Report[]); setFiltered(data as Report[]) }
    }
    fetch()
  }, [])

  useEffect(() => {
    let result = reports
    if (priorityFilter !== 'all') result = result.filter(r => r.priority === priorityFilter)
    if (statusFilter !== 'all') result = result.filter(r => r.status === statusFilter)
    setFiltered(result)
  }, [priorityFilter, statusFilter, reports])

  const counts = {
    high: reports.filter(r => r.priority === 'high').length,
    medium: reports.filter(r => r.priority === 'medium').length,
    low: reports.filter(r => r.priority === 'low').length,
  }

  return (
    <div className="p-4 lg:p-8 min-h-screen grid-bg">
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-white">Map Monitoring</h1>
        <p className="text-slate-400 text-sm mt-1">Visualisasi real-time semua laporan di peta</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {(['high', 'medium', 'low'] as const).map(p => (
          <div key={p} className={`rounded-2xl border ${priorityConfig[p].bg} p-3 text-center`}>
            <div className={`text-xl lg:text-2xl font-bold ${priorityConfig[p].color}`}>{counts[p]}</div>
            <div className="text-xs text-slate-400 mt-0.5">{p.toUpperCase()}</div>
          </div>
        ))}
      </div>

      <Card className="mb-4">
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="flex-1 min-w-[110px] text-xs"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Priority</SelectItem>
                <SelectItem value="high">HIGH</SelectItem>
                <SelectItem value="medium">MEDIUM</SelectItem>
                <SelectItem value="low">LOW</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1 min-w-[110px] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-slate-400 ml-auto">
              <span className="text-white font-medium">{filtered.length}</span> laporan
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
            <MapPin className="w-4 h-4 text-cyan-400" /> Peta Interaktif
            <div className="ml-auto flex items-center gap-2 lg:gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> HIGH</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> MED</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> LOW</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 lg:p-6">
          <ReportsMap reports={filtered} height="calc(100vh - 380px)" showDetailButton reportBasePath="/admin/reports" />
        </CardContent>
      </Card>
    </div>
  )
}
