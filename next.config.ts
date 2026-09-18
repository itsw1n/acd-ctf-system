import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-Frame-Options', value: 'DENY' },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Standalone output is required by Dockerfile (self-hosted `node server.js`),
  // but breaks Vercel builds on Next 16.3: with the Vercel adapter active the
  // whole-app NFT trace is skipped while the standalone finalizer still reads
  // it (upstream vercel/next.js#96646, ENOENT next-server.js.nft.json in
  // onBuildComplete). Vercel sets VERCEL=1, so disable standalone only there —
  // Vercel packages the default output itself and never uses server.js.
  output: process.env.VERCEL ? undefined : 'standalone',
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

export default nextConfig
