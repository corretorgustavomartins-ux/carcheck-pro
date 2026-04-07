import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Reduz uso de memória no build
  experimental: {
    webpackBuildWorker: false,
  },
  // Desabilita source maps em produção (economiza memória)
  productionBrowserSourceMaps: false,
}

export default nextConfig
