import { execSync } from 'node:child_process';
import { prisma } from '@oneatlas/db';

export class DbProvisioner {
  /**
   * Helper to build the connection string for a given tenant schema.
   */
  public getTenantDbUrl(baseDbUrl: string, schemaName: string): string {
    const url = new URL(baseDbUrl);
    // Set the schema query parameter for PostgreSQL
    url.searchParams.set('schema', schemaName);
    return url.toString();
  }

  /**
   * Pre-creates the PostgreSQL schema using raw SQL query and pushes the Prisma schema.
   */
  public async provision(
    appId: string,
    workspacePath: string,
    dbSchemaName: string,
    onLog: (source: 'stdout' | 'stderr' | 'system', line: string) => void
  ): Promise<string> {
    onLog('system', `[DbProvisioner] Provisioning schema "${dbSchemaName}" for appId ${appId}...`);

    // 1. Pre-create the schema in the shared Postgres database
    try {
      await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${dbSchemaName}";`);
      onLog('system', `[DbProvisioner] PostgreSQL schema "${dbSchemaName}" created or already exists.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      onLog('stderr', `[DbProvisioner] Failed to pre-create PostgreSQL schema: ${msg}`);
      throw new Error(`Database schema creation failed: ${msg}`);
    }

    // 2. Extract database URL and construct the tenant URL
    const baseDbUrl = process.env.DATABASE_URL;
    if (!baseDbUrl) {
      throw new Error('DATABASE_URL env variable is not set on the executor process.');
    }
    const tenantDbUrl = this.getTenantDbUrl(baseDbUrl, dbSchemaName);

    // 3. Run Prisma db push inside the workspace using the tenant connection string
    try {
      onLog('system', `[DbProvisioner] Running prisma db push...`);
      
      // Execute command with env overrides
      const stdout = execSync('npx prisma db push --accept-data-loss --skip-generate', {
        cwd: workspacePath,
        env: {
          ...process.env,
          DATABASE_URL: tenantDbUrl,
          DIRECT_URL: tenantDbUrl // Avoid prisma migration override issues
        },
        stdio: 'pipe',
        shell: process.platform === 'win32' ? 'powershell.exe' : undefined
      });

      onLog('stdout', stdout.toString());
      onLog('system', `[DbProvisioner] Database schema synchronization complete.`);
    } catch (err: any) {
      const errorMsg = err.stderr ? err.stderr.toString() : (err.message || String(err));
      onLog('stderr', `[DbProvisioner] Prisma db push failed:\n${errorMsg}`);
      throw new Error(`Database push failed: ${errorMsg}`);
    }

    return tenantDbUrl;
  }
}
export default DbProvisioner;
