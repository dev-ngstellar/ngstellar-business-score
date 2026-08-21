import { createHmac, timingSafeEqual } from 'crypto';

const TOKEN_EXPIRY_MS = 8 * 60 * 60 * 1000; // 8 hours

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return secret;
}

/** Generate a secure signed admin token */
export function generateAdminToken(): string {
  const exp = Date.now() + TOKEN_EXPIRY_MS;
  const payload = `admin:${exp}`;
  const sig = createHmac('sha256', getSecret()).update(payload).digest('base64url');
  return `${Buffer.from(payload).toString('base64url')}.${sig}`;
}

/** Verify an admin token — returns true if valid and not expired */
export function verifyAdminToken(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payloadB64, sig] = parts;
    const payload = Buffer.from(payloadB64, 'base64url').toString();
    const [role, expStr] = payload.split(':');
    if (role !== 'admin') return false;
    const exp = parseInt(expStr, 10);
    if (isNaN(exp) || exp < Date.now()) return false;
    const expectedSig = createHmac('sha256', getSecret()).update(payload).digest('base64url');
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length) return false;
    return timingSafeEqual(sigBuf, expectedBuf);
  } catch {
    return false;
  }
}

/** Extract token from Authorization header */
export function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7).trim();
}

/** Middleware helper — returns 401 response if not authenticated */
export function requireAdminAuth(request: Request): Response | null {
  const token = extractBearerToken(request);
  if (!token || !verifyAdminToken(token)) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized. Admin authentication required.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  return null;
}
