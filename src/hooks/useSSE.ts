import { useEffect, useRef, useState, useCallback } from 'react'
import { API_BASE_URL } from '../api/client'
import type { GameState, MoveResult, GameResults } from '../api/types'

interface UseSSEOptions {
  onGameStarted?: (data: GameState) => void
  onMoveExecuted?: (data: MoveResult) => void
  onTurnChanged?: (data: { currentPlayerId: string; turnNumber: number }) => void
  onGameEnded?: (data: GameResults) => void
  onError?: (error: Event) => void
  onConnected?: () => void
}

export function useSSE(
  sessionId: string | null,
  options: UseSSEOptions
): { isConnected: boolean; reconnectCount: number; disconnect: () => void } {
  const [isConnected, setIsConnected] = useState(false)
  const [reconnectCount, setReconnectCount] = useState(0)

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectCountRef = useRef(0)
  const optionsRef = useRef(options)

  // Update optionsRef on every render to ensure callbacks are always fresh
  optionsRef.current = options

  const connect = useCallback(() => {
    // Schließe bestehende Verbindung falls vorhanden
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
    }

    if (!sessionId) return

    const url = `${API_BASE_URL}/sessions/${sessionId}/live`
    const es = new EventSource(url, { withCredentials: true })
    eventSourceRef.current = es

    es.onopen = () => {
      setIsConnected(true)
      reconnectCountRef.current = 0
      setReconnectCount(0)
      optionsRef.current.onConnected?.()
    }

    es.onerror = (event: Event) => {
      setIsConnected(false)
      es.close()
      if (reconnectCountRef.current >= 10) {
        optionsRef.current.onError?.(event)
        return
      }
      const delay = Math.min(1000 * Math.pow(2, reconnectCountRef.current), 30000)
      reconnectCountRef.current++
      setReconnectCount(reconnectCountRef.current)
      reconnectTimerRef.current = setTimeout(connect, delay)
    }

    es.addEventListener('game_started', (e: MessageEvent) => {
      try {
        optionsRef.current.onGameStarted?.(JSON.parse(e.data))
      } catch {}
    })
    es.addEventListener('move_executed', (e: MessageEvent) => {
      try {
        optionsRef.current.onMoveExecuted?.(JSON.parse(e.data))
      } catch {}
    })
    es.addEventListener('turn_changed', (e: MessageEvent) => {
      try {
        optionsRef.current.onTurnChanged?.(JSON.parse(e.data))
      } catch {}
    })
    es.addEventListener('game_ended', (e: MessageEvent) => {
      try {
        optionsRef.current.onGameEnded?.(JSON.parse(e.data))
      } catch {}
    })
  }, [sessionId])

  useEffect(() => {
    if (sessionId === null) return

    connect()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
      }
      reconnectCountRef.current = 0
    }
  }, [sessionId, connect])

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
    }
    setIsConnected(false)
  }, [])

  return { isConnected, reconnectCount, disconnect }
}
