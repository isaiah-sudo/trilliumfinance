import admin from 'firebase-admin';

/**
 * Initializes the Firebase Admin SDK.
 * Uses environment variables for configuration.
 */
if (!admin.apps.length) {
  if (process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'trilliumfinance-e1e81',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'trilliumfinance-e1e81',
    });
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
