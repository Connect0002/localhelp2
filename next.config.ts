import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://kyaycxxeezxrxesdhkha.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5YXljeHhlZXp4cnhlc2Roa2hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMDM0NjMsImV4cCI6MjA5MDg3OTQ2M30.HW8-LIfhVbL200MlrqnmfYdniS24ptbXk9YY_yqnjx8',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'kyaycxxeezxrxesdhkha.supabase.co' },
    ],
  },
}

export default nextConfig
