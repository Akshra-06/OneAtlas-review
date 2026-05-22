"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {}, [error]);
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Preview Safe Mode</h1>
          <Badge variant="warning">error</Badge>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Something failed to render</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The preview recovered without crashing.
            </p>
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
    </div>
  );
}
