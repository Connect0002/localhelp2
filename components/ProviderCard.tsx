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
  const isOwnProfile = currentUserId === p.id

  return (
    <div className="card card-hover" style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <Avatar name={p.name} avatarUrl={p.avatar_url} size={48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--t1)' }}>{p.name}</p>
            <span className={`badge ${p.is_available ? 'badge-ok' : 'badge-neutral'}`}>
              <span className={`dot ${p.is_available ? 'dot-ok' : 'dot-busy'}`} />
              {p.is_available ? 'Available' : 'Busy'}
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 3 }}>{p.city}, {p.state}</p>
          {p.rating > 0 && (
            <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
              ★ {p.rating.toFixed(1)} · {p.review_count} reviews
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
        {p.services.map(s => <span key={s} className="tag">{s}</span>)}
      </div>

      {p.description && (
        <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 12, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {p.description}
        </p>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <Link href={`/providers/${p.id}`} className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
          View Profile
        </Link>
        {isOwnProfile ? (
          <span className="btn btn-ghost btn-sm" style={{ flex: 1, opacity: 0.4, cursor: 'default', fontSize: 12 }}>Your Profile</span>
        ) : requestStatus === 'pending' ? (
          <button className="btn btn-ghost btn-sm" style={{ flex: 1, opacity: 0.6 }} disabled>Pending…</button>
        ) : requestStatus === 'accepted' ? (
          <button className="btn btn-ghost btn-sm" style={{ flex: 1, color: 'var(--ok)' }}>✓ Connected</button>
        ) : (
          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onRequest(p)}>
            Request Connect
          </button>
        )}
      </div>
    </div>
  )
}
