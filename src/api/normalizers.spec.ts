import { describe, it, expect } from "vitest";
import {
  normalizeLobby,
  normalizeGameState,
  normalizeSessionList,
  normalizeResults,
  normalizeHistoryEvent,
} from "./normalizers";

describe("API Normalizers", () => {
  describe("normalizeLobby", () => {
    it("should normalize lobby with default values when raw fields are missing", () => {
      const raw = {
        id: "session-1",
        hostId: "host-1",
        status: "LOBBY",
        createdAt: "2026-07-05T12:00:00Z",
      };
      const result = normalizeLobby(raw);
      expect(result).toEqual({
        sessionId: "session-1",
        hostId: "host-1",
        settings: {
          numberOfPlayers: undefined,
          mode: "CLASSIC",
          boardTheme: "CLASSIC",
          isPrivate: false,
          turnTimeLimitSeconds: null,
          additionalRules: [],
        },
        players: [],
        status: "LOBBY",
        inviteToken: ***ENTFERNT***
        createdAt: "2026-07-05T12:00:00Z",
      });
    });

    it("should map fields correctly when raw fields are provided", () => {
      const raw = {
        sessionId: "session-123",
        hostId: "host-123",
        settings: {
          numberOfPlayers: 4,
          mode: "EXTENDED",
          boardTheme: "DARK",
          isPrivate: true,
          turnTimeLimitSeconds: 30,
          additionalRules: ["DOUBLE_DICE"],
        },
        players: [
          {
            userId: "user-1",
            username: "Player1",
            color: "RED",
            type: "HUMAN",
            isCurrentTurn: true,
            hasFinished: false,
            figuresInGoal: 1,
          },
        ],
        status: "IN_PROGRESS",
        inviteToken: ***ENTFERNT***
        createdAt: "2026-07-05T12:00:00Z",
      };
      const result = normalizeLobby(raw);
      expect(result.sessionId).toBe("session-123");
      expect(result.inviteToken).toBe("token-abc");
      expect(result.players[0].id).toBe("user-1");
      expect(result.settings.mode).toBe("EXTENDED");
    });

    it("should cover fallback branches for player normalization", () => {
      const raw = {
        id: "session-1",
        hostId: "host-1",
        players: [
          {
            id: "user-id-only",
            username: "Bob",
            color: "BLUE",
          },
        ],
      };
      const result = normalizeLobby(raw);
      expect(result.players[0]).toEqual({
        id: "user-id-only",
        username: "Bob",
        color: "BLUE",
        type: "HUMAN",
        isCurrentTurn: false,
        hasFinished: false,
        figuresInGoal: 0,
      });
    });
  });

  describe("normalizeGameState", () => {
    it("should normalize raw game state object", () => {
      const raw = {
        id: "game-1",
        status: "IN_PROGRESS",
        mode: "CLASSIC",
        boardTheme: "CLASSIC",
        players: [],
        figures: [],
        currentPlayerId: "user-1",
        turnNumber: 5,
        lastDiceValue: 6,
        diceRolledThisTurn: true,
        consecutiveSixes: 1,
        additionalRules: ["RULE_A"],
        winnerId: null,
        createdAt: "2026-07-05T12:00:00Z",
      };
      const result = normalizeGameState(raw);
      expect(result).toEqual({
        sessionId: "game-1",
        status: "IN_PROGRESS",
        mode: "CLASSIC",
        boardTheme: "CLASSIC",
        players: [],
        figures: [],
        currentPlayerId: "user-1",
        turnNumber: 5,
        lastDiceValue: 6,
        diceRolledThisTurn: true,
        consecutiveSixes: 1,
        activeRules: ["RULE_A"],
        winnerId: null,
        createdAt: "2026-07-05T12:00:00Z",
        lastUpdatedAt: "2026-07-05T12:00:00Z",
      });
    });

    it("should cover all fallback branches of normalizeGameState", () => {
      const raw = {
        id: "game-1",
        status: "LOBBY",
        createdAt: "2026-07-05T12:00:00Z",
        updatedAt: "2026-07-05T12:10:00Z",
      };
      const result = normalizeGameState(raw);
      expect(result.turnNumber).toBe(0);
      expect(result.lastDiceValue).toBeNull();
      expect(result.diceRolledThisTurn).toBe(false);
      expect(result.consecutiveSixes).toBe(0);
      expect(result.activeRules).toEqual([]);
      expect(result.winnerId).toBeNull();
      expect(result.lastUpdatedAt).toBe("2026-07-05T12:10:00Z");
    });
  });

  describe("normalizeSessionList", () => {
    it("should handle empty raw items", () => {
      const raw = {};
      const result = normalizeSessionList(raw);
      expect(result).toEqual({
        sessions: [],
        totalCount: 0,
        page: 1,
        size: 0,
      });
    });

    it("should map session summary items correctly", () => {
      const raw = {
        items: [
          {
            id: "session-1",
            status: "LOBBY",
            _count: { participants: 2 },
            numberOfPlayers: 4,
            mode: "CLASSIC",
            boardTheme: "CLASSIC",
            hostUsername: "Hosty",
            isPrivate: false,
            createdAt: "2026-07-05T12:00:00Z",
          },
        ],
        totalCount: 1,
        page: 1,
        size: 10,
      };
      const result = normalizeSessionList(raw);
      expect(result.sessions[0].sessionId).toBe("session-1");
      expect(result.sessions[0].playerCount).toBe(2);
      expect(result.sessions[0].maxPlayers).toBe(4);
    });

    it("should cover all fallback branches of normalizeSessionList", () => {
      const raw = {
        sessions: [
          {
            id: "session-abc",
            boardTheme: "DARK",
            hostUsername: "Bob",
          },
        ],
      };
      const result = normalizeSessionList(raw);
      expect(result.sessions[0].sessionId).toBe("session-abc");
      expect(result.sessions[0].playerCount).toBe(0);
      expect(result.sessions[0].maxPlayers).toBe(4);
      expect(result.sessions[0].mode).toBe("CLASSIC");
      expect(result.sessions[0].isPrivate).toBe(false);
    });
  });

  describe("normalizeResults", () => {
    it("should normalize results array or single object", () => {
      const raw = {
        placement: 1,
        userId: "user-1",
        username: "Winner",
        color: "BLUE",
        figuresInGoal: 4,
        figuresCaptured: 2,
      };
      const result = normalizeResults(raw);
      expect(result.placements[0]).toEqual({
        rank: 1,
        playerId: "user-1",
        username: "Winner",
        color: "BLUE",
        figuresInGoal: 4,
        figuresCaptured: 2,
      });
    });

    it("should handle ranks and alternate names in results normalization", () => {
      const rawArray = [
        {
          rank: 2,
          playerId: "user-2",
          userId: "user-2",
          color: "RED",
          figuresInGoal: 2,
          figuresCaptured: 1,
        },
      ];
      const result = normalizeResults(rawArray);
      expect(result.placements[0]).toEqual({
        rank: 2,
        playerId: "user-2",
        username: "user-2",
        color: "RED",
        figuresInGoal: 2,
        figuresCaptured: 1,
      });
    });
  });

  describe("normalizeHistoryEvent", () => {
    it("should normalize history event fields", () => {
      const raw = {
        id: "evt-1",
        createdAt: "2026-07-05T12:00:00Z",
        participantId: "player-1",
        actionType: "ROLL_DICE",
        diceValue: 5,
      };
      const result = normalizeHistoryEvent(raw);
      expect(result).toEqual({
        eventId: "evt-1",
        timestamp: "2026-07-05T12:00:00Z",
        playerId: "player-1",
        actionType: "ROLL_DICE",
        diceValue: 5,
        figureId: null,
        fromPosition: null,
        toPosition: null,
        outcome: null,
      });
    });

    it("should cover fallback branches of history event", () => {
      const raw = {
        eventId: "evt-xyz",
        timestamp: "now",
        playerId: "p1",
        actionType: "MOVE",
      };
      const result = normalizeHistoryEvent(raw);
      expect(result.eventId).toBe("evt-xyz");
      expect(result.timestamp).toBe("now");
      expect(result.playerId).toBe("p1");
    });
  });
});
