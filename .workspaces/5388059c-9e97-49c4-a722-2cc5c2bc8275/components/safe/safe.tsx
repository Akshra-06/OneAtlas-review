"use client";

import type { ReactNode } from "react";
import ErrorBoundary from "@/components/safe/error-boundary";

export function Safe({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
}
