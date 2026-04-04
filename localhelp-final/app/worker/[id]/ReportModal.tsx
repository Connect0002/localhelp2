'use client'
import { useState } from 'react'
import { Flag, X, CheckCircle, Loader2 } from 'lucide-react'
import { submitReport } from '@/lib/supabase'

const REASONS = ['Fake profile','Inappropriate content','Scam or fraud','Incorrect information','Other']

export default function ReportModal({ workerId, workerName }: { workerId: string; workerName: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) return
    setLoading(true)
    const { error } = await submitReport(workerId, reason, comment.trim())
    setLoading(false)
    if (!error) {
      setSuccess(true)
      setTimeout(() => { setOpen(false); setSuccess(false); setReason(''); setComment('') }, 2000)
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-xs text-text-muted hover:text-danger transition-colors w-full justify-center py-1">
        <Flag size={11} /> Report this profile
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl2 scale-in">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-bold text-text-primary">Report Profile</h3>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-surface-muted text-text-muted transition-colors"><X size={16} /></button>
            </div>

            {success ? (
              <div className="p-8 text-center">
                <CheckCircle size={40} className="text-success mx-auto mb-3" />
                <p className="font-semibold text-text-primary">Report submitted. Thank you.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <p className="text-sm text-text-secondary">Reporting <strong>{workerName}</strong></p>
                <div className="space-y-2">
                  {REASONS.map(r => (
                    <label key={r} className="flex items-center gap-3 cursor-pointer group">
                      <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="accent-danger" />
                      <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{r}</span>
                    </label>
                  ))}
                </div>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} maxLength={300} placeholder="Additional details (optional)"
                  className="w-full px-3 py-2.5 rounded-xl border border-border text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-danger/20 focus:border-danger resize-none" />
                <button type="submit" disabled={!reason || loading}
                  className="w-full bg-danger text-white rounded-xl py-2.5 font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading && <Loader2 size={14} className="animate-spin" />} Submit Report
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
