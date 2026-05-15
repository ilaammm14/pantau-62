'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminGuard from '@/components/admin/AdminGuard'
import MobileTopbar from '@/components/admin/MobileTopbar'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types'

function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [newReportCount, setNewReportCount] = useState(0)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Fetch role from DB (source of truth)
        const { data: userData } = await supabase
          .from('users').select('*').eq('id', session.user.id).single()
        setUser({
          id: session.user.id,
          full_name: userData?.full_name || session.user.user_metadata?.full_name || 'Admin',
          email: session.user.email || '',
          role: userData?.role || session.user.user_metadata?.role || 'admin',
          created_at: session.user.created_at,
        })
      }
    }
    getUser()
  }, [])

  // Global realtime subscription for new report badge
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('layout-new-reports')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, () => {
        // Only increment if not already on reports page
        if (!pathname.includes('/admin/reports')) {
          setNewReportCount(c => c + 1)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [pathname])

  // Reset count when navigating to reports
  useEffect(() => {
    if (pathname.includes('/admin/reports')) {
      setNewReportCount(0)
    }
  }, [pathname])

  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean)
    const last = segments[segments.length - 1]
    if (!last || last === 'admin') return 'Dashboard'
    // Handle dynamic segments like [id]
    if (last.length === 36 && last.includes('-')) return 'Detail Laporan'
    return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ')
  }

  return (
    <div className="flex min-h-screen bg-[#020817] overflow-x-hidden">
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <MobileTopbar
          title={getPageTitle()}
          user={user}
          onMenuClick={() => setMobileOpen(true)}
          newReportCount={newReportCount}
          onNotificationClick={() => setNewReportCount(0)}
        />
        <div className="flex-1 min-w-0 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AdminGuard>
  )
}
