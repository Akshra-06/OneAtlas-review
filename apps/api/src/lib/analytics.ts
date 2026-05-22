// =============================================================================
// apps/api/src/lib/analytics.ts
//
// PostHog server-side analytics (Edge Compatible).
// Captures key product events for usage tracking and funnel analysis.
//
// Events captured:
//   - project.created
//   - generation.completed
//   - deployment.live
//
// Uses direct HTTP fetch instead of posthog-node to avoid Node.js `crypto`
// dependencies that break Next.js edge runtime builds.
// =============================================================================

function captureEvent(event: string, distinctId: string, properties: Record<string, any>) {
  const key = process.env.POSTHOG_API_KEY;
  if (!key) return;

  const host = process.env.POSTHOG_HOST ?? "https://app.posthog.com";
  
  // Fire and forget
  void fetch(`${host}/capture/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: key,
      event: event,
      distinct_id: distinctId,
      properties: {
        ...properties,
        $lib: "oneatlas-edge-analytics"
      },
      timestamp: new Date().toISOString()
    }),
  }).catch((err) => {
    // Silently fail - analytics should never crash the app
    console.warn("[Analytics] Failed to capture event:", err);
  });
}

interface BaseEventProps {
  distinctId: string; // userId or orgId
  orgId?: string;
  projectId?: string;
}

// ── Event: project.created ────────────────────────────────────────────────────

export interface ProjectCreatedProps extends BaseEventProps {
  projectName: string;
  projectType: string;
  plan: string;
}

export function captureProjectCreated(props: ProjectCreatedProps): void {
  captureEvent("project.created", props.distinctId, {
    org_id:       props.orgId,
    project_id:   props.projectId,
    project_name: props.projectName,
    project_type: props.projectType,
    plan:         props.plan,
  });
}

// ── Event: generation.completed ───────────────────────────────────────────────

export interface GenerationCompletedProps extends BaseEventProps {
  model: string;
  provider: string;
  cached: boolean;
  latencyMs: number;
  pageCount: number;
  apiRouteCount: number;
  tier: "fast" | "smart";
}

export function captureGenerationCompleted(props: GenerationCompletedProps): void {
  captureEvent("generation.completed", props.distinctId, {
    org_id:          props.orgId,
    project_id:      props.projectId,
    model:           props.model,
    provider:        props.provider,
    cached:          props.cached,
    latency_ms:      props.latencyMs,
    page_count:      props.pageCount,
    api_route_count: props.apiRouteCount,
    tier:            props.tier,
  });
}

// ── Event: deployment.live ────────────────────────────────────────────────────

export interface DeploymentLiveProps extends BaseEventProps {
  deploymentId: string;
  deployedUrl: string;
  version: number;
  env: string;
}

export function captureDeploymentLive(props: DeploymentLiveProps): void {
  captureEvent("deployment.live", props.distinctId, {
    org_id:        props.orgId,
    project_id:    props.projectId,
    deployment_id: props.deploymentId,
    deployed_url:  props.deployedUrl,
    version:       props.version,
    env:           props.env,
  });
}
