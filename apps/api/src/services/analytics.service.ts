// =============================================================================
// apps/api/src/services/analytics.service.ts
// Analytics orchestration service.
// =============================================================================

import {
  captureDeploymentLive,
  captureGenerationCompleted,
  captureProjectCreated,
  type DeploymentLiveProps,
  type GenerationCompletedProps,
  type ProjectCreatedProps,
} from "../lib/analytics";

export class AnalyticsService {
  async trackProjectCreated(props: ProjectCreatedProps): Promise<void> {
    captureProjectCreated(props);
  }

  async trackGenerationCompleted(
    props: GenerationCompletedProps
  ): Promise<void> {
    captureGenerationCompleted(props);
  }

  async trackDeploymentLive(props: DeploymentLiveProps): Promise<void> {
    captureDeploymentLive(props);
  }
}
