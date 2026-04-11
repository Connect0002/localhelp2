'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import Avatar from '@/components/Avatar'
import BottomNav from '@/components/BottomNav'

interface Req { id: string; from_user: string; to_provider: string; status: string; created_at: string; other_name: string; other_avatar: string | null; chat_id?: string | null }

export default function RequestsPage() {
  const { user, loading: al } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<'sent' | 'received'>('sent')
  const [sent, setSent] = useState<Req[]>([])
  const [received, setReceived] = useState<Req[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  useEffect(() => { if (!al && !user) router.replace('/') }, [user, al, router])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      const [s, r] = await Promise.all([
        supabase.from('connection_requests').select('*, profiles!connection_requests_to_provider_fkey(name,avatar_url)').eq('from_user', user.id).order('created_at', { ascending: false }),
        supabase.from('connection_requests').select('*, profiles!connection_requests_from_user_fkey(name,avatar_url)').eq('to_provider', user.id).order('created_at', { ascending: false }),
      ])
      const ms = (s.data ?? []).map((x: any) => ({ ...x, other_name: x.profiles?.name ?? 'Unknown', other_avatar: x.profiles?.avatar_url ?? null }))
      const mr = (r.data ?? []).map((x: any) => ({ ...x, other_name: x.profiles?.name ?? 'Unknown', other_avatar: x.profiles?.avatar_url ?? null }))
      const acceptedIds = [...ms, ...mr].filter(x => x.status === 'accepted').map(x => x.id)
      if (acceptedIds.length) {
        const { data: chats } = await supabase.from('chats').select('id,request_id').in('request_id', acceptedIds)
        const cmap: Record<string, string> = {}
        chats?.forEach((c: any) => { cmap[c.request_id] = c.id })
        ms.forEach(x => { x.chat_id = cmap[x.id] ?? null })
        mr.forEach(x => { x.chat_id = cmap[x.id] ?? null })
      }
      setSent(ms); setReceived(mr); setLoading(false)
    }
    load()
  }, [user])

  const act = async (reqId: string, status: 'accepted' | 'rejected') => {
    setActing(reqId)
    await supabase.from('connection_requests').update({ status }).eq('id', reqId)
    setReceived(prev => prev.map(r => r.id === reqId ? { ...r, status } : r))
    setActing(null)
  }

  const pending = received.filter(r => r.status === 'pending').length

  const statusBadge = (s: string) => {
    if (s === 'pending') return <span className="badge badge-warn">Pending</span>
    if (s === 'accepted') return <span className="badge badge-ok">✓ Accepted</span>
    return <span className="badge badge-neutral">Declined</span>
  }

  if (al || loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <>
      <header className="nav-top">
        <span className="font-display" style={{ fontWeight: 800, fontSize: 20 }}>Requests</span>
        {pending > 0 && <span className="badge badge-acc">{pending} new</span>}
      </header>

      <div className="tab-bar">
        {([['sent', 'Sent'], ['received', 'Incoming']] as const).map(([k, l]) => (
          <button key={k} className={`tab-item ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>
            {l}
            {k === 'received' && pending > 0 && (
              <span style={{ marginLeft: 6, background: 'var(--err)', color: '#fff', borderRadius: 10, fontSize: 10, padding: '1px 5px', fontWeight: 800 }}>{pending}</span>
            )}
          </button>
        ))}
      </div>

      <main className="page">
        {tab === 'sent' ? (
          sent.length === 0 ? (
            <div className="empty-state fade-in">
              <div className="empty-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </div>
              <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>No requests sent yet</p>
              <p style={{ fontSize: 14, color: 'var(--t3)', marginBottom: 24 }}>Browse providers and tap Connect</p>
              <Link href="/discover" className="btn btn-primary">Browse Providers</Link>
            </div>
          ) : sent.map((r, i) => (
            <div key={r.id} className="req-card fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <Avatar name={r.other_name} avatarUrl={r.other_avatar} size={46} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{r.other_name}</p>
                  <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                {statusBadge(r.status)}
              </div>
              {r.status === 'accepted' && r.chat_id && (
                <Link href={`/chat/${r.chat_id}`} className="btn btn-primary btn-sm btn-full" style={{ marginTop: 13 }}>
                  Open Chat →
                </Link>
              )}
            </div>
          ))
        ) : (
          received.length === 0 ? (
            <div className="empty-state fade-in">
              <div className="empty-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              </div>
              <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>No incoming requests</p>
              <p style={{ fontSize: 14, color: 'var(--t3)' }}>Set up your provider profile to start receiving requests</p>
            </div>
          ) : received.map((r, i) => (
            <div key={r.id} className="req-card fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: r.status === 'pending' ? 13 : 0 }}>
                <Avatar name={r.other_name} avatarUrl={r.other_avatar} size={46} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{r.other_name}</p>
                  <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                {statusBadge(r.status)}
              </div>
              {r.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => act(r.id, 'accepted')} disabled={acting === r.id}>Accept</button>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1, color: 'var(--err)' }} onClick={() => act(r.id, 'rejected')} disabled={acting === r.id}>Decline</button>
                </div>
              )}
              {r.status === 'accepted' && r.chat_id && (
                <Link href={`/chat/${r.chat_id}`} className="btn btn-outline btn-sm btn-full" style={{ marginTop: 0 }}>Open Chat →</Link>
              )}
            </div>
          ))
        )}
      </main>
      <BottomNav />
    </>
  )
}
