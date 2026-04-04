'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react'
import { signIn } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    setError('')

    const { error: signInError } = await signIn(email, password)
    setLoading(false)

    if (signInError) {
      if (signInError.message.includes('Invalid login credentials')) {
        setError('Wrong email or password. Please try again.')
      } else if (signInError.message.includes('Email not confirmed')) {
        setError('Please check your email and confirm your account first.')
      } else {
        setError(signInError.message)
      }
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-ink rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-button-dark">
            <span className="text-white text-2xl font-bold">L</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Welcome back</h1>
          <p className="text-text-secondary mt-2">Sign in to manage your profile</p>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                <input type="email" required value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder="you@example.com" autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface-muted text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-text-primary">Password</label>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="Your password" autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-surface-muted text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-danger bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 fade-up">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || !email || !password}
              className="w-full flex items-center justify-center gap-2 bg-ink text-white py-3.5 rounded-xl font-bold text-sm hover:bg-ink-soft active:scale-95 transition-all shadow-button-dark disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Sign In
            </button>
          </form>
        </div>

        <div className="text-center mt-5 space-y-2">
          <p className="text-sm text-text-muted">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-accent font-semibold hover:underline">Create one free</Link>
          </p>
          <p className="text-xs text-text-muted">
            Looking for local help?{' '}
            <Link href="/search" className="text-accent hover:underline">Browse workers</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
