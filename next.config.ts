import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow large base64 images in API responses
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    unoptimized: true,
  },
}

export default nextConfig
