import { create } from 'zustand';

interface UserProfile {
  displayName: string | null;
  photoURL: string | null;
  experiencePoints: number;
}

interface UserState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  updateExperience: (points: number) => void;
}

/**
 * Zustand store for synchronizing user session data across the frontend.
 */
export const useUserStore = create<UserState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  updateExperience: (points) =>
    set((state) => ({
      profile: state.profile
        ? { ...state.profile, experiencePoints: state.profile.experiencePoints + points }
        : null,
    })),
}));
