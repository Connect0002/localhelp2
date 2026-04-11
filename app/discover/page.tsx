'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Provider } from '@/lib/types'
import ProviderCard from '@/components/ProviderCard'
import BottomNav from '@/components/BottomNav'

const QUICK_FILTERS = [
  { label: '⚡ Available Now', service: '', availOnly: true },
  { label: '✂️ Barbers', service: 'barber', availOnly: false },
  { label: '✨ Makeup', service: 'makeup', availOnly: false },
  { label: '🏠 Cleaners', service: 'cleaner', availOnly: false },
  { label: '💪 Trainers', service: 'trainer', availOnly: false },
  { label: '📸 Photographers', service: 'photographer', availOnly: false },
  { label: '🐾 Pet Care', service: 'dog', availOnly: false },
]

export default function DiscoverPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [providers, setProviders] = useState<Provider[]>([])
  const [requestStatuses, setRequestStatuses] = useState<Record<string, string>>({})
  const [query, setQuery] = useState('')
  const [availOnly, setAvailOnly] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [fetching, setFetching] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const timer = useRef<NodeJS.Timeout | undefined>(undefined)
  const LIMIT = 15

  useEffect(() => { if (!loading && !user) router.replace('/') }, [user, loading, router])

  const fetchProviders = useCallback(async (q: string, avail: boolean, pg: number, append = false) => {
    setFetching(true)
    try {
      const { data, error } = await supabase.rpc('search_providers', {
        p_service: q || null, p_city: null,
        p_available: avail || null,
        p_limit: LIMIT, p_offset: pg * LIMIT,
      })
      if (error) throw error
      const list = (data ?? []) as Provider[]
      setProviders(prev => append ? [...prev, ...list] : list)
      setHasMore(list.length === LIMIT)
    } catch (e) { console.error(e) }
    finally { setFetching(false); setInitialLoad(false) }
  }, [])

  const fetchStatuses = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.from('connection_requests').select('to_provider, status').eq('from_user', user.id)
    if (data) {
      const map: Record<string, string> = {}
      data.forEach(r => { map[r.to_provider] = r.status })
      setRequestStatuses(map)
    }
  }, [user])

  useEffect(() => { if (user) { fetchProviders('', false, 0); fetchStatuses() } }, [user, fetchProviders, fetchStatuses])

  const onQuery = (val: string) => {
    setQuery(val); setActiveFilter(null)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { setPage(0); fetchProviders(val, availOnly, 0) }, 350)
  }

  const applyFilter = (f: typeof QUICK_FILTERS[0]) => {
    const isActive = activeFilter === f.label
    if (isActive) {
      setActiveFilter(null); setQuery(''); setAvailOnly(false)
      setPage(0); fetchProviders('', false, 0)
    } else {
      setActiveFilter(f.label); setQuery(f.service); setAvailOnly(f.availOnly)
      setPage(0); fetchProviders(f.service, f.availOnly, 0)
    }
  }

  const handleRequest = async (p: Provider) => {
    if (!user || user.id === p.id || requestStatuses[p.id]) return
    const { data: ok } = await supabase.rpc('check_daily_request_limit', { p_user_id: user.id })
    if (!ok) { alert('Daily request limit reached (10/day).'); return }
    const { error } = await supabase.from('connection_requests').insert({ from_user: user.id, to_provider: p.id, status: 'pending' })
    if (!error) setRequestStatuses(prev => ({ ...prev, [p.id]: 'pending' }))
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <>
      <header className="nav-top">
        <span className="wordmark" style={{ fontSize: 26 }}>nearwork</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--ok-lt)', padding: '6px 12px', borderRadius: 20, border: '1px solid var(--ok-md)' }}>
          <span className="dot dot-ok" />
          <span style={{ fontSize: 12, color: 'var(--ok)', fontWeight: 700 }}>USA</span>
        </div>
      </header>

      <div className="search-wrap">
        <div className="search-input-wrap">
          <span className="search-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input className="input search-input" placeholder="Search barbers, cleaners, tutors…" value={query} onChange={e => onQuery(e.target.value)} />
        </div>
        <div className="chips-row">
          {QUICK_FILTERS.map(f => (
            <button key={f.label} className={`chip ${activeFilter === f.label ? 'active' : ''}`} onClick={() => applyFilter(f)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <main className="page" style={{ paddingTop: 10 }}>
        {initialLoad ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ background: 'var(--card)', borderRadius: 18, padding: 18, border: '1px solid var(--b1)' }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div className="skeleton" style={{ width: 52, height: 52, borderRadius: '50%' }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 8, borderRadius: 8 }} />
                    <div className="skeleton" style={{ height: 13, width: '40%', borderRadius: 8 }} />
                  </div>
                </div>
                <div className="skeleton" style={{ height: 13, width: '80%', marginBottom: 10, borderRadius: 8 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="skeleton" style={{ height: 36, flex: 1, borderRadius: 10 }} />
                  <div className="skeleton" style={{ height: 36, flex: 1, borderRadius: 10 }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <p style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 600, marginBottom: 14, letterSpacing: '0.02em' }}>
              {fetching && providers.length === 0 ? 'Searching…' : `${providers.length} providers found`}
            </p>
            {!fetching && providers.length === 0 ? (
              <div className="empty-state fade-in">
                <div className="empty-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </div>
                <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>No providers found</p>
                <p style={{ fontSize: 14, color: 'var(--t3)' }}>Try a different search or clear filters</p>
                <button className="btn btn-outline" style={{ marginTop: 20 }} onClick={() => { setQuery(''); setAvailOnly(false); setActiveFilter(null); fetchProviders('', false, 0) }}>
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                {providers.map((p, i) => (
                  <div key={p.id} style={{ animationDelay: `${i * 0.04}s` }}>
                    <ProviderCard provider={p} requestStatus={requestStatuses[p.id]} onRequest={handleRequest} currentUserId={user?.id} />
                  </div>
                ))}
                {hasMore && !fetching && (
                  <button className="btn btn-ghost btn-full" style={{ marginTop: 4 }} onClick={() => { const next = page + 1; setPage(next); fetchProviders(query, availOnly, next, true) }}>
                    Load more providers
                  </button>
                )}
                {fetching && providers.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                    <div className="spinner" />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
      <BottomNav />
    </>
  )
}
