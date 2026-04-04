'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, CheckCircle, ArrowRight, User, Mail, Lock, Phone, MapPin } from 'lucide-react'
import { supabase, createProfile, CATEGORIES } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'account' | 'profile' | 'done'>('account')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '', city: '', category: '', description: '' })

  const set = (key: string, val: string) => { setForm(f => ({ ...f, [key]: val })); setError('') }

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 10)
    if (d.length <= 3) return d
    if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`
  }

  const rawPhone = form.phone.replace(/\D/g, '')

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    const { data, error: err } = await supabase.auth.signUp({ email: form.email, password: form.password })
    setLoading(false)
    if (err) {
      setError(err.message.includes('already registered') ? 'This email is already registered. Try logging in.' : err.message)
      return
    }
    if (data.user) setStep('profile')
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rawPhone.length !== 10) { setError('Enter a valid 10-digit US phone number.'); return }
    if (form.description.length < 20) { setError('Please write at least 20 characters about yourself.'); return }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Session expired. Please try again.'); setLoading(false); return }
    const { error: err } = await createProfile(user.id, {
      name: form.name.trim(), phone: rawPhone, city: form.city.trim(),
      category: form.category, description: form.description.trim(),
    })
    setLoading(false)
    if (err) {
      if (err.includes('duplicate') || err.includes('already')) {
        router.push('/dashboard'); return
      }
      setError(err); return
    }
    setStep('done')
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-ink rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-button-dark">
            <span className="text-white text-2xl font-bold">L</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {step === 'account' ? 'Create your account' : step === 'profile' ? 'Complete your profile' : "You're all set!"}
          </h1>
          <p className="text-text-secondary mt-2">
            {step === 'account' ? 'Join LocalHelp and start getting clients' : step === 'profile' ? 'Tell clients about yourself' : 'Your profile is live!'}
          </p>
        </div>

        {step !== 'done' && (
          <div className="flex items-center gap-2 mb-8">
            {(['account', 'profile'] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${s === step ? 'bg-accent text-white' : i < ['account','profile'].indexOf(step) ? 'bg-success text-white' : 'bg-surface-muted text-text-muted border border-border'}`}>
                  {i < ['account','profile'].indexOf(step) ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${s === step ? 'text-accent' : 'text-text-muted'}`}>
                  {s === 'account' ? 'Account' : 'Profile'}
                </span>
                {i < 1 && <div className={`flex-1 h-0.5 rounded-full ${i < ['account','profile'].indexOf(step) ? 'bg-success' : 'bg-border'}`} />}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-border shadow-card p-6 sm:p-8">
          {step === 'done' && (
            <div className="text-center py-6 fade-up">
              <CheckCircle size={56} className="text-success mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Profile is live!</h2>
              <p className="text-text-secondary">Redirecting to your dashboard…</p>
            </div>
          )}

          {step === 'account' && (
            <form onSubmit={handleAccountSubmit} className="space-y-4 fade-up">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Email address *</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <input type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface-muted text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Password *</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={e => set('password', e.target.value)} placeholder="At least 8 characters"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-surface-muted text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="text-xs text-text-muted mt-1">Minimum 8 characters</p>
              </div>
              {error && <div className="text-sm text-danger bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</div>}
              <button type="submit" disabled={loading || !form.email || !form.password}
                className="w-full flex items-center justify-center gap-2 bg-ink text-white py-3.5 rounded-xl font-bold text-sm hover:bg-ink-soft active:scale-95 transition-all shadow-button-dark disabled:opacity-50">
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                Continue <ArrowRight size={15} />
              </button>
            </form>
          )}

          {step === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4 fade-up">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Full Name *</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <input type="text" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Maria Johnson"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface-muted text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Phone Number *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm">🇺🇸</span>
                  <input type="tel" required value={form.phone} onChange={e => set('phone', formatPhone(e.target.value))} placeholder="(555) 000-0000"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface-muted text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
                </div>
                <p className="text-xs text-text-muted mt-1">Clients call or text this number directly</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">City *</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                    <input type="text" required value={form.city} onChange={e => set('city', e.target.value)} placeholder="Austin, TX"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface-muted text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Category *</label>
                  <select required value={form.category} onChange={e => set('category', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent appearance-none">
                    <option value="">Select…</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">About You *</label>
                <textarea required value={form.description} onChange={e => set('description', e.target.value)} rows={4} maxLength={600}
                  placeholder="How many years of experience? What areas do you serve? What makes you stand out?"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface-muted text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none transition-all" />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-text-muted">Min 20 characters</p>
                  <p className="text-xs text-text-muted">{form.description.length}/600</p>
                </div>
              </div>
              {error && <div className="text-sm text-danger bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</div>}
              <button type="submit" disabled={loading || !form.name || rawPhone.length !== 10 || !form.city || !form.category || form.description.length < 20}
                className="w-full flex items-center justify-center gap-2 bg-accent text-white py-3.5 rounded-xl font-bold text-sm hover:bg-accent-hover active:scale-95 transition-all shadow-button disabled:opacity-50">
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                Create My Profile <ArrowRight size={15} />
              </button>
            </form>
          )}
        </div>

        {step === 'account' && (
          <p className="text-center text-sm text-text-muted mt-5">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-accent font-semibold hover:underline">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  )
}
