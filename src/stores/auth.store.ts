import { create } from "zustand";
import { getSession, logout as logoutApi } from "../api/auth.api";
import { ApiError } from "../api/client";
import type { SessionUser } from "../api/types";

interface AuthState {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  checkSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await getSession();
      set({ user, isAuthenticated: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        set({ user: null, isAuthenticated: false });
      } else {
        const message = err instanceof Error ? err.message : "Unknown error";
        set({ error: message });
      }
    } finally {
      set({ isLoading: false });
    }
  },
  logout: async () => {
    try {
      await logoutApi();
    } catch {
      // ignore error
    }
    set({ user: null, isAuthenticated: false });
  },
  clearError: () => {
    set({ error: null });
  },
}));
