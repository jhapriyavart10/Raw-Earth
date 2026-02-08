/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true, 
  images: {
    unoptimized: true, 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
  },
};

module.exports = nextConfig;