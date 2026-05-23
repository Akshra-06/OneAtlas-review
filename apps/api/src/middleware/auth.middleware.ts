// =============================================================================
// apps/api/src/middleware/auth.middleware.ts
// Thin middleware helpers that forward to the existing auth implementation.
// =============================================================================

export {
  requireAuth,
  requireOrgMember,
  type AuthContext,
} from "../lib/auth";

export type { UserRole } from "@oneatlas/db";
