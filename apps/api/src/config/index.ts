// =============================================================================
// apps/api/src/config/index.ts
// Minimal config reads with safe fallbacks.
// =============================================================================

export const APP_NAME = process.env.APP_NAME ?? "OneAtlas";
export const API_VERSION = process.env.API_VERSION ?? "v1";
export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
