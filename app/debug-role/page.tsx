'use client'

// Temporary debug page — delete after fixing roles
// Access at: /debug-role

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugRolePage() {
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const fetchInfo = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) { 
      setInfo({ error: 'Not logged in' })
      setLoading(false)
      return 
    }

    const { data: userData } = await supabase
      .from('users').select('*').eq('id', user.id).single()

    setInfo({
      auth_id: user.id,
      auth_email: user.email,
      auth_metadata_role: user.user_metadata?.role,
      db_role: userData?.role,
      db_full_name: userData?.full_name,
      db_row_exists: !!userData,
    })
    setLoading(false)
  }

  useEffect(() => {
    fetchInfo()
  }, [])

  const fixRole = async (role: string) => {
    if (updating) return
    
    setUpdating(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('Not logged in!')
      setUpdating(false)
      return
    }

    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', user.id)

    if (error) {
      alert(`Error: ${error.message}`)
      setUpdating(false)
      return
    }

    alert(`✅ Role updated to: ${role}\n\nPlease logout and login again for changes to take effect.`)
    
    // Refresh info
    await fetchInfo()
    setUpdating(false)
  }

  return (
    <div style={{ padding: 32, fontFamily: 'monospace', background: '#020817', minHeight: '100vh', color: 'white' }}>
      <h1 style={{ color: '#06b6d4', marginBottom: 16, fontSize: 24 }}>🔍 Debug: Current User Role</h1>
      
      {loading ? (
        <p style={{ color: '#94a3b8' }}>Loading...</p>
      ) : !info ? (
        <p style={{ color: '#ef4444' }}>Error loading user info</p>
      ) : info.error ? (
        <div>
          <p style={{ color: '#ef4444', marginBottom: 16 }}>{info.error}</p>
          <a href="/auth/login" style={{ color: '#06b6d4', textDecoration: 'underline' }}>
            Go to Login
          </a>
        </div>
      ) : (
        <>
          <pre style={{ 
            background: '#1e293b', 
            padding: 16, 
            borderRadius: 8, 
            marginBottom: 24,
            overflow: 'auto',
            fontSize: 13,
            lineHeight: 1.6
          }}>
            {JSON.stringify(info, null, 2)}
          </pre>

          <div style={{ 
            background: '#1e293b', 
            padding: 16, 
            borderRadius: 8, 
            marginBottom: 24,
            border: '1px solid #334155'
          }}>
            <p style={{ color: '#94a3b8', marginBottom: 12, fontSize: 14 }}>
              <strong>Current Role:</strong> <span style={{ 
                color: info.db_role === 'admin' ? '#22c55e' : '#06b6d4',
                fontWeight: 'bold'
              }}>{info.db_role || 'unknown'}</span>
            </p>
            
            <p style={{ color: '#94a3b8', marginBottom: 16, fontSize: 13 }}>
              Click button below to change role:
            </p>
            
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => fixRole('admin')}
                disabled={updating}
                style={{
                  padding: '12px 24px', 
                  borderRadius: 8, 
                  border: '2px solid #0e7490',
                  background: info.db_role === 'admin' ? '#0e7490' : '#1e293b', 
                  color: '#e2e8f0', 
                  cursor: updating ? 'not-allowed' : 'pointer', 
                  fontSize: 14,
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                  opacity: updating ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!updating) e.currentTarget.style.background = '#0e7490'
                }}
                onMouseLeave={(e) => {
                  if (!updating && info.db_role !== 'admin') e.currentTarget.style.background = '#1e293b'
                }}
              >
                {updating ? '⏳ Updating...' : '👑 Set: admin'}
              </button>

              <button
                onClick={() => fixRole('user')}
                disabled={updating}
                style={{
                  padding: '12px 24px', 
                  borderRadius: 8, 
                  border: '2px solid #475569',
                  background: info.db_role === 'user' ? '#475569' : '#1e293b', 
                  color: '#e2e8f0', 
                  cursor: updating ? 'not-allowed' : 'pointer', 
                  fontSize: 14,
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                  opacity: updating ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!updating) e.currentTarget.style.background = '#475569'
                }}
                onMouseLeave={(e) => {
                  if (!updating && info.db_role !== 'user') e.currentTarget.style.background = '#1e293b'
                }}
              >
                {updating ? '⏳ Updating...' : '👤 Set: user'}
              </button>
            </div>
          </div>

          <div style={{ 
            background: '#422006', 
            border: '1px solid #78350f',
            padding: 16, 
            borderRadius: 8,
            marginBottom: 16
          }}>
            <p style={{ color: '#fbbf24', fontSize: 13, marginBottom: 8 }}>
              ⚠️ <strong>Important:</strong>
            </p>
            <ul style={{ color: '#fcd34d', fontSize: 12, paddingLeft: 20, margin: 0 }}>
              <li>After changing role, you MUST logout and login again</li>
              <li>Changes take effect after re-authentication</li>
              <li>Delete this page after fixing roles: <code>/app/debug-role/page.tsx</code></li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <a 
              href="/auth/login" 
              style={{ 
                color: '#06b6d4', 
                textDecoration: 'underline',
                fontSize: 13
              }}
            >
              → Go to Login
            </a>
            <a 
              href="/admin" 
              style={{ 
                color: '#06b6d4', 
                textDecoration: 'underline',
                fontSize: 13
              }}
            >
              → Try Admin Panel
            </a>
            <a 
              href="/dashboard" 
              style={{ 
                color: '#06b6d4', 
                textDecoration: 'underline',
                fontSize: 13
              }}
            >
              → Try Dashboard
            </a>
          </div>
        </>
      )}

      <p style={{ color: '#475569', marginTop: 32, fontSize: 11, borderTop: '1px solid #334155', paddingTop: 16 }}>
        Debug page for PANTAU+62 role management. Delete after production deployment.
      </p>
    </div>
  )
}
