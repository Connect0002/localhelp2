'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function ConfirmPage() {
  const router = useRouter()

  useEffect(() => {
    // Supabase handles the token from the URL hash automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard')
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={32} className="animate-spin text-accent mx-auto mb-4" />
        <p className="text-text-secondary font-medium">Confirming your account…</p>
      </div>
    </div>
  )
}
