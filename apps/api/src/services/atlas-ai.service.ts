// =============================================================================
// apps/api/src/services/atlas-ai.service.ts
//
// Atlas AI — the right-sidebar chatbot in the OneAtlas builder.
// Handles context-aware completions using the current app's GenerationResult
// as grounding context. Detects modification intents and returns structured
// responses the frontend can act on.
// =============================================================================

import { gateway } from "@oneatlas/ai";
import type { GenerationResult } from "@oneatlas/shared";
import type { ChatMessage } from "./atlas-conversation.service";

// Intent types Atlas AI can detect
export type AtlasIntent =
  | "add_feature"       // "add a dark mode toggle"
  | "modify_component"  // "make the sidebar collapsible"
  | "remove_feature"    // "remove the export button"
  | "change_style"      // "use a blue color scheme"
  | "explain"           // "how does the auth flow work?"
  | "general"           // anything else

export interface AtlasResponse {
  text: string;
  intent: AtlasIntent;
  affectedFiles?: string[];     // which generated files need updating
  requiresRegeneration: boolean; // whether to trigger partial re-gen
}

// Build a concise app summary from the GenerationResult to ground the AI
function buildAppContext(app: GenerationResult): string {
  const pageNames = app.files
    .filter((f) => f.fileType === "page")
    .map((f) => f.filePath)
    .slice(0, 10)
    .join(", ");

  const apiRouteNames = app.files
    .filter((f) => f.fileType === "api-route")
    .map((f) => f.filePath)
    .slice(0, 10)
    .join(", ");

  const entityNames = app.entitySchemas
    ?.map((e: any) => e.name ?? e.entityName)
    .filter(Boolean)
    .join(", ") ?? "none";

  return [
    `App name: ${app.appName}`,
    `Pages: ${pageNames || "none"}`,
    `API routes: ${apiRouteNames || "none"}`,
    `Entities: ${entityNames}`,
    `Default route: ${app.routeConfig?.defaultRoute ?? "/"}`,
  ].join("\n");
}

function buildSystemPrompt(appContext: string): string {
  return `You are Atlas AI, a helpful assistant built directly into the OneAtlas app builder.
You help users customize and modify their generated application through natural conversation.

Current app context:
${appContext}

Your responsibilities:
- Answer questions about the app's structure, entities, pages, and API routes
- Suggest and explain changes the user can make
- When the user requests a change, clearly describe what files will be affected
- Keep responses concise and actionable — this is a sidebar chat, not a document editor
- Never output raw code blocks unless the user explicitly asks for code
- Always acknowledge what you understand the user wants before describing what you'll do

When identifying changes, classify your response with one of these intents:
ADD_FEATURE | MODIFY_COMPONENT | REMOVE_FEATURE | CHANGE_STYLE | EXPLAIN | GENERAL

Format your response as plain conversational text. Do not use markdown headers.`;
}

// Simple intent detection from the AI's response text
// Classify intent from the USER's message, not the AI's response.
// Ordered from most specific to least specific.
function detectIntent(userMessage: string): AtlasIntent {
  const lower = userMessage.toLowerCase();

  // Explain / question intent — check first to avoid misclassifying
  // "how does X work" as a modification
  if (
    lower.startsWith("what") ||
    lower.startsWith("how") ||
    lower.startsWith("why") ||
    lower.startsWith("explain") ||
    lower.startsWith("show me how") ||
    lower.includes("what is") ||
    lower.includes("how does") ||
    lower.includes("can you explain")
  ) return "explain";

  // Remove / delete intent
  if (
    lower.startsWith("remove") ||
    lower.startsWith("delete") ||
    lower.startsWith("get rid of") ||
    lower.includes("remove the") ||
    lower.includes("delete the") ||
    lower.includes("don't show") ||
    lower.includes("hide the")
  ) return "remove_feature";

  // Style / visual intent
  if (
    lower.includes("color") ||
    lower.includes("colour") ||
    lower.includes("theme") ||
    lower.includes("dark mode") ||
    lower.includes("light mode") ||
    lower.includes("font") ||
    lower.includes("style") ||
    lower.includes("design") ||
    lower.includes("look and feel") ||
    lower.includes("ui") ||
    lower.includes("layout")
  ) return "change_style";

  // Modify / update existing feature
  if (
    lower.startsWith("change") ||
    lower.startsWith("update") ||
    lower.startsWith("edit") ||
    lower.startsWith("modify") ||
    lower.startsWith("make the") ||
    lower.startsWith("make it") ||
    lower.includes("instead of") ||
    lower.includes("replace") ||
    lower.includes("rename")
  ) return "modify_component";

  // Add / build new feature — broadest catch for action verbs
  if (
    lower.startsWith("add") ||
    lower.startsWith("build") ||
    lower.startsWith("create") ||
    lower.startsWith("implement") ||
    lower.startsWith("include") ||
    lower.startsWith("i want") ||
    lower.startsWith("i need") ||
    lower.startsWith("can you add") ||
    lower.startsWith("can you build") ||
    lower.includes("new page") ||
    lower.includes("new feature") ||
    lower.includes("add a") ||
    lower.includes("add the")
  ) return "add_feature";

  return "general";
}

export class AtlasAIService {
  async chat(
    messages: ChatMessage[],
    appContext: GenerationResult | null,
    projectId: string,
  ): Promise<AtlasResponse> {
    const contextString = appContext ? buildAppContext(appContext) : "No app generated yet.";
    const systemPrompt = buildSystemPrompt(contextString);

    // Convert our ChatMessage format to gateway format
    const gatewayMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const result = await gateway.complete({
      messages: gatewayMessages,
      systemPrompt,
      tier: "smart",
      temperature: 0.5,
      maxTokens: 1024,
      cacheKey: `atlas:${projectId}:${messages.length}`,
    });

    const text = result.text;

    // Classify intent from the last user message, not the AI's response
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const intent = detectIntent(lastUserMessage);
    const requiresRegeneration = ["add_feature", "modify_component", "remove_feature", "change_style"].includes(intent);

    return {
      text,
      intent,
      requiresRegeneration,
    };
  }
}