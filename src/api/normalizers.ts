/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Lobby, GameState, GameResults, GameHistoryEvent, SessionSummary, PaginatedSessionList } from './types'

// ── Lobby ─────────────────────────────────────────────────────────────────────
// createSession gibt raw Prisma Session zurück (id, flat settings, kein players-Array)
// getLobby gibt LobbyDto zurück (sessionId, settings nested, players als LobbyPlayerDto)
export function normalizeLobby(raw: any): Lobby {
  const settings = raw.settings ?? {
    numberOfPlayers: raw.numberOfPlayers,
    mode: raw.mode ?? 'CLASSIC',
    boardTheme: raw.boardTheme ?? 'CLASSIC',
    isPrivate: raw.isPrivate ?? false,
    turnTimeLimitSeconds: raw.turnTimeLimitSeconds ?? null,
    additionalRules: raw.additionalRules ?? [],
  }

  // LobbyPlayerDto hat id=participantId, userId=userId — für Vergleiche mit user.id
  // wird userId als Player.id gesetzt
  const players = (raw.players ?? []).map((p: any) => ({
    id: p.userId ?? p.id,
    username: p.username,
    color: p.color,
    type: p.type ?? 'HUMAN',
    isCurrentTurn: p.isCurrentTurn ?? false,
    hasFinished: p.hasFinished ?? false,
    figuresInGoal: p.figuresInGoal ?? 0,
  }))

  return {
    sessionId: raw.sessionId ?? raw.id,
    hostId: raw.hostId,
    settings,
    players,
    status: raw.status,
    inviteToken: ***ENTFERNT*** ?? null,
    createdAt: raw.createdAt,
  }
}

// ── GameState ─────────────────────────────────────────────────────────────────
// GameStateType vom Backend passt weitgehend, nur lastUpdatedAt/updatedAt
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
    createdAt: raw.createdAt,
    lastUpdatedAt: raw.lastUpdatedAt ?? raw.updatedAt ?? raw.createdAt,
  }
}

// ── SessionSummary ─────────────────────────────────────────────────────────────
// listSessions gibt ListSessionsResponseDto zurück: { items: Session[], total, page, size }
// items sind raw Prisma Session ohne playerCount/hostUsername
export function normalizeSessionList(raw: any): PaginatedSessionList {
  const items: any[] = raw.items ?? raw.sessions ?? []
  return {
    sessions: items.map((s: any): SessionSummary => ({
      sessionId: s.sessionId ?? s.id,
      status: s.status,
      playerCount: s.playerCount ?? s._count?.participants ?? 0,
      maxPlayers: s.maxPlayers ?? s.numberOfPlayers ?? 4,
      mode: s.mode ?? 'CLASSIC',
      boardTheme: s.boardTheme,
      hostUsername: s.hostUsername,
      isPrivate: s.isPrivate ?? false,
      createdAt: s.createdAt,
    })),
    totalCount: raw.totalCount ?? raw.total ?? items.length,
    page: raw.page ?? 1,
    size: raw.size ?? items.length,
  }
}

// ── GameResults ────────────────────────────────────────────────────────────────
// Backend gibt GameResultDto[]: { placement, userId, color, figuresInGoal, figuresCaptured }
// Kein username, sessionId, totalTurns, durationSeconds, finishedAt im Response
export function normalizeResults(raw: any): GameResults {
  const arr: any[] = Array.isArray(raw) ? raw : [raw]
  return {
    sessionId: '',
    placements: arr.map((p: any) => ({
      rank: p.placement ?? p.rank,
      playerId: p.userId ?? p.playerId,
      username: p.username ?? p.userId ?? '–',
      color: p.color,
      figuresInGoal: p.figuresInGoal,
      figuresCaptured: p.figuresCaptured,
    })),
    finishedAt: new Date().toISOString(),
  }
}

// ── GameHistoryEvent ───────────────────────────────────────────────────────────
// Backend gibt GameHistoryEventDto: id, participantId, createdAt (andere Feldnamen)
export function normalizeHistoryEvent(raw: any): GameHistoryEvent {
  return {
    eventId: raw.id ?? raw.eventId,
    timestamp: raw.createdAt ?? raw.timestamp,
    playerId: raw.participantId ?? raw.playerId,
    actionType: raw.actionType,
    diceValue: raw.diceValue ?? null,
    figureId: raw.figureId ?? null,
    fromPosition: raw.fromPosition ?? null,
    toPosition: raw.toPosition ?? null,
    outcome: raw.outcome ?? null,
  }
}
