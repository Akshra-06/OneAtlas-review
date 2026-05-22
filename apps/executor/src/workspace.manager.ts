import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import { GeneratedFile } from '@oneatlas/shared';
import { RuntimeMetadata } from './types';
import {
  getGoldenTemplateFiles,
  isLockedGeneratedPath,
  sanitizeGeneratedFile,
  safeFallbackForFile,
} from '@oneatlas/ai';

export class WorkspaceManager {
  private baseDir: string;
  private templateDir: string;
  private workspacesDir: string;

  constructor() {
    // Base workspace inside apps/executor
    this.baseDir = path.resolve(__dirname, '..');
    this.templateDir = path.join(this.baseDir, '.templates', 'base');
    this.workspacesDir = path.join(this.baseDir, '.workspaces');

    // Ensure folders exist
    fs.mkdirSync(this.templateDir, { recursive: true });
    fs.mkdirSync(this.workspacesDir, { recursive: true });
  }

  /**
   * Warm up base template node_modules if not already cached.
   */
  public ensureBaseTemplateWarmed(): void {
    const nodeModulesPath = path.join(this.templateDir, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      return;
    }

    console.log('[WorkspaceManager] Warming up base template node_modules...');

    // Write base package.json containing all possible generated dependencies
    const packageJson = {
      name: "oneatlas-generated-base",
      version: "1.0.0",
      private: true,
      dependencies: {
        "next": "^15.5.18",
        "react": "^19.2.6",
        "react-dom": "^19.2.6",
        "@prisma/client": "^5.22.0",
        "zod": "^4.4.3",
        "lucide-react": "^0.451.0",
        "clsx": "^2.1.1",
        "tailwind-merge": "^2.5.4",
        "tailwindcss-animate": "^1.0.7",
        "framer-motion": "^12.38.0",
        "class-variance-authority": "^0.7.0",
        "sonner": "^2.0.7",
        "zustand": "^5.0.13",
        "@hookform/resolvers": "^5.2.2",
        "react-hook-form": "^7.76.0",
        "@radix-ui/react-slot": "^1.1.0"
      },
      devDependencies: {
        "prisma": "^5.22.0",
        "typescript": "^5.3.3",
        "@types/node": "^20.11.0",
        "@types/react": "^18.3.12",
        "@types/react-dom": "^18.3.1",
        "postcss": "^8.4.47",
        "tailwindcss": "^3.4.13",
        "autoprefixer": "^10.4.20"
      }
    };

    fs.writeFileSync(
      path.join(this.templateDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Write a base tsconfig.json
    const tsconfigJson = {
      compilerOptions: {
        target: "es5",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [{ name: "next" }],
        paths: {
          "@/*": ["./src/*"]
        }
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"]
    };

    fs.writeFileSync(
      path.join(this.templateDir, 'tsconfig.json'),
      JSON.stringify(tsconfigJson, null, 2)
    );

    // Warm node_modules by running pnpm install in template folder
    try {
      execSync('pnpm install', {
        cwd: this.templateDir,
        stdio: 'inherit',
        shell: process.platform === 'win32' ? 'powershell.exe' : undefined
      });
      console.log('[WorkspaceManager] Base template warmed successfully.');
    } catch (err) {
      console.error('[WorkspaceManager] Failed to warm up base template:', err);
      throw err;
    }
  }

  /**
   * Provision a workspace for a generated application.
   */
  public provisionWorkspace(
    appId: string,
    generationId: string,
    files: GeneratedFile[],
    dbSchema: string
  ): { workspacePath: string; metadataPath: string } {
    const workspacePath = path.join(this.workspacesDir, appId);
    const metadataPath = path.join(workspacePath, '.oneatlas-runtime.json');

    // 1. Clean workspace directory if it exists, keeping node_modules
    if (fs.existsSync(workspacePath)) {
      const children = fs.readdirSync(workspacePath);
      for (const child of children) {
        if (child !== 'node_modules') {
          fs.rmSync(path.join(workspacePath, child), { recursive: true, force: true });
        }
      }
    } else {
      fs.mkdirSync(workspacePath, { recursive: true });
    }

    // 2. Symlink base template node_modules into workspace
    const workspaceNodeModules = path.join(workspacePath, 'node_modules');
    if (!fs.existsSync(workspaceNodeModules)) {
      const templateNodeModules = path.join(this.templateDir, 'node_modules');
      const symlinkType = process.platform === 'win32' ? 'junction' : 'dir';
      fs.symlinkSync(templateNodeModules, workspaceNodeModules, symlinkType);
    }

    // 3. Apply golden base template (always overwrite locked root)
    for (const t of getGoldenTemplateFiles()) {
      const targetFilePath = path.join(workspacePath, t.filePath);
      fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });
      fs.writeFileSync(targetFilePath, t.content);
    }

    // 4. Write generated file tree (restricted + sanitized)
    for (const file of files) {
      if (!file?.filePath) continue;
      if (isLockedGeneratedPath(file.filePath)) continue;

      const sanitized = sanitizeGeneratedFile(file);
      const output = sanitized.blocked
        ? safeFallbackForFile(sanitized.file)
        : sanitized.file;

      const targetFilePath = path.join(workspacePath, output.filePath);
      fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });
      fs.writeFileSync(targetFilePath, output.content ?? '');
    }

    // 5. Initialize/Write runtime metadata file
    const meta: RuntimeMetadata = {
      appId,
      generationId,
      allocatedPort: 0,
      dbSchema,
      createdAt: new Date().toISOString(),
      buildStatus: 'idle',
      runtimeStatus: 'idle',
      lastActiveAt: new Date().toISOString()
    };

    fs.writeFileSync(metadataPath, JSON.stringify(meta, null, 2));

    return { workspacePath, metadataPath };
  }

  public resetToGoldenTemplate(workspacePath: string): void {
    if (fs.existsSync(workspacePath)) {
      const children = fs.readdirSync(workspacePath);
      for (const child of children) {
        if (child !== 'node_modules' && child !== 'prisma' && child !== '.oneatlas-runtime.json') {
          fs.rmSync(path.join(workspacePath, child), { recursive: true, force: true });
        }
      }
    } else {
      fs.mkdirSync(workspacePath, { recursive: true });
    }

    for (const t of getGoldenTemplateFiles()) {
      const targetFilePath = path.join(workspacePath, t.filePath);
      fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });
      fs.writeFileSync(targetFilePath, t.content);
    }

    const prismaSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model PreviewHealth {
  id String @id @default(cuid())
}
`;
    const prismaPath = path.join(workspacePath, 'prisma', 'schema.prisma');
    fs.mkdirSync(path.dirname(prismaPath), { recursive: true });
    fs.writeFileSync(prismaPath, prismaSchema);
  }

  /**
   * Reads the current runtime metadata file for a workspace.
   */
  public readMetadata(workspacePath: string): RuntimeMetadata | null {
    const metadataPath = path.join(workspacePath, '.oneatlas-runtime.json');
    if (!fs.existsSync(metadataPath)) {
      return null;
    }
    try {
      return JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    } catch {
      return null;
    }
  }

  /**
   * Updates the runtime metadata file for a workspace.
   */
  public updateMetadata(workspacePath: string, updates: Partial<RuntimeMetadata>): void {
    const metadataPath = path.join(workspacePath, '.oneatlas-runtime.json');
    const existing = this.readMetadata(workspacePath) || {
      appId: path.basename(workspacePath),
      generationId: '',
      allocatedPort: 0,
      dbSchema: '',
      createdAt: new Date().toISOString(),
      buildStatus: 'idle',
      runtimeStatus: 'idle',
      lastActiveAt: new Date().toISOString()
    };

    const updated = {
      ...existing,
      ...updates,
      lastActiveAt: new Date().toISOString()
    };

    fs.writeFileSync(metadataPath, JSON.stringify(updated, null, 2));
  }
}
