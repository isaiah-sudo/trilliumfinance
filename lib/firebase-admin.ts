import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'trilliumfinance-e1e81';

console.log(`Initializing Firebase Admin for project: ${projectId}`);

const app = getApps().length > 0
  ? getApp()
  : initializeApp(
      process.env.FIREBASE_PRIVATE_KEY
        ? {
            credential: cert({
              projectId: projectId,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
          }
        : undefined // Passing undefined allows Firebase to use FIREBASE_CONFIG automatically
    );

export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);
