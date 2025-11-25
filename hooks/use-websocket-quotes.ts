/**
 * React hook for WebSocket quotes connection
 * Provides real-time quotes for specified symbols
 */

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { QuotesData, WebSocketState } from "../lib/types/websocket";
import {
  getQuotesWebSocketUrl,
  createWebSocketConnection,
  parseQuotesData,
  sendSymbolsToQuotes,
  closeWebSocket,
  isWebSocketReady,
} from "../lib/service/websocket.service";

export interface UseWebSocketQuotesOptions {
  symbols: string[];
  enabled?: boolean;
  onError?: (error: Error) => void;
  reconnectInterval?: number; // milliseconds
  maxReconnectAttempts?: number;
}

export interface UseWebSocketQuotesReturn {
  quotes: QuotesData;
  state: WebSocketState;
  error: Error | null;
  reconnect: () => void;
  sendSymbols: (symbols: string[]) => void;
}

const DEFAULT_RECONNECT_INTERVAL = 5000; // 5 seconds
const DEFAULT_MAX_RECONNECT_ATTEMPTS = 10;

/**
 * Hook to manage WebSocket connection for real-time quotes
 */
export function useWebSocketQuotes(
  options: UseWebSocketQuotesOptions
): UseWebSocketQuotesReturn {
  const { symbols, enabled = true, onError, reconnectInterval = DEFAULT_RECONNECT_INTERVAL, maxReconnectAttempts = DEFAULT_MAX_RECONNECT_ATTEMPTS } = options;

  const [quotes, setQuotes] = useState<QuotesData>({});
  const [state, setState] = useState<WebSocketState>("disconnected");
  const [error, setError] = useState<Error | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualCloseRef = useRef(false);

  // Normalize and deduplicate symbols
  const normalizedSymbols = useMemo(
    () =>
      symbols
        .map((s) => s.trim().toUpperCase())
        .filter((s) => s.length > 0),
    [symbols]
  );

  const symbolsKey = normalizedSymbols.join(",");

  const connect = useCallback(() => {
    if (!enabled || normalizedSymbols.length === 0) {
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
      const url = getQuotesWebSocketUrl();
      const ws = createWebSocketConnection(
        url,
        (event) => {
          // Handle incoming messages
          const data = parseQuotesData(event.data);
          if (data) {
            setQuotes(data);
            setState("connected");
            reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful message
          }
        },
        () => {
          // Handle errors
          const error = new Error("WebSocket error occurred");
          setError(error);
          setState("error");
          if (onError) {
            onError(error);
          }
        },
        () => {
          // Handle connection open
          setState("connected");
          reconnectAttemptsRef.current = 0;
          
          // Send symbols to backend
          sendSymbolsToQuotes(ws, normalizedSymbols);
        },
        () => {
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
  }, [enabled, normalizedSymbols, onError, reconnectInterval, maxReconnectAttempts]);

  const reconnect = useCallback(() => {
    isManualCloseRef.current = false;
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  const sendSymbols = useCallback(
    (newSymbols: string[]) => {
      if (isWebSocketReady(wsRef.current)) {
        sendSymbolsToQuotes(wsRef.current!, newSymbols);
      } else {
        console.warn("WebSocket is not ready. Cannot send symbols.");
      }
    },
    []
  );

  // Connect on mount and when dependencies change
  useEffect(() => {
    if (enabled && normalizedSymbols.length > 0) {
      isManualCloseRef.current = false;
      connect();
    } else {
      // Close connection if disabled or no symbols
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
  }, [enabled, symbolsKey, normalizedSymbols.length, connect]);

  return {
    quotes,
    state,
    error,
    reconnect,
    sendSymbols,
  };
}

