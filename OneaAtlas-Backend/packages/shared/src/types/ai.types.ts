// Shared AI types used across packages

export type AIProvider = "anthropic" | "openai" | "google" | "deepseek" | "groq" | "openrouter" | "mistral";

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface CompletionRequest {
  messages: AIMessage[];
  systemPrompt?: string;
  tier?: "fast" | "smart";
  provider?: AIProvider;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
  cacheKey?: string;
  cacheTtl?: number;
  schemaName?: string;
  extractionSchema?: any;
  schema?: any;
  normalizer?: any;
}

export interface CompletionResponse {
  text: string;
  provider: AIProvider;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cached: boolean;
  latencyMs: number;
}

export interface JsonCompletionResponse<T = unknown> extends CompletionResponse {
  data: T;
}

// Type alias for backward compatibility
export type AIRequest = CompletionRequest;
export type AIResponse = CompletionResponse;
