import { STORAGE_KEYS } from './constants';
import { User } from '@/types';

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.token);
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(STORAGE_KEYS.user);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
};

export const setAuthData = (token: string, user: User) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.token, token);
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  // Set cookie for middleware
  document.cookie = `${STORAGE_KEYS.token}=${token}; path=/; max-age=86400; SameSite=Lax`;
};

export const clearAuthData = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem('refresh_token');
  // Clear cookie
  document.cookie = `${STORAGE_KEYS.token}=; path=/; max-age=0`;
};

export const isAuthenticated = (): boolean => {
  return !!getStoredToken();
};
