import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSSE } from "./useSSE";

describe("useSSE hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should not connect when sessionId is null", () => {
    const { result } = renderHook(() => useSSE(null, {}));
    expect(result.current.isConnected).toBe(false);
    expect(result.current.reconnectCount).toBe(0);
    const EventSourceClass = globalThis.EventSource as any;
    expect(EventSourceClass.instances.length).toBe(0);
  });

  it("should connect and handle onopen event", () => {
    const onConnectedSpy = vi.fn();
    const { result } = renderHook(() =>
      useSSE("session-123", { onConnected: onConnectedSpy })
    );

    const EventSourceClass = globalThis.EventSource as any;
    expect(EventSourceClass.instances.length).toBe(1);
    const esInstance = EventSourceClass.instances[0];

    expect(result.current.isConnected).toBe(false);

    act(() => {
      esInstance.onopen();
    });

    expect(result.current.isConnected).toBe(true);
    expect(onConnectedSpy).toHaveBeenCalledTimes(1);
  });

  it("should handle error and schedule reconnection with exponential backoff", () => {
    const onErrorSpy = vi.fn();
    const { result } = renderHook(() =>
      useSSE("session-123", { onError: onErrorSpy })
    );

    const EventSourceClass = globalThis.EventSource as any;
    const esInstance = EventSourceClass.instances[0];

    act(() => {
      esInstance.onopen();
    });
    expect(result.current.isConnected).toBe(true);

    act(() => {
      esInstance.onerror(new Event("error"));
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.reconnectCount).toBe(1);
    expect(esInstance.close).toHaveBeenCalledTimes(1);

    expect(EventSourceClass.instances.length).toBe(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(EventSourceClass.instances.length).toBe(2);
  });

  it("should stop reconnecting after 10 failures and trigger options.onError", () => {
    const onErrorSpy = vi.fn();
    const { result } = renderHook(() =>
      useSSE("session-123", { onError: onErrorSpy })
    );

    const EventSourceClass = globalThis.EventSource as any;

    // Trigger 11 errors (initial connection error + 10 reconnect errors)
    for (let i = 0; i < 11; i++) {
      const currentEs =
        EventSourceClass.instances[EventSourceClass.instances.length - 1];
      act(() => {
        currentEs.onerror(new Event("error"));
      });
      if (i < 10) {
        act(() => {
          vi.advanceTimersByTime(30000);
        });
      }
    }

    expect(onErrorSpy).toHaveBeenCalledTimes(1);
    expect(result.current.isConnected).toBe(false);
  });

  it("should parse onmessage events and route them to correct callbacks", () => {
    const onGameStateSpy = vi.fn();
    const onGameStartedSpy = vi.fn();
    const onMoveExecutedSpy = vi.fn();
    const onTurnChangedSpy = vi.fn();
    const onGameEndedSpy = vi.fn();
    const onQuizStartedSpy = vi.fn();
    const onQuizResolvedSpy = vi.fn();
    const onPlagueFlyAcquiredSpy = vi.fn();

    renderHook(() =>
      useSSE("session-123", {
        onGameState: onGameStateSpy,
        onGameStarted: onGameStartedSpy,
        onMoveExecuted: onMoveExecutedSpy,
        onTurnChanged: onTurnChangedSpy,
        onGameEnded: onGameEndedSpy,
        onQuizStarted: onQuizStartedSpy,
        onQuizResolved: onQuizResolvedSpy,
        onPlagueFlyAcquired: onPlagueFlyAcquiredSpy,
      })
    );

    const EventSourceClass = globalThis.EventSource as any;
    const es = EventSourceClass.instances[0];

    const testEvent = (type: string, data: any) => {
      act(() => {
        es.onmessage({
          data: JSON.stringify({ type, data }),
        } as MessageEvent);
      });
    };

    testEvent("game_state", { id: 1 });
    expect(onGameStateSpy).toHaveBeenCalledWith({ id: 1 });

    testEvent("game_started", { id: 2 });
    expect(onGameStartedSpy).toHaveBeenCalledWith({ id: 2 });

    testEvent("move_executed", { id: 3 });
    expect(onMoveExecutedSpy).toHaveBeenCalledWith({ id: 3 });

    testEvent("turn_changed", { currentTurn: 4 });
    expect(onTurnChangedSpy).toHaveBeenCalledWith({ currentTurn: 4 });

    testEvent("game_ended", { winner: "p1" });
    expect(onGameEndedSpy).toHaveBeenCalledWith({ winner: "p1" });

    testEvent("quiz_started", { quizId: "q1" });
    expect(onQuizStartedSpy).toHaveBeenCalledWith({ quizId: "q1" });

    testEvent("quiz_resolved", { id: 5 });
    expect(onQuizResolvedSpy).toHaveBeenCalledWith({ id: 5 });

    testEvent("plague_fly_acquired", { player: "p1" });
    expect(onPlagueFlyAcquiredSpy).toHaveBeenCalledWith({ player: "p1" });
  });

  it("should disconnect and close event source manually", () => {
    const { result } = renderHook(() => useSSE("session-123", {}));
    const EventSourceClass = globalThis.EventSource as any;
    const es = EventSourceClass.instances[0];

    act(() => {
      es.onopen();
    });
    expect(result.current.isConnected).toBe(true);

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.isConnected).toBe(false);
    expect(es.close).toHaveBeenCalledTimes(1);
  });
});
