'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Message } from '@/lib/types'
import Avatar from '@/components/Avatar'
import BottomNav from '@/components/BottomNav'

export default function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<{ name: string; avatar_url: string | null } | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data: chat } = await supabase
        .from('chats')
        .select('customer_id, provider_id, customer:profiles!chats_customer_id_fkey(name, avatar_url), provider:profiles!chats_provider_id_fkey(name, avatar_url)')
        .eq('id', id)
        .single()

      if (!chat) { router.replace('/chat'); return }

      const isCustomer = chat.customer_id === user.id
      setOtherUser(isCustomer ? (chat as any).provider : (chat as any).customer)

      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', id)
        .order('sent_at', { ascending: true })
        .limit(100)

      setMessages(msgs ?? [])
      setLoading(false)
    }
    load()

    const sub = supabase
      .channel(`chat-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${id}` },
        (payload) => {
          const msg = payload.new as Message
          setMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev
            return [...prev, msg]
          })
        })
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [id, user, router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !user || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)
    const optimistic: Message = { id: `opt-${Date.now()}`, chat_id: id, sender_id: user.id, content, sent_at: new Date().toISOString() }
    setMessages(prev => [...prev, optimistic])
    const { error } = await supabase.from('messages').insert({ chat_id: id, sender_id: user.id, content })
    if (error) setMessages(prev => prev.filter(m => m.id !== optimistic.id))
    setSending(false)
    inputRef.current?.focus()
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header className="nav-top" style={{ flexShrink: 0 }}>
        <button className="btn btn-ghost btn-sm" style={{ padding: '6px 10px' }} onClick={() => router.back()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {otherUser && <Avatar name={otherUser.name} avatarUrl={otherUser.avatar_url} size={34} />}
          <div>
            <p style={{ fontWeight: 600, fontSize: 14, lineHeight: 1 }}>{otherUser?.name}</p>
            <p style={{ fontSize: 11, color: 'var(--ok)', marginTop: 2 }}>Connected</p>
          </div>
        </div>
        <div style={{ width: 70 }} />
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 20px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--t3)' }}>
            <p style={{ fontSize: 14 }}>You're now connected with {otherUser?.name}.</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Say hello to get started!</p>
          </div>
        )}
        {messages.map(m => {
          const isMe = m.sender_id === user?.id
          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
              <div className={isMe ? 'bubble-me' : 'bubble-them'} style={{ opacity: m.id.startsWith('opt-') ? 0.7 : 1 }}>
                {m.content}
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                  {new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '12px 16px 16px', background: 'var(--card)', borderTop: '1px solid var(--b1)', flexShrink: 0 }}>
        <input
          ref={inputRef}
          className="input"
          style={{ flex: 1, padding: '10px 14px' }}
          placeholder="Type a message…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
        />
        <button className="btn btn-primary" style={{ padding: '10px 14px', flexShrink: 0 }} onClick={sendMessage} disabled={sending || !input.trim()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  )
}
