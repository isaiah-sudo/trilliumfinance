import { auth } from "@/lib/firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
} from "firebase/auth";

let activeSyncToken: string | null = null;
let activeSyncPromise: Promise<boolean> | null = null;

/** Synchronize Firebase ID token to server session cookie with retry & 429 resilience */
export const syncAuthCookie = async (idToken: string, retries = 3, initialDelay = 300): Promise<boolean> => {
  if (activeSyncToken === idToken && activeSyncPromise) {
    return activeSyncPromise;
  }

  activeSyncToken = idToken;
  activeSyncPromise = (async () => {
    try {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch('/api/auth/cookie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });

          if (res.ok) {
            return true;
          }

          if (res.status === 429 || res.status >= 500) {
            console.warn(`Auth cookie sync attempt ${i + 1} returned status ${res.status}. Retrying...`);
            if (i < retries - 1) {
              await new Promise((resolve) => setTimeout(resolve, initialDelay * Math.pow(2, i)));
              continue;
            }
          }
        } catch (fetchErr) {
          console.warn(`Auth cookie sync attempt ${i + 1} failed network call:`, fetchErr);
          if (i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, initialDelay * Math.pow(2, i)));
            continue;
          }
        }
      }
      return false;
    } finally {
      activeSyncToken = null;
      activeSyncPromise = null;
    }
  })();

  return activeSyncPromise;
};

/** Clear session cookie on server with retries */
export const removeAuthCookie = async (retries = 2, initialDelay = 300): Promise<boolean> => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch('/api/auth/cookie', { method: 'DELETE' });
      if (res.ok) return true;
      if ((res.status === 429 || res.status >= 500) && i < retries - 1) {
        await new Promise((r) => setTimeout(r, initialDelay * (i + 1)));
      }
    } catch (e) {
      if (i < retries - 1) await new Promise((r) => setTimeout(r, initialDelay * (i + 1)));
    }
  }
  return false;
};

/** Sign‑in with Google */
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
};

/** Sign‑in with email & password */
export const signInWithEmail = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

/** Sign‑up with email & password */
export const signUpWithEmail = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

/** Send password reset email */
export const resetPassword = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

/** Sign‑out */
export const signOut = async () => {
  await firebaseSignOut(auth);
  await removeAuthCookie();
};

