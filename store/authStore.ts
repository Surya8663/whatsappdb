import { create } from 'zustand';
import { User, LoginCredentials } from '@/types';
import { apiClient } from '@/lib/api-client';
import {
  setAuthData,
  clearAuthData,
  getStoredUser,
  getStoredToken,
} from '@/lib/auth';
import { API_ENDPOINTS } from '@/lib/constants';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // ✅ LOGIN
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });

    try {
      // ⬇️ Match backend response EXACTLY
      const response = await apiClient.post<{
        user: User;
        accessToken: string;
      }>(API_ENDPOINTS.auth.login, credentials);

      const { user, accessToken } = response;

      // ✅ Persist auth
      setAuthData(accessToken, user);

      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Login failed';

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  // ✅ LOGOUT
  logout: () => {
    clearAuthData();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  // ✅ CHECK AUTH ON APP LOAD
  checkAuth: () => {
    const token = getStoredToken();
    const user = getStoredUser();

    if (token && user) {
      set({
        token,
        user,
        isAuthenticated: true,
      });
    } else {
      set({
        token: null,
        user: null,
        isAuthenticated: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
