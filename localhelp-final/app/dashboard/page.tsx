'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Edit2, Eye, Copy, LogOut, CheckCircle, X, Loader2,
  Phone, MapPin, Star, Users, TrendingUp, ExternalLink, Save
} from 'lucide-react'
import { supabase, getWorkerByUserId, updateProfile, CATEGORIES, CATEGORY_ICONS, getAvatarGradient, getInitials } from '@/lib/supabase'
import type { Profile } from '@/lib/supabase'
import { Stars } from '@/components/WorkerCard'

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-card p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>{icon}</div>
      <div className="text-2xl font-bold text-text-primary">{value}</div>
      <div className="text-xs text-text-muted mt-0.5 font-medium">{label}</div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const [form, setForm] = useState({
    name: '', phone: '', city: '', category: '', description: '',
  })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const p = await getWorkerByUserId(user.id)
      if (p) {
        setProfile(p)
        setForm({ name: p.name, phone: formatPhone(p.phone), city: p.city, category: p.category, description: p.description })
      }
      setLoading(false)
    }
    load()
  }, [])

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 10)
    if (d.length <= 3) return d
    if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`
  }

  const set = (key: string, val: string) => { setForm(f => ({ ...f, [key]: val })); setError('') }
  const rawPhone = form.phone.replace(/\D/g, '')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rawPhone.length !== 10) { setError('Enter a valid 10-digit US phone number.'); return }
    if (form.description.length < 20) { setError('Description must be at least 20 characters.'); return }

    setSaving(true)
    const { error: err } = await updateProfile({
      name: form.name.trim(),
      phone: rawPhone,
      city: form.city.trim(),
      category: form.category,
      description: form.description.trim(),
    })
    setSaving(false)

    if (err) { setError(err); return }

    // Reload profile
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const p = await getWorkerByUserId(user.id)
      if (p) setProfile(p)
    }
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const copyLink = () => {
    if (!profile) return
    navigator.clipboard.writeText(`${window.location.origin}/worker/${profile.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-border border-t-accent rounded-full animate-spin" />
          <p className="text-sm text-text-muted font-medium">Loading your dashboard…</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🔧</div>
        <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
        <p className="text-text-secondary mb-6">Your account exists but your profile wasn't set up completely.</p>
        <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-ink text-white px-6 py-3 rounded-xl font-semibold">
          Complete Setup
        </Link>
      </div>
    )
  }

  const initials = getInitials(profile.name)
  const gradient = getAvatarGradient(profile.name)
  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/worker/${profile.id}`

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">My Dashboard</h1>
          <p className="text-text-secondary mt-1 text-sm">Manage your LocalHelp profile</p>
        </div>
        <button onClick={handleSignOut} className="flex items-center gap-2 text-sm text-text-secondary border border-border px-4 py-2 rounded-xl hover:bg-red-50 hover:text-danger hover:border-red-200 transition-all">
          <LogOut size={15} /> Sign Out
        </button>
      </div>

      {/* Success toast */}
      {saved && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-medium mb-6 fade-up">
          <CheckCircle size={16} /> Profile updated successfully!
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Star size={18} className="text-warning" />} label="Avg Rating" value={(profile.avg_rating || 0) > 0 ? `${profile.avg_rating?.toFixed(1)} ★` : '—'} color="bg-amber-50" />
        <StatCard icon={<Users size={18} className="text-accent" />} label="Total Reviews" value={profile.review_count || 0} color="bg-blue-50" />
        <StatCard icon={<TrendingUp size={18} className="text-success" />} label="Profile Status" value="Active" color="bg-emerald-50" />
        <StatCard icon={<Phone size={18} className="text-purple-500" />} label="Direct Contact" value="Enabled" color="bg-purple-50" />
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-border shadow-card mb-6">
        <div className="p-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">{profile.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-sm text-text-secondary">{CATEGORY_ICONS[profile.category]} {profile.category}</span>
                <span className="text-text-muted">·</span>
                <span className="flex items-center gap-1 text-sm text-text-muted"><MapPin size={12} />{profile.city}</span>
              </div>
              {(profile.avg_rating || 0) > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Stars rating={profile.avg_rating || 0} />
                  <span className="text-sm font-bold">{profile.avg_rating?.toFixed(1)}</span>
                  <span className="text-xs text-text-muted">({profile.review_count} reviews)</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/worker/${profile.id}`} target="_blank"
              className="p-2.5 rounded-xl border border-border hover:bg-surface-muted transition-colors text-text-secondary" title="View public profile">
              <ExternalLink size={16} />
            </Link>
            <button onClick={() => setEditing(!editing)}
              className={`p-2.5 rounded-xl border transition-colors ${editing ? 'border-accent bg-accent-light text-accent' : 'border-border hover:bg-surface-muted text-text-secondary'}`}>
              {editing ? <X size={16} /> : <Edit2 size={16} />}
            </button>
          </div>
        </div>

        {!editing && profile.description && (
          <div className="px-6 pb-6 border-t border-border pt-4">
            <p className="text-sm text-text-secondary leading-relaxed">{profile.description}</p>
          </div>
        )}
      </div>

      {/* Edit form */}
      {editing && (
        <div className="bg-white rounded-2xl border border-border shadow-card p-6 mb-6 fade-up">
          <h3 className="font-bold text-text-primary text-lg mb-5 flex items-center gap-2">
            <Edit2 size={17} className="text-accent" /> Edit Profile
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Full Name</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} required
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Phone</label>
                <input value={form.phone} onChange={e => set('phone', formatPhone(e.target.value))} required
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">City</label>
                <input value={form.city} onChange={e => set('city', e.target.value)} required
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Category</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} required
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent appearance-none">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">About You</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} maxLength={600}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none transition-all" />
              <div className="text-right text-xs text-text-muted mt-1">{form.description.length}/600</div>
            </div>

            {error && <div className="text-sm text-danger bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</div>}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditing(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:bg-surface-muted transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-accent text-white py-2.5 rounded-xl text-sm font-bold hover:bg-accent-hover transition-colors shadow-button disabled:opacity-60">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-border shadow-card p-5">
        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/worker/${profile.id}`} target="_blank"
            className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-muted hover:bg-accent-light hover:text-accent transition-all text-sm font-semibold text-text-secondary group">
            View Public Profile <ExternalLink size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <button onClick={copyLink}
            className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-muted hover:bg-accent-light hover:text-accent transition-all text-sm font-semibold text-text-secondary text-left group">
            {copied ? 'Link Copied! ✓' : 'Copy Profile Link'}
            <Copy size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}
