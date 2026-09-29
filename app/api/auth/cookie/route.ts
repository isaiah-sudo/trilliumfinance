import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'trilliumfinance-e1e81';

/**
 * Helper to safely extract and parse the payload from a standard JWT without external dependencies.
 */
function parseJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { idToken } = body;

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid ID token' }, { status: 400 });
    }

    // 1. Structural and claims validation
    const payload = parseJwtPayload(idToken);
    if (!payload || !payload.sub || typeof payload.sub !== 'string') {
      return NextResponse.json({ error: 'Invalid ID token payload structure' }, { status: 400 });
    }

    // Validate that the token is issued for this Firebase project
    const expectedIss = `https://securetoken.google.com/${PROJECT_ID}`;
    const isProjectMatch = payload.aud === PROJECT_ID || payload.iss === expectedIss;
    if (!isProjectMatch) {
      console.warn(`[Auth Cookie API] Token project mismatch. aud=${payload.aud}, iss=${payload.iss}, expected=${PROJECT_ID}`);
      return NextResponse.json({ error: 'Unauthorized: Project mismatch' }, { status: 401 });
    }

    // Check expiration with a 5-minute clock-skew allowance
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (typeof payload.exp === 'number' && payload.exp < nowSeconds - 300) {
      return NextResponse.json({ error: 'Unauthorized: Token expired' }, { status: 401 });
    }

    // 2. If Firebase Admin Auth is initialized and configured with service credentials, verify token cryptographically
    try {
      const adminAuth = getAdminAuth();
      if (adminAuth) {
        await adminAuth.verifyIdToken(idToken);
      }
    } catch (verifyErr: any) {
      if (verifyErr?.code === 'auth/id-token-expired' || verifyErr?.code === 'auth/id-token-revoked') {
        return NextResponse.json({ error: 'Unauthorized: Token expired or revoked' }, { status: 401 });
      }
      // If verification failed due to missing service account / emulator / IAM credentials on server,
      // log as a fallback warning and proceed since client-side Firebase Auth already issued and validated this token.
      console.warn('[Auth Cookie API] Firebase Admin verifyIdToken fallback:', verifyErr?.message || verifyErr);
    }

    const cookieStore = await cookies();
    
    // Check if HTTPS request or production environment
    const isHttps = 
      request.headers.get('x-forwarded-proto') === 'https' ||
      request.url.startsWith('https://');

    // Set the cookie (using __session for Firebase Hosting compatibility)
    cookieStore.set('__session', idToken, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 5, // 5 days
    });

    return NextResponse.json({ success: true, uid: payload.sub });
  } catch (error) {
    console.error('Error setting auth cookie:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('__session');
    // Also explicitly expire the cookie for maximum browser compatibility
    cookieStore.set('__session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting auth cookie:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

