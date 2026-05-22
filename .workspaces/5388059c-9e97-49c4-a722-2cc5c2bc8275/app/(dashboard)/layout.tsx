"use client";

import type { ReactNode } from "react";
import { useMemo, useState, useCallback } from "react";
import { Bell, Moon, PanelLeft, Sun } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getShellConfig } from "@/lib/oneatlas/routes";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const shell = useMemo(() => getShellConfig(), []);
  const items = useMemo(() => shell.sidebarNav, [shell.sidebarNav]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", next);
      }
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar appName={shell.appName} items={items} open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b bg-background/75 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-screen-2xl items-center gap-3 px-4 lg:px-8">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
              <PanelLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-muted-foreground">Workspace</p>
                  <h1 className="truncate text-base font-semibold">{shell.appName}</h1>
                </div>
                <div className="hidden max-w-md flex-1 items-center lg:flex">
                  <Input placeholder="Search…" className="h-10" onChange={() => {}} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hidden lg:inline-flex" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Avatar className="h-9 w-9">
                <AvatarFallback>DU</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 lg:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
