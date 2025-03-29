import { create } from 'zustand';
import { authService, AuthUser } from '../lib/auth';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string, role: 'donor' | 'orphanage') => Promise<void>;
  signUp: (data: {
    email: string;
    password: string;
    name: string;
    role: 'donor' | 'orphanage';
  }) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  signIn: async (email: string, password: string, role: 'donor' | 'orphanage') => {
    try {
      set({ loading: true, error: null });
      const user = await authService.signIn(email, password, role);
      set({ user, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Authentication failed',
        loading: false 
      });
      throw error;
    }
  },
  signUp: async (data) => {
    try {
      set({ loading: true, error: null });
      const user = await authService.signUp(data);
      set({ user, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Registration failed',
        loading: false 
      });
      throw error;
    }
  },
  signOut: async () => {
    try {
      set({ loading: true, error: null });
      await authService.signOut();
      set({ user: null, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sign out',
        loading: false 
      });
      throw error;
    }
  },
  checkAuth: async () => {
    try {
      set({ loading: true, error: null });
      
      // Try to refresh the session first
      await authService.refreshSession();
      
      const user = await authService.getCurrentUser();
      set({ user, loading: false });
    } catch (error) {
      set({ 
        user: null,
        error: error instanceof Error ? error.message : 'Authentication check failed',
        loading: false 
      });
    }
  },
  clearError: () => set({ error: null })
}));