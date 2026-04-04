'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { submitRating, getOrCreateReviewerToken } from '@/lib/supabase'

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button" onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
          className="focus:outline-none hover:scale-110 active:scale-95 transition-transform">
          <svg style={{width:30,height:30}} className={s <= (hovered || value) ? 'star-filled' : 'star-empty'} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm font-semibold text-text-secondary">
          {['','Poor','Fair','Good','Very Good','Excellent'][value]}
        </span>
      )}
    </div>
  )
}

export default function RatingForm({ workerId }: { workerId: string }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const check = async () => {
      const token = getOrCreateReviewerToken()
      if (!token) { setChecking(false); return }
      try {
        const res = await fetch(`/api/check-review?worker=${workerId}&token=${token}`)
        const data = await res.json()
        setAlreadyReviewed(data.reviewed)
      } catch {
        // If check fails, allow review (DB unique constraint will catch duplicates)
      }
      setChecking(false)
    }
    check()
  }, [workerId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) { setError('Please select a rating.'); return }

    const token = getOrCreateReviewerToken()
    if (!token) { setError('Could not identify your browser. Please enable localStorage.'); return }

    setLoading(true)
    setError('')

    const { error: err } = await submitRating(workerId, rating, comment.trim(), token)
    setLoading(false)

    if (err) {
      if (err.includes('already reviewed')) setAlreadyReviewed(true)
      else setError(err)
      return
    }

    setSuccess(true)
    setAlreadyReviewed(true)
  }

  if (checking) {
    return <div className="flex items-center gap-2 text-sm text-text-muted py-4"><Loader2 size={14} className="animate-spin" /> Checking…</div>
  }

  if (alreadyReviewed && !success) {
    return (
      <div className="flex items-center gap-3 bg-surface-muted rounded-xl px-4 py-4">
        <AlertCircle size={18} className="text-text-muted flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-text-primary">You've already reviewed this worker</p>
          <p className="text-xs text-text-muted mt-0.5">Only one review per person is allowed.</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center fade-up">
        <CheckCircle size={44} className="text-success" />
        <h3 className="font-bold text-text-primary">Review submitted!</h3>
        <p className="text-sm text-text-secondary">Thanks for sharing your experience.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">Your Rating *</label>
        <StarInput value={rating} onChange={setRating} />
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Comment <span className="font-normal text-text-muted">(optional)</span>
        </label>
        <textarea value={comment} onChange={e => setComment(e.target.value)}
          placeholder="Share your experience…" rows={3} maxLength={600}
          className="w-full px-4 py-3 rounded-xl border border-border bg-surface-muted text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none transition-all" />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-text-muted">One review per person per worker</p>
          <p className="text-xs text-text-muted">{comment.length}/600</p>
        </div>
      </div>
      {error && <div className="text-sm text-danger bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</div>}
      <button type="submit" disabled={loading || rating === 0}
        className="w-full flex items-center justify-center gap-2 bg-accent text-white rounded-xl py-3 font-bold text-sm hover:bg-accent-hover active:scale-95 transition-all shadow-button disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? <Loader2 size={15} className="animate-spin" /> : null}
        Submit Review
      </button>
    </form>
  )
}
