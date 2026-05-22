"use client";

import { usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CatchAll() {
  const path = usePathname();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Section</h1>
        <Badge variant="secondary">{path}</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Placeholder</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This route was generated for navigation stability. If the intended page failed generation, it will still render safely here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
