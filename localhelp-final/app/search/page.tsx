import { Suspense } from 'react'
import { searchWorkers, CATEGORIES, CATEGORY_ICONS } from '@/lib/supabase'
import SearchBar from '@/components/SearchBar'
import WorkerCard from '@/components/WorkerCard'
import { Users } from 'lucide-react'

export const revalidate = 0

interface PageProps {
  searchParams: { category?: string; city?: string }
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 space-y-4 shadow-card">
      <div className="flex gap-4">
        <div className="skeleton w-14 h-14 rounded-2xl" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-3 w-1/2" />
          <div className="skeleton h-3 w-1/3" />
        </div>
      </div>
      <div className="skeleton h-10 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-2.5">
        <div className="skeleton h-10 rounded-xl" />
        <div className="skeleton h-10 rounded-xl" />
      </div>
    </div>
  )
}

async function Results({ category, city }: { category?: string; city?: string }) {
  const workers = await searchWorkers(category, city)
  if (workers.length === 0) {
    return (
      <div className="col-span-full bg-white rounded-2xl border border-border p-16 text-center shadow-card">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-xl font-bold mb-2">No workers found</h3>
        <p className="text-text-secondary mb-6 max-w-sm mx-auto">Try a different category or city — or be the first worker in this area!</p>
        <a href="/auth/signup" className="inline-flex items-center gap-2 bg-ink text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-ink-soft transition-colors">
          Join as a Worker →
        </a>
      </div>
    )
  }
  return <>{workers.map(w => <WorkerCard key={w.id} worker={w} />)}</>
}

async function Count({ category, city }: { category?: string; city?: string }) {
  const workers = await searchWorkers(category, city)
  return <>{workers.length}</>
}

export default function SearchPage({ searchParams }: PageProps) {
  const { category, city } = searchParams
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 bg-white rounded-2xl border border-border p-4 shadow-card">
        <SearchBar initialCategory={category || ''} initialCity={city || ''} size="compact" />
      </div>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {category ? `${CATEGORY_ICONS[category] || ''} ${category}` : 'All Workers'}
          </h1>
          <p className="text-text-secondary text-sm mt-0.5 flex items-center gap-1.5">
            <Users size={13} />
            <Suspense fallback="…"><Count category={category} city={city} /></Suspense>
            {' '}workers{city ? ` in ${city}` : ''}
          </p>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {[{ cat: '', label: 'All' }, ...CATEGORIES.map(c => ({ cat: c, label: c }))].map(({ cat, label }) => (
          <a key={cat} href={`/search?${cat ? `category=${encodeURIComponent(cat)}` : ''}${city ? `&city=${city}` : ''}`}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${category === cat || (!category && !cat) ? 'bg-ink text-white border-ink shadow-button-dark' : 'bg-white text-text-secondary border-border hover:border-accent hover:text-accent hover:bg-accent-light'}`}>
            {cat && <span>{CATEGORY_ICONS[cat]}</span>}{label}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Suspense fallback={Array.from({length:6}).map((_,i) => <SkeletonCard key={i} />)}>
          <Results category={category} city={city} />
        </Suspense>
      </div>
    </div>
  )
}
