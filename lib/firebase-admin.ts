import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import admin from 'firebase-admin';

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'trilliumfinance-e1e81';

console.log(`[Firebase Admin] Loading module for project: ${projectId}`);

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  if (process.env.NODE_ENV === 'production') {
    // 1. Try explicit service account credentials in environment variables
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      try {
        console.log(`[Firebase Admin] Initializing with env service account credentials.`);
        return initializeApp({
          credential: admin.credential.cert({
            projectId: projectId,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          })
        });
      } catch (err: any) {
        console.error('[Firebase Admin] Env cert initialization failed:', err.message);
      }
    }

    // 2. Try local firebase-service-account.json file
    try {
      const fs = require('fs');
      const path = require('path');
      const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
      if (fs.existsSync(serviceAccountPath)) {
        console.log(`[Firebase Admin] Initializing with local firebase-service-account.json.`);
        return initializeApp({
          credential: admin.credential.cert(serviceAccountPath)
        });
      }
    } catch (err: any) {
      console.warn('[Firebase Admin] Local service account initialization failed:', err.message);
    }

    // 3. Try to initialize without arguments (ideal fallback for Google Cloud envs/Cloud Functions)
    try {
      console.log(`[Firebase Admin] Initializing with no arguments (GCP default).`);
      return initializeApp();
    } catch (err: any) {
      console.warn('[Firebase Admin] No-argument initialization failed:', err.message);
    }

    // 4. Try applicationDefault()
    try {
      console.log(`[Firebase Admin] Initializing with applicationDefault().`);
      return initializeApp({
        credential: admin.credential.applicationDefault()
      });
    } catch (err: any) {
      console.warn('[Firebase Admin] applicationDefault() initialization failed:', err.message);
    }

    // 5. Last resort: simple project ID
    try {
      console.log(`[Firebase Admin] Last resort initialization with projectId: ${projectId}`);
      return initializeApp({ projectId });
    } catch (err: any) {
      console.error('[Firebase Admin] Last resort initialization failed:', err.message);
      throw err;
    }
  } else {
    console.log(`[Firebase Admin] Development mode – using emulators.`);
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
    return initializeApp({ projectId });
  }
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
