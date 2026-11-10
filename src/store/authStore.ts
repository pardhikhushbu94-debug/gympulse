import { create } from 'zustand';
import { UserProfile, UserRole, UserMembership } from '../types';
import { mockUsers, mockUserMembership } from '../services/mockData';

interface AuthState {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  membership: UserMembership | null;
  isLoading: boolean;

  // Actions
  switchRole: (role: UserRole) => void;
  loginWithPhone: (phone: string, otp: string) => Promise<boolean>;
  loginWithEmail: (email: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateMembership: (membership: UserMembership) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: mockUsers.member_1, // Pre-loaded with realistic member profile
  role: 'member',
  isAuthenticated: true,
  membership: mockUserMembership,
  isLoading: false,

  switchRole: (role: UserRole) => {
    if (role === 'member') {
      set({ user: mockUsers.member_1, role: 'member', isAuthenticated: true });
    } else if (role === 'trainer') {
      set({ user: mockUsers.trainer_1, role: 'trainer', isAuthenticated: true });
    } else if (role === 'admin') {
      set({ user: mockUsers.admin_1, role: 'admin', isAuthenticated: true });
    }
  },

  loginWithPhone: async (phone: string, otp: string) => {
    set({ isLoading: true });
    // In live mode, verify via Supabase Auth OTP
    await new Promise((res) => setTimeout(res, 600));
    set({
      user: {
        ...mockUsers.member_1,
        phone,
      },
      role: 'member',
      isAuthenticated: true,
      isLoading: false,
    });
    return true;
  },

  loginWithEmail: async (email: string) => {
    set({ isLoading: true });
    await new Promise((res) => setTimeout(res, 600));
    set({
      user: {
        ...mockUsers.member_1,
        email,
      },
      role: 'member',
      isAuthenticated: true,
      isLoading: false,
    });
    return true;
  },

  logout: () => {
    set({
      user: null,
      role: 'member',
      isAuthenticated: false,
      membership: null,
    });
  },

  updateProfile: (updates: Partial<UserProfile>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },

  updateMembership: (membership: UserMembership) => {
    set({ membership });
  },
}));
