import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

function encryptApiKey(apiKey: string | undefined): string {
  if (!apiKey) return '';

  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }

  const key = crypto.createHash('sha256').update(encryptionKey).digest();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(apiKey, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

export async function GET() {
  // Get API keys from env and encrypt them
  const kratosApiKey = process.env.KRATOS_API_KEY || process.env.ORY_API_KEY || '';
  const hydraApiKey = process.env.HYDRA_API_KEY || process.env.ORY_API_KEY || '';

  const config = {
    kratosPublicUrl: process.env.KRATOS_PUBLIC_URL || 'http://localhost:4433',
    kratosAdminUrl: process.env.KRATOS_ADMIN_URL || 'http://localhost:4434',
    kratosApiKey: encryptApiKey(kratosApiKey),
    hydraPublicUrl: process.env.HYDRA_PUBLIC_URL || 'http://localhost:4444',
    hydraAdminUrl: process.env.HYDRA_ADMIN_URL || 'http://localhost:4445',
    hydraApiKey: encryptApiKey(hydraApiKey),
    isOryNetwork: process.env.IS_ORY_NETWORK === 'true',
  };

  return NextResponse.json(config);
}
