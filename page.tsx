import Link from 'next/link'
import { ArrowRight, Shield, Zap, Star, Users, CheckCircle, Phone, MessageSquare } from 'lucide-react'
import SearchBar from '@/components/SearchBar'
import WorkerCard from '@/components/WorkerCard'
import { CATEGORIES, CATEGORY_ICONS, CATEGORY_STYLES, getTopWorkers } from '@/lib/supabase'

export const revalidate = 0

export default async function HomePage() {
  const topWorkers = await getTopWorkers()

  return (
    <div>
      {/* HERO */}
      <section className="hero-pattern relative overflow-hidden">
        <div className="hero-grid absolute inset-0" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28">
          <div className="flex justify-center mb-8">
            <div className="glass inline-flex items-center gap-2.5 text-white/70 text-sm px-5 py-2 rounded-full">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Trusted workers across the United States
            </div>
          </div>

          <h1 className="text-center text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
            <span className="text-white">Find Trusted</span><br />
            <span className="gradient-text">Local Help</span><br />
            <span className="text-white">Near You</span>
          </h1>

          <p className="text-center text-white/55 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed font-light">
            Search, compare, and contact verified local workers. No signup required to find help.
          </p>

          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar size="hero" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: Shield, text: 'Verified Accounts' },
              { icon: Zap, text: 'Instant Contact' },
              { icon: Star, text: 'Real Reviews' },
              { icon: CheckCircle, text: 'Always Free' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 glass rounded-full px-4 py-2 text-white/60 text-sm">
                <Icon size={13} className="text-blue-300/80" /> {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="bg-ink border-b border-ink-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: `${topWorkers.length}+`, label: 'Active Workers' },
              { value: '8', label: 'Categories' },
              { value: '100%', label: 'Free to Use' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-xl sm:text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-white/40 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Browse by Category</h2>
          <p className="text-text-secondary mt-2">Find the exact help you need</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map(cat => (
            <Link key={cat} href={`/search?category=${encodeURIComponent(cat)}`}
              className={`group flex flex-col items-center gap-3 p-5 sm:p-6 rounded-2xl border ${CATEGORY_STYLES[cat]} transition-all hover:-translate-y-0.5 hover:shadow-md text-center`}>
              <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">{CATEGORY_ICONS[cat]}</span>
              <span className="text-sm font-semibold leading-tight">{cat}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* TOP WORKERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Top-Rated Workers</h2>
            <p className="text-text-secondary mt-1">Highest rated professionals</p>
          </div>
          <Link href="/search" className="hidden sm:flex items-center gap-1.5 text-accent font-semibold text-sm hover:gap-3 transition-all">
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {topWorkers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {topWorkers.map((worker, i) => (
              <WorkerCard key={worker.id} worker={worker} featured={i < 2 && (worker.review_count || 0) > 0} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border p-16 text-center shadow-card">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">Be the first worker</h3>
            <p className="text-text-secondary mb-6">Create your free profile and start getting clients today.</p>
            <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-ink text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-ink-soft transition-colors">
              List Your Services <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white border-y border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">How It Works</h2>
            <p className="text-text-secondary mt-2">Find help in under 60 seconds</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { n: '1', icon: '🔍', title: 'Search', body: 'Browse by category and city. Filter to find exactly who you need.' },
              { n: '2', icon: '⭐', title: 'Compare', body: 'Read verified reviews from real clients. Check ratings and experience.' },
              { n: '3', icon: '📞', title: 'Contact Directly', body: 'Call or text the worker directly. No middleman, no fees, ever.' },
            ].map(({ n, icon, title, body }) => (
              <div key={n} className="text-center relative">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-muted rounded-2xl text-3xl mb-4 relative">
                  {icon}
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">{n}</span>
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-ink rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 25% 60%, rgba(37,99,235,0.35) 0%, transparent 55%), radial-gradient(ellipse at 75% 40%, rgba(124,58,237,0.25) 0%, transparent 55%)' }} />
          <div className="absolute inset-0 hero-grid opacity-30" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 glass text-white/70 text-sm px-4 py-2 rounded-full mb-6">
              <Users size={14} className="text-blue-300" /> Join the LocalHelp community
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight">Are you a local worker?</h2>
            <p className="text-white/55 text-lg mb-8 max-w-lg mx-auto">Create your verified profile in 2 minutes. Clients find you, call you, hire you — completely free.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/signup"
                className="inline-flex items-center justify-center gap-2.5 bg-white text-ink px-8 py-4 rounded-xl font-bold text-base hover:bg-white/90 active:scale-95 transition-all shadow-xl2">
                Start Getting Clients <ArrowRight size={18} />
              </Link>
              <Link href="/auth/login"
                className="inline-flex items-center justify-center gap-2 glass text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-white/10 transition-all">
                Already a member? Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
