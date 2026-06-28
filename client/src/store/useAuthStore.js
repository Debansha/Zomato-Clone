import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, accessToken } = response.data;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken);
          }
          
          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error) {
          set({ error: error.message, isLoading: false, isAuthenticated: false });
          return false;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', userData);
          const { user, accessToken } = response.data;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken);
          }
          
          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error) {
          set({ error: error.message, isLoading: false, isAuthenticated: false });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.post('/auth/logout');
        } catch (e) {
          console.error('Logout error', e);
        } finally {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
          }
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      fetchProfile: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) return;

        set({ isLoading: true });
        try {
          const response = await api.get('/auth/me');
          set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ user: null, isAuthenticated: false, isLoading: false });
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
          }
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      // Only persist user basic info, not sensitive state or loading state
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
