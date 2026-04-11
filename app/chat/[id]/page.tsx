'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Message } from '@/lib/types'
import Avatar from '@/components/Avatar'

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
      const { data: chat } = await supabase.from('chats')
        .select('customer_id,provider_id,customer:profiles!chats_customer_id_fkey(name,avatar_url),provider:profiles!chats_provider_id_fkey(name,avatar_url)')
        .eq('id', id).single()
      if (!chat) { router.replace('/chat'); return }
      setOtherUser(chat.customer_id === user.id ? (chat as any).provider : (chat as any).customer)
      const { data: msgs } = await supabase.from('messages').select('*').eq('chat_id', id).order('sent_at', { ascending: true }).limit(100)
      setMessages(msgs ?? [])
      setLoading(false)
    }
    load()

    const sub = supabase.channel(`chat-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${id}` },
        (payload) => {
          const msg = payload.new as Message
          setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg])
        })
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [id, user, router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || !user || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)
    const opt: Message = { id: `opt-${Date.now()}`, chat_id: id, sender_id: user.id, content, sent_at: new Date().toISOString() }
    setMessages(prev => [...prev, opt])
    const { error } = await supabase.from('messages').insert({ chat_id: id, sender_id: user.id, content })
    if (error) setMessages(prev => prev.filter(m => m.id !== opt.id))
    setSending(false)
    inputRef.current?.focus()
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header className="nav-top" style={{ flexShrink: 0 }}>
        <button className="btn btn-ghost btn-sm" style={{ padding: '8px 12px', gap: 6 }} onClick={() => router.back()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            {otherUser && <Avatar name={otherUser.name} avatarUrl={otherUser.avatar_url} size={36} />}
            <span style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, background: 'var(--ok)', borderRadius: '50%', border: '2px solid var(--card)' }} />
          </div>
          <div>
            <p className="font-display" style={{ fontWeight: 700, fontSize: 15, lineHeight: 1 }}>{otherUser?.name}</p>
            <p style={{ fontSize: 11, color: 'var(--ok)', fontWeight: 600, marginTop: 2 }}>Connected</p>
          </div>
        </div>
        <div style={{ width: 60 }} />
      </header>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--t3)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
            <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--t2)', marginBottom: 6 }}>You're connected!</p>
            <p style={{ fontSize: 13 }}>Say hello to {otherUser?.name?.split(' ')[0]} to get started</p>
          </div>
        )}
        {messages.map(m => {
          const isMe = m.sender_id === user?.id
          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: 2 }}>
              <div className={isMe ? 'bubble-me' : 'bubble-them'} style={{ opacity: m.id.startsWith('opt-') ? 0.65 : 1 }}>
                {m.content}
                <div className="bubble-time" style={{ textAlign: isMe ? 'right' : 'left' }}>
                  {new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} style={{ height: 8 }} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, padding: '12px 16px 16px', background: 'var(--card)', borderTop: '1px solid var(--b1)', flexShrink: 0 }}>
        <input ref={inputRef} className="input" style={{ flex: 1, padding: '11px 16px', borderRadius: 14 }}
          placeholder="Type a message…"
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} />
        <button className="btn btn-primary" style={{ padding: '11px 16px', borderRadius: 14, flexShrink: 0 }}
          onClick={send} disabled={sending || !input.trim()}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  )
}
