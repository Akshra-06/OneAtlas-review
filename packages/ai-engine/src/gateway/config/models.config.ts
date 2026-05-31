/**
 * Central AI model registry for OneAtlas.dev
 *
 * Philosophy:
 * - FAST       → low latency / cheap inference
 * - CAPABLE    → balanced reasoning + generation
 * - REASONING  → deep planning / architecture / workflows
 */

export const MODELS_CONFIG = {
  OPENAI: {
    FAST: "gpt-4.1-mini",
    CAPABLE: "gpt-4.1",
    REASONING: "o4-mini",
  },

  ANTHROPIC: {
    FAST: "claude-3-5-haiku-latest",
    CAPABLE: "claude-sonnet-4-0",
    REASONING: "claude-opus-4-1",
  },

  GEMINI: {
    FAST: "gemini-2.5-flash",
    CAPABLE: "gemini-2.5-pro-preview-tts",
    REASONING: "gemini-2.5-pro-preview-tts",
  },

  GROQ: {
    FAST: "llama-3.1-8b-instant",
    CAPABLE: "openai/gpt-oss-120b",
    REASONING: "openai/gpt-oss-120b",
  },

  MISTRAL: {
    FAST: "mistral-small-latest",
    CAPABLE: "mistral-large-latest",
    REASONING: "mistral-large-latest",
  },

  DEEPSEEK: {
    FAST: "deepseek-chat",
    CAPABLE: "deepseek-chat",
    REASONING: "deepseek-reasoner",
  },

  OPENROUTER: {
    FAST: "meta-llama/llama-4-scout:free",
    CAPABLE: "meta-llama/llama-4-maverick:free",
    REASONING: "deepseek/deepseek-r1:free",
  },
} as const;

export type ProviderName = keyof typeof MODELS_CONFIG;

export type ModelTier = "FAST" | "CAPABLE" | "REASONING";

export interface ModelCapabilities {
  supportsVision?: boolean;
  supportsStructuredOutputs?: boolean;
  supportsToolCalling?: boolean;
  supportsReasoning?: boolean;
  supportsStreaming?: boolean;
  supportsJSONMode?: boolean;
  supportsLongContext?: boolean;
  structuredOutputReliability?: "LOW" | "MEDIUM" | "HIGH";
  maxContextWindow?: number;
  maxOutputTokens?: number;
}

export const MODEL_CAPABILITIES: Record<string, ModelCapabilities> = {
  // ───────────────── OpenAI ─────────────────

  "gpt-4.1-mini": {
    supportsVision: true,
    supportsStructuredOutputs: true,
    supportsToolCalling: true,
    supportsReasoning: true,
    supportsStreaming: true,
    supportsJSONMode: true,
    supportsLongContext: true,
    structuredOutputReliability: "HIGH",
    maxContextWindow: 128_000,
    maxOutputTokens: 16_384,
  },

  "gpt-4.1": {
    supportsVision: true,
    supportsStructuredOutputs: true,
    supportsToolCalling: true,
    supportsReasoning: true,
    supportsStreaming: true,
    supportsJSONMode: true,
    supportsLongContext: true,
    structuredOutputReliability: "HIGH",
    maxContextWindow: 128_000,
    maxOutputTokens: 32_768,
  },

  "o4-mini": {
    supportsStructuredOutputs: true,
    supportsToolCalling: true,
    supportsReasoning: true,
    supportsStreaming: true,
    supportsJSONMode: true,
    supportsLongContext: true,
    structuredOutputReliability: "HIGH",
    maxContextWindow: 200_000,
    maxOutputTokens: 100_000,
  },

  // ───────────────── Anthropic ─────────────────

  "claude-3-5-haiku-latest": {
    supportsVision: true,
    supportsStructuredOutputs: true,
    supportsToolCalling: true,
    supportsStreaming: true,
    supportsJSONMode: true,
    structuredOutputReliability: "HIGH",
    maxContextWindow: 200_000,
    maxOutputTokens: 8_192,
  },

  "claude-sonnet-4-0": {
    supportsVision: true,
    supportsStructuredOutputs: true,
    supportsToolCalling: true,
    supportsReasoning: true,
    supportsStreaming: true,
    supportsJSONMode: true,
    supportsLongContext: true,
    structuredOutputReliability: "HIGH",
    maxContextWindow: 200_000,
    maxOutputTokens: 16_384,
  },

  "claude-opus-4-1": {
    supportsVision: true,
    supportsStructuredOutputs: true,
    supportsToolCalling: true,
    supportsReasoning: true,
    supportsStreaming: true,
    supportsJSONMode: true,
    supportsLongContext: true,
    structuredOutputReliability: "HIGH",
    maxContextWindow: 200_000,
    maxOutputTokens: 32_768,
  },

  // ───────────────── Gemini ─────────────────

  "gemini-2.5-flash": {
    supportsVision: true,
    supportsStructuredOutputs: true,
    supportsToolCalling: true,
    supportsStreaming: true,
    supportsJSONMode: true,
    supportsLongContext: true,
    structuredOutputReliability: "MEDIUM",
    maxContextWindow: 1_000_000,
    maxOutputTokens: 8_192,
  },

  "gemini-2.5-pro-preview-tts": {
    supportsVision: true,
    supportsStructuredOutputs: true,
    supportsToolCalling: true,
    supportsReasoning: true,
    supportsStreaming: true,
    supportsJSONMode: true,
    supportsLongContext: true,
    structuredOutputReliability: "HIGH",
    maxContextWindow: 1_000_000,
    maxOutputTokens: 65_536,
  },

  // ───────────────── Groq ─────────────────

  "llama-3.1-8b-instant": {
    supportsStreaming: true,
    supportsJSONMode: true,
    structuredOutputReliability: "MEDIUM",
    maxContextWindow: 128_000,
    maxOutputTokens: 8_192,
  },

  "llama-3.3-70b-versatile": {
    supportsStreaming: true,
    supportsJSONMode: true,
    supportsReasoning: true,
    structuredOutputReliability: "MEDIUM",
    maxContextWindow: 128_000,
    maxOutputTokens: 32_768,
  },

  "openai/gpt-oss-120b": {
    supportsStreaming: true,
    supportsReasoning: true,
    supportsJSONMode: true,
    structuredOutputReliability: "HIGH",
    maxContextWindow: 128_000,
    maxOutputTokens: 32_768,
  },

  // ───────────────── Mistral ─────────────────

  "mistral-small-latest": {
    supportsStructuredOutputs: true,
    supportsToolCalling: true,
    supportsStreaming: true,
    supportsJSONMode: true,
    structuredOutputReliability: "HIGH",
    maxContextWindow: 32_768,
    maxOutputTokens: 8_192,
  },

  "mistral-large-latest": {
    supportsStructuredOutputs: true,
    supportsToolCalling: true,
    supportsStreaming: true,
    supportsJSONMode: true,
    structuredOutputReliability: "HIGH",
    maxContextWindow: 128_000,
    maxOutputTokens: 8_192,
  },

  // ───────────────── DeepSeek ─────────────────

  "deepseek-chat": {
    supportsStructuredOutputs: true,
    supportsStreaming: true,
    supportsJSONMode: true,
    structuredOutputReliability: "HIGH",
    maxContextWindow: 64_000,
    maxOutputTokens: 8_192,
  },

  "deepseek-reasoner": {
    supportsReasoning: true,
    supportsStructuredOutputs: true,
    supportsStreaming: true,
    supportsJSONMode: true,
    structuredOutputReliability: "HIGH",
    maxContextWindow: 64_000,
    maxOutputTokens: 32_768,
  },

  // ───────────────── OpenRouter ─────────────────

  "meta-llama/llama-4-scout:free": {
    supportsStreaming: true,
    supportsStructuredOutputs: true,
    supportsToolCalling: true,
    supportsJSONMode: true,
    supportsLongContext: true,
    structuredOutputReliability: "MEDIUM",
    maxContextWindow: 512_000,
    maxOutputTokens: 16_384,
  },
  "meta-llama/llama-4-maverick:free": {
    supportsStreaming: true,
    supportsStructuredOutputs: true,
    supportsToolCalling: true,
    supportsJSONMode: true,
    supportsLongContext: true,
    structuredOutputReliability: "MEDIUM",
    maxContextWindow: 1_000_000,
    maxOutputTokens: 32_768,
  },
  "deepseek/deepseek-r1:free": {
    supportsStreaming: true,
    supportsReasoning: true,
    supportsJSONMode: true,
    supportsLongContext: true,
    structuredOutputReliability: "HIGH",
    maxContextWindow: 164_000,
    maxOutputTokens: 32_768,
  },
};

// ───────────────── Cost Table (USD / 1M Tokens) ─────────────────

export interface ModelCost {
  inputPer1M: number;
  outputPer1M: number;
}

export const COST_TABLE: Record<string, ModelCost> = {
  // OpenAI
  "gpt-4.1-mini": { inputPer1M: 0.15, outputPer1M: 0.60 },
  "gpt-4.1": { inputPer1M: 5.00, outputPer1M: 15.00 },
  "o4-mini": { inputPer1M: 3.00, outputPer1M: 12.00 },

  // Anthropic
  "claude-3-5-haiku-latest": { inputPer1M: 0.80, outputPer1M: 4.00 },
  "claude-sonnet-4-0": { inputPer1M: 3.00, outputPer1M: 15.00 },
  "claude-opus-4-1": { inputPer1M: 15.00, outputPer1M: 75.00 },

  // Gemini
  "gemini-2.5-flash": { inputPer1M: 0.10, outputPer1M: 0.40 },
  "gemini-2.5-pro-preview-tts": { inputPer1M: 3.50, outputPer1M: 10.50 },

  // Groq
  "llama-3.1-8b-instant": { inputPer1M: 0.05, outputPer1M: 0.08 },
  "llama-3.3-70b-versatile": { inputPer1M: 0.59, outputPer1M: 0.79 },
  "openai/gpt-oss-120b": { inputPer1M: 0.04, outputPer1M: 0.20 },

  // Mistral
  "mistral-small-latest": { inputPer1M: 0.20, outputPer1M: 0.60 },
  "mistral-large-latest": { inputPer1M: 2.00, outputPer1M: 6.00 },

  // DeepSeek
  "deepseek-chat": { inputPer1M: 0.14, outputPer1M: 0.28 },
  "deepseek-reasoner": { inputPer1M: 0.55, outputPer1M: 2.19 },

  // OpenRouter
  "meta-llama/llama-4-scout:free": { inputPer1M: 0, outputPer1M: 0 },
  "meta-llama/llama-4-maverick:free": { inputPer1M: 0, outputPer1M: 0 },
  "deepseek/deepseek-r1:free": { inputPer1M: 0, outputPer1M: 0 },
};

// ───────────────── Public Helpers ─────────────────

export function getModelId(
  provider: string,
  tier: string,
): string {
  let pKey = provider.toUpperCase();

  if (pKey === "GOOGLE") {
    pKey = "GEMINI";
  }

  let tKey = tier.toUpperCase();

  if (tKey === "SMART") {
    tKey = "CAPABLE";
  }

  const providerModels =
    MODELS_CONFIG[pKey as ProviderName];

  if (!providerModels) {
    throw new Error(
      `[models.config] Unknown provider: ${provider}`,
    );
  }

  return (
    (providerModels as any)[tKey] ||
    providerModels.CAPABLE
  );
}

export function getModelCost(model: string): ModelCost {
  return COST_TABLE[model] ?? {
    inputPer1M: 0,
    outputPer1M: 0,
  };
}

export function estimateCostCents(
  model: string,
  promptTokens: number,
  completionTokens: number,
): number {
  const cost = getModelCost(model);

  const inputCost =
    (promptTokens / 1_000_000) * cost.inputPer1M;

  const outputCost =
    (completionTokens / 1_000_000) * cost.outputPer1M;

  return Math.round((inputCost + outputCost) * 100);
}