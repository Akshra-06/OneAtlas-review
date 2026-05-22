import OpenAI from 'openai';
import { BaseProvider } from './base.provider';
import { ProviderConfig, AIRequest, AIResponse } from '../types/gateway.types';
import { MODELS_CONFIG } from '../config/models.config';
import { PROVIDER_CONFIG } from '../config/provider.config';
import { SafeCompletionExtractor } from './safe-completion';

/**
 * DeepSeek Provider using the OpenAI-compatible SDK.
 */
export class DeepSeekProvider extends BaseProvider {
  readonly name = 'deepseek' as const;
  readonly providerName = 'DEEPSEEK' as const;
  private client: OpenAI;

  constructor(config: Partial<ProviderConfig> = {}) {
    const apiKey = config.apiKey || process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("DeepSeek API key is missing. Set DEEPSEEK_API_KEY.");
    }
    super({ ...config, apiKey });
    this.client = new OpenAI({
      apiKey,
      baseURL: PROVIDER_CONFIG.DEEPSEEK.BASE_URL,
      timeout: config.timeoutMs || PROVIDER_CONFIG.DEEPSEEK.TIMEOUT_MS,
      maxRetries: config.maxRetries ?? PROVIDER_CONFIG.DEEPSEEK.MAX_RETRIES,
    });
  }

  async generate<T>(request: AIRequest<T>): Promise<AIResponse<T>> {
    const model = MODELS_CONFIG.DEEPSEEK[request.modelTier || 'CAPABLE'];

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
        // DeepSeek supports JSON mode for structured outputs.
        ...(request.schema ? { response_format: { type: 'json_object' } } : {}),
      });

      // PRINCIPAL FIX: Use safe extractor to prevent "choices[0]" TypeErrors
      const content = SafeCompletionExtractor.extractOpenAI(completion, 'DEEPSEEK');

      return {
        content,
        parsedOutput: undefined,
        usage: SafeCompletionExtractor.extractUsage(completion),
        model: completion.model || model,
      };
    } catch (error) {
      console.error('[DeepSeekProvider] Generation failed:', error);
      throw error;
    }
  }
}
