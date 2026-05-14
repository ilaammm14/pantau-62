'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminGuard from '@/components/admin/AdminGuard'
import MobileTopbar from '@/components/admin/MobileTopbar'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types'

function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser({
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name || 'Admin',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'admin',
          created_at: session.user.created_at,
        })
      }
    }
    getUser()
  }, [])

  // Get page title from pathname
  const getPageTitle = () => {
    const path = pathname.split('/').pop()
    if (!path || path === 'admin') return 'Dashboard'
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ')
  }

  return (
    <div className="flex min-h-screen bg-[#020817]">
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="flex-1 flex flex-col lg:ml-64">
        <MobileTopbar 
          title={getPageTitle()} 
          user={user}
          onMenuClick={() => setMobileOpen(true)} 
        />
        <div className="flex-1 overflow-auto">
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
