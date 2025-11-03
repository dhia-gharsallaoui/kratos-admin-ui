/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        hostname: 'localhost',
      },
      {
        hostname: 'kratos.local',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', '@mui/x-data-grid', '@mui/x-charts'],
  },
};

module.exports = nextConfig;
