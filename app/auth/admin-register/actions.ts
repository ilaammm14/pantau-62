'use server'

import { createClient } from '@/lib/supabase/server'

// Secret key hanya ada di server (tidak exposed ke browser)
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'PANTAU62_ADMIN_2026'

export async function verifyAdminSecretKey(secretKey: string): Promise<{ success: boolean; error?: string }> {
  if (secretKey !== ADMIN_SECRET_KEY) {
    return { success: false, error: 'Secret key salah. Hubungi super admin.' }
  }
  return { success: true }
}

export async function registerAdmin(data: {
  fullName: string
  email: string
  password: string
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { full_name: data.fullName, role: 'admin' } },
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  if (authData.user) {
    const { error: insertError } = await supabase.from('users').insert({
      id: authData.user.id,
      full_name: data.fullName,
      email: data.email,
      role: 'admin',
    })

    if (insertError) {
      // Try upsert if already exists
      await supabase.from('users').upsert({
        id: authData.user.id,
        full_name: data.fullName,
        email: data.email,
        role: 'admin',
      })
    }
  }

  return { success: true }
}
