import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLobby } from "./useLobby";
import { useLobbyStore } from "../stores/lobby.store";
import { useAuthStore } from "../stores/auth.store";
import { useUIStore } from "../stores/ui.store";
import { createSession, startSession } from "../api/sessions.api";
import {
  joinSession,
  leaveSession,
  generateInvite as generateInviteApi,
} from "../api/lobby.api";

// Mock the APIs
vi.mock("../api/sessions.api", () => ({
  createSession: vi.fn(),
  startSession: vi.fn(),
}));
vi.mock("../api/lobby.api", () => ({
  joinSession: vi.fn(),
  leaveSession: vi.fn(),
  generateInvite: vi.fn(),
}));

describe("useLobby hook", () => {
  beforeEach(() => {
    useLobbyStore.getState().reset();
    useAuthStore.setState({ user: null });
    useUIStore.setState({ toasts: [] });
    vi.clearAllMocks();
  });

  it("should map store states correctly", () => {
    const mockSessions = [{ sessionId: "s1" }] as any;
    useLobbyStore.setState({
      sessions: mockSessions,
      currentLobby: { sessionId: "s1" } as any,
      players: [{ id: "p1" }] as any,
      isLoading: true,
      error: "some error",
    });

    const { result } = renderHook(() => useLobby());

    expect(result.current.sessions).toEqual(mockSessions);
    expect(result.current.currentLobby).toEqual({ sessionId: "s1" });
    expect(result.current.players).toEqual([{ id: "p1" }]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe("some error");
  });

  it("should create lobby successfully when authenticated", async () => {
    useAuthStore.setState({
      user: { id: "user-1", username: "Alice", role: "USER" },
    });
    const mockLobby = { sessionId: "lobby-123", settings: {} } as any;
    vi.mocked(createSession).mockResolvedValue(mockLobby);

    const { result } = renderHook(() => useLobby());

    let created;
    await act(async () => {
      created = await result.current.createLobby({
        numberOfPlayers: 4,
        mode: "CLASSIC",
      } as any);
    });

    expect(createSession).toHaveBeenCalledWith({
      settings: { numberOfPlayers: 4, mode: "CLASSIC" },
    });
    expect(created).toEqual(mockLobby);
    expect(useLobbyStore.getState().currentLobby).toEqual(mockLobby);
  });

  it("should throw error and show toast if creating lobby when unauthenticated", async () => {
    const { result } = renderHook(() => useLobby());

    await expect(
      act(async () => {
        await result.current.createLobby({
          numberOfPlayers: 4,
          mode: "CLASSIC",
        } as any);
      })
    ).rejects.toThrow("Nicht eingeloggt");

    expect(useUIStore.getState().toasts.length).toBe(1);
    expect(useUIStore.getState().toasts[0].title).toBe("Fehler");
    expect(useUIStore.getState().toasts[0].message).toBe("Nicht eingeloggt");
  });

  it("should join lobby and refresh details", async () => {
    vi.mocked(joinSession).mockResolvedValue({} as any);
    const fetchSpy = vi.fn().mockResolvedValue(undefined);
    useLobbyStore.setState({ fetchLobby: fetchSpy });

    const { result } = renderHook(() => useLobby());

    await act(async () => {
      await result.current.joinLobby("s123", { username: "Guest" } as any);
    });

    expect(joinSession).toHaveBeenCalledWith("s123", { username: "Guest" } as any);
    expect(fetchSpy).toHaveBeenCalledWith("s123");
  });

  it("should leave lobby and reset store", async () => {
    vi.mocked(leaveSession).mockResolvedValue({ message: "Success" } as any);
    useLobbyStore.setState({ currentLobby: { sessionId: "s123" } as any });

    const { result } = renderHook(() => useLobby());

    await act(async () => {
      await result.current.leaveLobby("s123");
    });

    expect(leaveSession).toHaveBeenCalledWith("s123");
    expect(useLobbyStore.getState().currentLobby).toBeNull();
  });

  it("should start game session", async () => {
    vi.mocked(startSession).mockResolvedValue(undefined);

    const { result } = renderHook(() => useLobby());

    await act(async () => {
      await result.current.startGame("s123");
    });

    expect(startSession).toHaveBeenCalledWith("s123");
  });

  it("should generate invite details", async () => {
    const mockInvite = {
      inviteToken: ***ENTFERNT***
      inviteUrl: "http://url",
      expiresAt: "2026",
    };
    vi.mocked(generateInviteApi).mockResolvedValue(mockInvite);

    const { result } = renderHook(() => useLobby());
    let invite;
    await act(async () => {
      invite = await result.current.generateInvite("s123");
    });

    expect(generateInviteApi).toHaveBeenCalledWith("s123");
    expect(invite).toEqual(mockInvite);
  });
});
