import * as http from 'http';
import httpProxy from 'http-proxy';
import { ProcessRegistry } from './process.registry';
import { WorkspaceManager } from './workspace.manager';
import { Executor } from './executor.interface';
import * as path from 'path';

export class ProxyRouter {
  private proxy = httpProxy.createProxyServer({});
  private server: http.Server;
  private wakingApps = new Set<string>();

  constructor(
    private registry: ProcessRegistry,
    private workspaceManager: WorkspaceManager,
    private executor: Executor,
    private port: number = 3002
  ) {
    this.server = http.createServer((req, res) => this.handleRequest(req, res));

    // Handle proxy errors gracefully
    this.proxy.on('error', (err, req, res) => {
      console.error('[ProxyRouter] Proxy error:', err);
      if (res instanceof http.ServerResponse) {
        res.writeHead(502, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body style="font-family: sans-serif; background: #0b0f19; color: #f3f4f6; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0;">
              <h2 style="color: #ef4444;">502 Bad Gateway</h2>
              <p>The application container is running, but failed to respond to the proxy router.</p>
            </body>
          </html>
        `);
      }
    });
  }

  /**
   * Starts the proxy router listening on the port.
   */
  public start(): void {
    this.server.listen(this.port, () => {
      console.log(`[ProxyRouter] Dynamic routing proxy listening on port ${this.port}`);
    });
  }

  /**
   * Stops the proxy server.
   */
  public stop(): void {
    this.server.close();
  }

  /**
   * Request dispatcher.
   */
  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const host = req.headers.host || '';
    
    // Parse appId from Host header (e.g. appId.preview.localhost:3002 or appId.preview.oneatlas.dev)
    const match = host.match(/^([a-zA-Z0-9\-_]+)\.preview/);
    if (!match) {
      this.sendErrorPage(res, 404, 'Not Found', 'Host header must match &lt;appId&gt;.preview.oneatlas.dev');
      return;
    }

    const appId = match[1];
    if (!appId) {
      this.sendErrorPage(res, 404, 'Not Found', 'Invalid Application Subdomain');
      return;
    }

    // 1. Check if the app is already running
    const active = this.registry.get(appId);
    if (active) {
      // Record activity to reset idle timeout
      this.registry.recordActivity(appId, async () => {
        console.log(`[ProxyRouter] App ${appId} idle timeout. Stopping runner...`);
        await this.executor.stop(appId);
      });

      // Forward request
      this.proxy.web(req, res, { target: `http://127.0.0.1:${active.port}` });
      return;
    }

    // 2. Check if the app is currently in the process of waking up
    if (this.wakingApps.has(appId)) {
      this.sendWakingUpPage(res, appId);
      return;
    }

    // 3. Handle cold-start: App exists but is not running
    const workspacesDir = path.join(__dirname, '..', '.workspaces');
    const appWorkspacePath = path.join(workspacesDir, appId);
    const meta = this.workspaceManager.readMetadata(appWorkspacePath);

    if (!meta || meta.buildStatus !== 'success') {
      this.sendErrorPage(
        res,
        404,
        'App Offline',
        `Application workspace is not deployed or build compile has failed. Deploy the app from the OneAtlas panel first.`
      );
      return;
    }

    // Trigger cold-start activation asynchronously
    this.wakingApps.add(appId);
    this.triggerColdStart(appId, appWorkspacePath, meta)
      .then(() => {
        this.wakingApps.delete(appId);
      })
      .catch((err) => {
        console.error(`[ProxyRouter] Failed to cold start app ${appId}:`, err);
        this.wakingApps.delete(appId);
      });

    // Send waking up page so client reloads
    this.sendWakingUpPage(res, appId);
  }

  /**
   * Spawns a sleeping app runner back to life.
   */
  private async triggerColdStart(appId: string, workspacePath: string, meta: any): Promise<void> {
    console.log(`[ProxyRouter] Engaging cold start for app ${appId}...`);

    const allocatedPort = await this.registry.allocatePort();
    
    // Construct runner environment vars
    const env: Record<string, string> = {
      DATABASE_URL: process.env.DATABASE_URL
        ? new URL(process.env.DATABASE_URL).origin + `?schema=${meta.dbSchema}`
        : '',
      PORT: String(allocatedPort)
    };

    // Spawn the next start process
    await this.executor.start({
      appId,
      generationId: meta.generationId,
      port: allocatedPort,
      workspacePath,
      dbSchema: meta.dbSchema,
      env,
      onEvent: (event, details) => {
        console.log(`[ProxyRouter] Cold start event for ${appId}: ${event}`, details || '');
      },
      onLog: (src, logLine) => {
        // Forward logs to console for cold starts
        console.log(`[ColdStart][${appId}][${src}] ${logLine}`);
      }
    });
  }

  /**
   * Premium UI indicating the application container is warming up.
   */
  private sendWakingUpPage(res: http.ServerResponse, appId: string): void {
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Refresh': '3' // Auto refresh page every 3 seconds
    });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Waking up App - OneAtlas</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, sans-serif;
              background-color: #0b0f19;
              color: #f3f4f6;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              text-align: center;
            }
            .card {
              background: rgba(255, 255, 255, 0.03);
              backdrop-filter: blur(16px);
              border: 1px solid rgba(255, 255, 255, 0.08);
              padding: 2.5rem;
              border-radius: 16px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
              max-width: 400px;
            }
            .spinner {
              border: 4px solid rgba(255, 255, 255, 0.1);
              width: 48px;
              height: 48px;
              border-radius: 50%;
              border-left-color: #6366f1;
              animation: spin 1s linear infinite;
              margin: 0 auto 1.5rem;
            }
            h2 {
              margin: 0 0 0.5rem;
              font-weight: 600;
              color: #ffffff;
            }
            p {
              color: #9ca3af;
              font-size: 0.95rem;
              margin: 0;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="spinner"></div>
            <h2>Waking up application</h2>
            <p>App <strong>${appId}</strong> has been sleeping. Provisioning resources and starting server...</p>
          </div>
        </body>
      </html>
    `);
  }

  /**
   * Dynamic error screen.
   */
  private sendErrorPage(res: http.ServerResponse, status: number, title: string, message: string): void {
    res.writeHead(status, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - OneAtlas Preview</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, sans-serif;
              background-color: #0b0f19;
              color: #f3f4f6;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              text-align: center;
            }
            .card {
              background: rgba(255, 255, 255, 0.02);
              border: 1px solid rgba(239, 68, 68, 0.2);
              padding: 2.5rem;
              border-radius: 16px;
              max-width: 450px;
            }
            h2 {
              margin: 0 0 1rem;
              font-weight: 600;
              color: #ef4444;
            }
            p {
              color: #9ca3af;
              font-size: 0.95rem;
              line-height: 1.5;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>${title}</h2>
            <p>${message}</p>
          </div>
        </body>
      </html>
    `);
  }
}
export default ProxyRouter;
