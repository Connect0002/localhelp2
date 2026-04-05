'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Provider } from '@/lib/types'
import ProviderCard from '@/components/ProviderCard'
import BottomNav from '@/components/BottomNav'

export default function DiscoverPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [providers, setProviders] = useState<Provider[]>([])
  const [requestStatuses, setRequestStatuses] = useState<Record<string, string>>({})
  const [query, setQuery] = useState('')
  const [availOnly, setAvailOnly] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const timer = useRef<NodeJS.Timeout | undefined>(undefined)
  const LIMIT = 15

  useEffect(() => {
    if (!loading && !user) router.replace('/')
  }, [user, loading, router])

  const fetchProviders = useCallback(async (q: string, avail: boolean, pg: number, append = false) => {
    setFetching(true)
    try {
      const { data, error } = await supabase.rpc('search_providers', {
        p_service: q || null,
        p_city: null,
        p_available: avail || null,
        p_limit: LIMIT,
        p_offset: pg * LIMIT,
      })
      if (error) throw error
      const list = (data ?? []) as Provider[]
      setProviders(prev => append ? [...prev, ...list] : list)
      setHasMore(list.length === LIMIT)
    } catch (e) {
      console.error(e)
    } finally {
      setFetching(false)
    }
  }, [])

  const fetchRequestStatuses = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('connection_requests')
      .select('to_provider, status')
      .eq('from_user', user.id)
    if (data) {
      const map: Record<string, string> = {}
      data.forEach(r => { map[r.to_provider] = r.status })
      setRequestStatuses(map)
    }
  }, [user])

  useEffect(() => {
    if (user) { fetchProviders('', false, 0); fetchRequestStatuses() }
  }, [user, fetchProviders, fetchRequestStatuses])

  const onQueryChange = (val: string) => {
    setQuery(val)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { setPage(0); fetchProviders(val, availOnly, 0) }, 350)
  }

  const onAvailToggle = () => {
    const next = !availOnly
    setAvailOnly(next)
    setPage(0)
    fetchProviders(query, next, 0)
  }

  const handleRequest = async (p: Provider) => {
    if (!user) return
    if (requestStatuses[p.id]) return

    const allowed = await supabase.rpc('check_daily_request_limit', { p_user_id: user.id })
    if (!allowed.data) { alert('Daily request limit reached (10/day). Try again tomorrow.'); return }

    const { error } = await supabase.from('connection_requests').insert({
      from_user: user.id, to_provider: p.id, status: 'pending'
    })
    if (!error) setRequestStatuses(prev => ({ ...prev, [p.id]: 'pending' }))
  }

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchProviders(query, availOnly, next, true)
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <>
      <header className="nav-top">
        <span className="font-syne" style={{ fontSize: 22, fontWeight: 800, color: 'var(--acc)' }}>nearwork</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg)', padding: '6px 12px', borderRadius: 20 }}>
          <span className="dot dot-ok" />
          <span style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 500 }}>USA</span>
        </div>
      </header>

      <div className="search-sticky">
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <input className="input" style={{ paddingLeft: 38 }}
            placeholder="Search barbers, cleaners, tutors…"
            value={query} onChange={e => onQueryChange(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
          <button className={`chip ${availOnly ? 'active' : ''}`} onClick={onAvailToggle}>Available Now</button>
          <button className="chip" onClick={() => { setQuery('barber'); setPage(0); fetchProviders('barber', availOnly, 0) }}>Barbers</button>
          <button className="chip" onClick={() => { setQuery('cleaner'); setPage(0); fetchProviders('cleaner', availOnly, 0) }}>Cleaners</button>
          <button className="chip" onClick={() => { setQuery('trainer'); setPage(0); fetchProviders('trainer', availOnly, 0) }}>Trainers</button>
          <button className="chip" onClick={() => { setQuery('photographer'); setPage(0); fetchProviders('photographer', availOnly, 0) }}>Photographers</button>
        </div>
      </div>

      <main className="page" style={{ paddingTop: 8 }}>
        <p style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 500, marginBottom: 12 }}>
          {fetching ? 'Searching…' : `${providers.length} providers found`}
        </p>

        {!fetching && providers.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p style={{ fontWeight: 600, marginBottom: 6 }}>No providers found</p>
            <p style={{ fontSize: 14 }}>Try a different service or clear the filters</p>
          </div>
        ) : (
          <>
            {providers.map(p => (
              <ProviderCard key={p.id} provider={p} requestStatus={requestStatuses[p.id]} onRequest={handleRequest} />
            ))}
            {hasMore && !fetching && (
              <button className="btn btn-ghost btn-full" style={{ marginTop: 8 }} onClick={loadMore}>Load more</button>
            )}
            {fetching && providers.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                <div className="spinner" />
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </>
  )
}
