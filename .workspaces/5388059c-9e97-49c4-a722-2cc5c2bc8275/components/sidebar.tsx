"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, DollarSign, Layout, Mail, Package, Square, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export default function Sidebar({
  appName,
  items,
  open,
  onOpenChange,
}: {
  appName: string;
  items: NavItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const iconMap: Record<string, any> = { Users, DollarSign, CheckSquare, Layout, Package, Mail };
  const close = () => onOpenChange(false);

  return (
    <>
      {open ? <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={close} /> : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r bg-sidebar text-sidebar-foreground shadow-sm transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground/70">OneAtlas</p>
            <p className="truncate text-sm font-semibold">{appName}</p>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={close} aria-label="Close navigation">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {items.map((item) => {
            const Icon = iconMap[item.icon] ?? Square;
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4 opacity-90" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
