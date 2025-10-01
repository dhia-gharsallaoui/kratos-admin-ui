import { NextRequest, NextResponse } from 'next/server';

async function proxyToService(request: NextRequest, baseUrl: string, pathPrefix: string, serviceName: string): Promise<NextResponse> {
  try {
    const targetPath = request.nextUrl.pathname.replace(pathPrefix, '');
    const targetUrl = `${baseUrl}${targetPath}${request.nextUrl.search}`;

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: Object.fromEntries(
        Array.from(request.headers.entries()).filter(
          ([key]) =>
            // Forward relevant headers but exclude problematic ones
            !key.startsWith('x-forwarded') && !key.startsWith('x-real-ip') && key !== 'host' && key !== 'connection' && key !== 'upgrade'
        )
      ),
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.arrayBuffer() : undefined,
    });

    // Handle different response types
    if (response.status === 204) {
      const headers = new Headers();
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding') {
          headers.set(key, value);
        }
      });

      return new NextResponse(null, {
        status: 204,
        headers,
      });
    }

    // Handle successful responses with content
    const responseBody = await response.arrayBuffer();
    const headers = new Headers();

    // Copy response headers selectively to avoid Next.js Edge Runtime issues
    // The 'location' header from Ory Hydra's 201 responses causes "Invalid URL" TypeErrors
    // in the Edge Runtime, which then returns 500 errors to the frontend. We filter to only
    // include essential headers that are safe for the Edge Runtime to process.
    const safeHeaders = ['content-type', 'cache-control', 'etag', 'last-modified', 'vary'];
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      // Only copy safe headers and custom x-* headers (excluding forwarding headers)
      if (
        safeHeaders.includes(lowerKey) ||
        (lowerKey.startsWith('x-') && !lowerKey.startsWith('x-forwarded') && !lowerKey.startsWith('x-real-ip'))
      ) {
        headers.set(key, value);
      }
    });

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error(`[Middleware] Failed to proxy ${request.nextUrl.pathname}:`, error);
    console.error(`[Middleware] Error details:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });

    // Handle fetch errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        {
          error: 'Network Error',
          message: error.message,
          details: `Unable to reach ${serviceName} at ${baseUrl}. Please check your ${serviceName} configuration.`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        error: 'Proxy Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: `Failed to proxy request to ${serviceName} at ${baseUrl}`,
        errorType: error instanceof Error ? error.name : 'Unknown',
      },
      { status: 500 }
    );
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle Kratos public API proxying
  if (pathname.startsWith('/api/kratos/')) {
    const kratosPublicUrlRaw =
      request.cookies.get('kratos-public-url')?.value ||
      request.headers.get('x-kratos-public-url') ||
      process.env.KRATOS_PUBLIC_URL ||
      'http://localhost:4433';

    const kratosPublicUrl = decodeURIComponent(kratosPublicUrlRaw);
    return proxyToService(request, kratosPublicUrl, '/api/kratos', 'Kratos');
  }

  // Handle Kratos admin API proxying
  if (pathname.startsWith('/api/kratos-admin/')) {
    const kratosAdminUrlRaw =
      request.cookies.get('kratos-admin-url')?.value ||
      request.headers.get('x-kratos-admin-url') ||
      process.env.KRATOS_ADMIN_URL ||
      'http://localhost:4434';

    const kratosAdminUrl = decodeURIComponent(kratosAdminUrlRaw);
    // Strip /admin from the path since Ory SDK already includes it in the basePath
    return proxyToService(request, kratosAdminUrl, '/api/kratos-admin/admin', 'Kratos');
  }

  // Handle Hydra public API proxying
  if (pathname.startsWith('/api/hydra/')) {
    const hydraPublicUrlRaw =
      request.cookies.get('hydra-public-url')?.value ||
      request.headers.get('x-hydra-public-url') ||
      process.env.HYDRA_PUBLIC_URL ||
      'http://localhost:4444';

    const hydraPublicUrl = decodeURIComponent(hydraPublicUrlRaw);
    return proxyToService(request, hydraPublicUrl, '/api/hydra', 'Hydra');
  }

  // Handle Hydra admin API proxying
  if (pathname.startsWith('/api/hydra-admin/')) {
    const hydraAdminUrlRaw =
      request.cookies.get('hydra-admin-url')?.value ||
      request.headers.get('x-hydra-admin-url') ||
      process.env.HYDRA_ADMIN_URL ||
      'http://localhost:4445';

    const hydraAdminUrl = decodeURIComponent(hydraAdminUrlRaw);
    // Strip /admin from the path since Ory SDK already includes it in the basePath
    return proxyToService(request, hydraAdminUrl, '/api/hydra-admin/admin', 'Hydra');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/kratos/:path*', '/api/kratos-admin/:path*', '/api/hydra/:path*', '/api/hydra-admin/:path*'],
};
