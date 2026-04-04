import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">🔍</div>
        <h1 className="text-3xl font-bold text-text-primary mb-3 tracking-tight">Page not found</h1>
        <p className="text-text-secondary mb-8 leading-relaxed">
          This page doesn't exist, or a worker profile may have been removed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="flex items-center justify-center gap-2 text-sm font-semibold text-text-secondary border border-border px-6 py-3 rounded-xl hover:bg-surface-muted transition-colors">
            <ArrowLeft size={15} /> Go home
          </Link>
          <Link href="/search" className="flex items-center justify-center gap-2 bg-accent text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-accent-hover transition-colors shadow-button">
            <Search size={15} /> Find workers
          </Link>
        </div>
      </div>
    </div>
  )
}
