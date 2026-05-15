'use server';

import { adminDb } from '@/lib/firebase-admin';
import { adminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Validates the session and returns the user ID.
 */
async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    throw new Error('Unauthorized');
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    throw new Error('Unauthorized');
  }
}

/**
 * Fetch transactions for the authenticated user.
 */
export async function getTransactions() {
  const userId = await getAuthenticatedUserId();
  const snapshot = await adminDb
    .collection('users')
    .doc(userId)
    .collection('transactions')
    .orderBy('timestamp', 'desc')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp.toDate().toISOString(),
  }));
}

/**
 * Add a new transaction.
 */
export async function addTransaction(data: { amount: number; type: string; description: string }) {
  const userId = await getAuthenticatedUserId();
  const res = await adminDb
    .collection('users')
    .doc(userId)
    .collection('transactions')
    .add({
      ...data,
      timestamp: FieldValue.serverTimestamp(),
    });

  return { id: res.id };
}
