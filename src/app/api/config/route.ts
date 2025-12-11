import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = {
    kratosPublicUrl: process.env.KRATOS_PUBLIC_URL || 'http://localhost:4433',
    kratosAdminUrl: process.env.KRATOS_ADMIN_URL || 'http://localhost:4434',
    hydraPublicUrl: process.env.HYDRA_PUBLIC_URL || 'http://localhost:4444',
    hydraAdminUrl: process.env.HYDRA_ADMIN_URL || 'http://localhost:4445',
    isOryNetwork: process.env.IS_ORY_NETWORK === 'true',
  };

  return NextResponse.json(config);
}
