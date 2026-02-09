/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  env: {
    NEXT_PUBLIC_GIT_SHA: process.env.GIT_SHA,
    NEXT_PUBLIC_REPO_URL: process.env.REPO_URL,
  },
}

module.exports = nextConfig

