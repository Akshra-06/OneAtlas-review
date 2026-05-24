import { NextResponse } from "next/server";

export const allowedOrigins: string[] = Array.from(
  new Set([
    "http://localhost:3000",
    "http://localhost:3001",
    "https://oneatlas.dev",
    "https://www.oneatlas.dev",
    ...(process.env.NEXT_PUBLIC_FRONTEND_URL ? [process.env.NEXT_PUBLIC_FRONTEND_URL] : []),
  ])
);

function getRequestOrigin(request?: Request | string): string | null {
  if (!request) {
    return null;
  }

  if (typeof request === "string") {
    return request;
  }

  return request.headers.get("origin");
}

/**
 * Reusable helper to apply CORS headers to Next.js responses.
 */
export function withCors(res: NextResponse, request?: Request | string) {
  const fallbackOrigin = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "http://localhost:3000";
  const requestOrigin = getRequestOrigin(request);
  const origin = requestOrigin && allowedOrigins.includes(requestOrigin)
    ? requestOrigin
    : fallbackOrigin;

  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-request-id");

  if (typeof request !== "string" && request?.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: res.headers,
    });
  }

  return res;
}
