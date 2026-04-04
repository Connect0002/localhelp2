import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Single client used everywhere
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey)

// ── TYPES ──────────────────────────────────
export type Profile = {
  id: string
  name: string
  phone: string
  city: string
  category: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
  avg_rating?: number
  review_count?: number
}

export type Rating = {
  id: string
  worker_id: string
  rating: number
  comment: string
  reviewer_token: string
  created_at: string
}

// ── CONSTANTS ──────────────────────────────
export const CATEGORIES = [
  'House Cleaning','Handyman','Moving Help','Furniture Assembly',
  'Yard Work','Junk Removal','Pet Sitting','Personal Assistant',
]

export const CATEGORY_ICONS: Record<string, string> = {
  'House Cleaning': '🧹', 'Handyman': '🔧', 'Moving Help': '📦',
  'Furniture Assembly': '🪑', 'Yard Work': '🌿', 'Junk Removal': '🗑️',
  'Pet Sitting': '🐾', 'Personal Assistant': '📋',
}

export const CATEGORY_STYLES: Record<string, string> = {
  'House Cleaning': 'bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100',
  'Handyman': 'bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100',
  'Moving Help': 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100',
  'Furniture Assembly': 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100',
  'Yard Work': 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100',
  'Junk Removal': 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100',
  'Pet Sitting': 'bg-pink-50 text-pink-700 border-pink-100 hover:bg-pink-100',
  'Personal Assistant': 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100',
}

export const AVATAR_GRADIENTS = [
  'from-blue-500 to-indigo-600','from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600','from-orange-500 to-red-500',
  'from-pink-500 to-rose-600','from-cyan-500 to-blue-500',
  'from-amber-500 to-orange-600','from-green-500 to-emerald-600',
]

export function getAvatarGradient(name: string): string {
  return AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length]
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// ── AUTH ───────────────────────────────────
export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ── HELPERS ────────────────────────────────
function attachRatings(data: any[]): Profile[] {
  return data.map((w: any) => {
    const ratings: any[] = w.ratings || []
    const avg = ratings.length
      ? ratings.reduce((s: number, r: any) => s + r.rating, 0) / ratings.length : 0
    return { ...w, ratings: undefined, avg_rating: ratings.length ? Math.round(avg * 10) / 10 : 0, review_count: ratings.length }
  })
}

// ── WORKERS ────────────────────────────────
export async function getTopWorkers(): Promise<Profile[]> {
  const { data, error } = await supabaseServer
    .from('profiles').select('*, ratings(rating)').eq('is_active', true).limit(12)
  if (error || !data) return []
  return attachRatings(data)
    .sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0) || (b.review_count || 0) - (a.review_count || 0))
    .slice(0, 8)
}

export async function searchWorkers(category?: string, city?: string): Promise<Profile[]> {
  let query = supabaseServer.from('profiles').select('*, ratings(rating)').eq('is_active', true)
  if (category && category !== 'All') query = query.eq('category', category)
  if (city?.trim()) query = query.ilike('city', `%${city.trim()}%`)
  const { data, error } = await query.order('created_at', { ascending: false }).limit(50)
  if (error || !data) return []
  return attachRatings(data)
}

export async function getWorker(id: string): Promise<Profile | null> {
  const { data, error } = await supabaseServer
    .from('profiles').select('*, ratings(rating, comment, created_at, reviewer_token)')
    .eq('id', id).eq('is_active', true).single()
  if (error || !data) return null
  const ratings: any[] = data.ratings || []
  const avg = ratings.length ? ratings.reduce((s: number, r: any) => s + r.rating, 0) / ratings.length : 0
  return { ...data, avg_rating: ratings.length ? Math.round(avg * 10) / 10 : 0, review_count: ratings.length }
}

export async function getWorkerByUserId(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles').select('*, ratings(rating)').eq('id', userId).single()
  if (error || !data) return null
  const ratings: any[] = data.ratings || []
  const avg = ratings.length ? ratings.reduce((s: number, r: any) => s + r.rating, 0) / ratings.length : 0
  return { ...data, avg_rating: ratings.length ? Math.round(avg * 10) / 10 : 0, review_count: ratings.length }
}

export async function createProfile(userId: string, profile: { name: string; phone: string; city: string; category: string; description: string }): Promise<{ error: string | null }> {
  const { error } = await supabase.from('profiles').insert({ id: userId, ...profile })
  if (error) return { error: error.message }
  return { error: null }
}

export async function updateProfile(updates: Partial<{ name: string; phone: string; city: string; category: string; description: string; is_active: boolean }>): Promise<{ error: string | null }> {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }
  const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
  if (error) return { error: error.message }
  return { error: null }
}

// ── RATINGS ────────────────────────────────
export async function getWorkerRatings(workerId: string): Promise<Rating[]> {
  const { data, error } = await supabaseServer
    .from('ratings').select('id, worker_id, rating, comment, created_at')
    .eq('worker_id', workerId).order('created_at', { ascending: false })
  if (error) return []
  return data || []
}

export async function submitRating(workerId: string, rating: number, comment: string, reviewerToken: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('ratings').insert({ worker_id: workerId, rating, comment, reviewer_token: reviewerToken })
  if (error) {
    if (error.code === '23505') return { error: 'You have already reviewed this worker.' }
    return { error: error.message }
  }
  return { error: null }
}

// ── REPORTS ────────────────────────────────
export async function submitReport(workerId: string, reason: string, comment: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('reports').insert({ worker_id: workerId, reason, comment })
  if (error) return { error: error.message }
  return { error: null }
}

// ── REVIEWER TOKEN ─────────────────────────
export function getOrCreateReviewerToken(): string {
  if (typeof window === 'undefined') return ''
  const key = 'lh_reviewer_token'
  let token = localStorage.getItem(key)
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem(key, token)
  }
  return token
}
