/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  typescript: {
    // ⚠️ Temporarily ignore TypeScript errors during build
    // TODO: Fix all TypeScript errors and remove this
    ignoreBuildErrors: true,
  },
  eslint: {
    // ⚠️ Temporarily ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
