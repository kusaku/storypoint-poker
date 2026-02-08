/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  env: {
    NEXT_PUBLIC_GIT_SHA: process.env.GIT_SHA || 'dev',
    NEXT_PUBLIC_REPO_URL: process.env.REPO_URL || 'https://github.com/kusaku/storypoint-poker',
  },
}

module.exports = nextConfig

