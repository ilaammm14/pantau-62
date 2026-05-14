'use client'

import { Menu, Bell, Search } from 'lucide-react'
import { motion } from 'framer-motion'

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
}

export default function MobileTopbar({ title, user, onMenuClick }: MobileTopbarProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="lg:hidden sticky top-0 z-30 glass border-b border-slate-700/40 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between px-4 h-16">
        {/* Left: Menu + Title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all active:scale-95"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white truncate">{title}</h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          
          {user && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-purple-500/30">
              {user.full_name?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
