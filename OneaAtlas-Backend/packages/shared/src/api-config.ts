/**
 * API Configuration
 * Shared constants for frontend-backend communication
 */

// Backend API base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// API endpoints
export const API_ENDPOINTS = {
  // AI Gateway
  AI: {
    HEALTH: "/api/v1/ai/health",
    COMPLETE: "/api/v1/ai/complete",
    GENERATE_CODE: "/api/v1/ai/generate/code",
    GENERATE_SCHEMA: "/api/v1/ai/generate/schema",
    UNDERSTAND: "/api/v1/ai/understand",
  },
  // Database
  DB: {
    HEALTH: "/api/v1/db/health",
  },
};

// API client config
export interface APIClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export const DEFAULT_API_CLIENT_CONFIG: APIClientConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000,
};

export function buildURL(endpoint: string, baseURL?: string): string {
  const base = baseURL || API_BASE_URL;
  return `${base}${endpoint}`;
}
