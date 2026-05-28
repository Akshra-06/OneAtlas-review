const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export interface GeneratePayload {
  prompt: string;
  model: "FAST" | "SMART";
  regenerateParts?: string[];
}

export type GenerateEventData = Record<string, unknown>;

export async function generateApp(
  orgId: string,
  projectId: string,
  token: string,
  payload: GeneratePayload,
  signal: AbortSignal,
  onEvent: (event: string, data: GenerateEventData) => void,
  onDone: () => void,
  onError: (error: string) => void
) {
  try {
    const response = await fetch(`${API_URL}/orgs/${orgId}/projects/${projectId}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      onError(`Generation failed: ${response.statusText}`);
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      onError("No response stream");
      return;
    }

    let buffer = "";
    let sawDone = false;
    let sawError = false;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || "";
      
      for (const part of parts) {
        const lines = part.split('\n');
        let eventName = 'message';
        let data = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) eventName = line.slice(7).trim();
          if (line.startsWith('data: ')) data = line.slice(6).trim();
        }
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (eventName === "done") sawDone = true;
            if (eventName === "error") sawError = true;
            onEvent(
              eventName,
              parsed && typeof parsed === "object"
                ? (parsed as GenerateEventData)
                : { value: parsed }
            );
          } catch {
            console.error("Failed to parse SSE data", data);
          }
        }
      }
    }
    if (sawDone && !sawError) {
      onDone();
    } else if (!sawDone && !sawError) {
      onError("Streaming interruption: connection closed before completion");
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      console.log("Generation aborted by user.");
    } else {
      onError("Network error or connection lost");
    }
  }
}
