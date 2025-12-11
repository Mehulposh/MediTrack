import { create } from 'zustand';
import type { User, Patient, Doctor } from '../types/index.ts';

interface AuthState {
  user: User | null;
  profile: Patient | Doctor | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, profile: Patient | Doctor | null, token: string, refreshToken: string) => void;
  updateProfile: (profile: Patient | Doctor) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, profile, token, refreshToken) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('profile', JSON.stringify(profile));
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    
    set({
      user,
      profile,
      token,
      isAuthenticated: true,
    });
  },

  updateProfile: (profile) => {
    localStorage.setItem('profile', JSON.stringify(profile));
    set({ profile });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    set({
      user: null,
      profile: null,
      token: null,
      isAuthenticated: false,
    });
  },

  initializeAuth: () => {
    const userStr = localStorage.getItem('user');
    const profileStr = localStorage.getItem('profile');
    const token = localStorage.getItem('token');

    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        const profile = profileStr ? JSON.parse(profileStr) : null;
        
        set({
          user,
          profile,
          token,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error('Failed to parse stored auth data:', error);
        localStorage.clear();
      }
    }
  },
}));