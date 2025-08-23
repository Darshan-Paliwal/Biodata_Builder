/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // disables sharp so Netlify won’t fail
  },
};

module.exports = nextConfig;