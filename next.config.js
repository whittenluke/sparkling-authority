/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // This is required for static images to work on Netlify
  },
  // Ensure trailing slashes for consistent routing
  trailingSlash: true,
}

module.exports = nextConfig 