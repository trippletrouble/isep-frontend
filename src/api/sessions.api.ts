import { api } from "./client";
import {
  normalizeLobby,
  normalizeGameState,
  normalizeSessionList,
} from "./normalizers";
import type {
  GameState,
  Lobby,
  PaginatedSessionList,
  CreateSessionRequest,
} from "./types";

export async function listSessions(params?: {
  page?: number;
  size?: number;
}): Promise<PaginatedSessionList> {
  const queryParts: string[] = [];
  if (params?.page !== undefined) queryParts.push(`page=${params.page}`);
  if (params?.size !== undefined) queryParts.push(`size=${params.size}`);
  const qs = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
  const raw = await api.get<any>(`/sessions${qs}`);
  return normalizeSessionList(raw);
}

export async function createSession(
  body: CreateSessionRequest,
): Promise<Lobby> {
  const raw = await api.post<any>("/sessions", body);
  return normalizeLobby(raw);
}

export async function getSessionState(id: string): Promise<GameState> {
  const raw = await api.get<any>(`/sessions/${id}`);
  return normalizeGameState(raw);
}

export async function deleteSession(id: string): Promise<void> {
  return api.delete<void>(`/sessions/${id}`);
}

export async function startSession(id: string): Promise<void> {
  await api.post<any>(`/sessions/${id}/start`);
}

export async function reconnectSession(id: string): Promise<void> {
  return api.post<void>(`/sessions/${id}/reconnect`);
}

export const getSession = getSessionState;
