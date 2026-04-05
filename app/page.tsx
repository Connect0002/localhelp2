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
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p style={{ fontSize: 14, color: 'var(--t2)' }}>Loading…</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '48px 24px 0', textAlign: 'center', marginBottom: 32 }}>
        <div className="font-syne" style={{ fontSize: 32, fontWeight: 800, color: 'var(--acc)', letterSpacing: '-.04em', marginBottom: 6 }}>
          nearwork
        </div>
        <p style={{ fontSize: 15, color: 'var(--t2)', lineHeight: 1.5 }}>
          Find local service providers you can actually trust
        </p>
      </div>

      <div style={{ flex: 1, padding: '0 24px 40px' }}>
        <div className="card" style={{ borderRadius: 16, padding: 24 }}>
          <h2 className="font-syne" style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 24 }}>
            {mode === 'login' ? 'Sign in to continue' : 'Join and find local pros near you'}
          </p>

          {mode === 'signup' && (
            <div className="form-group">
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

          {error && <p style={{ color: 'var(--err)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={submitting} style={{ marginBottom: 16 }}>
            {submitting ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--t2)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span style={{ color: 'var(--acc)', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError('') }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </span>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20, fontSize: 12, color: 'var(--t3)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          No OTP · Email only · Anti-bot protected
        </div>
      </div>
    </div>
  )
}
