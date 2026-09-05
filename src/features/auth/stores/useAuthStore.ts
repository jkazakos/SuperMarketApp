import { create } from 'zustand';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import { AuthService } from '../services/authService';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  isInitialized: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  signOut: async () => {
    await AuthService.signOut();
    set({ user: null, profile: null });
  },
}));

let unsubscribeProfile: (() => void) | null = null;

// Initialize Firebase Auth listener
AuthService.watchAuthState(async (firebaseUser) => {
  if (unsubscribeProfile) {
    unsubscribeProfile();
    unsubscribeProfile = null;
  }

  useAuthStore.getState().setUser(firebaseUser);

  if (firebaseUser) {
    unsubscribeProfile = AuthService.watchUserProfile(firebaseUser.uid, (profile) => {
      useAuthStore.getState().setProfile(profile);
      useAuthStore.getState().setLoading(false);
    });
  } else {
    useAuthStore.getState().setProfile(null);
    useAuthStore.getState().setLoading(false);
  }

  useAuthStore.setState({ isInitialized: true });
});
