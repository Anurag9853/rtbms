import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: false,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — auto logout
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  }
);

export { API };

/**
 * useAuthStore — Zustand store persisted to localStorage
 * Handles login, register, logout, token refresh, and user state
 */
export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ── State ──────────────────────────────────────────────────────
        user:     null,
        token:    null,
        loading:  false,
        error:    null,

        // ── Computed ───────────────────────────────────────────────────
        isAuthenticated: () => !!get().token && !!get().user,
        isRole:          (role) => get().user?.role === role,
        hasRole:         (roles) => roles.includes(get().user?.role),

        // ── Actions ────────────────────────────────────────────────────

        register: async (data) => {
          set({ loading: true, error: null });
          try {
            const res = await API.post('/auth/register', data);
            set({
              user:    res.data.user,
              token:   res.data.token,
              loading: false,
              error:   null,
            });
            return { success: true, user: res.data.user };
          } catch (err) {
            const message = err.response?.data?.message
              || Object.values(err.response?.data?.errors || {})[0]?.[0]
              || 'Registration failed.';
            set({ loading: false, error: message });
            return { success: false, error: message };
          }
        },

        login: async (email, password) => {
          set({ loading: true, error: null });
          try {
            const res = await API.post('/auth/login', { email, password });
            set({
              user:    res.data.user,
              token:   res.data.token,
              loading: false,
              error:   null,
            });
            return { success: true };
          } catch (err) {
            const message = err.response?.data?.message
              || 'Invalid email or password.';
            set({ loading: false, error: message });
            return { success: false, error: message };
          }
        },

        logout: async () => {
          try {
            if (get().token) await API.post('/auth/logout');
          } catch {}
          set({ user: null, token: null, error: null });
        },

        fetchMe: async () => {
          if (!get().token) return;
          try {
            const res = await API.get('/auth/me');
            set({ user: res.data.user });
          } catch {
            set({ user: null, token: null });
          }
        },

        clearError: () => set({ error: null }),

        updateUser: (data) => set((state) => ({ user: { ...state.user, ...data } })),
      }),
      {
        name: 'rtbms-auth',
        partialize: (state) => ({ user: state.user, token: state.token }),
      }
    ),
    { name: 'AuthStore' }
  )
);

/**
 * useAuth — convenience hook for components
 */
export function useAuth() {
  return useAuthStore();
}
