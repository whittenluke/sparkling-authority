/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // This is required for static images to work on Netlify
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Ensure trailing slashes for consistent routing
  trailingSlash: true,
}

module.exports = nextConfig 