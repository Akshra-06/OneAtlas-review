"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {}, [error]);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Preview Safe Mode</h1>
        <Badge variant="warning">error</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Section failed to render</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">This dashboard route recovered without crashing.</p>
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-10 items-center justify-center rounded-lg border bg-background px-4 text-sm font-medium hover:bg-muted"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
