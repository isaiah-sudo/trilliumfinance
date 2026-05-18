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
    // 1. Check if GOOGLE_APPLICATION_CREDENTIALS is explicitly set in the environment
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log(`[Firebase Admin] Production mode – using GOOGLE_APPLICATION_CREDENTIALS.`);
      return initializeApp({
        credential: admin.credential.applicationDefault()
      });
    }

    // 2. Check if explicit service account credentials are provided in env vars
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      console.log(`[Firebase Admin] Production mode – using environment variable service account credentials.`);
      return initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
      });
    }

    // 3. Check if local firebase-service-account.json exists in workspace
    try {
      const fs = require('fs');
      const path = require('path');
      const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
      if (fs.existsSync(serviceAccountPath)) {
        console.log(`[Firebase Admin] Production mode – using local firebase-service-account.json.`);
        return initializeApp({
          credential: admin.credential.cert(serviceAccountPath)
        });
      }
    } catch (e) {
      console.warn('[Firebase Admin] Error checking for local service account file:', e);
    }

    // 4. Default fallback to application default credentials (e.g. when hosted on Google Cloud)
    console.log(`[Firebase Admin] Production mode – using default credentials.`);
    return initializeApp({
      credential: admin.credential.applicationDefault()
    });
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
