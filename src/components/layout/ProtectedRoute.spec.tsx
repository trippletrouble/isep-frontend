import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuthStore } from "../../stores/auth.store";
import { MemoryRouter, Routes, Route } from "react-router-dom";

describe("ProtectedRoute component", () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: false,
      isLoading: false,
      checkSession: vi.fn(),
    });
    vi.clearAllMocks();
  });

  it("should show Loading indicator when loading session", () => {
    useAuthStore.setState({ isLoading: true });

    render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>
    );

    expect(screen.getByText("Laden...")).toBeInTheDocument();
  });

  it("should redirect to /login when unauthenticated", () => {
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/protected" element={<ProtectedRoute />}>
            <Route path="" element={<div>Protected Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).toBeNull();
  });

  it("should render outlet when authenticated", () => {
    useAuthStore.setState({ isAuthenticated: true });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/protected" element={<ProtectedRoute />}>
            <Route path="" element={<div>Protected Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(screen.queryByText("Login Page")).toBeNull();
  });

  it("should trigger checkSession on mount", () => {
    const checkSessionSpy = vi.fn();
    useAuthStore.setState({ checkSession: checkSessionSpy });

    render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>
    );

    expect(checkSessionSpy).toHaveBeenCalledTimes(1);
  });
});
