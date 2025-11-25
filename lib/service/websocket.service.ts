/**
 * WebSocket Service
 * Handles WebSocket connections for real-time stock data
 */

import { getFullUrl, apiConfig } from "../config/api";
import type { Quote, QuotesData, MoversData } from "../types/websocket";

/**
 * Get WebSocket URL for quotes endpoint
 */
export function getQuotesWebSocketUrl(): string {
  const baseUrl = apiConfig.baseURL.replace(/^https?/, "ws");
  return `${baseUrl}${apiConfig.apiPrefix}${apiConfig.endpoints.websocket.quotes}`;
}

/**
 * Get WebSocket URL for movers endpoint
 */
export function getMoversWebSocketUrl(): string {
  const baseUrl = apiConfig.baseURL.replace(/^https?/, "ws");
  return `${baseUrl}${apiConfig.apiPrefix}${apiConfig.endpoints.websocket.movers}`;
}

/**
 * Create a WebSocket connection
 */
export function createWebSocketConnection(
  url: string,
  onMessage: (event: MessageEvent) => void,
  onError?: (event: Event) => void,
  onOpen?: (event: Event) => void,
  onClose?: (event: CloseEvent) => void
): WebSocket {
  const ws = new WebSocket(url);

  if (onOpen) {
    ws.addEventListener("open", onOpen);
  }

  if (onMessage) {
    ws.addEventListener("message", onMessage);
  }

  if (onError) {
    ws.addEventListener("error", onError);
  }

  if (onClose) {
    ws.addEventListener("close", onClose);
  }

  return ws;
}

/**
 * Parse quotes data from WebSocket message
 */
export function parseQuotesData(data: string): QuotesData | null {
  try {
    const parsed = JSON.parse(data);
    // The backend sends quotes as a map/object where keys are symbols
    return parsed as QuotesData;
  } catch (error) {
    console.error("Error parsing quotes data:", error);
    return null;
  }
}

/**
 * Parse movers data from WebSocket message
 */
export function parseMoversData(data: string): MoversData | null {
  try {
    const parsed = JSON.parse(data);
    // The backend sends movers data with gainers, losers, actives arrays
    return parsed as MoversData;
  } catch (error) {
    console.error("Error parsing movers data:", error);
    return null;
  }
}

/**
 * Send symbols to quotes WebSocket
 * The backend expects a comma-separated string of symbols
 */
export function sendSymbolsToQuotes(ws: WebSocket, symbols: string[]): void {
  if (ws.readyState === WebSocket.OPEN) {
    const symbolsString = symbols.join(",");
    ws.send(symbolsString);
  } else {
    console.warn("WebSocket is not open. Cannot send symbols.");
  }
}

/**
 * Check if WebSocket is in a valid state
 */
export function isWebSocketReady(ws: WebSocket | null): boolean {
  return ws !== null && ws.readyState === WebSocket.OPEN;
}

/**
 * Close WebSocket connection gracefully
 */
export function closeWebSocket(ws: WebSocket | null): void {
  if (ws && ws.readyState !== WebSocket.CLOSED && ws.readyState !== WebSocket.CLOSING) {
    ws.close(1000, "Client closing connection");
  }
}

