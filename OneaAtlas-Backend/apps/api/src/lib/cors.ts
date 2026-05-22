import { NextResponse } from "next/server";

/**
 * Reusable helper to apply CORS headers to Next.js responses.
 */
export function withCors(res: NextResponse, origin: string = "http://localhost:3000") {
  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-request-id");
  return res;
}
