import Anthropic from '@anthropic-ai/sdk';
import { BaseProvider } from './base.provider';
import { ProviderConfig, AIRequest, AIResponse } from '../types/gateway.types';
import { MODELS_CONFIG } from '../config/models.config';
import { PROVIDER_CONFIG } from '../config/provider.config';
import { SafeCompletionExtractor } from './safe-completion';
import { logger } from '../../shared/utils/logger';

/**
 * Claude Provider using the official @anthropic-ai/sdk.
 */
export class ClaudeProvider extends BaseProvider {
  readonly name = 'anthropic' as const;
  readonly providerName = 'ANTHROPIC' as const;
  private client: Anthropic;

  constructor(config: Partial<ProviderConfig> = {}) {
    const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("Anthropic API key is missing. Set ANTHROPIC_API_KEY.");
    }
    super({ ...config, apiKey });
    this.client = new Anthropic({
      apiKey,
      timeout: config.timeoutMs || PROVIDER_CONFIG.ANTHROPIC.TIMEOUT_MS,
      maxRetries: config.maxRetries ?? PROVIDER_CONFIG.ANTHROPIC.MAX_RETRIES,
    });
  }

  async generate<T>(request: AIRequest<T>): Promise<AIResponse<T>> {
    const model = MODELS_CONFIG.ANTHROPIC[request.modelTier || 'CAPABLE'];

    // Claude 3 handles JSON best when instructed in the prompt.
    // Note: Anthropic does not yet have a native 'json_mode' or 'response_format: json'
    // in the same way OpenAI does, so we rely on prompt engineering + ValidationOrchestrator.
    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: request.prompt }
    ];

    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: request.maxTokens || 4096,
        system: request.systemPrompt,
        messages,
        temperature: request.temperature ?? 0.2,
      });

      // PRINCIPAL FIX: Use safe extractor to prevent "content[0]" TypeErrors
      const content = SafeCompletionExtractor.extractAnthropic(response, 'ANTHROPIC');

      return {
        content,
        parsedOutput: undefined,
        usage: SafeCompletionExtractor.extractUsage(response),
        model: response.model || model,
      };
    } catch (error) {
      logger.error('ClaudeProvider', 'GENERATION_FAILED', `Generation failed for tier ${request.modelTier}`, { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }
}
