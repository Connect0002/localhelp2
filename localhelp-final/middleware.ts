import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  // Protect /dashboard - check for Supabase session cookie
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Get the access token from cookie
    const cookieStore = request.cookies
    const hasSession = cookieStore.getAll().some(c => 
      c.name.includes('auth-token') || c.name.includes('access-token') || 
      c.name.startsWith('sb-') || c.name.includes('supabase')
    )

    if (!hasSession) {
      return NextResponse.redirect(new URL('/auth/login?redirect=/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
