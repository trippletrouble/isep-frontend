import { useEffect, useRef, useState, useCallback } from 'react'
import { API_BASE_URL } from '../api/client'
import type { GameState, MoveResult, GameResults } from '../api/types'

interface UseSSEOptions {
  onGameState?: (data: GameState) => void       // initial snapshot on SSE connect
  onGameStarted?: (data: GameState) => void    // game transitioned to IN_PROGRESS
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
  const connectRef = useRef<() => void>(() => {})

  useEffect(() => {
    optionsRef.current = options
  })

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
      reconnectTimerRef.current = setTimeout(() => {
        connectRef.current()
      }, delay)
    }

    // NestJS @Sse() sendet generische message-Events mit { type, data } im Body,
    // keine named events — daher onmessage statt addEventListener(name)
    es.onmessage = (e: MessageEvent) => {
      try {
        const { type, data } = JSON.parse(e.data)
        switch (type) {
          case 'game_state':
            optionsRef.current.onGameState?.(data)
            break
          case 'game_started':
            optionsRef.current.onGameStarted?.(data)
            break
          case 'move_executed':
            optionsRef.current.onMoveExecuted?.(data)
            break
          case 'turn_changed':
            optionsRef.current.onTurnChanged?.(data)
            break
          case 'game_ended':
            optionsRef.current.onGameEnded?.(data)
            break
          case 'heartbeat':
            break
        }
      } catch (err) {
        console.error('SSE parse error', err)
      }
    }
  }, [sessionId])

  useEffect(() => {
    connectRef.current = connect
  }, [connect])

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
