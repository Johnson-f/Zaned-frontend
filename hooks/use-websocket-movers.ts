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
  isInitialLoading: boolean; // True only on first load, not on reconnection
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
  const [hasReceivedData, setHasReceivedData] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualCloseRef = useRef(false);
  const onErrorRef = useRef(onError);
  const reconnectIntervalRef = useRef(reconnectInterval);
  const maxReconnectAttemptsRef = useRef(maxReconnectAttempts);
  const enabledRef = useRef(enabled);

  // Update refs when values change
  useEffect(() => {
    onErrorRef.current = onError;
    reconnectIntervalRef.current = reconnectInterval;
    maxReconnectAttemptsRef.current = maxReconnectAttempts;
    enabledRef.current = enabled;
  }, [enabled, onError, reconnectInterval, maxReconnectAttempts]);

  const connect = useCallback(() => {
    if (!enabledRef.current) {
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
            setHasReceivedData(true); // Mark that we've received data at least once
            reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful message
          }
        },
        () => {
          // Handle errors
          const error = new Error("WebSocket error occurred");
          setError(error);
          setState("error");
          if (onErrorRef.current) {
            onErrorRef.current(error);
          }
        },
        () => {
          // Handle connection open
          setState("connected");
          reconnectAttemptsRef.current = 0;
          // No need to send any data - movers endpoint streams automatically
        },
        () => {
          // Handle connection close
          setState("disconnected");

          // Attempt to reconnect if not manually closed
          if (!isManualCloseRef.current && reconnectAttemptsRef.current < maxReconnectAttemptsRef.current) {
            reconnectAttemptsRef.current += 1;
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, reconnectIntervalRef.current);
          } else if (reconnectAttemptsRef.current >= maxReconnectAttemptsRef.current) {
            const error = new Error("Max reconnection attempts reached");
            setError(error);
            setState("error");
            if (onErrorRef.current) {
              onErrorRef.current(error);
            }
          }
        }
      );

      wsRef.current = ws;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create WebSocket connection");
      setError(error);
      setState("error");
      if (onErrorRef.current) {
        onErrorRef.current(error);
      }
    }
  }, []); // Empty dependencies - all values accessed via refs

  const reconnect = useCallback(() => {
    isManualCloseRef.current = false;
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  // Connect on mount and when enabled changes
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

    // Cleanup on unmount or when enabled changes
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

  // Only show loading on initial connection, not on reconnection when we already have data
  const isInitialLoading = state === "connecting" && !hasReceivedData;

  return {
    movers,
    state,
    error,
    reconnect,
    isInitialLoading,
  };
}

