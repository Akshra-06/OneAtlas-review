// =============================================================================
// apps/api/src/services/ai.service.ts
// AI orchestration service.
// =============================================================================

import {
  gateway,
  ModelRouter,
  UnderstandingOrchestrator,
  diagnoseError,
  type AIProvider,
  type CompletionResponse,
  type ErrorDiagnostic,
} from "@oneatlas/ai";
import type { AppUnderstanding } from "@oneatlas/shared";

export type CompletionTier = "fast" | "smart";

export interface CompleteTextInput {
  prompt: string;
  provider?: AIProvider;
  model?: string;
  tier?: CompletionTier;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  cacheKey?: string;
}

export class AIService {
  async understandPrompt(prompt: string): Promise<AppUnderstanding> {
    const router = new ModelRouter();
    const orchestrator = new UnderstandingOrchestrator(router);
    const result = await orchestrator.process(prompt);
    return result.data;
  }

  async completeText(input: CompleteTextInput): Promise<CompletionResponse> {
    return gateway.complete({
      messages: [{ role: "user", content: input.prompt }],
      systemPrompt: input.systemPrompt,
      provider: input.provider,
      model: input.model,
      tier: input.tier ?? "smart",
      temperature: input.temperature,
      maxTokens: input.maxTokens,
      jsonMode: input.jsonMode,
      cacheKey: input.cacheKey,
    });
  }

  async completeJson<T>(input: CompleteTextInput): Promise<T> {
    const result = await gateway.completeJson<T>({
      messages: [{ role: "user", content: input.prompt }],
      systemPrompt: input.systemPrompt,
      provider: input.provider,
      model: input.model,
      tier: input.tier ?? "smart",
      temperature: input.temperature,
      maxTokens: input.maxTokens,
      cacheKey: input.cacheKey,
    });

    return result.data;
  }

  async diagnose(error: unknown): Promise<ErrorDiagnostic> {
    return diagnoseError(error);
  }
}
