import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Phone, MessageSquare, MapPin, ArrowLeft, Flag, Star } from 'lucide-react'
import { getWorker, getWorkerRatings, CATEGORY_ICONS, getAvatarGradient, getInitials } from '@/lib/supabase'
import RatingForm from './RatingForm'
import ReportModal from './ReportModal'

export const revalidate = 0

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} style={{width:size,height:size}} className={s <= Math.round(rating) ? 'star-filled' : 'star-empty'} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  )
}

export default async function WorkerPage({ params }: { params: { id: string } }) {
  const [worker, ratings] = await Promise.all([
    getWorker(params.id),
    getWorkerRatings(params.id),
  ])

  if (!worker) notFound()

  const icon = CATEGORY_ICONS[worker.category] || '👤'
  const initials = getInitials(worker.name)
  const gradient = getAvatarGradient(worker.name)
  const smsBody = encodeURIComponent(`Hi ${worker.name}, I found your profile on LocalHelp and I'm interested in your ${worker.category} services.`)

  const dist = [5,4,3,2,1].map(star => ({
    star,
    count: ratings.filter(r => r.rating === star).length,
  }))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/search" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors group">
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to search
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAIN */}
        <div className="lg:col-span-2 space-y-5">
          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-border shadow-card p-6 sm:p-8">
            <div className="flex items-start gap-5">
              <div className={`flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-2xl shadow-sm`}>
                {initials}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">{worker.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary bg-surface-muted rounded-full px-3 py-1">
                    {icon} {worker.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm text-text-muted">
                    <MapPin size={13} /> {worker.city}
                  </span>
                </div>

                {(worker.avg_rating || 0) > 0 ? (
                  <div className="flex items-center gap-2.5 mt-3">
                    <Stars rating={worker.avg_rating || 0} size={18} />
                    <span className="font-bold text-text-primary text-lg">{worker.avg_rating?.toFixed(1)}</span>
                    <span className="text-sm text-text-muted">
                      ({worker.review_count} {worker.review_count === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-text-muted mt-2">No reviews yet</p>
                )}
              </div>
            </div>

            {worker.description && (
              <div className="mt-6 pt-6 border-t border-border">
                <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">About</h2>
                <p className="text-text-secondary leading-relaxed">{worker.description}</p>
              </div>
            )}
          </div>

          {/* Ratings breakdown */}
          {ratings.length > 0 && (
            <div className="bg-white rounded-2xl border border-border shadow-card p-6">
              <h2 className="font-bold text-text-primary text-lg mb-5">Ratings Summary</h2>
              <div className="flex gap-8 items-center">
                <div className="text-center flex-shrink-0">
                  <div className="text-5xl font-bold text-text-primary">{worker.avg_rating?.toFixed(1)}</div>
                  <Stars rating={worker.avg_rating || 0} size={16} />
                  <div className="text-xs text-text-muted mt-1">{ratings.length} {ratings.length === 1 ? 'review' : 'reviews'}</div>
                </div>
                <div className="flex-1 space-y-2">
                  {dist.map(({ star, count }) => (
                    <div key={star} className="flex items-center gap-3 text-sm">
                      <span className="text-text-secondary w-6 text-right text-xs">{star}★</span>
                      <div className="flex-1 bg-surface-muted rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-warning rounded-full transition-all" style={{ width: `${ratings.length > 0 ? (count / ratings.length) * 100 : 0}%` }} />
                      </div>
                      <span className="text-text-muted text-xs w-4">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reviews list */}
          {ratings.length > 0 && (
            <div className="bg-white rounded-2xl border border-border shadow-card p-6">
              <h2 className="font-bold text-text-primary text-lg mb-5">Reviews ({ratings.length})</h2>
              <div className="space-y-4">
                {ratings.map(r => (
                  <div key={r.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-surface-muted rounded-full flex items-center justify-center text-xs font-bold text-text-muted">A</div>
                        <Stars rating={r.rating} size={14} />
                      </div>
                      <span className="text-xs text-text-muted">
                        {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    {r.comment && <p className="text-sm text-text-secondary leading-relaxed ml-9">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Write a review */}
          <div className="bg-white rounded-2xl border border-border shadow-card p-6">
            <h2 className="font-bold text-text-primary text-lg mb-1">Leave a Review</h2>
            <p className="text-sm text-text-secondary mb-5">Share your experience working with {worker.name}</p>
            <RatingForm workerId={worker.id} />
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-border shadow-card p-6 lg:sticky lg:top-24">
            <h2 className="font-bold text-text-primary mb-1">Contact {worker.name.split(' ')[0]}</h2>
            <p className="text-sm text-text-secondary mb-5">Reach out directly — no fees</p>

            <div className="space-y-3">
              <a href={`tel:${worker.phone}`}
                className="flex items-center justify-center gap-3 w-full bg-ink text-white rounded-xl px-4 py-4 font-bold hover:bg-ink-soft active:scale-95 transition-all shadow-button-dark">
                <Phone size={17} /> Call Now
              </a>
              <a href={`sms:${worker.phone}?body=${smsBody}`}
                className="flex items-center justify-center gap-3 w-full bg-accent-light text-accent border border-accent-subtle rounded-xl px-4 py-4 font-bold hover:bg-accent-subtle active:scale-95 transition-all">
                <MessageSquare size={17} /> Send Text
              </a>
            </div>

            <div className="mt-5 pt-5 border-t border-border space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-surface-muted rounded-lg flex items-center justify-center text-sm">{icon}</div>
                <div>
                  <div className="text-xs text-text-muted">Service</div>
                  <div className="text-sm font-semibold text-text-primary">{worker.category}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-surface-muted rounded-lg flex items-center justify-center"><MapPin size={14} className="text-text-muted" /></div>
                <div>
                  <div className="text-xs text-text-muted">Location</div>
                  <div className="text-sm font-semibold text-text-primary">{worker.city}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <ReportModal workerId={worker.id} workerName={worker.name} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
