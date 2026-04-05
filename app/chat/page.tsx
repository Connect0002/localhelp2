'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import Avatar from '@/components/Avatar'
import BottomNav from '@/components/BottomNav'

interface ChatListItem {
  id: string
  other_name: string
  other_avatar: string | null
  last_message: string
  last_message_at: string
}

export default function ChatListPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [chats, setChats] = useState<ChatListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data } = await supabase
        .from('chats')
        .select('id, last_message_at, customer_id, provider_id, customer:profiles!chats_customer_id_fkey(name, avatar_url), provider:profiles!chats_provider_id_fkey(name, avatar_url)')
        .or(`customer_id.eq.${user.id},provider_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false })

      if (data) {
        const items: ChatListItem[] = await Promise.all(data.map(async (c: any) => {
          const isCustomer = c.customer_id === user.id
          const other = isCustomer ? c.provider : c.customer
          const { data: msgs } = await supabase
            .from('messages')
            .select('content')
            .eq('chat_id', c.id)
            .order('sent_at', { ascending: false })
            .limit(1)
          return {
            id: c.id,
            other_name: other?.name ?? 'Unknown',
            other_avatar: other?.avatar_url ?? null,
            last_message: msgs?.[0]?.content ?? 'No messages yet',
            last_message_at: c.last_message_at,
          }
        }))
        setChats(items)
      }
      setLoading(false)
    }
    load()
  }, [user])

  if (authLoading || loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <>
      <header className="nav-top">
        <span className="font-syne" style={{ fontWeight: 700, fontSize: 18 }}>Messages</span>
        <span style={{ fontSize: 13, color: 'var(--t3)' }}>{chats.length} chats</span>
      </header>

      <main className="page">
        {chats.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
            <p style={{ fontWeight: 600, marginBottom: 6 }}>No conversations yet</p>
            <p style={{ fontSize: 14, marginBottom: 20 }}>Chats unlock after a provider accepts your request</p>
            <Link href="/discover" className="btn btn-primary">Find Providers</Link>
          </div>
        ) : chats.map(c => (
          <Link key={c.id} href={`/chat/${c.id}`} className="chat-item">
            <Avatar name={c.other_name} avatarUrl={c.other_avatar} size={48} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{c.other_name}</p>
                <p style={{ fontSize: 11, color: 'var(--t3)', flexShrink: 0 }}>
                  {new Date(c.last_message_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <p style={{ fontSize: 13, color: 'var(--t2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {c.last_message}
              </p>
            </div>
          </Link>
        ))}
      </main>
      <BottomNav />
    </>
  )
}
