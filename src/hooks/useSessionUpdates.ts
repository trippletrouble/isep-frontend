import { useEffect, useRef, useState, useCallback } from 'react'
import { API_BASE_URL } from '../api/client'

interface UseSessionUpdatesOptions {
  onUpdate?: (data: unknown) => void
  onError?: (error: Event) => void
  onConnected?: () => void
}

export function useSessionUpdates(
  sessionId: string | null,
  options: UseSessionUpdatesOptions
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
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
    }

    if (!sessionId) return

    const url = `${API_BASE_URL}/sessions/${sessionId}/updates`
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

    es.onmessage = (e: MessageEvent) => {
      try {
        optionsRef.current.onUpdate?.(JSON.parse(e.data))
      } catch {
        optionsRef.current.onUpdate?.(e.data)
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
