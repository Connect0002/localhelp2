'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace('/discover')
  }, [user, loading, router])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    setError('')
    if (!form.email || !form.password) { setError('Email and password are required.'); return }
    if (mode === 'signup' && !form.name) { setError('Name is required.'); return }
    setSubmitting(true)
    try {
      if (mode === 'signup') {
        const { error: e } = await supabase.auth.signUp({
          email: form.email, password: form.password,
          options: { data: { name: form.name } }
        })
        if (e) { setError(e.message); return }
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
        if (e) { setError(e.message); return }
      }
      router.replace('/discover')
    } finally { setSubmitting(false) }
  }

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p style={{ fontSize: 14, color: 'var(--t3)', fontWeight: 500 }}>Loading…</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(150deg, #0D0A07 0%, #2A1400 60%, #E05C00 100%)',
        padding: '56px 28px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 50%, rgba(224,92,0,0.35) 0%, transparent 65%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="font-display" style={{ fontSize: 40, fontWeight: 900, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 12 }}>
            near<span style={{ color: 'var(--acc-dim)' }}>work</span>
          </div>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, maxWidth: 280 }}>
            Find and connect with trusted local service providers — no middlemen.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            {['Barbers', 'Cleaners', 'Trainers', 'Photographers'].map(s => (
              <span key={s} style={{ padding: '5px 14px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, padding: '28px 20px 40px' }}>
        <div className="card slide-up" style={{ borderRadius: 20, padding: '28px 24px', boxShadow: 'var(--shadow-lg)' }}>
          {/* Mode Toggle */}
          <div style={{ display: 'flex', background: 'var(--card3)', borderRadius: 12, padding: 4, marginBottom: 24 }}>
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 700,
                background: mode === m ? 'var(--card)' : 'transparent',
                color: mode === m ? 'var(--t1)' : 'var(--t3)',
                boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease',
              }}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {mode === 'signup' && (
            <div className="form-group fade-in">
              <label className="label">Full Name</label>
              <input className="input" placeholder="Your full name" value={form.name} onChange={set('name')} />
            </div>
          )}
          <div className="form-group">
            <label className="label">Email address</label>
            <input className="input" type="email" placeholder="you@email.com" value={form.email} onChange={set('email')}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>

          {error && (
            <div style={{ background: 'var(--err-lt)', border: '1px solid rgba(201,43,43,0.15)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
              <p style={{ color: 'var(--err)', fontSize: 13, fontWeight: 500 }}>⚠ {error}</p>
            </div>
          )}

          <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={submitting} style={{ fontSize: 15, padding: '14px', borderRadius: 14 }}>
            {submitting ? 'Please wait…' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, fontSize: 12, color: 'var(--t3)', fontWeight: 500 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          No OTP · Email only · Anti-bot protected
        </div>
      </div>
    </div>
  )
}
