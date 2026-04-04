import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const workerId = searchParams.get('worker')
  const token = searchParams.get('token')

  if (!workerId || !token || token.length !== 36) {
    return NextResponse.json({ reviewed: false })
  }

  const { data } = await supabase
    .from('ratings')
    .select('id')
    .eq('worker_id', workerId)
    .eq('reviewer_token', token)
    .single()

  return NextResponse.json({ reviewed: !!data })
}
