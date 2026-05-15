'use client'

export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { Settings, User, Shield, Bell, Loader2, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import type { User as UserType } from '@/types'

export default function AdminSettingsPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single()
        if (data) { setUser(data); setFullName(data.full_name) }
      }
    }
    fetch()
  }, [])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('users').update({ full_name: fullName }).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-4 lg:p-8 min-h-screen grid-bg">
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" /> Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">Kelola pengaturan akun dan sistem</p>
      </div>

      <div className="max-w-2xl space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
              <User className="w-4 h-4 text-cyan-400" /> Profil Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 space-y-4">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled className="opacity-50" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm w-fit">
                <Shield className="w-4 h-4" /> Administrator
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="gap-2 w-full sm:w-auto">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : null}
              {saved ? 'Tersimpan!' : 'Simpan Perubahan'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
              <Bell className="w-4 h-4 text-yellow-400" /> Sistem Info
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            <div className="space-y-3 text-sm">
              {[
                { label: 'Platform', value: 'PANTAU+62 v1.0.0' },
                { label: 'Database', value: 'Supabase PostgreSQL' },
                { label: 'AI Engine', value: 'Smart Scoring System' },
                { label: 'Maps', value: 'Leaflet + OpenStreetMap' },
                { label: 'Status', value: '🟢 Online' },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-2 border-b border-slate-700/50 last:border-0">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

