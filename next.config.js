/** @type {import('next').NextConfig} */
const nextConfig = {

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pictures.lodgix.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.lodgix.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'stssevastorage.blob.core.windows.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Enable React Strict Mode
  reactStrictMode: true,
  // Enable production source maps
  productionBrowserSourceMaps: true,
}

module.exports = nextConfig
