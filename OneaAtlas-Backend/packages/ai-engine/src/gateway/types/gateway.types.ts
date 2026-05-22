import { z } from 'zod';
import { ModelTier } from '../config/models.config';

// ── Provider identifiers ──────────────────────────────────────────────────────

export type AIProvider = "anthropic" | "openai" | "google" | "deepseek" | "groq" | "openrouter" | "mistral";

// ── Tier determines which model to pick ──────────────────────────────────────

export type LegacyModelTier = "fast" | "smart";

// ── Message format (normalized, OpenAI-compatible) ───────────────────────────

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// ── Completion request ────────────────────────────────────────────────────────

export interface CompletionRequest {
  messages: AIMessage[];
  systemPrompt?: string;
  /**
   * Which tier to use. Gateway picks the right model per provider.
   * Default: "smart"
   */
  tier?: LegacyModelTier | ModelTier;
  /**
   * Explicit provider override. If omitted the gateway infers it from `model`
   * or falls back to the configured default provider.
   */
  provider?: AIProvider;
  /**
   * Explicit model override. When provided, providers use this exact model ID.
   * Useful for frontend model pickers (for example: gemini-1.5-flash).
   */
  model?: string;
  /**
   * Max output tokens. Default: 4096.
   */
  maxTokens?: number;
  /**
   * 0–1 temperature. Default: 0.2 for generation tasks.
   */
  temperature?: number;
  /**
   * If true, force JSON output (adds system instruction + validates).
   */
  jsonMode?: boolean;
  /**
   * Optional cache key. If provided, response is cached in Redis.
   * Use a deterministic string (e.g. hash of prompt).
   */
  cacheKey?: string;
  /**
   * Cache TTL in seconds. Default: 3600 (1 hr).
   */
  cacheTtl?: number;
  /**
   * Optional callback triggered when a provider fails and is falling back.
   */
  onFallback?: (
    provider: AIProvider,
    error: any,
    nextProvider?: AIProvider,
    diagnostic?: ErrorDiagnostic,
  ) => void;
  /**
   * Optional callback triggered before a provider is attempted.
   */
  onProviderSelected?: (event: ProviderSelectionEvent) => void;
  /**
   * Optional callback triggered when retrying a transient failure on the same provider.
   */
  onProviderRetry?: (event: ProviderRetryEvent) => void;
}

// ── Completion response ───────────────────────────────────────────────────────

export interface CompletionResponse {
  text: string;
  provider: AIProvider;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** True if the response was served from cache */
  cached: boolean;
  /** Wall-clock latency in ms (0 if cached) */
  latencyMs: number;
}

// ── Structured JSON completion ────────────────────────────────────────────────

export interface JsonCompletionResponse<T = unknown> extends CompletionResponse {
  data: T;
}

// ── Token usage tracking ─────────────────────────────────────────────────────

export interface UsageRecord {
  provider: AIProvider;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  tier: LegacyModelTier | ModelTier;
  cached: boolean;
  latencyMs: number;
  timestamp: string;
  /** Optional org/project for per-tenant tracking */
  orgId?: string;
  projectId?: string;
}

// ── Gateway config ────────────────────────────────────────────────────────────

export interface GatewayConfig {
  /** Primary provider to try first */
  defaultProvider: AIProvider;
  /** Fallback provider if primary fails */
  fallbackProvider?: AIProvider;
  /** Enable Redis response caching */
  cacheEnabled: boolean;
  /** Log all completions for cost tracking */
  usageTrackingEnabled: boolean;
  /** Max retry attempts per provider */
  maxRetries: number;
  /** Base delay for exponential backoff (ms) */
  retryBaseDelayMs: number;
}

// ── Provider interface ────────────────────────────────────────────────────────

export interface AIProviderClient {
  readonly name: AIProvider;
  complete(req: CompletionRequest): Promise<CompletionResponse>;
}

// ── Team 3 Router Configuration & Types ──────────────────────────────────────

export interface ProviderConfig {
  apiKey: string;
  maxRetries?: number;
  timeoutMs?: number;
}

export interface AIRequest<T = any, E = any> {
  prompt: string;
  systemPrompt?: string;
  modelTier?: ModelTier;
  temperature?: number;
  maxTokens?: number;
  schema?: z.ZodSchema<T>;
  extractionSchema?: z.ZodSchema<E>;
  normalizer?: (extracted: E) => any;
  schemaName?: string;
  schemaDescription?: string;
}

export interface AIResponse<T = any> {
  content: string;
  parsedOutput?: T;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

// ── Error types & Diagnostics ─────────────────────────────────────────────────

export type DiagnosticCode =
  | "INVALID_API_KEY"
  | "INSUFFICIENT_BALANCE"
  | "RATE_LIMITING"
  | "TIMEOUT"
  | "PROVIDER_UNAVAILABLE"
  | "MALFORMED_RESPONSE"
  | "STREAMING_INTERRUPTION"
  | "PROVIDER_NOT_CONFIGURED"
  | "UNKNOWN_ERROR";

export interface ErrorDiagnostic {
  code: DiagnosticCode;
  message: string;
  retryable: boolean;
}

export interface ProviderSelectionEvent {
  provider: AIProvider;
  model?: string;
  attempt: number;
  totalProviders: number;
  providerOrder: AIProvider[];
}

export interface ProviderRetryEvent {
  provider: AIProvider;
  attempt: number;
  maxRetries: number;
  delayMs: number;
  diagnostic: ErrorDiagnostic;
}

function getStatusCode(err: any): number | undefined {
  return err?.statusCode ?? err?.status ?? err?.response?.status;
}

export function diagnoseError(err: any): ErrorDiagnostic {
  const msg = (err instanceof Error ? err.message : String(err)) || "";
  const lowerMsg = msg.toLowerCase();
  const statusCode = getStatusCode(err);
  
  let code: DiagnosticCode = "UNKNOWN_ERROR";
  let displayMessage = msg;
  let retryable = false;

  // 1. Timeout
  if (lowerMsg.includes("timeout") || lowerMsg.includes("timed out") || lowerMsg.includes("abort")) {
    code = "TIMEOUT";
    displayMessage = "Request timed out. The provider took too long to respond.";
    retryable = true;
  }
  // 2. Insufficient Balance
  else if (
    statusCode === 402 ||
    lowerMsg.includes("insufficient balance") ||
    lowerMsg.includes("insufficient_balance") ||
    lowerMsg.includes("quota") ||
    lowerMsg.includes("billing") ||
    lowerMsg.includes("credit") ||
    lowerMsg.includes("balance") ||
    lowerMsg.includes("402")
  ) {
    code = "INSUFFICIENT_BALANCE";
    displayMessage = "Insufficient balance or quota exceeded on the AI provider account.";
    retryable = false;
  }
  // 3. Invalid API Key
  else if (
    statusCode === 401 ||
    statusCode === 403 ||
    lowerMsg.includes("invalid api key") ||
    lowerMsg.includes("api_key") ||
    lowerMsg.includes("unauthorized") ||
    lowerMsg.includes("auth") ||
    lowerMsg.includes("invalid key")
  ) {
    code = "INVALID_API_KEY";
    displayMessage = "Invalid API key or unauthorized request. Please check key configuration.";
    retryable = false;
  }
  // 4. Rate Limiting
  else if (
    statusCode === 429 ||
    lowerMsg.includes("rate limit") ||
    lowerMsg.includes("too many requests") ||
    lowerMsg.includes("throttled")
  ) {
    code = "RATE_LIMITING";
    displayMessage = "AI provider rate limit reached. Throttling request.";
    retryable = true;
  }
  // 5. Provider not configured
  else if (
    lowerMsg.includes("api_key is not configured") ||
    lowerMsg.includes("api key is not configured") ||
    lowerMsg.includes("not configured")
  ) {
    code = "PROVIDER_NOT_CONFIGURED";
    displayMessage = "AI provider is not configured. Add the provider API key or remove it from the route.";
    retryable = false;
  }
  // 6. Malformed response
  else if (
    lowerMsg.includes("malformed") ||
    lowerMsg.includes("invalid json") ||
    lowerMsg.includes("empty response") ||
    lowerMsg.includes("missing generated text")
  ) {
    code = "MALFORMED_RESPONSE";
    displayMessage = "AI provider returned a malformed or empty response.";
    retryable = false;
  }
  // 7. Streaming interruption
  else if (
    lowerMsg.includes("stream interrupted") ||
    lowerMsg.includes("streaming interruption") ||
    lowerMsg.includes("connection closed before completion") ||
    lowerMsg.includes("response stream")
  ) {
    code = "STREAMING_INTERRUPTION";
    displayMessage = "The AI response stream was interrupted before completion.";
    retryable = true;
  }
  // 8. Provider Unavailable
  else if (
    (statusCode && statusCode >= 500) ||
    lowerMsg.includes("unavailable") ||
    lowerMsg.includes("bad gateway") ||
    lowerMsg.includes("gateway timeout") ||
    lowerMsg.includes("service unavailable") ||
    lowerMsg.includes("connection") ||
    lowerMsg.includes("fetch failed")
  ) {
    code = "PROVIDER_UNAVAILABLE";
    displayMessage = "AI provider is currently unavailable or returned a server error.";
    retryable = true;
  }

  return { code, message: displayMessage, retryable };
}

export class AIGatewayError extends Error {
  public readonly diagnosticCode: DiagnosticCode;
  public readonly displayMessage: string;

  constructor(
    message: string,
    public readonly provider: AIProvider,
    public readonly statusCode?: number,
    public readonly retryable: boolean = false,
    diagnosticCode?: DiagnosticCode,
  ) {
    super(message);
    this.name = "AIGatewayError";
    
    // Classify the error using diagnoseError
    const diagnosis = diagnosticCode
      ? { code: diagnosticCode, message, retryable }
      : diagnoseError(this);
    this.diagnosticCode = diagnosis.code;
    this.displayMessage = diagnosis.message;
  }
}
