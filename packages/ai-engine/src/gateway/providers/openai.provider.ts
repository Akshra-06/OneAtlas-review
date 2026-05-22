import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { BaseProvider } from './base.provider';
import { ProviderConfig, AIRequest, AIResponse } from '../types/gateway.types';
import { MODELS_CONFIG } from '../config/models.config';
import { PROVIDER_CONFIG } from '../config/provider.config';
import { SafeCompletionExtractor } from './safe-completion';
import { logger } from '../../shared/utils/logger';

export class OpenAIProvider extends BaseProvider {
  readonly name = 'openai' as const;
  readonly providerName = 'OPENAI' as const;
  private client: OpenAI;

  constructor(config: Partial<ProviderConfig> = {}) {
    const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key is missing. Set OPENAI_API_KEY.");
    }
    super({ ...config, apiKey });
    this.client = new OpenAI({
      apiKey,
      timeout: config.timeoutMs || PROVIDER_CONFIG.OPENAI.TIMEOUT_MS,
      maxRetries: config.maxRetries ?? PROVIDER_CONFIG.OPENAI.MAX_RETRIES,
    });
  }

  async generate<T>(request: AIRequest<T>): Promise<AIResponse<T>> {
    const model = MODELS_CONFIG.OPENAI[request.modelTier || 'CAPABLE'];
    
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    
    messages.push({ role: 'user', content: request.prompt });

    const completionParams: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
      model,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens,
    };

    // If a Zod schema is provided, use OpenAI's native Structured Outputs
    if (request.schema) {
      completionParams.response_format = zodResponseFormat(
        request.schema as any,
        request.schemaName || 'structured_response',
      );
    }

    try {
      const completion = await this.client.chat.completions.create(completionParams);
      
      // PRINCIPAL FIX: Use safe extractor to prevent "choices[0]" TypeErrors
      const content = SafeCompletionExtractor.extractOpenAI(completion, 'OPENAI');
      
      let parsedOutput: T | undefined;
      
      if (request.schema && content) {
        try {
          parsedOutput = request.schema.parse(JSON.parse(content));
        } catch (parseErr) {
          // If native parsing fails, we still return content so Orchestrator can recover
          logger.warn('OpenAIProvider', 'NATIVE_PARSE_FAILED', 'Native parse failed, relying on Orchestrator recovery.');
        }
      }

      return {
        content,
        parsedOutput,
        usage: SafeCompletionExtractor.extractUsage(completion),
        model: completion.model || model,
      };
    } catch (error) {
      // In production, integrate this with the ResponseRecovery or a Logger.
      logger.error('OpenAIProvider', 'GENERATION_FAILED', `Generation failed for tier ${request.modelTier}`, { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }
}
