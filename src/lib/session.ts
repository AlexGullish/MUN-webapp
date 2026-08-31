import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'mun_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'mun-conference-portal-super-secret-key-2026';

// Get cryptography key for HMAC signing
async function getCryptoKey() {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Creates a base64 encoded and HMAC-SHA256 signed session token.
 */
export interface SessionPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  committeeId?: string | null;
  country: string;
  school: string;
  exp: number;
}

export async function signSession(payload: Omit<SessionPayload, 'exp'>): Promise<string> {
  const enc = new TextEncoder();
  const data = JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 }); // 24 Hours
  const key = await getCryptoKey();
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const signatureHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${btoa(unescape(encodeURIComponent(data)))}.${signatureHex}`;
}

/**
 * Verifies and decodes a signed session token.
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [dataB64, signatureHex] = parts;
    const dataStr = decodeURIComponent(escape(atob(dataB64)));
    
    // Verify signature
    const key = await getCryptoKey();
    const enc = new TextEncoder();
    const verified = await crypto.subtle.verify(
      'HMAC',
      key,
      new Uint8Array(signatureHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))),
      enc.encode(dataStr)
    );
    
    if (!verified) return null;
    
    const payload = JSON.parse(dataStr);
    if (payload.exp < Date.now()) return null; // Token expired
    
    return payload;
  } catch {
    return null;
  }
}

/**
 * Server Component / API helper to retrieve current user session.
 */
export async function getSession() {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!cookie) return null;
    return await verifySession(cookie.value);
  } catch {
    return null;
  }
}

/**
 * Serializes and sets secure HTTP-Only cookie.
 */
export async function setSession(user: { id: string; name: string; email: string; role: string; committeeId?: string | null; country: string; school: string }) {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    committeeId: user.committeeId,
    country: user.country,
    school: user.school,
  };
  const token = await signSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 1 Day
    path: '/',
  });
}

/**
 * Clears the session cookie to logout user.
 */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
}
