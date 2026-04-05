'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import Avatar from '@/components/Avatar'
import BottomNav from '@/components/BottomNav'

const ALL_SERVICES = ['Barber','Makeup Artist','House Cleaner','Plumber','Electrician','Personal Trainer','Yoga Instructor','Dog Walker','Photographer','Tutor','Chef','Massage Therapist','Painter','Landscaper','Carpenter','Handyman','Babysitter','Pet Groomer','Tailor','Mechanic']

export default function ProfilePage() {
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<'info' | 'provider'>('info')
  const [providerData, setProviderData] = useState<any>(null)
  const [selectedServices, setSelectedServices] = useState<number[]>([])
  const [services, setServices] = useState<{ id: number; name: string }[]>([])
  const [form, setForm] = useState({ city: '', state: '', description: '', experience_years: '', price_range: '', instagram_handle: '' })
  const [isAvailable, setIsAvailable] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [stats, setStats] = useState({ requests: 0, connections: 0, chats: 0 })

  useEffect(() => {
    if (!authLoading && !user) router.replace('/')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const [provRes, svcRes, reqRes, chatRes] = await Promise.all([
        supabase.from('provider_profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('services').select('*').order('name'),
        supabase.from('connection_requests').select('status').eq('from_user', user.id),
        supabase.from('chats').select('id').or(`customer_id.eq.${user.id},provider_id.eq.${user.id}`),
      ])
      setServices(svcRes.data ?? [])
      setStats({
        requests: reqRes.data?.length ?? 0,
        connections: reqRes.data?.filter((r: any) => r.status === 'accepted').length ?? 0,
        chats: chatRes.data?.length ?? 0,
      })
      if (provRes.data) {
        const pv = provRes.data
        setProviderData(pv)
        setIsAvailable(pv.is_available)
        setForm({ city: pv.city ?? '', state: pv.state ?? '', description: pv.description ?? '', experience_years: pv.experience_years?.toString() ?? '', price_range: pv.price_range ?? '', instagram_handle: pv.instagram_handle ?? '' })
        const { data: pvSvcs } = await supabase.from('provider_services').select('service_id').eq('provider_id', user.id)
        setSelectedServices(pvSvcs?.map((s: any) => s.service_id) ?? [])
        setTab('provider')
      }
    }
    load()
  }, [user])

  const toggleService = (id: number) => setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

  const saveProviderProfile = async () => {
    if (!user) return
    setSaving(true)
    try {
      const payload = { id: user.id, city: form.city, state: form.state, description: form.description, experience_years: parseInt(form.experience_years) || 0, price_range: form.price_range || null, instagram_handle: form.instagram_handle || null, is_available: isAvailable }
      const { error } = await supabase.from('provider_profiles').upsert(payload)
      if (error) { alert('Save failed: ' + error.message); return }
      await supabase.from('profiles').update({ account_type: 'provider' }).eq('id', user.id)
      if (selectedServices.length > 0) {
        await supabase.from('provider_services').delete().eq('provider_id', user.id)
        await supabase.from('provider_services').insert(selectedServices.map(sid => ({ provider_id: user.id, service_id: sid })))
      }
      await refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }

  const handleSignOut = async () => {
    await signOut()
    router.replace('/')
  }

  if (authLoading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <>
      <header className="nav-top">
        <span className="font-syne" style={{ fontWeight: 700, fontSize: 18 }}>My Profile</span>
        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--err)', fontSize: 13 }} onClick={handleSignOut}>Sign Out</button>
      </header>

      <div className="profile-hero">
        <Avatar name={profile?.name ?? 'User'} avatarUrl={null} size={72} fontSize={24} />
        <h1 className="font-syne" style={{ fontSize: 20, fontWeight: 700, marginTop: 12, marginBottom: 4 }}>{profile?.name}</h1>
        <p style={{ fontSize: 13, opacity: 0.85 }}>{profile?.account_type === 'provider' ? 'Service Provider' : 'Customer'}</p>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '0 0' }}>
        {[{ label: 'Requests', val: stats.requests }, { label: 'Connections', val: stats.connections }, { label: 'Chats', val: stats.chats }].map(({ label, val }) => (
          <div key={label} className="stat-box" style={{ borderRadius: 0 }}>
            <p className="font-syne" style={{ fontSize: 22, fontWeight: 700 }}>{val}</p>
            <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--b1)', background: 'var(--card)' }}>
        {([['info', 'Account'], ['provider', 'Provider Setup']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ flex: 1, padding: '14px 8px', fontSize: 14, fontWeight: 600, border: 'none', background: 'none', fontFamily: "'DM Sans', sans-serif", color: tab === k ? 'var(--acc)' : 'var(--t2)', borderBottom: tab === k ? '2px solid var(--acc)' : '2px solid transparent', cursor: 'pointer' }}>
            {l}
          </button>
        ))}
      </div>

      <main className="page">
        {tab === 'info' ? (
          <>
            <div className="card" style={{ marginBottom: 12 }}>
              {[{ label: 'Name', val: profile?.name }, { label: 'Email', val: profile?.email }, { label: 'Account type', val: profile?.account_type }].map(({ label, val }, i, arr) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--b1)' : 'none' }}>
                  <span style={{ fontSize: 14, color: 'var(--t2)' }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{val}</span>
                </div>
              ))}
            </div>
            <div className="card" style={{ marginBottom: 12 }}>
              <p className="section-label">Safety & Privacy</p>
              {['Block a user', 'Report a concern', 'Privacy settings'].map((item, i) => (
                <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: i > 0 ? '1px solid var(--b1)' : 'none', cursor: 'pointer' }}>
                  <span style={{ fontSize: 14 }}>{item}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>Availability</p>
                  <p style={{ fontSize: 13, color: 'var(--t2)' }}>{isAvailable ? 'Visible as Available' : 'Shown as Busy'}</p>
                </div>
                <button className={`toggle ${isAvailable ? 'toggle-on' : 'toggle-off'}`} onClick={() => setIsAvailable(v => !v)} />
              </div>
            </div>

            <div className="card" style={{ marginBottom: 12 }}>
              <p className="section-label">Basic Info</p>
              {[{ k: 'city', label: 'City', ph: 'e.g. Austin' }, { k: 'state', label: 'State', ph: 'e.g. TX' }, { k: 'experience_years', label: 'Years of Experience', ph: 'e.g. 5' }, { k: 'price_range', label: 'Price Range (optional)', ph: 'e.g. $30-50/hr' }, { k: 'instagram_handle', label: 'Instagram Handle (optional)', ph: '@yourusername' }].map(({ k, label, ph }) => (
                <div key={k} className="form-group">
                  <label className="label">{label}</label>
                  <input className="input" placeholder={ph} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                </div>
              ))}
              <div className="form-group">
                <label className="label">Description</label>
                <textarea className="input" style={{ resize: 'vertical', minHeight: 80 }} placeholder="Describe your services, experience, and what makes you great…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <p className="section-label">Services you offer</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {services.map(s => (
                  <button key={s.id} className={`chip ${selectedServices.includes(s.id) ? 'active' : ''}`} onClick={() => toggleService(s.id)} style={{ padding: '6px 12px', fontSize: 12 }}>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary btn-full" onClick={saveProviderProfile} disabled={saving}>
              {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save Provider Profile'}
            </button>
          </>
        )}
      </main>
      <BottomNav />
    </>
  )
}
