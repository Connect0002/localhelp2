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
  const [reporting, setReporting] = useState(false)

  useEffect(() => {
    const load = async () => {
      const [provRes, reqRes] = await Promise.all([
        supabase.rpc('search_providers', { p_limit: 100, p_offset: 0 }),
        user ? supabase.from('connection_requests').select('status').eq('from_user', user.id).eq('to_provider', id).maybeSingle() : Promise.resolve({ data: null }),
      ])
      const found = (provRes.data ?? []).find((p: Provider) => p.id === id)
      setProvider(found ?? null)
      setRequestStatus(reqRes.data?.status ?? null)

      if (user && reqRes.data?.status === 'accepted') {
        const { data: chat } = await supabase.from('chats')
          .select('id').or(`customer_id.eq.${user.id},provider_id.eq.${user.id}`)
          .or(`customer_id.eq.${id},provider_id.eq.${id}`).maybeSingle()
        setChatId(chat?.id ?? null)
      }
      setLoading(false)
    }
    load()
  }, [id, user])

  const handleRequest = async () => {
    if (!user || !provider) return
    setRequesting(true)
    try {
      const allowed = await supabase.rpc('check_daily_request_limit', { p_user_id: user.id })
      if (!allowed.data) { alert('Daily limit reached (10/day). Try again tomorrow.'); return }
      const { error } = await supabase.from('connection_requests').insert({ from_user: user.id, to_provider: id, status: 'pending' })
      if (!error) setRequestStatus('pending')
      else if (error.code === '23505') alert('You already sent a request to this provider.')
    } finally { setRequesting(false) }
  }

  const handleReport = async () => {
    if (!user) return
    const reason = prompt('Please describe the issue (spam, inappropriate, etc.):')
    if (!reason) return
    setReporting(true)
    await supabase.from('reports').insert({ reporter_id: user.id, reported_id: id, reason })
    setReporting(false)
    alert('Report submitted. Thank you for keeping the community safe.')
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (!provider) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
      <p style={{ fontSize: 48, marginBottom: 12 }}>😕</p>
      <p style={{ fontWeight: 600 }}>Provider not found</p>
      <Link href="/discover" className="btn btn-outline" style={{ marginTop: 16 }}>Back to Search</Link>
    </div>
  )

  const MOCK_COLORS = ['#E8E0D8','#D8E8E0','#D8D8E8','#E8D8E0','#E8E8D8','#EDE8D8']

  return (
    <>
      <header className="nav-top">
        <button className="btn btn-ghost btn-sm" style={{ padding: '6px 10px' }} onClick={() => router.back()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <span className="font-syne" style={{ fontWeight: 700, fontSize: 16 }}>Profile</span>
        <button className="btn btn-danger btn-sm" style={{ fontSize: 12 }} onClick={handleReport} disabled={reporting}>
          {reporting ? '…' : 'Report'}
        </button>
      </header>

      <div className="profile-hero">
        <Avatar name={provider.name} avatarUrl={provider.avatar_url} size={80} fontSize={28} />
        <h1 className="font-syne" style={{ fontSize: 24, fontWeight: 800, marginTop: 12, marginBottom: 6 }}>{provider.name}</h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 10, fontSize: 14, opacity: 0.9 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {provider.city}, {provider.state}
        </div>
        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
          <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: provider.is_available ? '#4ADE80' : '#ccc', marginRight: 5 }} />
          {provider.is_available ? 'Available Now' : 'Currently Busy'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 0, background: 'var(--card)', borderBottom: '1px solid var(--b1)' }}>
        {[
          { label: 'Exp', val: `${provider.experience_years}yr` },
          { label: 'Rating', val: provider.rating > 0 ? provider.rating.toFixed(1) : '—' },
          { label: 'Reviews', val: provider.review_count || '—' },
        ].map(({ label, val }, i) => (
          <div key={label} className="stat-box" style={{ borderRight: i < 2 ? '1px solid var(--b1)' : 'none', borderRadius: 0 }}>
            <p className="font-syne" style={{ fontSize: 22, fontWeight: 700, color: 'var(--t1)' }}>{val}</p>
            <p style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 500, marginTop: 2 }}>{label}</p>
          </div>
        ))}
      </div>

      <main className="page">
        <div className="card" style={{ marginBottom: 12 }}>
          <p className="section-label">Services</p>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {provider.services.map(s => <span key={s} className="tag">{s}</span>)}
          </div>
        </div>

        {provider.description && (
          <div className="card" style={{ marginBottom: 12 }}>
            <p className="section-label">About</p>
            <p style={{ fontSize: 14, color: 'var(--t1)', lineHeight: 1.7 }}>{provider.description}</p>
          </div>
        )}

        {provider.price_range && (
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="section-label" style={{ margin: 0 }}>Pricing</span>
              <span className="font-syne" style={{ fontWeight: 700, fontSize: 16, color: 'var(--acc)' }}>{provider.price_range}</span>
            </div>
          </div>
        )}

        {provider.instagram_handle && (
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t2)" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--acc)' }}>{provider.instagram_handle}</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 6 }}>Contact info shared only after connecting</p>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <p className="section-label">Portfolio</p>
          <div className="portfolio-grid">
            {MOCK_COLORS.map((c, i) => (
              <div key={i} className="portfolio-img" style={{ background: `linear-gradient(135deg, ${c}, #c8c0b8)` }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {chatId ? (
          <Link href={`/chat/${chatId}`} className="btn btn-primary btn-full">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            Open Chat
          </Link>
        ) : requestStatus === 'pending' ? (
          <div className="card" style={{ textAlign: 'center', borderStyle: 'dashed' }}>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>Request Sent ✓</p>
            <p style={{ fontSize: 13, color: 'var(--t2)' }}>Waiting for {provider.name} to accept your request</p>
          </div>
        ) : requestStatus === 'rejected' ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--t2)', fontSize: 14 }}>This request was declined.</p>
          </div>
        ) : (
          <button className="btn btn-primary btn-full" onClick={handleRequest} disabled={requesting}>
            {requesting ? 'Sending…' : 'Request to Connect'}
          </button>
        )}
      </main>
      <BottomNav />
    </>
  )
}
