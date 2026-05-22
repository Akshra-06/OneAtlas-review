import OpenAI from 'openai';
import { BaseProvider } from './base.provider';
import { ProviderConfig, AIRequest, AIResponse } from '../types/gateway.types';
import { MODELS_CONFIG } from '../config/models.config';
import { PROVIDER_CONFIG } from '../config/provider.config';
import { SafeCompletionExtractor } from './safe-completion';

/**
 * Groq Provider — uses the OpenAI-compatible SDK pointed at Groq's inference API.
 * Groq delivers ultra-low latency inference (often 10-20x faster than OpenAI).
 *
 * KEY DESIGN DECISION:
 * Groq does NOT support OpenAI-style Structured Outputs schema enforcement.
 * We use JSON mode and deliberately do NOT call schema.parse() inside generate().
 * Instead, we always return raw content so the ValidationOrchestrator
 * owns the parse → validate → recover flow completely.
 * This is critical: if we throw here, the Recovery pipeline never gets a chance to run.
 */
export class GroqProvider extends BaseProvider {
  readonly name = 'groq' as const;
  readonly providerName = 'GROQ' as const;
  private client: OpenAI;

  constructor(config: Partial<ProviderConfig> = {}) {
    const apiKey = config.apiKey || process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("Groq API key is missing. Set GROQ_API_KEY.");
    }
    super({ ...config, apiKey });
    this.client = new OpenAI({
      apiKey,
      baseURL: PROVIDER_CONFIG.GROQ.BASE_URL,
      timeout: config.timeoutMs ?? PROVIDER_CONFIG.GROQ.TIMEOUT_MS,
      maxRetries: config.maxRetries ?? PROVIDER_CONFIG.GROQ.MAX_RETRIES,
    });
  }

  async generate<T>(request: AIRequest<T>): Promise<AIResponse<T>> {
    const model = MODELS_CONFIG.GROQ[request.modelTier || 'CAPABLE'];

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.prompt });

    const completion = await this.client.chat.completions.create({
      model,
      messages,
      temperature: request.temperature ?? 0.2,
      max_tokens: request.maxTokens,
      // Groq JSON mode: instructs model to output JSON, but does NOT enforce schema shape.
      // Shape validation + recovery happens in ValidationOrchestrator.
      ...(request.schema ? { response_format: { type: 'json_object' } } : {}),
    });

    // PRINCIPAL FIX: Use safe extractor to prevent "choices[0]" TypeErrors
    const content = SafeCompletionExtractor.extractOpenAI(completion, 'GROQ');

    // Intentionally return raw content without parsing.
    // ValidationOrchestrator calls schema.parse() and triggers recovery on failures.
    return {
      content,
      parsedOutput: undefined,
      usage: SafeCompletionExtractor.extractUsage(completion),
      model: completion.model || model,
    };
  }
}
