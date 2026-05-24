// =============================================================================
// apps/api/src/middleware/validate.middleware.ts
// Zod validation helpers for route handlers.
// =============================================================================

import { z } from "zod";

export async function validateBody<TSchema extends z.ZodTypeAny>(
  bodyOrRequest: Request | unknown,
  schema: TSchema
): Promise<z.infer<TSchema>> {
  const body = bodyOrRequest instanceof Request
    ? await bodyOrRequest.json()
    : bodyOrRequest;

  return schema.parse(body);
}

export function validateParams<TSchema extends z.ZodTypeAny>(
  params: unknown,
  schema: TSchema
): z.infer<TSchema> {
  return schema.parse(params);
}
