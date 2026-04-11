'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Provider } from '@/lib/types'
import Avatar from '@/components/Avatar'
import BottomNav from '@/components/BottomNav'

export default function ProviderProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const router = useRouter()
  const [provider, setProvider] = useState<Provider | null>(null)
  const [requestStatus, setRequestStatus] = useState<string | null>(null)
  const [chatId, setChatId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)

  const isOwnProfile = user?.id === id

  useEffect(() => {
    const load = async () => {
      const [provRes, reqRes] = await Promise.all([
        supabase.rpc('search_providers', { p_limit: 200, p_offset: 0 }),
        user ? supabase.from('connection_requests').select('status').eq('from_user', user.id).eq('to_provider', id).maybeSingle() : Promise.resolve({ data: null }),
      ])

      // For own profile, fetch directly from provider_profiles
      if (user?.id === id) {
        const { data: own } = await supabase.from('provider_profiles')
          .select('*, profiles(name, avatar_url)')
          .eq('id', id).maybeSingle()
        const { data: svcs } = await supabase.from('provider_services')
          .select('services(name)').eq('provider_id', id)
        if (own) {
          setProvider({
            id, name: (own as any).profiles?.name ?? '', avatar_url: (own as any).profiles?.avatar_url ?? null,
            city: own.city, state: own.state, description: own.description,
            experience_years: own.experience_years, price_range: own.price_range,
            instagram_handle: own.instagram_handle, is_available: own.is_available,
            rating: own.rating, review_count: own.review_count,
            services: svcs?.map((s: any) => s.services?.name).filter(Boolean) ?? [],
          })
        }
      } else {
        const found = (provRes.data ?? []).find((p: Provider) => p.id === id)
        setProvider(found ?? null)
      }

      setRequestStatus(reqRes.data?.status ?? null)

      if (user && reqRes.data?.status === 'accepted') {
        const { data: chat } = await supabase.from('chats').select('id')
          .or(`and(customer_id.eq.${user.id},provider_id.eq.${id}),and(customer_id.eq.${id},provider_id.eq.${user.id})`)
          .maybeSingle()
        setChatId(chat?.id ?? null)
      }
      setLoading(false)
    }
    load()
  }, [id, user])

  const handleRequest = async () => {
    if (!user || !provider || isOwnProfile) return
    setRequesting(true)
    try {
      const { data: ok } = await supabase.rpc('check_daily_request_limit', { p_user_id: user.id })
      if (!ok) { alert('Daily limit reached (10/day).'); return }
      const { error } = await supabase.from('connection_requests').insert({ from_user: user.id, to_provider: id, status: 'pending' })
      if (!error) setRequestStatus('pending')
      else if (error.code === '23505') alert('Request already sent.')
    } finally { setRequesting(false) }
  }

  const handleReport = async () => {
    if (!user) return
    const reason = prompt('Describe the issue (spam, inappropriate behavior, etc.):')
    if (!reason) return
    await supabase.from('reports').insert({ reporter_id: user.id, reported_id: id, reason })
    alert('Report submitted. Thank you.')
  }

  const PORTFOLIO_COLORS = ['#F0EBE3','#E3EBF0','#E8F0E3','#F0E3EB','#F0EEE3','#E3E8F0']

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (!provider) return (
    <div style={{ padding: '80px 24px', textAlign: 'center' }}>
      <p style={{ fontSize: 48, marginBottom: 16 }}>😕</p>
      <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Provider not found</p>
      <Link href="/discover" className="btn btn-primary" style={{ marginTop: 8 }}>Back to Search</Link>
    </div>
  )

  return (
    <>
      <header className="nav-top">
        <button className="btn btn-ghost btn-sm" style={{ padding: '8px 12px', gap: 6 }} onClick={() => router.back()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>
        <span className="font-display" style={{ fontWeight: 700, fontSize: 16 }}>Profile</span>
        <button className="btn btn-ghost btn-sm" style={{ fontSize: 12, color: 'var(--err)', padding: '8px 12px' }} onClick={handleReport}>Report</button>
      </header>

      {/* Hero */}
      <div className="profile-hero">
        <Avatar name={provider.name} avatarUrl={provider.avatar_url} size={80} fontSize={28} />
        <h1 className="font-display" style={{ fontSize: 26, fontWeight: 800, marginTop: 14, marginBottom: 6, letterSpacing: '-0.03em' }}>{provider.name}</h1>
        <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 14, fontWeight: 500 }}>
          📍 {provider.city}, {provider.state}
        </p>
        <span style={{
          background: provider.is_available ? 'rgba(0,200,120,0.2)' : 'rgba(255,255,255,0.1)',
          border: `1px solid ${provider.is_available ? 'rgba(0,200,120,0.4)' : 'rgba(255,255,255,0.15)'}`,
          padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: provider.is_available ? '#4ADE80' : 'rgba(255,255,255,0.4)', display: 'inline-block' }} />
          {provider.is_available ? 'Available Now' : 'Currently Busy'}
        </span>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', background: 'var(--card)', borderBottom: '1px solid var(--b1)' }}>
        {[
          { label: 'Experience', val: `${provider.experience_years}y` },
          { label: 'Rating', val: provider.rating > 0 ? `${provider.rating.toFixed(1)} ★` : '—' },
          { label: 'Reviews', val: provider.review_count > 0 ? provider.review_count : '—' },
        ].map(({ label, val }, i) => (
          <div key={label} className="stat-box" style={{ borderRadius: 0, borderRight: i < 2 ? '1px solid var(--b1)' : 'none' }}>
            <p className="font-display" style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)' }}>{val}</p>
            <p style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
          </div>
        ))}
      </div>

      <main className="page fade-in">
        {/* Services */}
        <div className="card-flat" style={{ marginBottom: 10 }}>
          <p className="section-label">Services</p>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {provider.services.map(s => <span key={s} className="tag">{s}</span>)}
          </div>
        </div>

        {/* About */}
        {provider.description && (
          <div className="card-flat" style={{ marginBottom: 10 }}>
            <p className="section-label">About</p>
            <p style={{ fontSize: 14, color: 'var(--t1)', lineHeight: 1.75 }}>{provider.description}</p>
          </div>
        )}

        {/* Pricing */}
        {provider.price_range && (
          <div className="card-flat" style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p className="section-label" style={{ margin: 0 }}>Pricing</p>
              <p className="font-display" style={{ fontWeight: 800, fontSize: 18, color: 'var(--acc)' }}>{provider.price_range}</p>
            </div>
          </div>
        )}

        {/* Instagram */}
        {provider.instagram_handle && (
          <div className="card-flat" style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{provider.instagram_handle}</p>
                <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>Shared only after connecting</p>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio */}
        <div style={{ marginBottom: 24 }}>
          <p className="section-label">Portfolio</p>
          <div className="portfolio-grid">
            {PORTFOLIO_COLORS.map((c, i) => (
              <div key={i} className="portfolio-img" style={{ background: `linear-gradient(145deg, ${c}, #d8d0c8)` }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t4)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        {isOwnProfile ? (
          <div style={{ background: 'var(--acc-lt)', border: '1.5px dashed var(--acc)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--acc)', marginBottom: 6 }}>This is your provider profile</p>
            <p style={{ fontSize: 13, color: 'var(--t2)' }}>Edit it from the <strong>Me</strong> tab</p>
          </div>
        ) : chatId ? (
          <Link href={`/chat/${chatId}`} className="btn btn-primary btn-full" style={{ fontSize: 15, padding: 15, borderRadius: 16 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            Open Chat
          </Link>
        ) : requestStatus === 'pending' ? (
          <div style={{ background: 'var(--warn-lt)', border: '1px solid rgba(196,123,0,0.2)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--warn)', marginBottom: 6 }}>⏳ Request Sent</p>
            <p style={{ fontSize: 13, color: 'var(--t2)' }}>Waiting for {provider.name} to accept</p>
          </div>
        ) : requestStatus === 'rejected' ? (
          <div style={{ background: 'var(--card3)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
            <p style={{ color: 'var(--t2)', fontSize: 14, fontWeight: 500 }}>This request was declined.</p>
          </div>
        ) : (
          <button className="btn btn-primary btn-full" style={{ fontSize: 15, padding: 15, borderRadius: 16 }} onClick={handleRequest} disabled={requesting}>
            {requesting ? 'Sending…' : `Connect with ${provider.name.split(' ')[0]}`}
          </button>
        )}
      </main>
      <BottomNav />
    </>
  )
}
