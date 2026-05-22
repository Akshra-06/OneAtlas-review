import type { GeneratedFile } from '@oneatlas/shared';

const normalizePath = (value: string) => value.replace(/\\/g, '/').replace(/^\/+/, '');

export const GOLDEN_LOCKED_PATH_PREFIXES = [
  'components/providers.tsx',
  'components/sidebar.tsx',
  'components/safe/',
  'components/safe-mode-banner.tsx',
  'components/ui/',
  'lib/utils.ts',
  'lib/prisma.ts',
  'lib/tenant.ts',
  'next-env.d.ts',
  'next.config.js',
  'package.json',
  'postcss.config.js',
  'tailwind.config.ts',
  'tsconfig.json',
];

export const GOLDEN_LOCKED_PATH_EXACT = new Set<string>([
  'app/layout.tsx',
  'app/globals.css',
  'app/error.tsx',
  'app/not-found.tsx',
  'app/(dashboard)/layout.tsx',
  'app/(dashboard)/page.tsx',
  'app/(dashboard)/error.tsx',
  'app/(dashboard)/not-found.tsx',
  'app/(dashboard)/[...slug]/page.tsx',
  'components/providers.tsx',
  'components/sidebar.tsx',
  'components/safe/error-boundary.tsx',
  'components/safe/safe.tsx',
  'components/safe-mode-banner.tsx',
  'lib/utils.ts',
  'lib/prisma.ts',
  'lib/tenant.ts',
  'next-env.d.ts',
  'next.config.js',
  'package.json',
  'postcss.config.js',
  'tailwind.config.ts',
  'tsconfig.json',
]);

export const isLockedGeneratedPath = (filePath: string): boolean => {
  const p = normalizePath(filePath).toLowerCase();
  if (GOLDEN_LOCKED_PATH_EXACT.has(p)) return true;
  return GOLDEN_LOCKED_PATH_PREFIXES.some((prefix) => p.startsWith(prefix));
};

export const FORBIDDEN_CONTENT_PATTERNS: Array<{ id: string; pattern: RegExp }> = [
  { id: 'revalidate', pattern: /\bexport\s+const\s+revalidate\b/g },
  { id: 'unstable_cache', pattern: /\bunstable_cache\b/g },
  { id: 'next_cache', pattern: /\bnext\/cache\b/g },
  { id: 'react_query', pattern: /@tanstack\/react-query|QueryClientProvider|useQueryClient\b/g },
  { id: 'custom_provider', pattern: /\bcreateContext\s*\(|\bReact\.createContext\s*\(/g },
  { id: 'use_server', pattern: /^\s*['"]use server['"]\s*;?/gm },
  { id: 'server_actions', pattern: /\bserverActions\b|\buseActionState\b/g },
];

export const hasReactHooks = (content: string): boolean =>
  /\buse(State|Effect|Context|Reducer|Ref|Memo|Callback|Transition|DeferredValue)\b/.test(content);

export const ensureUseClient = (content: string): string => {
  if (/^\s*['"]use client['"]/.test(content)) return content;
  return `"use client";\n\n${content}`;
};

export const stripForbiddenExports = (content: string): string => {
  let out = content;
  out = out.replace(/^\s*export\s+const\s+revalidate\s*=\s*[^;]+;?\s*$/gm, '');
  out = out.replace(/^\s*export\s+const\s+dynamic\s*=\s*['"][^'"]+['"]\s*;?\s*$/gm, (line) => line);
  return out;
};

export const sanitizeGeneratedFile = (file: GeneratedFile): { file: GeneratedFile; blocked: boolean; reasons: string[] } => {
  const p = normalizePath(file.filePath);
  let content = file.content ?? '';

  const reasons: string[] = [];
  for (const rule of FORBIDDEN_CONTENT_PATTERNS) {
    if (rule.pattern.test(content)) reasons.push(rule.id);
    rule.pattern.lastIndex = 0;
  }

  content = stripForbiddenExports(content);

  const isTsx = p.endsWith('.tsx') || p.endsWith('.ts') || p.endsWith('.jsx') || p.endsWith('.js');
  if (isTsx && hasReactHooks(content) && !/layout\.(t|j)sx?$/.test(p)) {
    content = ensureUseClient(content);
  }

  const blocked = reasons.length > 0;
  return {
    file: { ...file, filePath: p, content },
    blocked,
    reasons,
  };
};

export const safeFallbackForFile = (file: GeneratedFile): GeneratedFile => {
  const p = normalizePath(file.filePath);
  if (p.endsWith('/page.tsx') || p.endsWith('/page.jsx') || p.endsWith('/page.ts')) {
    return {
      ...file,
      filePath: p,
      content: `"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Preview Safe Mode</h1>
        <Badge variant="warning">degraded</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Component failed to render</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page was replaced to keep preview stable.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
`,
    };
  }

  if (p.includes('/app/api/') && (p.endsWith('/route.ts') || p.endsWith('/route.js'))) {
    return {
      ...file,
      filePath: p,
      content: `import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Preview Safe Mode", code: "SAFE_MODE" }, { status: 200 });
}
`,
    };
  }

  return {
    ...file,
    filePath: p,
    content: `export default function Component() { return null; }
`,
  };
};

export const GOLDEN_TEMPLATE_FILES: Record<string, string> = {
  'package.json': `{
  "name": "oneatlas-generated-app",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "15.5.18",
    "react": "19.2.6",
    "react-dom": "19.2.6",
    "@prisma/client": "5.22.0",
    "@hookform/resolvers": "5.2.2",
    "react-hook-form": "7.76.0",
    "zod": "4.4.3",
    "clsx": "2.1.1",
    "tailwind-merge": "2.6.1",
    "class-variance-authority": "0.7.0",
    "lucide-react": "0.451.0",
    "sonner": "2.0.7",
    "framer-motion": "12.38.0"
  },
  "devDependencies": {
    "prisma": "5.22.0",
    "tailwindcss": "3.4.19",
    "postcss": "8.5.6",
    "autoprefixer": "10.4.20",
    "typescript": "5.9.3",
    "@types/node": "20.19.0",
    "@types/react": "18.3.28",
    "@types/react-dom": "18.3.7"
  }
}
`,
  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
`,
  'next-env.d.ts': `/// <reference types="next" />
/// <reference types="next/image-types/global" />
`,
  'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true }
};

module.exports = nextConfig;
`,
  'postcss.config.js': `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`,
  'tailwind.config.ts': `import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 6px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      }
    }
  },
  plugins: []
};

export default config;
`,
  'app/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 215 90% 60%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.75rem;
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 222.2 47.4% 11.2%;
    --sidebar-primary-foreground: 210 40% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 215 90% 60%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 215 90% 60%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 215 90% 60%;
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 215 90% 60%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 215 90% 60%;
  }
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground antialiased; }
}
`,
  'app/layout.tsx': `import "./globals.css";
import type { ReactNode } from "react";
import Providers from "@/components/providers";
import ErrorBoundary from "@/components/safe/error-boundary";
import SafeModeBanner from "@/components/safe-mode-banner";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ErrorBoundary>
            <SafeModeBanner />
            {children}
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
`,
  'app/error.tsx': `"use client";

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
`,
  'app/not-found.tsx': `export default function NotFound() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-xl border bg-background p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Not Found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page does not exist.</p>
      </div>
    </div>
  );
}
`,
  'app/(dashboard)/layout.tsx': `"use client";

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
`,
  'app/(dashboard)/page.tsx': `"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, TrendingUp, Activity } from "lucide-react";

// Entity endpoints - will be dynamically populated based on generated entities
const ENTITY_ENDPOINTS = [
  { name: "Todos", slug: "todos", label: "Todo" },
  { name: "Users", slug: "users", label: "User" },
  { name: "Patients", slug: "patients", label: "Patient" },
  { name: "Doctors", slug: "doctors", label: "Doctor" },
  { name: "Organizations", slug: "organizations", label: "Organization" },
  { name: "Appointments", slug: "appointments", label: "Appointment" },
].filter(e => {
  // Filter to only include entities that exist in the app
  // This is a runtime check to avoid 404s
  return true;
});

export default function DashboardHome() {
  const [entityData, setEntityData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      const data: Record<string, any> = {};
      let total = 0;

      const promises = ENTITY_ENDPOINTS.map(async (entity) => {
        try {
          const response = await fetch(\`/api/\${entity.slug}\`);
          if (response.ok) {
            const result = await response.json();
            data[entity.slug] = result.data || [];
            total += (result.data || []).length;
          }
        } catch (error) {
          // Entity might not exist, skip it
          data[entity.slug] = [];
        }
      });

      await Promise.all(promises);
      setEntityData(data);
      setTotalRecords(total);
      setIsLoading(false);
    };

    loadAllData();
    
    // Removed auto-refresh interval to prevent component reloading
    // const interval = setInterval(loadAllData, 5000);
    // return () => clearInterval(interval);
  }, []);

  const activeEntities = ENTITY_ENDPOINTS.filter(e => entityData[e.slug] && entityData[e.slug].length > 0);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{totalRecords}</div>
            <div className="text-sm text-muted-foreground">Across all entities</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Active Entities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-blue-600">{activeEntities.length}</div>
            <div className="text-sm text-muted-foreground">With data</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Data Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-green-600">+{totalRecords}</div>
            <div className="text-sm text-muted-foreground">Total created</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-500" />
              Entity Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-purple-600">{ENTITY_ENDPOINTS.length}</div>
            <div className="text-sm text-muted-foreground">Available</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {activeEntities.map((entity) => {
          const data = entityData[entity.slug] || [];
          const displayFields = data.length > 0 ? Object.keys(data[0]).filter(k => !['id', 'createdAt', 'updatedAt', 'tenantId'].includes(k)).slice(0, 3) : [];
          const columns = displayFields.map(field => ({
            accessorKey: field,
            header: field.charAt(0).toUpperCase() + field.slice(1),
          }));

          return (
            <Card key={entity.slug}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{entity.name}</span>
                  <Badge variant="secondary">{data.length} records</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.length === 0 ? (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    No {entity.label.toLowerCase()}s yet
                  </div>
                ) : (
                  <DataTable columns={columns} data={data.slice(0, 5)} />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {activeEntities.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No data yet. Create your first record to see it appear on the dashboard.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
`,
  'app/(dashboard)/[...slug]/page.tsx': `"use client";

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
`,
  'app/(dashboard)/error.tsx': `"use client";

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
`,
  'app/(dashboard)/not-found.tsx': `export default function DashboardNotFound() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-background p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Not Found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This section does not exist.</p>
      </div>
    </div>
  );
}
`,
  'components/providers.tsx': `"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster richColors />
    </>
  );
}
`,
  'components/sidebar.tsx': `"use client";

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
`,
  'components/safe/error-boundary.tsx': `"use client";

import * as React from "react";

export default class ErrorBoundary extends React.Component<
  { fallback?: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}
`,
  'components/safe/safe.tsx': `"use client";

import type { ReactNode } from "react";
import ErrorBoundary from "@/components/safe/error-boundary";

export function Safe({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
}
`,
  'components/safe-mode-banner.tsx': `"use client";

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
`,
  'lib/utils.ts': `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`,
  'lib/prisma.ts': `import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prismaClient = globalForPrisma.prisma ?? new PrismaClient();
export const prisma = prismaClient as any;
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaClient;
`,
  'lib/tenant.ts': `import { NextRequest } from "next/server";

export async function getTenantId(request: NextRequest): Promise<string> {
  const headerTenant = request.headers.get("x-org-id") ?? request.headers.get("x-tenant-id");
  if (headerTenant) return headerTenant;
  return "demo-tenant";
}
`,
  'lib/oneatlas/routes.ts': `export type ShellNavItem = { label: string; href: string; icon: string };

export function getShellConfig(): { appName: string; sidebarNav: ShellNavItem[] } {
  return {
    appName: "Generated App",
    sidebarNav: [
      { label: "Dashboard", href: "/", icon: "Layout" }
    ]
  };
}
`,
  'lib/oneatlas/mock-data.ts': `export function getMockDashboard() {
  return {
    kpis: [
      { label: "Active", value: "128", subtext: "Last 7 days" },
      { label: "New", value: "24", subtext: "Today" },
      { label: "Conversion", value: "4.2%", subtext: "This week" },
      { label: "Health", value: "Good", subtext: "No incidents" }
    ],
    activity: [
      { id: "a1", title: "Imported data", time: "2m ago", status: "Success", variant: "success" },
      { id: "a2", title: "Workflow executed", time: "15m ago", status: "Running", variant: "secondary" },
      { id: "a3", title: "User invited", time: "1h ago", status: "Success", variant: "success" }
    ],
    table: {
      columns: [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "status", header: "Status" },
        { accessorKey: "updated", header: "Updated" }
      ],
      data: [
        { id: "r1", name: "Record A", status: "Active", updated: "Today" },
        { id: "r2", name: "Record B", status: "Pending", updated: "Yesterday" },
        { id: "r3", name: "Record C", status: "Archived", updated: "2 days ago" }
      ]
    }
  };
}
`,
  'components/ui/card.tsx': `import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold leading-none tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />;
}
`,
  'components/ui/badge.tsx': `import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
        success: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
        warning: "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
`,
  'components/ui/button.tsx': `import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border bg-background hover:bg-muted",
  ghost: "hover:bg-muted",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
  icon: "h-10 w-10",
};

export function Button({
  className,
  variant = "default",
  size = "md",
  asChild = false,
  type,
  children,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  type?: "button" | "submit" | "reset";
  children?: React.ReactNode;
}) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, { ...props, className: cn(classes, (children as any).props?.className) });
  }

  return (
    <button className={classes} type={type ?? "button"} {...props}>
      {children}
    </button>
  );
}
`,
  'components/ui/input.tsx': `import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
`,
  'components/ui/textarea.tsx': `import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
`,
  'components/ui/separator.tsx': `import * as React from "react";
import { cn } from "@/lib/utils";

export function Separator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("h-px w-full bg-border", className)} {...props} />;
}
`,
  'components/ui/skeleton.tsx': `import * as React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}
`,
  'components/ui/avatar.tsx': `import * as React from "react";
import { cn } from "@/lib/utils";

export function Avatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border bg-muted text-muted-foreground", className)} {...props} />;
}

export function AvatarFallback({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex h-full w-full items-center justify-center text-xs font-medium", className)} {...props} />;
}
`,
  'components/ui/tabs.tsx': `"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = { value: string; setValue: (v: string) => void };
const TabsContext = React.createContext<TabsContextValue | null>(null);

export function Tabs({ defaultValue, children, className }: { defaultValue: string; children: React.ReactNode; className?: string }) {
  const [value, setValue] = React.useState(defaultValue);
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn("space-y-4", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("inline-flex h-10 items-center justify-center rounded-lg border bg-background p-1", className)}>{children}</div>;
}

export function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(TabsContext);
  const active = ctx?.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx?.setValue(value)}
      className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors", active ? "bg-muted" : "hover:bg-muted/50", className)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(TabsContext);
  if (ctx?.value !== value) return null;
  return <div className={cn("rounded-xl border bg-background p-4", className)}>{children}</div>;
}
`,
  'components/ui/dialog.tsx': `"use client";

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
`,
  'components/ui/select.tsx': `import * as React from "react";

export function Select({
  children,
  onValueChange,
  defaultValue,
}: {
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
}) {
  return (
    <select
      defaultValue={defaultValue}
      onChange={(event) => onValueChange?.(event.target.value)}
      className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      {children}
    </select>
  );
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <option value={value}>{children}</option>;
}

export function SelectTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <option value="">{placeholder ?? "Select an option"}</option>;
}
`,
  'components/ui/form.tsx': `import * as React from "react";
import { Controller, FormProvider, type UseFormReturn } from "react-hook-form";

export function Form({ children, ...props }: { children: React.ReactNode } & UseFormReturn<any>) {
  return <FormProvider {...props}>{children}</FormProvider>;
}

export function FormControl({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function FormField({
  name,
  control,
  render,
}: {
  control: unknown;
  name: string;
  render: (props: { field: any; fieldState: any }) => React.ReactNode;
}) {
  return <Controller name={name} control={control as any} render={({ field, fieldState }) => render({ field, fieldState })} />;
}

export function FormItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className ?? "space-y-2"}>{children}</div>;
}

export function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium">{children}</label>;
}

export function FormDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

export function FormMessage() {
  return null;
}
`,
  'components/ui/data-table.tsx': `export interface DataTableColumn<TData> {
  accessorKey: keyof TData | string;
  header: string;
}

export function DataTable<TData extends Record<string, unknown>>({
  columns,
  data,
}: {
  columns: DataTableColumn<TData>[];
  data: TData[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.accessorKey)}
                className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={String((row as any).id ?? index)} className="border-t transition-colors hover:bg-muted/40">
              {columns.map((column) => (
                <td key={String(column.accessorKey)} className="px-4 py-3">
                  {String((row as any)[column.accessorKey] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`,
};

export const getGoldenTemplateFiles = (): Array<{ filePath: string; content: string }> =>
  Object.entries(GOLDEN_TEMPLATE_FILES).map(([filePath, content]) => ({
    filePath,
    content,
  }));
