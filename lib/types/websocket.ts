/**
 * Type definitions for WebSocket data models
 * Matches the backend WebSocket message structure
 */

/**
 * Real-time quote data for a single symbol
 */
export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string; // ISO 8601 timestamp
  // Additional fields that may be present
  open?: number;
  high?: number;
  low?: number;
  previousClose?: number;
  marketCap?: number;
  bid?: number;
  ask?: number;
  bidSize?: number;
  askSize?: number;
}

/**
 * Real-time quotes response (multiple symbols)
 */
export interface QuotesData {
  [symbol: string]: Quote;
}

/**
 * Stock mover item (used in gainers, losers, actives)
 */
export interface MoverItem {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  timestamp?: string;
}

/**
 * Market movers data structure
 */
export interface MoversData {
  gainers: MoverItem[];
  losers: MoverItem[];
  actives: MoverItem[];
  timestamp: string; // ISO 8601 timestamp
}

/**
 * WebSocket connection states
 */
export type WebSocketState = "connecting" | "connected" | "disconnected" | "error";

/**
 * WebSocket error information
 */
export interface WebSocketError {
  message: string;
  code?: number;
  timestamp: string;
}

/**
 * WebSocket message types
 */
export type WebSocketMessageType = "quotes" | "movers" | "error" | "ping" | "pong";

/**
 * Generic WebSocket message wrapper
 */
export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType;
  data?: T;
  error?: WebSocketError;
  timestamp: string;
}

