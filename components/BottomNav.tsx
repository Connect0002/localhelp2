'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

function SearchIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
}
function BellIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
}
function ChatIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
}
function UserIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/></svg>
}

export default function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (!user) return
    const fetchPending = async () => {
      const { count } = await supabase
        .from('connection_requests')
        .select('*', { count: 'exact', head: true })
        .eq('to_provider', user.id)
        .eq('status', 'pending')
      setPendingCount(count ?? 0)
    }
    fetchPending()

    const sub = supabase
      .channel('pending-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'connection_requests', filter: `to_provider=eq.${user.id}` }, fetchPending)
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [user])

  const tabs = [
    { href: '/discover', label: 'Discover', Icon: SearchIcon },
    { href: '/requests', label: 'Requests', Icon: BellIcon, badge: pendingCount },
    { href: '/chat', label: 'Messages', Icon: ChatIcon },
    { href: '/profile', label: 'Me', Icon: UserIcon },
  ]

  return (
    <nav className="nav-bottom">
      {tabs.map(({ href, label, Icon, badge }) => {
        const active = pathname.startsWith(href)
        return (
          <Link key={href} href={href} className={`nav-tab ${active ? 'active' : ''}`}>
            <div style={{ position: 'relative' }}>
              <Icon />
              {badge ? <span className="notif-dot">{badge > 9 ? '9+' : badge}</span> : null}
            </div>
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
