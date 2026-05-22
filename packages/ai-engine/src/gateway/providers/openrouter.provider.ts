import OpenAI from 'openai';
import { BaseProvider } from './base.provider';
import { ProviderConfig, AIRequest, AIResponse } from '../types/gateway.types';
import { MODELS_CONFIG } from '../config/models.config';
import { PROVIDER_CONFIG } from '../config/provider.config';
import { SafeCompletionExtractor } from './safe-completion';

/**
 * OpenRouter Provider — uses the OpenAI-compatible SDK to access 100+ models.
 */
export class OpenRouterProvider extends BaseProvider {
  readonly name = 'openrouter' as const;
  readonly providerName = 'OPENROUTER' as const;
  private client: OpenAI;

  constructor(config: Partial<ProviderConfig> = {}) {
    const apiKey = config.apiKey || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OpenRouter API key is missing. Set OPENROUTER_API_KEY.");
    }
    super({ ...config, apiKey });
    this.client = new OpenAI({
      apiKey,
      baseURL: PROVIDER_CONFIG.OPENROUTER.BASE_URL,
      defaultHeaders: {
        'HTTP-Referer': 'https://oneatlas.dev', // Required by OpenRouter
        'X-Title': 'OneAtlas.dev',            // Required by OpenRouter
      },
      timeout: config.timeoutMs || PROVIDER_CONFIG.OPENROUTER.TIMEOUT_MS,
      maxRetries: config.maxRetries ?? PROVIDER_CONFIG.OPENROUTER.MAX_RETRIES,
    });
  }

  async generate<T>(request: AIRequest<T>): Promise<AIResponse<T>> {
    const model = MODELS_CONFIG.OPENROUTER[request.modelTier || 'CAPABLE'];

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.prompt });

    try {
      const completion = await this.client.chat.completions.create({
        model,
        messages,
        temperature: request.temperature ?? 0.2,
        max_tokens: request.maxTokens,
        ...(request.schema ? { response_format: { type: 'json_object' } } : {}),
      });

      // PRINCIPAL FIX: Use safe extractor to prevent "choices[0]" TypeErrors
      const content = SafeCompletionExtractor.extractOpenAI(completion, 'OPENROUTER');

      return {
        content,
        parsedOutput: undefined,
        usage: SafeCompletionExtractor.extractUsage(completion),
        model: completion.model || model,
      };
    } catch (error) {
      console.error('[OpenRouterProvider] Generation failed:', error);
      throw error;
    }
  }
}
