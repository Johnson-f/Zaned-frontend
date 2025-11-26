/**
 * WebSocket Service
 * Handles WebSocket connections for real-time stock data
 */

import { apiConfig } from "../config/api";
import type { QuotesData, MoversData } from "../types/websocket";

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
 * Parse a single mover item, converting string values to numbers
 */
function parseMoverItem(item: Record<string, unknown>): {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
} {
  const percentStr = String(item.percentChange || "0").replace("%", "");
  return {
    symbol: String(item.symbol || ""),
    name: item.name ? String(item.name) : undefined,
    price: parseFloat(String(item.price || "0")),
    change: parseFloat(String(item.change || "0")),
    changePercent: parseFloat(percentStr),
    volume: parseInt(String(item.volume || "0"), 10),
  };
}

/**
 * Parse movers data from WebSocket message
 */
export function parseMoversData(data: string): MoversData | null {
  try {
    const parsed = JSON.parse(data);
    
    // Transform string values to numbers for each mover item
    const gainers = Array.isArray(parsed.gainers) 
      ? parsed.gainers.map(parseMoverItem) 
      : [];
    const losers = Array.isArray(parsed.losers) 
      ? parsed.losers.map(parseMoverItem) 
      : [];
    const actives = Array.isArray(parsed.actives) 
      ? parsed.actives.map(parseMoverItem) 
      : [];
    
    return {
      gainers,
      losers,
      actives,
      timestamp: parsed.timestamp || new Date().toISOString(),
    };
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

