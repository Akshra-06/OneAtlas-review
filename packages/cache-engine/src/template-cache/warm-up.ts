import type { TemplateCache } from "./template-cache";

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  const entries = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`);
  return `{${entries.join(",")}}`;
}

function hashSchema(entitySchema: Record<string, unknown>): string {
  let hash = 0;
  const text = stableStringify(entitySchema);

  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash) + text.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}

const COMMON_TEMPLATES = [
  {
    orgId: "system",
    projectId: "system",
    templateId: "landing-page",
    entitySchema: {
      kind: "page",
      fields: ["headline", "subheadline", "cta"],
    },
  },
  {
    orgId: "system",
    projectId: "system",
    templateId: "dashboard",
    entitySchema: {
      kind: "page",
      fields: ["summary", "metrics", "activity"],
    },
  },
  {
    orgId: "system",
    projectId: "system",
    templateId: "onboarding",
    entitySchema: {
      kind: "flow",
      fields: ["stepOne", "stepTwo", "stepThree"],
    },
  },
] as const;

export async function warmUpTemplateCache(cache: TemplateCache): Promise<void> {
  void Promise.resolve().then(async () => {
    try {
      await Promise.all(
        COMMON_TEMPLATES.map(async (template) => {
          const key = cache.buildKey(template);
          if (await cache.has(template)) {
            return;
          }

          await cache.set({
            ...template,
            key,
            rendered: {
              templateId: template.templateId,
              warm: true,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ttlMs: 60 * 60 * 1000,
            entitySchemaHash: hashSchema(template.entitySchema),
          });
        })
      );
    } catch {
      // Background warm-up failures are non-fatal.
    }
  });
}
