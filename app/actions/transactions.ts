import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Validates the session and returns the user ID on the client.
 */
async function getAuthenticatedUserId() {
  let user = auth.currentUser;
  
  if (!user) {
    await new Promise<void>((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((u) => {
        user = u;
        unsubscribe();
        resolve();
      });
    });
  }

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user.uid;
}

/**
 * Fetch transactions for the authenticated user.
 */
export async function getTransactions() {
  const userId = await getAuthenticatedUserId();
  const transactionsRef = collection(db, 'users', userId, 'transactions');
  const q = query(transactionsRef, orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString(),
    };
  });
}

/**
 * Add a new transaction.
 */
export async function addTransaction(data: { amount: number; type: string; description: string }) {
  const userId = await getAuthenticatedUserId();
  const transactionsRef = collection(db, 'users', userId, 'transactions');
  const res = await addDoc(transactionsRef, {
    ...data,
    timestamp: serverTimestamp(),
  });

  return { id: res.id };
}
