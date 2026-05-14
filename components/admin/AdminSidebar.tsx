'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Shield, LayoutDashboard, FileText, BarChart3, Map, Brain, Settings, LogOut, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/reports', icon: FileText, label: 'Reports' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/admin/map', icon: Map, label: 'Map Monitor' },
  { href: '/admin/ai-insights', icon: Brain, label: 'AI Insights' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <aside className="w-64 min-h-screen bg-slate-900/80 border-r border-slate-700/50 backdrop-blur-sm flex flex-col">
      <div className="p-6 border-b border-slate-700/50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm">
              <span className="gradient-text">PANTAU</span>
              <span className="text-white">+62</span>
            </div>
            <div className="text-xs text-slate-500">Admin Panel</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <item.icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              {item.label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-cyan-400" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  )
}
