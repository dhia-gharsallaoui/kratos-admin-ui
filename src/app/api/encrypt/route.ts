import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  // Use SHA-256 to ensure we have exactly 32 bytes for AES-256
  return crypto.createHash('sha256').update(key).digest();
}

export async function POST(request: NextRequest) {
  try {
    const { value } = await request.json();
    if (!value) {
      return NextResponse.json({ encrypted: '' });
    }

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(value, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encryptedData (all base64)
    const result = `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;

    return NextResponse.json({ encrypted: result });
  } catch (error) {
    console.error('Encryption error:', error);
    return NextResponse.json({ error: 'Encryption failed' }, { status: 500 });
  }
}
