import "@testing-library/jest-dom";
import { vi, afterEach } from "vitest";

// Robust localStorage mock for jsdom environment
const localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value.toString();
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key];
  }),
  clear: vi.fn(() => {
    for (const key in localStorageStore) {
      delete localStorageStore[key];
    }
  }),
};
Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Fallback for crypto.randomUUID
if (!globalThis.crypto) {
  globalThis.crypto = {} as Crypto;
}
if (!globalThis.crypto.randomUUID) {
  globalThis.crypto.randomUUID = (() => {
    return "test-uuid-" + Math.random().toString(36).substring(2, 9);
  }) as any;
}

// Mock EventSource for Server-Sent Events (SSE)
class MockEventSource {
  url: string;
  withCredentials?: boolean;
  onopen: (() => void) | null = null;
  onerror: ((err: any) => void) | null = null;
  onmessage: ((e: any) => void) | null = null;

  constructor(url: string, init?: any) {
    this.url = url;
    this.withCredentials = init?.withCredentials;
    MockEventSource.instances.push(this);
  }

  static instances: MockEventSource[] = [];

  close = vi.fn();
}

globalThis.EventSource = MockEventSource as any;

// Reset all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
  MockEventSource.instances = [];
});
