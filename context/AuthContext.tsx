'use client';

import { createContext, useContext, useEffect, useState, PropsWithChildren } from 'react';
import { onIdTokenChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

/**
 * Provider that listens to Firebase auth state changes and supplies the current user.
 * Wrap this around the whole app (e.g., in `app/layout.tsx`) or around protected routes.
 */
export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety timeout: force loading to false if Firebase auth fails to respond in 1200ms
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 1200);

    let isFirstCall = true;
    let previousUser: User | null = null;

    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      // Optimistically set user state and resolve loading immediately
      setUser(firebaseUser);
      setLoading(false);
      clearTimeout(safetyTimeout);
      
      try {
        if (firebaseUser) {
          previousUser = firebaseUser;
          isFirstCall = false;
          const idToken = await firebaseUser.getIdToken();
          // Fire off cookie synchronization in the background
          fetch('/api/auth/cookie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          }).catch((error) => {
            console.error('Background auth cookie synchronization failed:', error);
          });
        } else {
          // Only clear the cookie if this is NOT the initial initialization check,
          // or if we had a logged-in user previously (which indicates a real logout).
          if (!isFirstCall || previousUser !== null) {
            fetch('/api/auth/cookie', {
              method: 'DELETE',
            }).catch((error) => {
              console.error('Background auth cookie removal failed:', error);
            });
          }
          previousUser = null;
          isFirstCall = false;
        }
      } catch (error) {
        console.error('Error during onIdTokenChanged processing:', error);
      }
    });

    return () => {
      clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access authentication state.
 * Returns `{ user, loading }`. `user` is `null` when not signed in.
 */
export const useAuth = () => useContext(AuthContext);

