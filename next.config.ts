import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'kyaycxxeezxrxesdhkha.supabase.co' },
    ],
  },
}

export default nextConfig
