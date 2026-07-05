import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "./auth.store";
import { getSession, logout } from "../api/auth.api";
import { ApiError } from "../api/client";

// Mock the API layer
vi.mock("../api/auth.api", () => ({
  getSession: vi.fn(),
  logout: vi.fn(),
  getOAuthUrl: () => "http://mock-oauth-url",
}));

describe("useAuthStore", () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
    });
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should have initial state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  it("should check session successfully and authenticate user", async () => {
    const mockUser = { id: "user-1", username: "Alice", role: "USER" };
    vi.mocked(getSession).mockResolvedValue(mockUser);

    await useAuthStore.getState().checkSession();

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should clear user when checkSession throws 401 ApiError", async () => {
    const apiError = new ApiError("Unauthorized", 401, "UNAUTHORIZED");
    vi.mocked(getSession).mockRejectedValue(apiError);

    await useAuthStore.getState().checkSession();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should set error when checkSession throws generic Error", async () => {
    const err = new Error("Network Failed");
    vi.mocked(getSession).mockRejectedValue(err);

    await useAuthStore.getState().checkSession();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe("Network Failed");
  });

  it("should set error when checkSession throws non-Error", async () => {
    vi.mocked(getSession).mockRejectedValue("string-error");

    await useAuthStore.getState().checkSession();

    const state = useAuthStore.getState();
    expect(state.error).toBe("Unknown error");
  });

  it("should logout successfully and reset state", async () => {
    useAuthStore.setState({
      user: { id: "user-1", username: "Alice", role: "USER" },
      isAuthenticated: true,
      isLoading: false,
    });
    vi.mocked(logout).mockResolvedValue({ message: "Success" });

    await useAuthStore.getState().logout();

    expect(logout).toHaveBeenCalledTimes(1);
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("should clear error", () => {
    useAuthStore.setState({ error: "Some Error" });
    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });
});
