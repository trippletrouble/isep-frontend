import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "./useAuth";
import { useAuthStore } from "../stores/auth.store";

// Mock auth store & auth api
vi.mock("../api/auth.api", () => ({
  getOAuthUrl: vi.fn().mockReturnValue("http://mock-oauth"),
}));

describe("useAuth hook", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock window.location
    Object.defineProperty(window, "location", {
      value: {
        href: "",
      },
      writable: true,
      configurable: true,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it("should return auth store state and credentials url", () => {
    useAuthStore.setState({
      user: { id: "u1", username: "Alice", role: "USER" },
      isAuthenticated: true,
      isLoading: false,
      error: "none",
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual({
      id: "u1",
      username: "Alice",
      role: "USER",
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("none");
    expect(result.current.loginUrl).toBe("http://mock-oauth");
  });

  it("should call store logout and redirect to /login on logout", async () => {
    const logoutSpy = vi.fn().mockResolvedValue(undefined);
    useAuthStore.setState({
      logout: logoutSpy,
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(logoutSpy).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe("/login");
  });
});
