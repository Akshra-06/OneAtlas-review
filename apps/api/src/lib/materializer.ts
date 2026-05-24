import * as fs from 'node:fs/promises';
import * as fsSync from 'node:fs';
import * as path from 'node:path';
import { spawn } from 'node:child_process';
import * as http from 'node:http';
import * as net from 'node:net';
import {
  getGoldenTemplateFiles,
  isLockedGeneratedPath,
  sanitizeGeneratedFile,
  safeFallbackForFile,
  previewValidator,
  safeComponentRegistry,
  type GeneratedFile as AIGeneratedFile,
  type GeneratedFileType,
} from '@oneatlas/ai';

interface GeneratedFile {
  filePath: string;
  content: string;
  fileType?: GeneratedFileType;
}

interface MaterializeResult {
  workspacePath: string;
  buildStatus: 'success' | 'failed';
  previewStartupStatus: 'success' | 'failed';
  previewUrl?: string;
}

const runningProcesses = new Map<string, any>();

const guaranteedComponents: Record<string, string> = {
  'components/ui/card.tsx': `import * as React from 'react';
import { cn } from '@/lib/utils';

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-xl border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-base font-semibold leading-none tracking-tight', className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />;
}
`,
  'components/ui/badge.tsx': `import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'text-foreground',
        success: 'border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
        warning: 'border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
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
  'components/ui/separator.tsx': `import * as React from 'react';
import { cn } from '@/lib/utils';

export function Separator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('h-px w-full bg-border', className)} {...props} />;
}
`,
  'components/ui/skeleton.tsx': `import * as React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}
`,
  'components/ui/avatar.tsx': `import * as React from 'react';
import { cn } from '@/lib/utils';

export function Avatar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border bg-muted text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

export function AvatarFallback({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex h-full w-full items-center justify-center text-xs font-medium', className)}
      {...props}
    />
  );
}
`,
  'components/ui/popover.tsx': `'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type PopoverContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

export function Popover({
  children,
  defaultOpen = false,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-flex">{children}</div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) return <>{children}</>;
  const onClick = () => ctx.setOpen(!ctx.open);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, { onClick });
  }

  return (
    <button type="button" onClick={onClick} className="inline-flex">
      {children}
    </button>
  );
}

export function PopoverContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(PopoverContext);
  if (!ctx?.open) return null;

  return (
    <div
      className={cn(
        'absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border bg-popover p-2 text-popover-foreground shadow-md',
        className,
      )}
    >
      {children}
    </div>
  );
}
`,
  'components/ui/command.tsx': `'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export function Command({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex w-full flex-col overflow-hidden rounded-lg bg-background text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CommandInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex items-center border-b px-3">
      <input
        className={cn(
          'flex h-10 w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground',
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function CommandList({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('max-h-[260px] overflow-y-auto p-1', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CommandEmpty({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="py-6 text-center text-sm text-muted-foreground" {...props}>
      {children ?? 'No results found.'}
    </div>
  );
}

export function CommandGroup({
  children,
  heading,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { heading?: string }) {
  return (
    <div className={cn('overflow-hidden', className)} {...props}>
      {heading ? (
        <div className="px-2 py-2 text-xs font-medium text-muted-foreground">
          {heading}
        </div>
      ) : null}
      <div className="p-1">{children}</div>
    </div>
  );
}

export function CommandItem({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex cursor-default select-none items-center rounded-md px-2 py-2 text-sm outline-none hover:bg-muted',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
`,
  'components/ui/button.tsx': `import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const variantClasses: Record<ButtonVariant, string> = {
  default:
    'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline:
    'border bg-background hover:bg-muted',
  ghost:
    'hover:bg-muted',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
  icon: 'h-10 w-10',
};

export function Button({
  className,
  variant = 'default',
  size = 'md',
  asChild = false,
  type,
  children,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  type?: 'button' | 'submit' | 'reset';
  children?: React.ReactNode;
}) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50',
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, {
      ...props,
      className: cn(classes, (children as any).props?.className),
    });
  }

  return (
    <button className={classes} type={type ?? 'button'} {...props}>
      {children}
    </button>
  );
}
`,
  'components/ui/input.tsx': `import * as React from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30',
        className,
      )}
      {...props}
    />
  );
}
`,
  'components/ui/textarea.tsx': `import * as React from 'react';
import { cn } from '@/lib/utils';

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30',
        className,
      )}
      {...props}
    />
  );
}
`,
  'components/ui/switch.tsx': `'use client';

import { cn } from '@/lib/utils';

export function Switch({
  checked = false,
  onCheckedChange,
  disabled = false,
}: {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        'inline-flex h-6 w-11 items-center rounded-full border transition-colors disabled:opacity-50',
        checked ? 'border-primary bg-primary' : 'border-input bg-muted',
      )}
    >
      <span
        className={cn(
          'h-5 w-5 rounded-full bg-background shadow-sm transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}
`,
  'components/ui/select.tsx': `import * as React from 'react';

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
  return <option value="">{placeholder ?? 'Select an option'}</option>;
}
`,
  'components/ui/form.tsx': `import * as React from 'react';
import { Controller, FormProvider, type UseFormReturn } from 'react-hook-form';

export function Form({
  children,
  ...props
}: { children: React.ReactNode } & UseFormReturn<any>) {
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
  return (
    <Controller
      name={name}
      control={control as any}
      render={({ field, fieldState }) => render({ field, fieldState })}
    />
  );
}

export function FormItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className ?? 'space-y-2'}>{children}</div>;
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
              <th key={String(column.accessorKey)} className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
                  {String(row[column.accessorKey] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`
};

async function findRepoRoot(startDir: string): Promise<string> {
  let currentDir = startDir;
  while (true) {
    try {
      const pnpmFile = path.join(currentDir, 'pnpm-workspace.yaml');
      const stat = await fs.stat(pnpmFile);
      if (stat.isFile()) {
        return currentDir;
      }
    } catch {}
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }
  return startDir;
}

async function findNodeModules(repoRoot: string): Promise<string | null> {
  const paths = [
    path.join(repoRoot, 'node_modules'),
    path.join(repoRoot, 'apps', 'web', 'node_modules'),
    path.join(repoRoot, 'apps', 'api', 'node_modules'),
    path.join(repoRoot, 'apps', 'executor', '.templates', 'base', 'node_modules'),
  ];
  for (const p of paths) {
    try {
      const reactPath = path.join(p, 'react');
      const stat = await fs.stat(reactPath);
      if (stat.isDirectory()) {
        return p;
      }
    } catch {}
  }
  for (const p of paths) {
    try {
      const stat = await fs.stat(p);
      if (stat.isDirectory()) {
        return p;
      }
    } catch {}
  }
  return null;
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => {
      resolve(false);
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

async function getAvailablePort(startPort = 3005): Promise<number> {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
  }
  return port;
}

function pollServerListening(port: number, timeoutMs = 15000): Promise<boolean> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const check = () => {
      if (Date.now() - startTime > timeoutMs) {
        resolve(false);
        return;
      }
      const req = http.request({
        host: '127.0.0.1',
        port: port,
        path: '/',
        method: 'GET',
        timeout: 500
      }, (res) => {
        resolve(true);
        req.destroy();
      });

      req.on('error', () => {
        req.destroy();
        setTimeout(check, 500);
      });

      req.end();
    };
    check();
  });
}

function runCommandAsync(
  command: string,
  args: string[],
  cwd: string,
  onLog: (line: string) => void
): Promise<{ success: boolean; exitCode: number }> {
  return new Promise((resolve) => {
    const proc = spawn(command, args, {
      cwd,
      env: { ...process.env },
      shell: true,
    });

    proc.stdout?.on('data', (data) => {
      const lines = data.toString().split(/\r?\n/);
      for (const line of lines) {
        if (line.trim()) {
          onLog(line.trim());
        }
      }
    });

    proc.stderr?.on('data', (data) => {
      const lines = data.toString().split(/\r?\n/);
      for (const line of lines) {
        if (line.trim()) {
          onLog(line.trim());
        }
      }
    });

    proc.on('close', (code) => {
      resolve({ success: code === 0, exitCode: code ?? 0 });
    });

    proc.on('error', (err) => {
      onLog(`Error spawning command ${command}: ${err.message}`);
      resolve({ success: false, exitCode: -1 });
    });
  });
}

export async function materializeWorkspace(
  appId: string,
  files: GeneratedFile[],
  onLog: (message: string) => void
): Promise<MaterializeResult> {
  const repoRoot = await findRepoRoot(__dirname);
  const workspacesDir = path.join(repoRoot, '.workspaces');
  const workspacePath = path.join(workspacesDir, appId);

  // Terminate any previously running process for this appId
  if (runningProcesses.has(appId)) {
    const oldProc = runningProcesses.get(appId);
    try {
      oldProc.kill();
      onLog(`Terminated previous running app instance for ${appId}`);
    } catch (e) {
      console.error(`Failed to kill old process for ${appId}:`, e);
    }
    runningProcesses.delete(appId);
  }

  // 1. Create workspace folder: .workspaces/<appId>/
  if (fsSync.existsSync(workspacePath)) {
    try {
      const children = await fs.readdir(workspacePath);
      for (const child of children) {
        if (child !== 'node_modules') {
          await fs.rm(path.join(workspacePath, child), { recursive: true, force: true });
        }
      }
    } catch (e) {
      console.error('Error cleaning workspace:', e);
    }
  } else {
    await fs.mkdir(workspacePath, { recursive: true });
  }
  onLog('workspace created');

  // 2. Link node_modules (part of Copy Stable Base Template step)
  const workspaceNodeModules = path.join(workspacePath, 'node_modules');
  const targetNodeModules = await findNodeModules(repoRoot) || path.join(repoRoot, 'node_modules');
  if (!fsSync.existsSync(workspaceNodeModules)) {
    const symlinkType = process.platform === 'win32' ? 'junction' : 'dir';
    await fs.symlink(targetNodeModules, workspaceNodeModules, symlinkType);
    onLog('template copied');
  } else {
    onLog('template copied');
  }

  const writeTemplate = async () => {
    for (const t of getGoldenTemplateFiles()) {
      const target = path.join(workspacePath, t.filePath);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, t.content, 'utf8');
    }
  };

  const writeGeneratedFiles = async (validateFirst: boolean = true) => {
    let written = 0;
    let validatedFiles = files;

    // Phase 2: Auto validation before preview
    if (validateFirst) {
      onLog('Running preview validation...');
      const validationResult = previewValidator.validate(files as AIGeneratedFile[]);
      
      if (validationResult.safeMode) {
        onLog(`Preview validation found ${validationResult.issues.length} issues, entering safe mode`);
        
        // Auto-repair where possible
        const repairedFiles = previewValidator.autoRepair(files as AIGeneratedFile[], validationResult.issues);
        if (repairedFiles.length !== files.length) {
          onLog(`Auto-repaired ${repairedFiles.length - files.length} files`);
          validatedFiles = repairedFiles;
        }

        // Validate component usage
        for (const file of validatedFiles) {
          if (file.filePath.endsWith('.tsx') || file.filePath.endsWith('.jsx')) {
            const componentValidation = safeComponentRegistry.validateComponentUsage(file.content);
            if (!componentValidation.valid) {
              onLog(`Found ${componentValidation.unauthorized.length} unauthorized components in ${file.filePath}`);
              const sanitizedContent = safeComponentRegistry.sanitizeComponentUsage(file.content);
              if (sanitizedContent !== file.content) {
                onLog(`Sanitized component usage in ${file.filePath}`);
                file.content = sanitizedContent;
              }
            }
          }
        }
      } else {
        onLog('Preview validation passed');
      }
    }

    for (const file of validatedFiles) {
      if (!file?.filePath) continue;
      if (isLockedGeneratedPath(file.filePath)) continue;

      const sanitized = sanitizeGeneratedFile({ filePath: file.filePath, content: file.content } as any);
      const output = sanitized.blocked
        ? safeFallbackForFile({ filePath: sanitized.file.filePath, content: sanitized.file.content } as any)
        : (sanitized.file as any);

      const target = path.join(workspacePath, output.filePath);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, output.content ?? '', 'utf8');
      written++;
      onLog('file written');
    }
    onLog(`total files written: ${written}`);
    
    // Set safe mode flag in sessionStorage for banner
    const validationResult = previewValidator.validate(validatedFiles as AIGeneratedFile[]);
    if (validationResult.safeMode) {
      onLog('Setting safe mode flag for preview');
      // We'll inject this via a script tag in the layout
      const safeModeScript = `
        <script>
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('oneatlas-safe-mode', 'true');
            sessionStorage.setItem('oneatlas-build-status', 'degraded');
          }
        </script>
      `;
      
      const layoutPath = path.join(workspacePath, 'app', 'layout.tsx');
      if (fsSync.existsSync(layoutPath)) {
        let layoutContent = await fs.readFile(layoutPath, 'utf8');
        layoutContent = layoutContent.replace(
          /<body>/,
          `<body>${safeModeScript}`
        );
        await fs.writeFile(layoutPath, layoutContent, 'utf8');
      }
    }

    return validatedFiles;
  };

  await writeTemplate();
  await writeGeneratedFiles(true);

  // Build Recovery System with retry logic
  const buildWithRetry = async (retryCount: number = 0): Promise<{ success: boolean; port: number; process: any }> => {
    const port = await getAvailablePort(3005 + retryCount);
    onLog(`Starting dev preview on port ${port} (attempt ${retryCount + 1})...`);

    const proc = spawn('npx', ['next', 'dev', '-p', String(port)], {
      cwd: workspacePath,
      env: {
        ...process.env,
        PORT: String(port),
        NODE_ENV: 'development',
        PREVIEW_MODE: 'true',
      },
      shell: true
    });

    // Collect build output to detect failures
    let buildOutput = '';
    const buildTimeout = setTimeout(() => {
      if (!buildOutput.includes('Ready') && !buildOutput.includes('Local:')) {
        onLog(`Build attempt ${retryCount + 1} timed out`);
        proc.kill();
      }
    }, 60000); // 60 second timeout

    proc.stdout?.on('data', (data) => {
      const lines = data.toString().split(/\r?\n/);
      for (const line of lines) {
        if (line.trim()) {
          buildOutput += line + '\n';
          onLog(`$ ${line.trim()}`);
        }
      }
    });

    proc.stderr?.on('data', (data) => {
      const lines = data.toString().split(/\r?\n/);
      for (const line of lines) {
        if (line.trim()) {
          buildOutput += line + '\n';
          onLog(line.trim());
        }
      }
    });

    // Wait for server to start
    const isListening = await pollServerListening(port);
    clearTimeout(buildTimeout);

    if (isListening) {
      onLog(`Preview server successfully started on port ${port}`);
      return { success: true, port, process: proc };
    } else {
      onLog(`Preview server failed to start on port ${port}`);
      proc.kill();
      return { success: false, port, process: null };
    }
  };

  // Phase 6: Build Recovery System
  let buildResult = await buildWithRetry(0);
  let buildStatus: 'success' | 'failed' = buildResult.success ? 'success' : 'failed';
  let previewStartupStatus: 'success' | 'failed' = buildResult.success ? 'success' : 'failed';

  // If build failed, try auto-repair and retry once
  if (!buildResult.success && buildStatus === 'failed') {
    onLog('Build failed, attempting auto-repair and retry...');
    
    // Re-validate and repair files
    const validationResult = previewValidator.validate(files as AIGeneratedFile[]);
    const repairedFiles = previewValidator.autoRepair(files as AIGeneratedFile[], validationResult.issues);
    
    // Rewrite files with repairs
    if (fsSync.existsSync(workspacePath)) {
      const children = await fs.readdir(workspacePath);
      for (const child of children) {
        if (child !== 'node_modules') {
          await fs.rm(path.join(workspacePath, child), { recursive: true, force: true });
        }
      }
    }
    await writeTemplate();
    await writeGeneratedFiles(false); // Skip validation on retry to avoid loop

    // Retry build
    buildResult = await buildWithRetry(1);
    buildStatus = buildResult.success ? 'success' : 'failed';
    previewStartupStatus = buildResult.success ? 'success' : 'failed';
  }

  // Phase 1: Preview Safe Mode - fallback if still failing
  if (!buildResult.success) {
    onLog('Build recovery failed, entering preview safe mode');
    
    // Clean workspace except node_modules
    if (fsSync.existsSync(workspacePath)) {
      const children = await fs.readdir(workspacePath);
      for (const child of children) {
        if (child !== 'node_modules') {
          await fs.rm(path.join(workspacePath, child), { recursive: true, force: true });
        }
      }
    }
    
    // Write only golden template (safe shell)
    await writeTemplate();
    
    // Set failed build status flag
    const safeModeScript = `
      <script>
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('oneatlas-safe-mode', 'true');
          sessionStorage.setItem('oneatlas-build-status', 'failed');
        }
      </script>
    `;
    
    const layoutPath = path.join(workspacePath, 'app', 'layout.tsx');
    if (fsSync.existsSync(layoutPath)) {
      let layoutContent = await fs.readFile(layoutPath, 'utf8');
      layoutContent = layoutContent.replace(/<body>/, `<body>${safeModeScript}`);
      await fs.writeFile(layoutPath, layoutContent, 'utf8');
    }

    // Start safe mode preview
    const safePort = await getAvailablePort(3010);
    onLog(`Starting safe mode preview on port ${safePort}`);
    
    const safeProc = spawn('npx', ['next', 'dev', '-p', String(safePort)], {
      cwd: workspacePath,
      env: { ...process.env, PORT: String(safePort), NODE_ENV: 'development' },
      shell: true,
    });

    safeProc.stdout?.on('data', (data) => {
      const lines = data.toString().split(/\r?\n/);
      for (const line of lines) {
        if (line.trim()) onLog(`$ ${line.trim()}`);
      }
    });

    safeProc.stderr?.on('data', (data) => {
      const lines = data.toString().split(/\r?\n/);
      for (const line of lines) {
        if (line.trim()) onLog(line.trim());
      }
    });

    const safeListening = await pollServerListening(safePort);
    if (safeListening) {
      onLog('Safe mode preview started successfully');
      previewStartupStatus = 'success';
      runningProcesses.set(appId, safeProc);
      return {
        workspacePath,
        buildStatus: 'failed', // Still marked as failed but preview works
        previewStartupStatus,
        previewUrl: `http://localhost:${safePort}`,
      };
    } else {
      onLog('Safe mode preview failed to start');
      return {
        workspacePath,
        buildStatus: 'failed',
        previewStartupStatus: 'failed',
        previewUrl: undefined,
      };
    }
  }

  // Normal success case
  if (buildResult.success) {
    runningProcesses.set(appId, buildResult.process);
    return {
      workspacePath,
      buildStatus: 'success',
      previewStartupStatus,
      previewUrl: `http://localhost:${buildResult.port}`,
    };
  }

  return {
    workspacePath,
    buildStatus,
    previewStartupStatus,
    previewUrl: undefined,
  };
}
