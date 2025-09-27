import { NextRequest, NextResponse } from 'next/server';
import { kratosHttpClient, HttpError, NetworkError, TimeoutError } from '@/lib/http-client';

async function proxyToKratos(request: NextRequest, baseUrl: string, pathPrefix: string): Promise<NextResponse> {
  try {
    const targetPath = request.nextUrl.pathname.replace(pathPrefix, '');
    const targetUrl = `${baseUrl}${targetPath}${request.nextUrl.search}`;

    const response = await kratosHttpClient.fetch(targetUrl, {
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

    // Handle 204 No Content responses
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

    // Create response with original content
    const responseBody = await response.arrayBuffer();
    const headers = new Headers();

    // Copy response headers
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding') {
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

    if (error instanceof HttpError) {
      return NextResponse.json(
        {
          error: 'Kratos API Error',
          message: error.message,
          status: error.status,
          details: `Failed to connect to Kratos at ${baseUrl}`,
        },
        { status: error.status || 502 }
      );
    }

    if (error instanceof NetworkError || error instanceof TimeoutError) {
      return NextResponse.json(
        {
          error: 'Network Error',
          message: error.message,
          details: `Unable to reach Kratos at ${baseUrl}. Please check your Kratos configuration.`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        error: 'Proxy Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: `Failed to proxy request to ${baseUrl}`,
      },
      { status: 502 }
    );
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle Kratos public API proxying
  if (pathname.startsWith('/api/kratos/')) {
    const kratosPublicUrl =
      request.cookies.get('kratos-public-url')?.value ||
      request.headers.get('x-kratos-public-url') ||
      process.env.KRATOS_PUBLIC_URL ||
      'http://localhost:4433';

    return proxyToKratos(request, kratosPublicUrl, '/api/kratos');
  }

  // Handle Kratos admin API proxying
  if (pathname.startsWith('/api/kratos-admin/')) {
    const kratosAdminUrl =
      request.cookies.get('kratos-admin-url')?.value ||
      request.headers.get('x-kratos-admin-url') ||
      process.env.KRATOS_ADMIN_URL ||
      'http://localhost:4434';

    return proxyToKratos(request, kratosAdminUrl, '/api/kratos-admin');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/kratos/:path*', '/api/kratos-admin/:path*'],
};
