export type AIProvider = "anthropic" | "openai" | "google" | "deepseek" | "groq" | "openrouter" | "mistral";
export type ModelTier = "fast" | "smart";

export interface EdgeCompletionOptions {
  prompt: string;
  provider: AIProvider;
  model?: string;
  tier?: ModelTier;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface EdgeCompletionResult {
  text: string;
  provider: AIProvider;
  model: string;
  cached: false;
  latencyMs: number;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}

export function inferProviderFromModel(model?: string): AIProvider {
  const value = model?.toLowerCase() ?? "";
  if (value.includes("gemini") || value.includes("google")) return "google";
  if (value.includes("deepseek")) return "deepseek";
  if (value.includes("claude") || value.includes("anthropic")) return "anthropic";
  if (value.includes("groq")) return "groq";
  if (value.includes("mistral")) return "mistral";
  if (value.includes("openrouter")) return "openrouter";
  if (value.includes("gpt") || value.includes("o1") || value.includes("openai")) return "openai";
  return "google";
}

function defaultModel(provider: AIProvider, tier: ModelTier = "fast"): string {
  if (provider === "google") {
    return tier === "smart" ? "gemini-1.5-pro" : "gemini-1.5-flash";
  }
  if (provider === "anthropic") {
    return tier === "smart" ? "claude-sonnet-4-20250514" : "claude-3-5-haiku-20241022";
  }
  if (provider === "groq") {
    return tier === "smart" ? "llama-3.3-70b-versatile" : "llama-3.1-8b-instant";
  }
  if (provider === "deepseek") {
    return "deepseek-chat";
  }
  if (provider === "mistral") {
    return tier === "smart" ? "mistral-large-latest" : "mistral-small-latest";
  }
  if (provider === "openrouter") {
    return tier === "smart" ? "openai/gpt-4o" : "openai/gpt-4o-mini";
  }
  return tier === "smart" ? "gpt-4o" : "gpt-4o-mini";
}

function getKey(provider: AIProvider): string {
  switch (provider) {
    case "google":
      return process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";
    case "openai":
      return process.env.OPENAI_API_KEY || "";
    case "deepseek":
      return process.env.DEEPSEEK_API_KEY || "";
    case "groq":
      return process.env.GROQ_API_KEY || "";
    case "openrouter":
      return process.env.OPENROUTER_API_KEY || "";
    case "mistral":
      return process.env.MISTRAL_API_KEY || "";
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY || "";
  }
}

function getEndpoint(provider: AIProvider, model: string): string {
  switch (provider) {
    case "google":
      return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    case "openai":
      return "https://api.openai.com/v1/chat/completions";
    case "groq":
      return "https://api.groq.com/openai/v1/chat/completions";
    case "deepseek":
      return "https://api.deepseek.com/chat/completions";
    case "openrouter":
      return "https://openrouter.ai/api/v1/chat/completions";
    case "mistral":
      return "https://api.mistral.ai/v1/chat/completions";
    case "anthropic":
      return "https://api.anthropic.com/v1/messages";
  }
}

function buildHeaders(provider: AIProvider, key: string): HeadersInit {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  switch (provider) {
    case "google":
      break;
    case "anthropic":
      headers["x-api-key"] = key;
      headers["anthropic-version"] = "2023-06-01";
      break;
    case "openrouter":
      headers["Authorization"] = `Bearer ${key}`;
      headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://oneatlas.dev";
      headers["X-Title"] = "OneAtlas";
      break;
    default:
      headers["Authorization"] = `Bearer ${key}`;
      break;
  }

  return headers;
}

function extractText(provider: AIProvider, data: unknown): string {
  const payload = data as Record<string, unknown>;

  if (provider === "google") {
    const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
    const first = candidates[0] as Record<string, unknown> | undefined;
    const content = first?.content as Record<string, unknown> | undefined;
    const parts = Array.isArray(content?.parts) ? content?.parts : [];
    return parts
      .map((part) => (part as Record<string, unknown>)?.text)
      .filter((value): value is string => typeof value === "string")
      .join("\n")
      .trim();
  }

  if (provider === "anthropic") {
    const content = Array.isArray(payload.content) ? payload.content : [];
    return content
      .map((part) => (part as Record<string, unknown>)?.text)
      .filter((value): value is string => typeof value === "string")
      .join("\n")
      .trim();
  }

  const choices = Array.isArray(payload.choices) ? payload.choices : [];
  const first = choices[0] as Record<string, unknown> | undefined;
  const message = first?.message as Record<string, unknown> | undefined;
  const content = message?.content;
  if (typeof content === "string") {
    return content.trim();
  }

  return JSON.stringify(data);
}

export async function completeText(options: EdgeCompletionOptions): Promise<EdgeCompletionResult> {
  const startedAt = Date.now();
  const provider = options.provider;
  const model = options.model ?? defaultModel(provider, options.tier ?? "fast");
  const key = getKey(provider);

  if (!key && provider !== "google") {
    throw new Error(`Missing API key for provider: ${provider}`);
  }
  if (provider === "google" && !key) {
    throw new Error("Missing Gemini/Google AI API key");
  }

  const endpoint = getEndpoint(provider, model);

  const messages = [
    ...(options.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []),
    { role: "user", content: options.prompt },
  ] as Array<{ role: string; content: string }>;

  const isGoogle = provider === "google";
  const body = isGoogle
    ? {
        contents: messages.map((message) => ({
          role: message.role === "system" ? "user" : message.role,
          parts: [{ text: `${message.role === "system" ? `SYSTEM: ${message.content}\n\n` : ""}${message.content}` }],
        })),
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 2048,
          responseMimeType: options.jsonMode ? "application/json" : "text/plain",
        },
      }
    : provider === "anthropic"
      ? {
          model,
          max_tokens: options.maxTokens ?? 2048,
          temperature: options.temperature ?? 0.7,
          system: options.systemPrompt,
          messages: [{ role: "user", content: options.prompt }],
        }
      : {
          model,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 2048,
          ...(options.jsonMode ? { response_format: { type: "json_object" } } : {}),
        };

  const response = await fetch(isGoogle ? `${endpoint}?key=${encodeURIComponent(key)}` : endpoint, {
    method: "POST",
    headers: buildHeaders(provider, key),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Provider request failed (${response.status}): ${detail || response.statusText}`);
  }

  const data = (await response.json()) as unknown;
  const text = extractText(provider, data);

  return {
    text,
    provider,
    model,
    cached: false,
    latencyMs: Date.now() - startedAt,
  };
}

export async function completeJson<T>(options: EdgeCompletionOptions): Promise<T> {
  const result = await completeText({ ...options, jsonMode: true });
  const raw = result.text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "");
  return JSON.parse(raw) as T;
}