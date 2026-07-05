import { describe, it, expect, beforeEach, vi } from "vitest";
import { useLobbyStore } from "./lobby.store";
import { listSessions } from "../api/sessions.api";
import { getLobby, getSessionPlayers } from "../api/lobby.api";

// Mock the APIs
vi.mock("../api/sessions.api", () => ({
  listSessions: vi.fn(),
}));
vi.mock("../api/lobby.api", () => ({
  getLobby: vi.fn(),
  getSessionPlayers: vi.fn(),
}));

describe("useLobbyStore", () => {
  beforeEach(() => {
    useLobbyStore.getState().reset();
    vi.clearAllMocks();
  });

  it("should have initial state", () => {
    const state = useLobbyStore.getState();
    expect(state.sessions).toEqual([]);
    expect(state.currentLobby).toBeNull();
    expect(state.players).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should fetch sessions successfully", async () => {
    const mockSessionsResponse = {
      sessions: [
        {
          sessionId: "s1",
          status: "LOBBY" as const,
          playerCount: 2,
          maxPlayers: 4,
          mode: "CLASSIC",
          boardTheme: "CLASSIC",
          hostUsername: "Hosty",
          isPrivate: false,
          createdAt: "now",
        },
      ],
      totalCount: 1,
      page: 1,
      size: 10,
    };
    vi.mocked(listSessions).mockResolvedValue(mockSessionsResponse);

    await useLobbyStore.getState().fetchSessions();

    const state = useLobbyStore.getState();
    expect(state.sessions).toEqual(mockSessionsResponse.sessions);
    expect(state.totalCount).toBe(1);
    expect(state.page).toBe(1);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should set error when fetchSessions fails with Error", async () => {
    vi.mocked(listSessions).mockRejectedValue(new Error("Fetch failed"));

    await useLobbyStore.getState().fetchSessions();

    const state = useLobbyStore.getState();
    expect(state.sessions).toEqual([]);
    expect(state.error).toBe("Fetch failed");
    expect(state.isLoading).toBe(false);
  });

  it("should set error when fetchSessions fails with non-Error", async () => {
    vi.mocked(listSessions).mockRejectedValue("string-error");

    await useLobbyStore.getState().fetchSessions();

    const state = useLobbyStore.getState();
    expect(state.error).toBe("Unknown error");
  });

  it("should fetch lobby details successfully", async () => {
    const mockLobby = {
      sessionId: "s1",
      hostId: "h1",
      settings: {
        numberOfPlayers: 4,
        mode: "CLASSIC" as const,
        boardTheme: "CLASSIC",
        isPrivate: false,
        turnTimeLimitSeconds: null,
        additionalRules: [],
      },
      players: [
        {
          id: "p1",
          username: "Player 1",
          color: "RED" as const,
          type: "HUMAN" as const,
          isCurrentTurn: false,
          hasFinished: false,
          figuresInGoal: 0,
        },
      ],
      status: "LOBBY" as const,
      inviteToken: ***ENTFERNT***
      createdAt: "now",
    };
    vi.mocked(getLobby).mockResolvedValue(mockLobby);

    await useLobbyStore.getState().fetchLobby("s1");

    const state = useLobbyStore.getState();
    expect(state.currentLobby).toEqual(mockLobby);
    expect(state.players).toEqual(mockLobby.players);
    expect(state.isLoading).toBe(false);
  });

  it("should throw error and set error state when fetchLobby fails with Error", async () => {
    vi.mocked(getLobby).mockRejectedValue(new Error("Lobby error"));

    await expect(useLobbyStore.getState().fetchLobby("s1")).rejects.toThrow(
      "Lobby error"
    );

    const state = useLobbyStore.getState();
    expect(state.currentLobby).toBeNull();
    expect(state.error).toBe("Lobby error");
  });

  it("should throw error and set error state when fetchLobby fails with non-Error", async () => {
    vi.mocked(getLobby).mockRejectedValue(null);

    await expect(useLobbyStore.getState().fetchLobby("s1")).rejects.toBeNull();

    const state = useLobbyStore.getState();
    expect(state.error).toBe("Unknown error");
  });

  it("should fetch players successfully", async () => {
    const mockPlayers = [
      {
        id: "p1",
        username: "Player 1",
        color: "RED" as const,
        type: "HUMAN" as const,
        isCurrentTurn: false,
        hasFinished: false,
        figuresInGoal: 0,
      },
    ];
    vi.mocked(getSessionPlayers).mockResolvedValue(mockPlayers);

    await useLobbyStore.getState().fetchPlayers("s1");

    const state = useLobbyStore.getState();
    expect(state.players).toEqual(mockPlayers);
    expect(state.isLoading).toBe(false);
  });

  it("should set error when fetchPlayers fails with Error", async () => {
    vi.mocked(getSessionPlayers).mockRejectedValue(new Error("Players error"));

    await useLobbyStore.getState().fetchPlayers("s1");

    const state = useLobbyStore.getState();
    expect(state.players).toEqual([]);
    expect(state.error).toBe("Players error");
  });

  it("should set error when fetchPlayers fails with non-Error", async () => {
    vi.mocked(getSessionPlayers).mockRejectedValue(undefined);

    await useLobbyStore.getState().fetchPlayers("s1");

    const state = useLobbyStore.getState();
    expect(state.error).toBe("Unknown error");
  });

  it("should manually update players and current lobby", () => {
    const mockPlayers = [
      {
        id: "p2",
        username: "P2",
        color: "BLUE" as const,
        type: "HUMAN" as const,
        isCurrentTurn: true,
        hasFinished: false,
        figuresInGoal: 0,
      },
    ];
    useLobbyStore.getState().updatePlayers(mockPlayers);
    expect(useLobbyStore.getState().players).toEqual(mockPlayers);

    const mockLobby = { sessionId: "s2" } as any;
    useLobbyStore.getState().setCurrentLobby(mockLobby);
    expect(useLobbyStore.getState().currentLobby).toEqual(mockLobby);
  });

  it("should clear error state", () => {
    useLobbyStore.setState({ error: "Lobby err" });
    useLobbyStore.getState().clearError();
    expect(useLobbyStore.getState().error).toBeNull();
  });
});
