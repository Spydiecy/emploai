/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['pbs.twimg.com'],

  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 