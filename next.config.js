/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'kratos.local'],
  },
  async rewrites() {
    // Default URLs if environment variables aren't set
    const kratosPublicUrl = process.env.KRATOS_PUBLIC_URL || 'http://localhost:4433';
    const kratosAdminUrl = process.env.KRATOS_ADMIN_URL || 'http://localhost:4434';

    return [
      {
        source: '/api/kratos/:path*',
        destination: `${kratosPublicUrl}/:path*`,
      },
      {
        source: '/api/kratos-admin/:path*',
        destination: `${kratosAdminUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
