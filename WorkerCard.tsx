import Link from 'next/link'
import { Phone, MessageSquare, MapPin, Star } from 'lucide-react'
import { Profile, CATEGORY_ICONS, getAvatarGradient, getInitials } from '@/lib/supabase'

function Stars({ rating, size = 3.5 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} style={{width: `${size * 4}px`, height: `${size * 4}px`}} className={s <= Math.round(rating) ? 'star-filled' : 'star-empty'} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  )
}

export { Stars }

export default function WorkerCard({ worker, featured }: { worker: Profile; featured?: boolean }) {
  const icon = CATEGORY_ICONS[worker.category] || '👤'
  const initials = getInitials(worker.name)
  const gradient = getAvatarGradient(worker.name)
  const hasRating = (worker.avg_rating || 0) > 0
  const smsBody = encodeURIComponent(`Hi ${worker.name}, I found your profile on LocalHelp and I'm interested in your ${worker.category} services.`)

  return (
    <div className="group bg-white rounded-2xl border border-border shadow-card card-hover overflow-hidden flex flex-col">
      <div className="p-5 flex gap-4">
        {/* Colored avatar */}
        <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <Link href={`/worker/${worker.id}`} className="font-bold text-text-primary hover:text-accent transition-colors text-[15px] leading-snug truncate flex-1">
              {worker.name}
            </Link>
            {featured && (
              <span className="flex-shrink-0 text-xs bg-amber-50 text-amber-600 border border-amber-200 rounded-full px-2 py-0.5 font-semibold">⭐ Top</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-sm">{icon}</span>
            <span className="text-xs font-semibold text-text-secondary">{worker.category}</span>
          </div>

          <div className="flex items-center gap-1 mt-1">
            <MapPin size={11} className="text-text-muted" />
            <span className="text-xs text-text-muted truncate">{worker.city}</span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            {hasRating ? (
              <>
                <Stars rating={worker.avg_rating || 0} />
                <span className="text-xs font-bold text-text-primary">{worker.avg_rating?.toFixed(1)}</span>
                <span className="text-xs text-text-muted">({worker.review_count} {worker.review_count === 1 ? 'review' : 'reviews'})</span>
              </>
            ) : (
              <span className="text-xs text-text-muted italic">No reviews yet · Be first!</span>
            )}
          </div>
        </div>
      </div>

      {worker.description && (
        <div className="px-5 pb-3">
          <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed bg-surface-muted rounded-xl px-3 py-2">{worker.description}</p>
        </div>
      )}

      <div className="mt-auto border-t border-border p-4 grid grid-cols-2 gap-2.5">
        <a href={`tel:${worker.phone}`}
          className="flex items-center justify-center gap-2 bg-ink text-white rounded-xl py-2.5 text-sm font-bold hover:bg-ink-soft active:scale-95 transition-all shadow-button-dark">
          <Phone size={14} /> Call
        </a>
        <a href={`sms:${worker.phone}?body=${smsBody}`}
          className="flex items-center justify-center gap-2 bg-accent-light text-accent border border-accent-subtle rounded-xl py-2.5 text-sm font-bold hover:bg-accent-subtle active:scale-95 transition-all">
          <MessageSquare size={14} /> Text
        </a>
      </div>
    </div>
  )
}
