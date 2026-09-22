import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { idToken } = body;

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid ID token' }, { status: 400 });
    }

    // Verify token validity with Firebase Admin
    try {
      const adminAuth = getAdminAuth();
      if (adminAuth) {
        await adminAuth.verifyIdToken(idToken);
      }
    } catch (verifyErr: any) {
      console.warn('[Auth Cookie API] Token verification failed:', verifyErr.message);
      return NextResponse.json({ error: 'Unauthorized: Invalid ID token' }, { status: 401 });
    }

    const cookieStore = await cookies();
    
    // Set the cookie (using __session for Firebase Hosting compatibility)
    cookieStore.set('__session', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 5, // 5 days
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting auth cookie:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('__session');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting auth cookie:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
