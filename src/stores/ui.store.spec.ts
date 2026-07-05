import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useUIStore } from "./ui.store";

describe("useUIStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useUIStore.setState({ toasts: [], isGlobalLoading: false });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should have initial state", () => {
    const state = useUIStore.getState();
    expect(state.toasts).toEqual([]);
    expect(state.isGlobalLoading).toBe(false);
  });

  it("should set global loading state", () => {
    useUIStore.getState().setGlobalLoading(true);
    expect(useUIStore.getState().isGlobalLoading).toBe(true);

    useUIStore.getState().setGlobalLoading(false);
    expect(useUIStore.getState().isGlobalLoading).toBe(false);
  });

  it("should add a toast and automatically remove it after duration", () => {
    useUIStore.getState().addToast({
      type: "success",
      title: "Test Toast",
      message: "Test Message",
      duration: 3000,
    });

    const state = useUIStore.getState();
    expect(state.toasts.length).toBe(1);
    expect(state.toasts[0].title).toBe("Test Toast");
    expect(state.toasts[0].duration).toBe(3000);
    expect(state.toasts[0].id).toBeDefined();

    // Advance time by 3000ms
    vi.advanceTimersByTime(3000);

    expect(useUIStore.getState().toasts.length).toBe(0);
  });

  it("should remove toast by id", () => {
    useUIStore.getState().addToast({
      type: "info",
      title: "Toast to remove",
      duration: 10000,
    });

    let state = useUIStore.getState();
    const id = state.toasts[0].id;

    useUIStore.getState().removeToast(id);

    state = useUIStore.getState();
    expect(state.toasts.length).toBe(0);
  });

  it("should limit toasts to maximum of 5", () => {
    const store = useUIStore.getState();

    // Add 6 toasts
    for (let i = 1; i <= 6; i++) {
      store.addToast({
        type: "info",
        title: `Toast ${i}`,
        duration: 10000,
      });
    }

    const state = useUIStore.getState();
    expect(state.toasts.length).toBe(5);
    // The first toast should have been shifted off, leaving Toast 2 through Toast 6
    expect(state.toasts[0].title).toBe("Toast 2");
    expect(state.toasts[4].title).toBe("Toast 6");
  });

  it("should clear all toasts", () => {
    const store = useUIStore.getState();
    store.addToast({ type: "warning", title: "W1" });
    store.addToast({ type: "error", title: "E1" });

    expect(useUIStore.getState().toasts.length).toBe(2);

    store.clearToasts();

    expect(useUIStore.getState().toasts.length).toBe(0);
  });
});
