"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type DialogContextValue = { open: boolean; setOpen: (v: boolean) => void };
const DialogContext = React.createContext<DialogContextValue | null>(null);

export function Dialog({ children, open: controlledOpen, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (v: boolean) => void }) {
  const [open, setOpen] = React.useState(false);
  const isControlled = typeof controlledOpen === "boolean";
  const value = isControlled ? controlledOpen : open;
  const setValue = (v: boolean) => {
    if (!isControlled) setOpen(v);
    onOpenChange?.(v);
  };
  return <DialogContext.Provider value={{ open: value, setOpen: setValue }}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(DialogContext);
  if (!ctx) return <>{children}</>;
  return (
    <button type="button" onClick={() => ctx.setOpen(true)} className="inline-flex">
      {children}
    </button>
  );
}

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(DialogContext);
  if (!ctx?.open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => ctx.setOpen(false)} />
      <div className={cn("relative z-10 w-full max-w-lg rounded-xl border bg-background p-6 shadow-lg", className)}>{children}</div>
    </div>
  );
}
