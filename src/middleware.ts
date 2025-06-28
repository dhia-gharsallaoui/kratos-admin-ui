import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle Kratos API proxying
  if (pathname.startsWith('/api/kratos/')) {
    const kratosPublicUrl = process.env.KRATOS_PUBLIC_URL || 'http://localhost:4435';
    const targetPath = pathname.replace('/api/kratos', '');
    const targetUrl = `${kratosPublicUrl}${targetPath}${request.nextUrl.search}`;
    
    return NextResponse.rewrite(new URL(targetUrl));
  }

  if (pathname.startsWith('/api/kratos-admin/')) {
    const kratosAdminUrl = process.env.KRATOS_ADMIN_URL || 'http://localhost:4434';
    const targetPath = pathname.replace('/api/kratos-admin', '');
    const targetUrl = `${kratosAdminUrl}${targetPath}${request.nextUrl.search}`;
    
    return NextResponse.rewrite(new URL(targetUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/kratos/:path*',
    '/api/kratos-admin/:path*'
  ]
};