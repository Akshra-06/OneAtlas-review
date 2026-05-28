export interface AICompleteInput {
  prompt: string;
  model?: string;
  provider?: "anthropic" | "openai" | "google" | "deepseek" | "groq" | "openrouter" | "mistral";
  tier?: "fast" | "smart";
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface AICompleteResult {
  text: string;
  provider: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  cached: boolean;
  latencyMs: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export async function completeAI(input: AICompleteInput): Promise<AICompleteResult> {
  const response = await fetch(`${API_URL}/ai/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok || !response.body) {
    throw new Error(`AI request failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const event of events) {
      const lines = event.split("\n");
      const eventName =
        lines.find((line) => line.startsWith("event: "))?.slice(7).trim() ??
        "message";
      const data = lines
        .find((line) => line.startsWith("data: "))
        ?.slice(6)
        .trim();

      if (eventName === "done" && data) {
        const parsed = JSON.parse(data) as {
          data?: AICompleteResult;
        };
        if (parsed.data) return parsed.data;
      }

      if (eventName === "error" && data) {
        const parsed = JSON.parse(data) as {
          error?: string;
        };
        throw new Error(parsed.error ?? "AI request failed");
      }
    }
  }

  throw new Error("AI response ended before completion");
}
