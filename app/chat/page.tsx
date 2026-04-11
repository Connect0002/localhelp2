'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import Avatar from '@/components/Avatar'
import BottomNav from '@/components/BottomNav'

interface ChatItem { id: string; other_name: string; other_avatar: string | null; last_message: string; last_message_at: string }

export default function ChatListPage() {
  const { user, loading: al } = useAuth()
  const router = useRouter()
  const [chats, setChats] = useState<ChatItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (!al && !user) router.replace('/') }, [user, al, router])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data } = await supabase.from('chats')
        .select('id,last_message_at,customer_id,provider_id,customer:profiles!chats_customer_id_fkey(name,avatar_url),provider:profiles!chats_provider_id_fkey(name,avatar_url)')
        .or(`customer_id.eq.${user.id},provider_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false })
      if (data) {
        const items: ChatItem[] = await Promise.all(data.map(async (c: any) => {
          const other = c.customer_id === user.id ? c.provider : c.customer
          const { data: msgs } = await supabase.from('messages').select('content').eq('chat_id', c.id).order('sent_at', { ascending: false }).limit(1)
          return { id: c.id, other_name: other?.name ?? 'Unknown', other_avatar: other?.avatar_url ?? null, last_message: msgs?.[0]?.content ?? 'No messages yet', last_message_at: c.last_message_at }
        }))
        setChats(items)
      }
      setLoading(false)
    }
    load()
  }, [user])

  if (al || loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <>
      <header className="nav-top">
        <span className="font-display" style={{ fontWeight: 800, fontSize: 20 }}>Messages</span>
        <span style={{ fontSize: 13, color: 'var(--t3)', fontWeight: 600 }}>{chats.length} chats</span>
      </header>

      <main className="page">
        {chats.length === 0 ? (
          <div className="empty-state fade-in">
            <div className="empty-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </div>
            <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>No conversations yet</p>
            <p style={{ fontSize: 14, color: 'var(--t3)', marginBottom: 24 }}>Chats unlock once a provider accepts your request</p>
            <Link href="/discover" className="btn btn-primary">Find Providers</Link>
          </div>
        ) : (
          <div style={{ background: 'var(--card)', borderRadius: 18, border: '1px solid var(--b1)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            {chats.map((c, i) => (
              <Link key={c.id} href={`/chat/${c.id}`} className="chat-item" style={{ padding: '16px 18px', borderBottom: i < chats.length - 1 ? '1px solid var(--b0)' : 'none' }}>
                <div style={{ position: 'relative' }}>
                  <Avatar name={c.other_name} avatarUrl={c.other_avatar} size={50} />
                  <span style={{ position: 'absolute', bottom: 2, right: 2, width: 10, height: 10, background: 'var(--ok)', borderRadius: '50%', border: '2px solid var(--card)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <p style={{ fontWeight: 700, fontSize: 15 }}>{c.other_name}</p>
                    <p style={{ fontSize: 11, color: 'var(--t4)', fontWeight: 600 }}>
                      {new Date(c.last_message_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--t3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.last_message}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  )
}
