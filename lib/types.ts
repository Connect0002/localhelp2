export type AccountType = 'customer' | 'provider'

export interface Profile {
  id: string
  name: string
  email: string
  account_type: AccountType
  avatar_url: string | null
  created_at: string
}

export interface ProviderProfile {
  id: string
  city: string
  state: string
  description: string | null
  experience_years: number
  price_range: string | null
  instagram_handle: string | null
  is_available: boolean
  rating: number
  review_count: number
}

export interface Provider {
  id: string
  name: string
  avatar_url: string | null
  city: string
  state: string
  description: string | null
  experience_years: number
  price_range: string | null
  instagram_handle: string | null
  is_available: boolean
  rating: number
  review_count: number
  services: string[]
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected'

export interface ConnectionRequest {
  id: string
  from_user: string
  to_provider: string
  status: RequestStatus
  created_at: string
  updated_at: string
  profiles?: Profile
  provider_profile?: Provider
}

export interface Chat {
  id: string
  request_id: string
  customer_id: string
  provider_id: string
  created_at: string
  last_message_at: string
  other_user?: Profile
  last_message?: string
}

export interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string
  sent_at: string
}

export interface Service {
  id: number
  name: string
}
