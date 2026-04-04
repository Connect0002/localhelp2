'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, ChevronDown, Loader2 } from 'lucide-react'
import { CATEGORIES } from '@/lib/supabase'

export default function SearchBar({ initialCategory = '', initialCity = '', size = 'hero' }: {
  initialCategory?: string; initialCity?: string; size?: 'hero' | 'compact'
}) {
  const [category, setCategory] = useState(initialCategory)
  const [city, setCity] = useState(initialCity)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSearch = () => {
    startTransition(() => {
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      if (city) params.set('city', city)
      router.push(`/search?${params.toString()}`)
    })
  }

  if (size === 'compact') {
    return (
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full pl-4 pr-8 py-3 rounded-xl border border-border bg-surface-muted text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent appearance-none">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
        <div className="relative flex-1">
          <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input type="text" value={city} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="City or ZIP..." className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-surface-muted text-sm font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
        </div>
        <button onClick={handleSearch} disabled={isPending}
          className="flex items-center justify-center gap-2 bg-ink text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-ink-soft transition-all shadow-button-dark disabled:opacity-60 active:scale-95">
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Search
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl2 border border-border/40 p-2">
      <div className="flex flex-col sm:flex-row gap-1">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-xs font-semibold tracking-wider">CATEGORY</div>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full pl-4 pr-8 pt-7 pb-3 rounded-xl bg-transparent text-sm font-semibold text-text-primary focus:outline-none focus:bg-surface-muted appearance-none cursor-pointer transition-colors">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>

        <div className="hidden sm:block w-px bg-border self-stretch my-2" />

        <div className="relative flex-1">
          <div className="absolute left-4 top-3 pointer-events-none text-text-muted text-xs font-semibold tracking-wider">LOCATION</div>
          <input type="text" value={city} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="City or ZIP code..."
            className="w-full pl-4 pr-4 pt-7 pb-3 rounded-xl bg-transparent text-sm font-semibold text-text-primary placeholder:text-text-muted focus:outline-none focus:bg-surface-muted transition-colors" />
        </div>

        <button onClick={handleSearch} disabled={isPending}
          className="flex items-center justify-center gap-2.5 bg-accent text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-accent-hover transition-all shadow-button disabled:opacity-60 active:scale-95">
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Search
        </button>
      </div>
    </div>
  )
}
