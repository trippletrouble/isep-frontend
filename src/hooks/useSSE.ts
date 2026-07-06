import { useEffect, useRef, useState, useCallback } from "react";
import { API_BASE_URL } from "../api/client";
import type {
  GameState,
  MoveResult,
  GameResults,
  ActiveQuizType,
} from "../api/types";

interface UseSSEOptions {
  onGameState?: (data: GameState) => void;
  onGameStarted?: (data: GameState) => void;
  onMoveExecuted?: (data: MoveResult) => void;
  onTurnChanged?: (data: {
    currentPlayerId: string;
    turnNumber: number;
  }) => void;
  onGameEnded?: (data: GameResults) => void;
  onQuizStarted?: (data: ActiveQuizType) => void;
  onQuizResolved?: (data: GameState) => void;
  onPlagueFlyAcquired?: (data: { figureId: number; playerId: string }) => void;
  onPlagueFlyTransferred?: (data: {
    fromFigureId: number;
    toFigureId: number;
    fromPlayerId: string;
    toPlayerId: string;
    activeFlyCount: number;
  }) => void;
  onError?: (error: Event) => void;
  onConnected?: () => void;
}

export function useSSE(
  sessionId: string | null,
  options: UseSSEOptions,
): { isConnected: boolean; reconnectCount: number; disconnect: () => void } {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectCountRef = useRef(0);
  const optionsRef = useRef(options);
  const connectRef = useRef<() => void>(() => {});

  useEffect(() => {
    optionsRef.current = options;
  });

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }

    if (!sessionId) return;

    const url = `${API_BASE_URL}/sessions/${sessionId}/live`;
    const es = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      reconnectCountRef.current = 0;
      setReconnectCount(0);
      optionsRef.current.onConnected?.();
    };

    es.onerror = (event: Event) => {
      setIsConnected(false);
      es.close();
      if (reconnectCountRef.current >= 10) {
        optionsRef.current.onError?.(event);
        return;
      }
      const delay = Math.min(
        1000 * Math.pow(2, reconnectCountRef.current),
        30000,
      );
      reconnectCountRef.current++;
      setReconnectCount(reconnectCountRef.current);
      reconnectTimerRef.current = setTimeout(() => {
        connectRef.current();
      }, delay);
    };

    // Central event routing system that securely extracts data payloads
    const routeEvent = (type: string, rawData: string) => {
      console.log(`📡 RAW SSE EVENT [${type}]:`, rawData);
      try {
        const data = JSON.parse(rawData);
        switch (type) {
          case "game_state":
            optionsRef.current.onGameState?.(data);
            break;
          case "game_started":
            optionsRef.current.onGameStarted?.(data);
            break;
          case "move_executed":
            optionsRef.current.onMoveExecuted?.(data);
            break;
          case "turn_changed":
            optionsRef.current.onTurnChanged?.(data);
            break;
          case "game_ended":
            optionsRef.current.onGameEnded?.(data);
            break;
          case "quiz_started":
            optionsRef.current.onQuizStarted?.(data);
            break;
          case "quiz_resolved":
            optionsRef.current.onQuizResolved?.(data);
            break;
          case "plague_fly_acquired":
            optionsRef.current.onPlagueFlyAcquired?.(data);
            break;
          case "plague_fly_transferred":
            optionsRef.current.onPlagueFlyTransferred?.(data);
            break;
          case "heartbeat":
            break;
        }
      } catch (err) {
        console.error(`Error parsing SSE data for event type: ${type}`, err);
      }
    };

    const nativeSseTypes = [
      "game_state",
      "game_started",
      "move_executed",
      "turn_changed",
      "game_ended",
      "quiz_started",
      "quiz_resolved",
      "plague_fly_acquired",
      "plague_fly_transferred",
    ];

    nativeSseTypes.forEach((type) => {
      es.addEventListener(type, (e: Event) => {
        const messageEvent = e as MessageEvent;
        routeEvent(type, messageEvent.data);
      });
    });

    es.onmessage = (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        if (parsed && typeof parsed === "object" && "type" in parsed) {
          routeEvent(parsed.type, JSON.stringify(parsed.data));
        }
      } catch {
        // Drop silent
      }
    };
  }, [sessionId]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    if (sessionId === null) return;

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      reconnectCountRef.current = 0;
    };
  }, [sessionId, connect]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    setIsConnected(false);
  }, []);

  return { isConnected, reconnectCount, disconnect };
}
