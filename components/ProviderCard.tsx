'use client'

import Link from 'next/link'
import Avatar from './Avatar'
import { Provider } from '@/lib/types'

interface Props {
  provider: Provider
  requestStatus?: string
  onRequest: (p: Provider) => void
  currentUserId?: string
}

export default function ProviderCard({ provider: p, requestStatus, onRequest, currentUserId }: Props) {
  const isOwn = currentUserId === p.id

  return (
    <div className="provider-card fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13, marginBottom: 13 }}>
        <Avatar name={p.name} avatarUrl={p.avatar_url} size={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 3 }}>
            <p className="font-display" style={{ fontWeight: 700, fontSize: 16, color: 'var(--t1)', lineHeight: 1.2 }}>{p.name}</p>
            <span className={`badge ${p.is_available ? 'badge-ok' : 'badge-neutral'}`} style={{ flexShrink: 0, marginTop: 2 }}>
              <span className={`dot ${p.is_available ? 'dot-ok' : 'dot-busy'}`} />
              {p.is_available ? 'Available' : 'Busy'}
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--t3)', fontWeight: 500 }}>
            📍 {p.city}, {p.state}
            {p.rating > 0 && <span style={{ marginLeft: 10 }}>⭐ {p.rating.toFixed(1)} <span style={{ color: 'var(--t4)' }}>({p.review_count})</span></span>}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 11 }}>
        {p.services.slice(0, 3).map(s => <span key={s} className="tag">{s}</span>)}
        {p.services.length > 3 && <span className="tag" style={{ background: 'var(--card3)', color: 'var(--t2)' }}>+{p.services.length - 3}</span>}
      </div>

      {p.description && (
        <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 14, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {p.description}
        </p>
      )}

      {p.price_range && (
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--acc)', marginBottom: 14 }}>{p.price_range}</p>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <Link href={`/providers/${p.id}`} className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
          View Profile
        </Link>
        {isOwn ? (
          <span className="btn btn-sm" style={{ flex: 1, background: 'var(--card3)', color: 'var(--t3)', cursor: 'default', fontSize: 12, fontWeight: 600 }}>
            Your Profile
          </span>
        ) : requestStatus === 'pending' ? (
          <button className="btn btn-sm" style={{ flex: 1, background: 'var(--warn-lt)', color: 'var(--warn)', cursor: 'default', border: 'none' }} disabled>
            ⏳ Pending
          </button>
        ) : requestStatus === 'accepted' ? (
          <button className="btn btn-sm" style={{ flex: 1, background: 'var(--ok-lt)', color: 'var(--ok)', border: 'none' }}>
            ✓ Connected
          </button>
        ) : (
          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onRequest(p)}>
            Connect
          </button>
        )}
      </div>
    </div>
  )
}
