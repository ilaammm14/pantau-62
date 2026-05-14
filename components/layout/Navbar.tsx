'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, Menu, X, Bell, LogOut, User, LayoutDashboard, MapPin, ChevronDown,
  FileText, Settings, BarChart3, Map, AlertCircle, Home, Zap, MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import type { User as UserType } from '@/types'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileOpen])

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Use session data directly — no DB query needed
        setUser({
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'user',
          created_at: session.user.created_at,
        })
      } else {
        setUser(null)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'user',
          created_at: session.user.created_at,
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/#features', label: 'Features', icon: Zap },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/report', label: 'Report Issue', icon: AlertCircle },
  ]

  const userMenuLinks = [
    { href: '/my-reports', label: 'My Reports', icon: FileText },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ]

  const adminMenuLinks = [
    { href: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/map', label: 'Monitoring Map', icon: Map },
    { href: '/admin/reports', label: 'Reports Management', icon: FileText },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-slate-700/50 shadow-xl' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 transition-all">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#020817] animate-pulse" />
            </div>
            <span className="font-bold text-lg">
              <span className="gradient-text">PANTAU</span>
              <span className="text-white">+62</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'text-cyan-400 bg-cyan-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-600 bg-slate-800/50 hover:bg-slate-700/50 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.full_name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-300">{user.full_name?.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-600 bg-slate-800 shadow-xl overflow-hidden"
                    >
                      {user.role === 'admin' && (
                        <Link href="/admin" className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                          <LayoutDashboard className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <Link href="/my-reports" className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                        <MapPin className="w-4 h-4" /> My Reports
                      </Link>
                      <Link href="/profile" className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <div className="border-t border-slate-700" />
                      <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Slide-in Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-gradient-to-br from-slate-900/98 via-slate-850/98 to-slate-900/98 backdrop-blur-2xl border-l border-slate-700/40 shadow-2xl z-50 md:hidden overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/40">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg">
                      <span className="gradient-text">PANTAU</span>
                      <span className="text-white">+62</span>
                    </span>
                  </Link>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* User Profile Section */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 border-b border-slate-700/40"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-cyan-500/30">
                          {user.full_name?.[0]?.toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900" />
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-base truncate mb-1">
                          {user.full_name}
                        </h3>
                        <p className="text-xs text-slate-400 truncate mb-2">
                          {user.email}
                        </p>
                        <Badge 
                          className={`text-xs ${
                            user.role === 'admin' 
                              ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300' 
                              : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-300'
                          }`}
                        >
                          {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Menu */}
                <div className="flex-1 overflow-y-auto py-6 px-4">
                  {/* Public Navigation */}
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                      Navigation
                    </h4>
                    <div className="space-y-1">
                      {navLinks.map((link, index) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href
                        return (
                          <motion.div
                            key={link.href}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                          >
                            <Link
                              href={link.href}
                              onClick={() => setMobileOpen(false)}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                isActive
                                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 shadow-lg shadow-cyan-500/10'
                                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : ''}`} />
                              {link.label}
                            </Link>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>

                  {/* User Menu (if logged in) */}
                  {user && (
                    <div className="mb-6">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                        My Account
                      </h4>
                      <div className="space-y-1">
                        {userMenuLinks.map((link, index) => {
                          const Icon = link.icon
                          const isActive = pathname === link.href
                          return (
                            <motion.div
                              key={link.href}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + index * 0.05 }}
                            >
                              <Link
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                  isActive
                                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 shadow-lg shadow-cyan-500/10'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                                }`}
                              >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : ''}`} />
                                {link.label}
                              </Link>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Admin Menu (if admin) */}
                  {user?.role === 'admin' && (
                    <div className="mb-6">
                      <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3 px-3 flex items-center gap-2">
                        <Shield className="w-3 h-3" />
                        Admin Panel
                      </h4>
                      <div className="space-y-1">
                        {adminMenuLinks.map((link, index) => {
                          const Icon = link.icon
                          const isActive = pathname === link.href
                          return (
                            <motion.div
                              key={link.href}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + index * 0.05 }}
                            >
                              <Link
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                  isActive
                                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 shadow-lg shadow-purple-500/10'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                                }`}
                              >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : ''}`} />
                                {link.label}
                              </Link>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  {user && <div className="border-t border-slate-700/40 my-6" />}

                  {/* Auth Buttons */}
                  {!user && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-2 px-3"
                    >
                      <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block">
                        <Button variant="outline" size="lg" className="w-full justify-center">
                          <User className="w-4 h-4 mr-2" />
                          Login
                        </Button>
                      </Link>
                      <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="block">
                        <Button size="lg" className="w-full justify-center">
                          Get Started
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </div>

                {/* Logout Button (Bottom) */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-6 border-t border-slate-700/40"
                  >
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-200 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
