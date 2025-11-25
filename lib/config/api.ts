/**
 * API Configuration
 * Centralized configuration for backend API connection
 * 
 * Note: In production (Vercel), ensure NEXT_PUBLIC_API_BASE_URL is set to:
 * https://zaned-backennd.onrender.com
 */

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://zaned-backennd.onrender.com";

// Debug: Log the API base URL (only in browser, not during SSR)
if (typeof window !== "undefined") {
  console.log("[API Config] Base URL:", baseUrl);
  console.log("[API Config] Env var value:", process.env.NEXT_PUBLIC_API_BASE_URL || "not set, using fallback");
}

export const apiConfig = {
  baseURL: baseUrl,
  apiPrefix: "/api",
  endpoints: {
    // Root - health check
    root: "/",
    health: "/health",

    // Public screening endpoints
    screening: {
      insideDay: "/inside-day",
      highVolumeQuarter: "/high-volume-quarter",
      highVolumeYear: "/high-volume-year",
      highVolumeEver: "/high-volume-ever",
      adrScreen: "/adr-screen",
      adr: "/adr",
      atrScreen: "/atr-screen",
      atr: "/atr",
      avgVolumeDollarsScreen: "/avg-volume-dollars-screen",
      avgVolumeDollars: "/avg-volume-dollars",
      avgVolumePercentScreen: "/avg-volume-percent-screen",
      avgVolumePercent: "/avg-volume-percent",
    },

    // Volume Statistics endpoint (public)
    volumeStats: "/volume-stats",

    // Company Info endpoints (public, read-only)
    companyInfo: {
      base: "/company-info",
      bySymbol: (symbol: string) => `/company-info/${symbol}`,
      symbols: "/company-info/symbols",
      search: "/company-info/search",
      bySector: (sector: string) => `/company-info/sector/${encodeURIComponent(sector)}`,
      byIndustry: (industry: string) => `/company-info/industry/${encodeURIComponent(industry)}`,
    },

    // Fundamental Data endpoints (public, read-only)
    fundamentalData: {
      base: "/fundamental-data",
      bySymbol: (symbol: string) => `/fundamental-data/symbol/${encodeURIComponent(symbol)}`,
      bySymbolAndType: (symbol: string, statementType: string) =>
        `/fundamental-data/symbol/${encodeURIComponent(symbol)}/type/${encodeURIComponent(statementType)}`,
      bySymbolTypeAndFrequency: (symbol: string, statementType: string, frequency: string) =>
        `/fundamental-data/symbol/${encodeURIComponent(symbol)}/type/${encodeURIComponent(statementType)}/frequency/${encodeURIComponent(frequency)}`,
      byStatementType: (statementType: string) =>
        `/fundamental-data/type/${encodeURIComponent(statementType)}`,
      byFrequency: (frequency: string) =>
        `/fundamental-data/frequency/${encodeURIComponent(frequency)}`,
      metrics: "/fundamental-data/metrics",
    },

    // Market Statistics endpoints (public)
    marketStatistics: {
      base: "/market-statistics",
      current: "/market-statistics/current",
      live: "/market-statistics/live",
    },

    // WebSocket endpoints (public)
    websocket: {
      quotes: "/ws/quotes",
      movers: "/ws/movers",
    },

    // Screener Results endpoints (public, cached results)
    screenerResults: {
      base: "/screener-results",
    },

    // Protected routes (require JWT authentication)
    screener: {
      base: "/protected/screener",
      byId: (id: string) => `/protected/screener/${id}`,
      bySymbol: (symbol: string) => `/protected/screener/symbol/${symbol}`,
      symbols: "/protected/screener/symbols",
      count: "/protected/screener/count",
    },

    historical: {
      base: "/protected/historical",
      byId: (id: string) => `/protected/historical/${id}`,
      bySymbol: "/protected/historical/by-symbol",
      chart: "/protected/historical/chart",
    },

    watchlist: {
      base: "/protected/watchlist",
      byId: (id: string) => `/protected/watchlist/${id}`,
      items: (watchlistId: string) => `/protected/watchlist/${watchlistId}/items`,
      itemById: (id: string) => `/protected/watchlist/item/${id}`,
      addItem: (watchlistId: string) => `/protected/watchlist/${watchlistId}/items`,
      updateItem: (id: string) => `/protected/watchlist/item/${id}`,
      deleteItem: (id: string) => `/protected/watchlist/item/${id}`,
      toggleStar: (id: string) => `/protected/watchlist/item/${id}/star`,
      starred: "/protected/watchlist/starred",
      batchUpdateItems: "/protected/watchlist/items/batch",
    },
  },
  timeout: 30000,
  retries: 3,
};

/**
 * Get full URL for an endpoint
 */
export const getFullUrl = (endpoint: string): string => {
  const fullUrl = `${apiConfig.baseURL}${apiConfig.apiPrefix}${endpoint}`;
  
  // Warn if using the wrong domain in production
  if (typeof window !== "undefined" && fullUrl.includes("api.zaned.space")) {
    console.error(
      "[API Config] ⚠️ WARNING: Using api.zaned.space which doesn't resolve!",
      "\nExpected: https://zaned-backennd.onrender.com",
      "\nCheck Vercel environment variable: NEXT_PUBLIC_API_BASE_URL"
    );
  }
  
  return fullUrl;
};

/**
 * Get authentication token from Supabase session
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const { createClient } = await import("../supabase/client");
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
}

/**
 * Create headers for API requests with authentication
 */
export async function createAuthHeaders(): Promise<HeadersInit> {
  const token = await getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export default apiConfig;
