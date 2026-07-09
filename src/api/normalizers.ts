/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  Lobby,
  GameState,
  GameResults,
  GameHistoryEvent,
  SessionSummary,
  PaginatedSessionList,
} from "./types";

export function normalizeLobby(raw: any): Lobby {
  const settings = raw.settings ?? {
    numberOfPlayers: raw.numberOfPlayers,
    mode: raw.mode ?? "CLASSIC",
    boardTheme: raw.boardTheme ?? "CLASSIC",
    isPrivate: raw.isPrivate ?? false,
    turnTimeLimitSeconds: raw.turnTimeLimitSeconds ?? null,
    additionalRules: raw.additionalRules ?? [],
  };

  const players = (raw.players ?? []).map((p: any) => ({
    id: p.userId ?? p.id,
    username: p.username,
    color: p.color,
    type: p.type ?? "HUMAN",
    isCurrentTurn: p.isCurrentTurn ?? false,
    hasFinished: p.hasFinished ?? false,
    figuresInGoal: p.figuresInGoal ?? 0,
  }));

  return {
    sessionId: raw.sessionId ?? raw.id,
    hostId: raw.hostId,
    settings,
    players,
    status: raw.status,
    inviteToken: ***ENTFERNT*** ?? null,
    createdAt: raw.createdAt,
  };
}

export function normalizeGameState(raw: any): GameState {
  return {
    sessionId: raw.sessionId ?? raw.id,
    status: raw.status,
    mode: raw.mode,
    boardTheme: raw.boardTheme,
    players: raw.players ?? [],
    figures: raw.figures ?? [],
    currentPlayerId: raw.currentPlayerId,
    turnNumber: raw.turnNumber ?? 0,
    lastDiceValue: raw.lastDiceValue ?? null,
    diceRolledThisTurn: raw.diceRolledThisTurn ?? false,
    consecutiveSixes: raw.consecutiveSixes ?? 0,
    activeRules: raw.activeRules ?? raw.additionalRules ?? [],
    winnerId: raw.winnerId ?? null,
    activeQuiz: raw.activeQuiz ?? null,
    createdAt: raw.createdAt,
    lastUpdatedAt: raw.lastUpdatedAt ?? raw.updatedAt ?? raw.createdAt,
  };
}

export function normalizeSessionList(raw: any): PaginatedSessionList {
  const items: any[] = raw.items ?? raw.sessions ?? [];
  return {
    sessions: items.map(
      (s: any): SessionSummary => ({
        sessionId: s.sessionId ?? s.id,
        status: s.status,
        playerCount: s.playerCount ?? s._count?.participants ?? 0,
        maxPlayers: s.maxPlayers ?? s.numberOfPlayers ?? 4,
        mode: s.mode ?? "CLASSIC",
        boardTheme: s.boardTheme,
        hostUsername: s.hostUsername,
        isPrivate: s.isPrivate ?? false,
        createdAt: s.createdAt,
      }),
    ),
    totalCount: raw.totalCount ?? raw.total ?? items.length,
    page: raw.page ?? 1,
    size: raw.size ?? items.length,
  };
}

export function normalizeResults(raw: any): GameResults {
  const arr: any[] = Array.isArray(raw) ? raw : [raw];
  return {
    sessionId: "",
    placements: arr.map((p: any) => ({
      rank: p.placement ?? p.rank,
      playerId: p.userId ?? p.playerId,
      username: p.username ?? p.userId ?? "–",
      color: p.color,
      figuresInGoal: p.figuresInGoal,
      figuresCaptured: p.figuresCaptured,
    })),
    finishedAt: new Date().toISOString(),
  };
}

export function normalizeHistoryEvent(raw: any): GameHistoryEvent {
  return {
    eventId: raw.id ?? raw.eventId,
    timestamp: raw.createdAt ?? raw.timestamp,
    playerId: raw.participantId ?? raw.playerId,
    color: raw.color,
    actionType: raw.actionType,
    diceValue: raw.diceValue ?? null,
    figureId: raw.figureId ?? null,
    fromPosition: raw.fromPosition ?? null,
    toPosition: raw.toPosition ?? null,
    outcome: raw.outcome ?? null,
  };
}
