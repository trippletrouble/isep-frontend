import type { ErrorResponse } from "./types";

const rawBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  "http://localhost:8080/api/v1";
export const API_BASE_URL: string = rawBaseUrl.endsWith("/")
  ? rawBaseUrl.slice(0, -1)
  : rawBaseUrl;

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(
    message: string,
    status: number,
    code: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const formattedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  const url = `${API_BASE_URL}${formattedEndpoint}`;

  const headers = new Headers(options?.headers);
  if (options?.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.ok) {
    if (response.status === 204) {
      return undefined as unknown as T;
    }
    const text = await response.text();
    if (!text) {
      return undefined as unknown as T;
    }
    const json = JSON.parse(text);
    if (
      json &&
      typeof json === "object" &&
      json.status === "success" &&
      "data" in json
    ) {
      return json.data as T;
    }
    return json as T;
  } else {
    let errorJson: ErrorResponse | null = null;
    try {
      const text = await response.text();
      if (text) {
        errorJson = JSON.parse(text) as ErrorResponse;
      }
    } catch {
      // JSON parsing failed
    }

    if (errorJson && errorJson.status === "error") {
      throw new ApiError(
        errorJson.message,
        response.status,
        errorJson.code,
        errorJson.details,
      );
    }

    throw new ApiError("HTTP Error", response.status, "HTTP_ERROR");
  }
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: "DELETE" }),
};
