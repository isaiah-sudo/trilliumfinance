'use client';

import { createContext, useContext, useEffect, useState, PropsWithChildren } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      // Removed document.cookie assignment here. The login/signup pages now handle setting the HTTP-only cookie via API.
      setLoading(false);
    });
    return () => unsubscribe();
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
