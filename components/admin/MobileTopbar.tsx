'use client'

import { Menu, Bell, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
}

interface MobileTopbarProps {
  title: string
  user: User | null
  onMenuClick: () => void
  newReportCount?: number
  onNotificationClick?: () => void
}

export default function MobileTopbar({
  title,
  user,
  onMenuClick,
  newReportCount = 0,
  onNotificationClick,
}: MobileTopbarProps) {
  const router = useRouter()

  const handleNotification = () => {
    if (onNotificationClick) onNotificationClick()
    router.push('/admin/reports')
  }

  const handleProfile = () => {
    router.push('/admin/settings')
  }

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="lg:hidden sticky top-0 z-30 glass border-b border-slate-700/40 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left: Menu + Title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all active:scale-95 flex-shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-white truncate">{title}</h1>
        </div>

        {/* Right: Notification + Profile */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Notification button → /admin/reports */}
          <button
            onClick={handleNotification}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all active:scale-95 relative"
            aria-label="Notifikasi laporan baru"
          >
            <Bell className="w-5 h-5" />
            {newReportCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1 shadow-lg shadow-red-500/50"
              >
                {newReportCount > 99 ? '99+' : newReportCount}
              </motion.span>
            )}
          </button>

          {/* Profile avatar → /admin/settings */}
          <button
            onClick={handleProfile}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all active:scale-95 flex-shrink-0"
            aria-label="Pengaturan profil"
          >
            {user?.full_name?.[0]?.toUpperCase() ?? 'A'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
