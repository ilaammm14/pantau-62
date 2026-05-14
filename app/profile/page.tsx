'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Shield, Calendar, Loader2, CheckCircle } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

const roleLabels: Record<string, string> = {
  super_admin: '👑 Super Admin',
  regional_admin: '🗺️ Regional Admin',
  local_admin: '📍 Local Admin',
  admin: '🛠️ Admin',
  user: '👤 User',
}

export default function ProfilePage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('user')
  const [createdAt, setCreatedAt] = useState('')
  const [userId, setUserId] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { router.push('/auth/login'); return }

      const u = session.user
      setUserId(u.id)
      setEmail(u.email || '')
      setFullName(u.user_metadata?.full_name || u.email?.split('@')[0] || '')
      setRole(u.user_metadata?.role || 'user')
      setCreatedAt(u.created_at || '')
      setLoading(false)
    }
    fetch()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    // Update auth metadata
    await supabase.auth.updateUser({ data: { full_name: fullName } })
    // Also try updating public.users (best effort)
    await supabase.from('users').update({ full_name: fullName }).eq('id', userId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <main className="min-h-screen bg-[#020817] grid-bg">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-2xl font-bold text-white mb-8">Profil Saya</h1>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-cyan-500/30">
                {loading ? '?' : fullName?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <CardTitle>{loading ? 'Loading...' : fullName || email}</CardTitle>
                <div className={`inline-flex items-center gap-1 mt-1 text-xs px-2 py-0.5 rounded-full border ${
                  role === 'super_admin' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                  role === 'regional_admin' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                  role === 'local_admin' ? 'text-green-400 bg-green-500/10 border-green-500/20' :
                  role === 'admin' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' :
                  'text-slate-400 bg-slate-700/50 border-slate-600'
                }`}>
                  {roleLabels[role] || '👤 User'}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input value={fullName} onChange={e => setFullName(e.target.value)} className="pl-10" disabled={loading} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input value={email} disabled className="pl-10 opacity-50" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bergabung Sejak</Label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-600 bg-slate-800/50 text-sm text-slate-400">
                <Calendar className="w-4 h-4" />
                {createdAt ? new Date(createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving || loading} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : null}
              {saved ? 'Tersimpan!' : 'Simpan Perubahan'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
