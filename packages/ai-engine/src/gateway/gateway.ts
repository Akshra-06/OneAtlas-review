// =============================================================================
// packages/ai/src/gateway/gateway.ts
//
// Consolidated entry point for simple AI completions.
// Uses the consolidated provider instances under packages/ai/src/gateway/providers/
// =============================================================================

import {
  AIProvider,
  AIProviderClient,
  CompletionRequest,
  CompletionResponse,
  ErrorDiagnostic,
  GatewayConfig,
  JsonCompletionResponse,
  UsageRecord,
  AIGatewayError,
  diagnoseError,
  LegacyModelTier
} from "./types/gateway.types";
import { ModelTier } from "./config/models.config";

import { ClaudeProvider } from "./providers/claude.provider";
import { OpenAIProvider } from "./providers/openai.provider";
import { GeminiProvider } from "./providers/gemini.provider";
import { DeepSeekProvider } from "./providers/deepseek.provider";
import { GroqProvider } from "./providers/groq.provider";
import { OpenRouterProvider } from "./providers/openrouter.provider";
import { MistralProvider } from "./providers/mistral.provider";

import { getCachedResponse, setCachedResponse } from "@oneatlas/cache-engine";
import { trackUsage } from "./usage";

// ── Default gateway config ────────────────────────────────────────────────────

const DEFAULT_CONFIG: GatewayConfig = {
  defaultProvider:        "groq",
  fallbackProvider:       "openrouter",
  cacheEnabled:           process.env.AI_CACHE_ENABLED !== "false",
  usageTrackingEnabled:   process.env.AI_USAGE_TRACKING !== "false",
  maxRetries:             2,
  retryBaseDelayMs:       500,
};

const FALLBACK_PRIORITY: AIProvider[] = [
  "groq",
  "openrouter",
  "google",
  "deepseek",
  "openai",
  "anthropic",
  "mistral",
];

const PROVIDER_KEY_ENV: Record<AIProvider, string> = {
  groq: "GROQ_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
  google: "GOOGLE_API_KEY", // we also check GOOGLE_AI_API_KEY in isProviderConfigured
  deepseek: "DEEPSEEK_API_KEY",
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  mistral: "MISTRAL_API_KEY",
};

function isProviderConfigured(provider: AIProvider): boolean {
  if (provider === "google") {
    return Boolean(process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY);
  }
  return Boolean(process.env[PROVIDER_KEY_ENV[provider]]);
}

// ── Provider factory ──────────────────────────────────────────────────────────

function buildProvider(name: AIProvider): AIProviderClient {
  switch (name) {
    case "anthropic":  return new ClaudeProvider();
    case "openai":     return new OpenAIProvider();
    case "google":     return new GeminiProvider();
    case "deepseek":   return new DeepSeekProvider();
    case "groq":       return new GroqProvider();
    case "openrouter": return new OpenRouterProvider();
    case "mistral":    return new MistralProvider();
  }
}

function inferProviderFromModel(model?: string): AIProvider | undefined {
  const value = model?.toLowerCase() ?? "";
  if (!value) return undefined;
  if (value.includes("gemini") || value.includes("google")) return "google";
  if (value.includes("deepseek")) return "deepseek";
  if (value.includes("claude") || value.includes("anthropic")) return "anthropic";
  if (value.includes("gpt") || value.includes("o1") || value.includes("openai")) return "openai";
  if (value.includes("groq") || value.includes("llama")) return "groq";
  if (value.includes("openrouter")) return "openrouter";
  if (value.includes("mistral")) return "mistral";
  return undefined;
}

// ── Retry helper ──────────────────────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  baseDelayMs: number,
  onRetry?: (event: { attempt: number; maxRetries: number; delayMs: number; diagnostic: ErrorDiagnostic }) => void,
): Promise<T> {
  let lastErr: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;

      const diagnosis = diagnoseError(err);
      
      console.warn(`[AIGateway Retry] Attempt ${attempt} failed. Diagnosis: ${diagnosis.code} (Retryable: ${diagnosis.retryable})`);

      if (!diagnosis.retryable || attempt === maxRetries) break;

      const delay = baseDelayMs * Math.pow(2, attempt); // exponential backoff
      onRetry?.({ attempt: attempt + 1, maxRetries, delayMs: delay, diagnostic: diagnosis });
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastErr;
}

// ── Gateway class ─────────────────────────────────────────────────────────────

export class AIGateway {
  private readonly config: GatewayConfig;

  constructor(config: Partial<GatewayConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ── Main completion ─────────────────────────────────────────────────────────

  async complete(req: CompletionRequest): Promise<CompletionResponse> {
    const tier = req.tier ?? "smart";

    // 1. Cache check
    if (this.config.cacheEnabled && req.cacheKey) {
      const cached = await getCachedResponse(req.cacheKey) as unknown as CompletionResponse | null;
      if (cached) {
        return { ...cached, cached: true, latencyMs: 0 };
      }
    }

    // 2. Determine provider order based on availability and priority
    const requestedProvider = req.provider ?? inferProviderFromModel(req.model);

    const activeProviders = FALLBACK_PRIORITY.filter(isProviderConfigured);
    let providers = requestedProvider && isProviderConfigured(requestedProvider)
      ? [requestedProvider, ...activeProviders.filter((p) => p !== requestedProvider)]
      : activeProviders;

    if (providers.length === 0 && isProviderConfigured(this.config.defaultProvider)) {
      providers = [this.config.defaultProvider];
      if (this.config.fallbackProvider && isProviderConfigured(this.config.fallbackProvider)) {
        providers.push(this.config.fallbackProvider);
      }
    }

    providers = Array.from(new Set(providers));

    if (providers.length === 0) {
      throw new AIGatewayError(
        `No AI providers are configured. Set one of: ${Object.values(PROVIDER_KEY_ENV).join(", ")}`,
        requestedProvider ?? this.config.defaultProvider,
        undefined,
        false,
        "PROVIDER_NOT_CONFIGURED",
      );
    }

    console.log(`[AIGateway] Determined provider search path: ${providers.join(" -> ")}`);

    let response: CompletionResponse | null = null;
    let lastError: unknown;

    for (let i = 0; i < providers.length; i++) {
      const providerName = providers[i];
      if (!providerName) continue;
      try {
        console.log(`[AIGateway] Trying provider ${providerName} (Attempt ${i + 1}/${providers.length})...`);
        const client = buildProvider(providerName);
        req.onProviderSelected?.({
          provider: providerName,
          model: req.model,
          attempt: i + 1,
          totalProviders: providers.length,
          providerOrder: providers,
        });

        response = await withRetry(
          async () => {
            const candidate = await client.complete(req);
            if (!candidate.text || !candidate.text.trim()) {
              throw new AIGatewayError(
                `${providerName} returned an empty response with no generated text.`,
                providerName,
                undefined,
                false,
                "MALFORMED_RESPONSE",
              );
            }
            return candidate;
          },
          this.config.maxRetries,
          this.config.retryBaseDelayMs,
          (event) => req.onProviderRetry?.({
            provider: providerName,
            ...event,
          }),
        );

        console.log(`[AIGateway] Provider ${providerName} completed successfully.`);
        break; // success — stop trying providers
      } catch (err: any) {
        lastError = err;
        const nextProviderName = providers[i + 1];
        const diagnosis = diagnoseError(err);
        console.error(`[AIGateway] Provider ${providerName} failed: ${err instanceof Error ? err.message : String(err)}`);
        
        if (req.onFallback) {
          try {
            req.onFallback(providerName, err, nextProviderName, diagnosis);
          } catch (callbackErr) {
            console.error("[AIGateway] Failed to execute onFallback callback:", callbackErr);
          }
        }
      }
    }

    if (!response) {
      const primary = requestedProvider ?? this.config.defaultProvider;
      throw new AIGatewayError(
        `All AI providers failed. Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
        primary,
        undefined,
        false,
      );
    }

    // 3. Cache the successful response
    if (this.config.cacheEnabled && req.cacheKey) {
      void setCachedResponse(req.cacheKey, response as any, req.cacheTtl ?? 3600);
    }

    // 4. Usage tracking (fire-and-forget)
    if (this.config.usageTrackingEnabled) {
      const usageRecord: UsageRecord = {
        provider:         response.provider,
        model:            response.model,
        promptTokens:     response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        totalTokens:      response.usage.totalTokens,
        tier,
        cached:           false,
        latencyMs:        response.latencyMs,
        timestamp:        new Date().toISOString(),
      };
      void trackUsage(usageRecord);
    }

    return response;
  }

  // ── JSON completion — parse and return typed data ───────────────────────────

  async completeJson<T = unknown>(
    req: CompletionRequest,
  ): Promise<JsonCompletionResponse<T>> {
    const res = await this.complete({ ...req, jsonMode: true });

    let data: T;
    try {
      const clean = res.text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      data = JSON.parse(clean) as T;
    } catch {
      throw new AIGatewayError(
        `AI returned malformed JSON. Raw text: ${res.text.slice(0, 200)}`,
        res.provider,
        undefined,
        false,
        "MALFORMED_RESPONSE",
      );
    }

    return { ...res, data };
  }

  // ── Convenience: text-only shorthand ───────────────────────────────────────

  async ask(
    prompt: string,
    options: Omit<CompletionRequest, "messages"> = {},
  ): Promise<string> {
    const res = await this.complete({
      ...options,
      messages: [{ role: "user", content: prompt }],
    });
    return res.text;
  }
}

// ── Singleton gateway (shared across the app) ─────────────────────────────────

export const gateway = new AIGateway();
