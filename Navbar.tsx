'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, Search, LayoutDashboard, LogOut, LogIn, UserPlus } from 'lucide-react'
import clsx from 'clsx'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-ink rounded-xl flex items-center justify-center shadow-button-dark group-hover:scale-105 transition-transform">
              <span className="text-white text-sm font-bold">L</span>
            </div>
            <span className="font-bold text-[17px] tracking-tight text-ink">
              Local<span className="text-accent">Help</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="/search" className={clsx('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all', pathname === '/search' ? 'bg-accent text-white shadow-button' : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary')}>
              <Search size={14} /> Find Workers
            </Link>
            {!loading && user && (
              <Link href="/dashboard" className={clsx('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all', pathname === '/dashboard' ? 'bg-surface-muted text-text-primary' : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary')}>
                <LayoutDashboard size={14} /> My Profile
              </Link>
            )}
            {!loading && (
              user ? (
                <button onClick={handleSignOut} className="ml-2 flex items-center gap-2 border border-border text-text-secondary px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-50 hover:text-danger hover:border-red-200 transition-all">
                  <LogOut size={14} /> Sign Out
                </button>
              ) : (
                <>
                  <Link href="/auth/login" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-all">
                    <LogIn size={14} /> Worker Login
                  </Link>
                  <Link href="/auth/signup" className="ml-2 flex items-center gap-2 bg-ink text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-ink-soft transition-all shadow-button-dark">
                    <UserPlus size={14} /> List Your Services
                  </Link>
                </>
              )
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-xl text-text-secondary hover:bg-surface-muted transition-colors">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 pt-2 border-t border-border space-y-1">
            <Link href="/search" onClick={() => setOpen(false)} className={clsx('flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all', pathname === '/search' ? 'bg-ink text-white' : 'text-text-secondary hover:bg-surface-muted')}>
              <Search size={15} /> Find Workers
            </Link>
            {!loading && user && (
              <Link href="/dashboard" onClick={() => setOpen(false)} className={clsx('flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all', pathname === '/dashboard' ? 'bg-surface-muted text-text-primary' : 'text-text-secondary hover:bg-surface-muted')}>
                <LayoutDashboard size={15} /> My Profile
              </Link>
            )}
            {!loading && (
              user ? (
                <button onClick={handleSignOut} className="flex w-full items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-red-50 transition-all">
                  <LogOut size={15} /> Sign Out
                </button>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-muted transition-all">
                    <LogIn size={15} /> Worker Login
                  </Link>
                  <Link href="/auth/signup" onClick={() => setOpen(false)} className="flex items-center gap-2 bg-ink text-white px-4 py-3 rounded-xl text-sm font-semibold">
                    <UserPlus size={15} /> List Your Services
                  </Link>
                </>
              )
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
