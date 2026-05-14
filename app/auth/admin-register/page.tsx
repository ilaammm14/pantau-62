'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, Mail, Lock, User, Eye, EyeOff, Loader2, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { verifyAdminSecretKey, registerAdmin } from './actions'

export default function AdminRegisterPage() {
  const [step, setStep] = useState<'verify' | 'register'>('verify')
  const [secretKey, setSecretKey] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleVerifyKey = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await verifyAdminSecretKey(secretKey)
    
    if (result.success) {
      setStep('register')
    } else {
      setError(result.error || 'Verifikasi gagal')
    }
    
    setLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await registerAdmin({ fullName, email, password })

    if (result.success) {
      setSuccess(true)
      setTimeout(() => router.push('/auth/login'), 2500)
    } else {
      setError(result.error || 'Registrasi gagal')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#020817] grid-bg flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">
              <span className="gradient-text">PANTAU</span>
              <span className="text-white">+62</span>
            </span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-medium mt-4">
            <Shield className="w-3 h-3" /> Admin Registration
          </div>
          <h1 className="text-2xl font-bold text-white mt-3 mb-1">Daftar Akun Admin</h1>
          <p className="text-slate-400 text-sm">Diperlukan secret key untuk mendaftar sebagai admin</p>
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm p-8 shadow-2xl">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Akun Admin Berhasil Dibuat!</h3>
              <p className="text-slate-400 text-sm">Mengalihkan ke halaman login...</p>
            </motion.div>
          ) : step === 'verify' ? (
            /* Step 1: Verify secret key */
            <form onSubmit={handleVerifyKey} className="space-y-5">
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-400">
                Halaman ini hanya untuk administrator sistem. Masukkan secret key yang diberikan oleh super admin.
              </div>

              <div className="space-y-2">
                <Label htmlFor="secretKey">Secret Key</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="secretKey"
                    type="password"
                    placeholder="Masukkan secret key..."
                    value={secretKey}
                    onChange={e => setSecretKey(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400"
                >
                  {error}
                </motion.div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Memverifikasi...</> : 'Verifikasi Key'}
              </Button>
            </form>
          ) : (
            /* Step 2: Register form */
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-400 flex items-center gap-2">
                <Shield className="w-4 h-4 flex-shrink-0" /> Secret key terverifikasi. Lengkapi data admin.
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="fullName"
                    placeholder="Nama lengkap admin"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min. 8 karakter"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400"
                >
                  {error}
                </motion.div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Membuat akun admin...</>
                  : 'Buat Akun Admin'
                }
              </Button>

              <button
                type="button"
                onClick={() => { setStep('verify'); setError('') }}
                className="w-full text-sm text-slate-500 hover:text-slate-400 transition-colors"
              >
                ← Kembali
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-400">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Login di sini
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
