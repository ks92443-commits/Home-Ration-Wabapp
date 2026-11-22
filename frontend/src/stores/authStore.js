import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          error: null
        });
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null
        });
        delete api.defaults.headers.common['Authorization'];
      },

      setUser: (user) => {
        set({ user });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error });
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', credentials);
          const { user, accessToken, refreshToken } = response.data.data;
          get().setAuth(user, accessToken, refreshToken);
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', userData);
          const { user, accessToken, refreshToken } = response.data.data;
          get().setAuth(user, accessToken, refreshToken);
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed';
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          get().clearAuth();
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          const response = await api.post('/auth/refresh', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          set({ accessToken, refreshToken: newRefreshToken });
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          return true;
        } catch (error) {
          get().clearAuth();
          return false;
        }
      },

      fetchProfile: async () => {
        try {
          const response = await api.get('/auth/profile');
          set({ user: response.data.data.user });
          return response.data.data.user;
        } catch (error) {
          if (error.response?.status === 401) {
            get().clearAuth();
          }
          throw error;
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true });
        try {
          const response = await api.put('/auth/profile', data);
          set({ user: response.data.data.user, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      changePassword: async (data) => {
        set({ isLoading: true });
        try {
          await api.put('/auth/password', data);
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      initializeAuth: async () => {
        const { accessToken, refreshToken } = get();
        if (accessToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          try {
            await get().fetchProfile();
          } catch (error) {
            if (refreshToken) {
              const refreshed = await get().refreshAccessToken();
              if (refreshed) {
                try {
                  await get().fetchProfile();
                } catch (e) {
                  get().clearAuth();
                }
              } else {
                get().clearAuth();
              }
            } else {
              get().clearAuth();
            }
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export const AuthProvider = ({ children }) => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return children;
};

import React from 'react';

export default useAuthStore;