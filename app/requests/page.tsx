'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import Avatar from '@/components/Avatar'
import BottomNav from '@/components/BottomNav'

interface RequestWithProfile {
  id: string
  from_user: string
  to_provider: string
  status: string
  created_at: string
  other_name: string
  other_avatar: string | null
  services?: string[]
  chat_id?: string | null
}

export default function RequestsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<'sent' | 'received'>('sent')
  const [sent, setSent] = useState<RequestWithProfile[]>([])
  const [received, setReceived] = useState<RequestWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      const [sentRes, recRes] = await Promise.all([
        supabase.from('connection_requests').select('*, profiles!connection_requests_to_provider_fkey(name, avatar_url)').eq('from_user', user.id).order('created_at', { ascending: false }),
        supabase.from('connection_requests').select('*, profiles!connection_requests_from_user_fkey(name, avatar_url)').eq('to_provider', user.id).order('created_at', { ascending: false }),
      ])

      const mapSent = (sentRes.data ?? []).map((r: any) => ({
        ...r, other_name: r.profiles?.name ?? 'Unknown', other_avatar: r.profiles?.avatar_url ?? null,
      }))

      const mapRec = (recRes.data ?? []).map((r: any) => ({
        ...r, other_name: r.profiles?.name ?? 'Unknown', other_avatar: r.profiles?.avatar_url ?? null,
      }))

      // Attach chat IDs for accepted
      const acceptedIds = [...mapSent, ...mapRec].filter(r => r.status === 'accepted').map(r => r.id)
      if (acceptedIds.length > 0) {
        const { data: chats } = await supabase.from('chats').select('id, request_id').in('request_id', acceptedIds)
        const chatMap: Record<string, string> = {}
        chats?.forEach((c: any) => { chatMap[c.request_id] = c.id })
        mapSent.forEach(r => { r.chat_id = chatMap[r.id] ?? null })
        mapRec.forEach(r => { r.chat_id = chatMap[r.id] ?? null })
      }

      setSent(mapSent)
      setReceived(mapRec)
      setLoading(false)
    }
    load()
  }, [user])

  const handleAccept = async (reqId: string) => {
    setActing(reqId)
    await supabase.from('connection_requests').update({ status: 'accepted' }).eq('id', reqId)
    setReceived(prev => prev.map(r => r.id === reqId ? { ...r, status: 'accepted' } : r))
    setActing(null)
  }

  const handleReject = async (reqId: string) => {
    setActing(reqId)
    await supabase.from('connection_requests').update({ status: 'rejected' }).eq('id', reqId)
    setReceived(prev => prev.map(r => r.id === reqId ? { ...r, status: 'rejected' } : r))
    setActing(null)
  }

  const pendingReceived = received.filter(r => r.status === 'pending').length

  if (authLoading || loading) return <div className="loading-screen"><div className="spinner" /></div>

  const renderStatus = (status: string) => {
    if (status === 'pending') return <span className="badge badge-warn">Pending</span>
    if (status === 'accepted') return <span className="badge badge-ok">Accepted</span>
    return <span className="badge badge-err">Rejected</span>
  }

  return (
    <>
      <header className="nav-top">
        <span className="font-syne" style={{ fontWeight: 700, fontSize: 18 }}>Requests</span>
        {pendingReceived > 0 && <span className="badge badge-warn">{pendingReceived} incoming</span>}
      </header>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--b1)', background: 'var(--card)' }}>
        {([['sent', 'Sent'], ['received', 'Incoming']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ flex: 1, padding: '14px 8px', fontSize: 14, fontWeight: 600, border: 'none', background: 'none', fontFamily: "'DM Sans', sans-serif", color: tab === k ? 'var(--acc)' : 'var(--t2)', borderBottom: tab === k ? '2px solid var(--acc)' : '2px solid transparent', cursor: 'pointer', position: 'relative' }}>
            {l}
            {k === 'received' && pendingReceived > 0 && <span style={{ marginLeft: 6, background: 'var(--acc)', color: '#fff', borderRadius: 10, fontSize: 10, padding: '1px 5px', fontWeight: 700 }}>{pendingReceived}</span>}
          </button>
        ))}
      </div>

      <main className="page">
        {tab === 'sent' ? (
          sent.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48, marginBottom: 12 }}>📤</div>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>No requests sent yet</p>
              <p style={{ fontSize: 14, marginBottom: 20 }}>Search for providers and tap Request Connect</p>
              <Link href="/discover" className="btn btn-primary">Find Providers</Link>
            </div>
          ) : sent.map(r => (
            <div key={r.id} className="card" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar name={r.other_name} avatarUrl={r.other_avatar} size={44} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{r.other_name}</p>
                  <p style={{ fontSize: 12, color: 'var(--t2)' }}>{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                {renderStatus(r.status)}
              </div>
              {r.status === 'accepted' && r.chat_id && (
                <Link href={`/chat/${r.chat_id}`} className="btn btn-primary btn-sm btn-full" style={{ marginTop: 12 }}>
                  Open Chat
                </Link>
              )}
            </div>
          ))
        ) : (
          received.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48, marginBottom: 12 }}>📥</div>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>No incoming requests</p>
              <p style={{ fontSize: 14 }}>Customers who want to connect will appear here</p>
            </div>
          ) : received.map(r => (
            <div key={r.id} className="card" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: r.status === 'pending' ? 12 : 0 }}>
                <Avatar name={r.other_name} avatarUrl={r.other_avatar} size={44} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{r.other_name}</p>
                  <p style={{ fontSize: 12, color: 'var(--t2)' }}>{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                {renderStatus(r.status)}
              </div>
              {r.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => handleAccept(r.id)} disabled={acting === r.id}>Accept</button>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1, color: 'var(--err)' }} onClick={() => handleReject(r.id)} disabled={acting === r.id}>Decline</button>
                </div>
              )}
              {r.status === 'accepted' && r.chat_id && (
                <Link href={`/chat/${r.chat_id}`} className="btn btn-outline btn-sm btn-full" style={{ marginTop: 0 }}>Open Chat</Link>
              )}
            </div>
          ))
        )}
      </main>
      <BottomNav />
    </>
  )
}
