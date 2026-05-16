import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'trilliumfinance-e1e81';

console.log(`[Firebase Admin] Loading module for project: ${projectId}`);

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (privateKey && clientEmail) {
    console.log(`[Firebase Admin] Initializing with provided credentials.`);
    return initializeApp({
      credential: cert({
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  }

  console.log(`[Firebase Admin] Initializing with default credentials.`);
  // This will work automatically on Firebase Hosting / Cloud Run if permissions are set
  return initializeApp();
}

// Initialize the app once at module level, but catch errors
let app: any;
try {
  app = getFirebaseAdminApp();
} catch (error) {
  console.error('[Firebase Admin] Module-level initialization failed:', error);
}

/**
 * Robust getter for adminDb (Firestore)
 */
export const getAdminDb = (): Firestore => {
  if (!app) {
    throw new Error('Firebase Admin app not initialized. Check environment variables.');
  }
  return getFirestore(app);
};

/**
 * Robust getter for adminAuth
 */
export const getAdminAuth = (): Auth => {
  if (!app) {
    throw new Error('Firebase Admin app not initialized. Check environment variables.');
  }
  return getAuth(app);
};

// Also export the constants for backward compatibility, but wrap them
export const adminDb = app ? getFirestore(app) : null as unknown as Firestore;
export const adminAuth = app ? getAuth(app) : null as unknown as Auth;
