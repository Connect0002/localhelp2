import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'LocalHelp — Find Trusted Local Workers Near You',
  description: 'Search, compare, and contact trusted local workers instantly. No signup needed.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-surface antialiased">
        <Navbar />
        <main>{children}</main>
        <footer className="border-t border-border bg-white mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-ink rounded-xl flex items-center justify-center">
                  <span className="text-white text-sm font-bold">L</span>
                </div>
                <span className="font-bold text-lg tracking-tight text-ink">Local<span className="text-accent">Help</span></span>
              </div>
              <p className="text-text-muted text-sm text-center">© {new Date().getFullYear()} LocalHelp · Connecting communities across the USA</p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-text-secondary hover:text-text-primary transition-colors">Privacy</a>
                <a href="#" className="text-text-secondary hover:text-text-primary transition-colors">Terms</a>
                <a href="/auth/signup" className="text-accent font-medium hover:text-accent-hover transition-colors">List Your Services →</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
