"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SafeModeBanner() {
  const [visible, setVisible] = useState(false);
  const [buildStatus, setBuildStatus] = useState<'success' | 'failed' | 'degraded'>('success');

  useEffect(() => {
    // Check for safe mode flag from build process
    const safeMode = sessionStorage.getItem('oneatlas-safe-mode');
    const buildResult = sessionStorage.getItem('oneatlas-build-status');
    
    if (safeMode === 'true' || buildResult === 'failed') {
      setVisible(true);
      setBuildStatus(buildResult === 'failed' ? 'failed' : 'degraded');
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="sticky top-0 z-50 border-b bg-amber-50 dark:bg-amber-950/20 px-4 py-2">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
              {buildStatus === 'failed' ? 'Preview Safe Mode' : 'Preview Degraded Mode'}
            </span>
            <span className="text-xs text-amber-700 dark:text-amber-300">
              {buildStatus === 'failed' 
                ? 'Build failed. Showing safe fallback UI.' 
                : 'Some features may not work correctly.'}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/30"
          onClick={() => setVisible(false)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
