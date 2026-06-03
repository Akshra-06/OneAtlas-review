const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001/api/v1";

export interface ChatResult {
  intent: string;
  requiresRegeneration: boolean;
  fullText: string;
}

export async function chatWithAtlas(
  orgId: string,
  projectId: string,
  message: string,
) {

    console.log("API_URL:", API_URL);
console.log(
  "CHAT URL:",
  `${API_URL}/orgs/${orgId}/projects/${projectId}/chat`
);
  const response = await fetch(
    `${API_URL}/orgs/${orgId}/projects/${projectId}/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        message,
      }),
    }
  );

  if (!response.ok || !response.body) {
    throw new Error(
      `Chat request failed: ${response.status}`
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { done, value } =
      await reader.read();

    if (done) break;

    buffer += decoder.decode(value, {
      stream: true,
    });

    const events =
      buffer.split("\n\n");

    buffer = events.pop() ?? "";

    for (const event of events) {
      const lines =
        event.split("\n");

      const eventName =
        lines.find((line) =>
          line.startsWith("event: ")
        )?.slice(7).trim();

      const data =
        lines.find((line) =>
          line.startsWith("data: ")
        )?.slice(6);

      if (
        eventName === "done" &&
        data
      ) {
        return JSON.parse(
          data
        ) as ChatResult;
      }

      if (
        eventName === "error" &&
        data
      ) {
        throw new Error(data);
      }
    }
  }

  throw new Error(
    "Chat ended unexpectedly"
  );
}