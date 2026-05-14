'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading')
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/auth/login')
        return
      }

      // Query DB for role (source of truth)
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      const role = userData?.role ?? user.user_metadata?.role ?? ''

      // Only 'admin' role allowed
      if (role === 'admin') {
        setStatus('authorized')
      } else {
        setStatus('unauthorized')
        router.replace('/dashboard')
      }
    }
    check()
  }, [router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin mx-auto mb-2" />
          <p className="text-slate-400 text-sm">Memverifikasi akses...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthorized') return null

  return <>{children}</>
}
