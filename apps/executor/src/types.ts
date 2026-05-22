export type RuntimeEvent =
  | 'INSTALL_STARTED'
  | 'INSTALL_COMPLETED'
  | 'PRISMA_GENERATE_STARTED'
  | 'BUILD_STARTED'
  | 'BUILD_FAILED'
  | 'BUILD_COMPLETED'
  | 'RUNTIME_STARTED'
  | 'PREVIEW_READY'
  | 'PROCESS_EXITED';

export interface RuntimeMetadata {
  appId: string;
  generationId: string;
  allocatedPort: number;
  dbSchema: string;
  createdAt: string;
  buildStatus: 'idle' | 'building' | 'success' | 'failed';
  runtimeStatus: 'idle' | 'running' | 'stopped' | 'crashed';
  lastActiveAt: string;
}

export interface ExecutorOptions {
  appId: string;
  generationId: string;
  port: number;
  workspacePath: string;
  dbSchema: string;
  env: Record<string, string>;
  onEvent: (event: RuntimeEvent, details?: any) => void | Promise<void>;
  onLog: (source: 'stdout' | 'stderr' | 'system', line: string) => void | Promise<void>;
}

export interface WorkspaceConfig {
  appId: string;
  generationId: string;
  files: Array<{
    filePath: string;
    content: string;
  }>;
}
