import { useAuthStore } from "../stores/auth.store";
import { getOAuthUrl } from "../api/auth.api";
import type { SessionUser } from "../api/types";

export function useAuth(): {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
  loginUrl: string;
} {
  const store = useAuthStore();
  const loginUrl = getOAuthUrl();

  const logout = async () => {
    await useAuthStore.getState().logout();
    window.location.href = "/login";
  };

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    checkSession: store.checkSession,
    logout,
    loginUrl,
  };
}
