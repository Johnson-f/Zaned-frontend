/**
 * React hook for WebSocket movers connection
 * Provides real-time gainers, losers, and actives data
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { MoversData, WebSocketState } from "../lib/types/websocket";
import {
  getMoversWebSocketUrl,
  createWebSocketConnection,
  parseMoversData,
  closeWebSocket,
} from "../lib/service/websocket.service";

export interface UseWebSocketMoversOptions {
  enabled?: boolean;
  onError?: (error: Error) => void;
  reconnectInterval?: number; // milliseconds
  maxReconnectAttempts?: number;
}

export interface UseWebSocketMoversReturn {
  movers: MoversData | null;
  state: WebSocketState;
  error: Error | null;
  reconnect: () => void;
}

const DEFAULT_RECONNECT_INTERVAL = 5000; // 5 seconds
const DEFAULT_MAX_RECONNECT_ATTEMPTS = 10;

/**
 * Hook to manage WebSocket connection for real-time market movers
 */
export function useWebSocketMovers(
  options: UseWebSocketMoversOptions = {}
): UseWebSocketMoversReturn {
  const {
    enabled = true,
    onError,
    reconnectInterval = DEFAULT_RECONNECT_INTERVAL,
    maxReconnectAttempts = DEFAULT_MAX_RECONNECT_ATTEMPTS,
  } = options;

  const [movers, setMovers] = useState<MoversData | null>(null);
  const [state, setState] = useState<WebSocketState>("disconnected");
  const [error, setError] = useState<Error | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualCloseRef = useRef(false);

  const connect = useCallback(() => {
    if (!enabled) {
      return;
    }

    // Close existing connection if any
    if (wsRef.current) {
      closeWebSocket(wsRef.current);
      wsRef.current = null;
    }

    // Clear any pending reconnection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setState("connecting");
    setError(null);

    try {
      const url = getMoversWebSocketUrl();
      const ws = createWebSocketConnection(
        url,
        (event) => {
          // Handle incoming messages
          const data = parseMoversData(event.data);
          if (data) {
            setMovers(data);
            setState("connected");
            reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful message
          }
        },
        (event) => {
          // Handle errors
          const error = new Error("WebSocket error occurred");
          setError(error);
          setState("error");
          if (onError) {
            onError(error);
          }
        },
        (event) => {
          // Handle connection open
          setState("connected");
          reconnectAttemptsRef.current = 0;
          // No need to send any data - movers endpoint streams automatically
        },
        (event) => {
          // Handle connection close
          setState("disconnected");

          // Attempt to reconnect if not manually closed
          if (!isManualCloseRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current += 1;
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, reconnectInterval);
          } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            const error = new Error("Max reconnection attempts reached");
            setError(error);
            setState("error");
            if (onError) {
              onError(error);
            }
          }
        }
      );

      wsRef.current = ws;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create WebSocket connection");
      setError(error);
      setState("error");
      if (onError) {
        onError(error);
      }
    }
  }, [enabled, onError, reconnectInterval, maxReconnectAttempts]);

  const reconnect = useCallback(() => {
    isManualCloseRef.current = false;
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  // Connect on mount and when dependencies change
  useEffect(() => {
    if (enabled) {
      isManualCloseRef.current = false;
      connect();
    } else {
      // Close connection if disabled
      if (wsRef.current) {
        isManualCloseRef.current = true;
        closeWebSocket(wsRef.current);
        wsRef.current = null;
        setState("disconnected");
      }
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      isManualCloseRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        closeWebSocket(wsRef.current);
        wsRef.current = null;
      }
    };
  }, [enabled, connect]);

  return {
    movers,
    state,
    error,
    reconnect,
  };
}

