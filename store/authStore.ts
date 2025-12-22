import { create } from 'zustand';
import { User, LoginCredentials, ApiResponse } from '@/types';
import { apiClient } from '@/lib/api-client';
import { setAuthData, clearAuthData, getStoredUser, getStoredToken } from '@/lib/auth';
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

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiClient.post<ApiResponse<{ user: User; token: string }>>(
        API_ENDPOINTS.auth.login,
        credentials
      );

      if (response.success && response.data) {
        const { user, token } = response.data;
        setAuthData(token, user);
        set({ 
          user, 
          token, 
          isAuthenticated: true, 
          isLoading: false,
          error: null 
        });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      set({ 
        error: errorMessage, 
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null
      });
      throw error;
    }
  },

  logout: () => {
    clearAuthData();
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false,
      error: null
    });
  },

  checkAuth: () => {
    const token = getStoredToken();
    const user = getStoredUser();

    if (token && user) {
      set({ 
        token, 
        user, 
        isAuthenticated: true 
      });
    } else {
      set({ 
        token: null, 
        user: null, 
        isAuthenticated: false 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
