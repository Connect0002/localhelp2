'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

const icons = {
  search: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'none' : 'none'} stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7.5"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  bell: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
    </svg>
  ),
  chat: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  ),
  user: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
}

export default function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      const { count } = await supabase
        .from('connection_requests')
        .select('*', { count: 'exact', head: true })
        .eq('to_provider', user.id)
        .eq('status', 'pending')
      setPendingCount(count ?? 0)
    }
    fetch()
    const sub = supabase.channel('pending-req')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'connection_requests', filter: `to_provider=eq.${user.id}` }, fetch)
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [user])

  const tabs = [
    { href: '/discover', label: 'Discover', key: 'search' as const },
    { href: '/requests', label: 'Requests', key: 'bell' as const, badge: pendingCount },
    { href: '/chat', label: 'Messages', key: 'chat' as const },
    { href: '/profile', label: 'Me', key: 'user' as const },
  ]

  return (
    <nav className="nav-bottom">
      {tabs.map(({ href, label, key, badge }) => {
        const active = pathname.startsWith(href)
        return (
          <Link key={href} href={href} className={`nav-tab ${active ? 'active' : ''}`}>
            <div style={{ position: 'relative' }}>
              {icons[key](active)}
              {badge ? <span className="notif-dot">{badge > 9 ? '9+' : badge}</span> : null}
            </div>
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
