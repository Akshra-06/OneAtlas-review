// =============================================================================
// apps/api/src/services/ai.service.ts
// AI orchestration service.
// =============================================================================

import {
  ModelRouter,
  UnderstandingOrchestrator,
  diagnoseError,
  type ErrorDiagnostic,
} from "@oneatlas/ai";
import type { AppUnderstanding } from "@oneatlas/shared";

export class AIService {
  async understandPrompt(prompt: string): Promise<AppUnderstanding> {
    const router = new ModelRouter();
    const orchestrator = new UnderstandingOrchestrator(router);
    const result = await orchestrator.process(prompt);
    return result.data;
  }

  async diagnose(error: unknown): Promise<ErrorDiagnostic> {
    return diagnoseError(error);
  }
}
