import { auth } from "@/lib/firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";

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

/** Sign‑out */
export const signOut = async () => {
  await firebaseSignOut(auth);
  try {
    await fetch('/api/auth/cookie', { method: 'DELETE' });
  } catch (error) {
    console.error('Failed to clear auth cookie', error);
  }
};
