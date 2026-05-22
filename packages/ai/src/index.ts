// =============================================================================
// packages/ai/src/index.ts
//
// The single canonical public entrypoint for OneAtlas AI packages.
// Callers must import from "@oneatlas/ai" directly.
// This is a compatibility shim forwarding to the new modular packages.
// =============================================================================

// Consolidated Gateway Orchestrators
export { AIGateway, gateway } from "@oneatlas/ai-engine";

// Core and Diagnostic Types
export type {
  AIProvider,
  AIProviderClient,
  CompletionRequest,
  CompletionResponse,
  JsonCompletionResponse,
  GatewayConfig,
  ErrorDiagnostic,
  ProviderRetryEvent,
  ProviderSelectionEvent,
  UsageRecord,
  AIRequest,
  AIResponse,
} from "@oneatlas/ai-engine";
export { AIGatewayError, diagnoseError } from "@oneatlas/ai-engine";

// Model Registry Helpers
export { getModelId, getModelCost, estimateCostCents } from "@oneatlas/ai-engine";
export type { ModelTier } from "@oneatlas/ai-engine";

// Usage Tracking & Redis Analytics
export { trackUsage, getOrgUsage, getOrgUsageSummary } from "@oneatlas/ai-engine";

// Cache Utilities
export { getCachedResponse, setCachedResponse, invalidateCachedResponse } from "@oneatlas/cache-engine";

// Consolidated Providers (with Backwards Compatible Aliases)
export { ClaudeProvider as AnthropicProvider, ClaudeProvider } from "@oneatlas/ai-engine";
export { OpenAIProvider } from "@oneatlas/ai-engine";
export { GeminiProvider as GoogleProvider, GeminiProvider } from "@oneatlas/ai-engine";
export { DeepSeekProvider } from "@oneatlas/ai-engine";
export { GroqProvider } from "@oneatlas/ai-engine";
export { OpenRouterProvider } from "@oneatlas/ai-engine";
export { MistralProvider } from "@oneatlas/ai-engine";

// Team 3 Synthesis/Understanding Engine Exports
export { ModelRouter } from "@oneatlas/ai-engine";
export { UnderstandingOrchestrator } from "@oneatlas/ai-engine";
export { PIPELINE_STEPS } from "@oneatlas/workflow-engine";
export type { PipelineContext } from "@oneatlas/workflow-engine";
export { retryService } from "@oneatlas/workflow-engine";
export { runGenerationPipeline } from "@oneatlas/workflow-engine";

// Shared Types
export type { AppUnderstanding } from "@oneatlas/shared";
export type { GenerationResult, GeneratedFile, GeneratedFileType } from "@oneatlas/shared";

// Validation
export { generatedOutputValidator } from "@oneatlas/validation-engine";
export {
  GOLDEN_TEMPLATE_FILES,
  GOLDEN_LOCKED_PATH_EXACT,
  GOLDEN_LOCKED_PATH_PREFIXES,
  FORBIDDEN_CONTENT_PATTERNS,
  getGoldenTemplateFiles,
  hasReactHooks,
  isLockedGeneratedPath,
  safeFallbackForFile,
  sanitizeGeneratedFile,
} from "@oneatlas/ai-engine";

// Phase 2: Preview Validation & Safe Component Registry
export { previewValidator } from "@oneatlas/validation-engine";
export type { PreviewValidationIssue, PreviewValidationResult } from "@oneatlas/validation-engine";
export { safeComponentRegistry } from "@oneatlas/validation-engine";
export type { ComponentRegistryItem } from "@oneatlas/validation-engine";
