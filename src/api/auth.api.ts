import { api, API_BASE_URL } from "./client";
import type { SessionUser } from "./types";

export async function getSession(): Promise<SessionUser> {
  return api.get<SessionUser>("/auth/session");
}

export async function logout(): Promise<{ message: string }> {
  return api.post<{ message: string }>("/auth/logout");
}

export async function handleOAuthCallback(
  code: string,
  state?: string,
): Promise<void> {
  const queryParts = [`code=${encodeURIComponent(code)}`];
  if (state !== undefined) {
    queryParts.push(`state=${encodeURIComponent(state)}`);
  }
  return api.get<void>(`/auth/oauth/callback?${queryParts.join("&")}`);
}

export function getOAuthUrl(): string {
  return API_BASE_URL + "/auth/oauth";
}
