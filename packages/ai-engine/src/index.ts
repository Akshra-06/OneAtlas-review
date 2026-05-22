// =============================================================================
// packages/ai-engine/src/index.ts
//
// Entrypoint for @oneatlas/ai-engine
// =============================================================================

// Gateway & Router
export { AIGateway, gateway } from "./gateway/gateway";
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
} from "./gateway/types/gateway.types";
export { AIGatewayError, diagnoseError } from "./gateway/types/gateway.types";

// Providers
export { ClaudeProvider, ClaudeProvider as AnthropicProvider } from "./gateway/providers/claude.provider";
export { OpenAIProvider } from "./gateway/providers/openai.provider";
export { GeminiProvider, GeminiProvider as GoogleProvider } from "./gateway/providers/gemini.provider";
export { DeepSeekProvider } from "./gateway/providers/deepseek.provider";
export { GroqProvider } from "./gateway/providers/groq.provider";
export { OpenRouterProvider } from "./gateway/providers/openrouter.provider";
export { MistralProvider } from "./gateway/providers/mistral.provider";

// Model Router and Config
export { ModelRouter } from "./gateway/router/model.router";
export { getModelId, getModelCost, estimateCostCents } from "./gateway/config/models.config";
export type { ModelTier } from "./gateway/config/models.config";
export { trackUsage, getOrgUsage, getOrgUsageSummary } from "./gateway/usage";

// Prompts
export * from "./prompts";

// Understanding Orchestrator
export { UnderstandingOrchestrator } from "./understanding/orchestrator/understanding.orchestrator";

// Runtime/Golden Template (For code generation & safe fallbacks)
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
} from "./runtime/golden-template";

// Semantic Analysis
export type { DomainKnowledge } from "./semantic/domain-knowledge";
export { domainKnowledgeBase } from "./semantic/domain-knowledge";
export { entityClustering } from "./semantic/entity-clustering";
export { entitySimilarityScorer } from "./semantic/entity-similarity";
export { entityUnderstandingEngine } from "./semantic/entity-understanding";
export { intentClassifier } from "./semantic/intent-classifier";
export { relationshipDetector } from "./semantic/relationship-detector";
export { requirementAnalyzer } from "./semantic/requirement-analyzer";
export { requirementPrioritizer } from "./semantic/requirement-prioritizer";

// Internal Shared Utils/Errors
export * from "./shared/constants/app-types.constants";
export * from "./shared/constants/feature.constants";
export * from "./shared/contracts/app-understanding.contract";
export * from "./shared/errors/ai.errors";
export * from "./shared/errors/validation.errors";
export { logger } from "./shared/utils/logger";
export { tracer } from "./shared/utils/intelligence_trace";
export { JsonUtils } from "./shared/utils/json.utils";
export * from "./shared/utils/token.utils";
export { validateEnv } from "./shared/utils/env.validation";

// Generators
export * from "./generators";

// AI Code Reviewer & Feedback Loop (moved from validation-engine to break cyclic dependency)
export * from "./ai-code-reviewer";
export * from "./feedback-loop";
export * from "./error-corrector";
export * from "./error-pattern-recognizer";

