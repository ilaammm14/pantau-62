'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Report } from '@/types'

interface UseRealtimeReportsOptions {
  initialFetch?: boolean
  filter?: {
    province?: string
    city?: string
    district?: string
  }
}

export function useRealtimeReports(options: UseRealtimeReportsOptions = {}) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [newReportCount, setNewReportCount] = useState(0)

  const fetchReports = useCallback(async () => {
    const supabase = createClient()
    let query = supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (options.filter?.province) query = query.eq('province', options.filter.province)
    if (options.filter?.city) query = query.eq('city', options.filter.city)
    if (options.filter?.district) query = query.eq('district', options.filter.district)

    const { data, error } = await query
    if (!error && data) setReports(data)
    setLoading(false)
  }, [options.filter?.province, options.filter?.city, options.filter?.district])

  useEffect(() => {
    fetchReports()

    const supabase = createClient()

    const channel = supabase
      .channel('admin-reports-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reports' },
        (payload) => {
          const newReport = payload.new as Report
          // Apply filter if set
          if (options.filter?.province && newReport.province !== options.filter.province) return
          if (options.filter?.city && newReport.city !== options.filter.city) return
          if (options.filter?.district && newReport.district !== options.filter.district) return

          setReports(prev => [newReport, ...prev])
          setNewReportCount(c => c + 1)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'reports' },
        (payload) => {
          const updated = payload.new as Report
          setReports(prev => prev.map(r => r.id === updated.id ? updated : r))
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'reports' },
        (payload) => {
          const deleted = payload.old as { id: string }
          setReports(prev => prev.filter(r => r.id !== deleted.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchReports])

  const resetNewCount = useCallback(() => setNewReportCount(0), [])

  return { reports, loading, newReportCount, resetNewCount, refetch: fetchReports }
}
