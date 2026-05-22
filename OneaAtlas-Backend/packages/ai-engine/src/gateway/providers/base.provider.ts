import { ProviderConfig, AIRequest, AIResponse, AIProvider, CompletionRequest, CompletionResponse } from '../types/gateway.types';
import { ProviderName, ModelTier } from '../config/models.config';

/**
 * Abstract Base Provider defining the standard contract for all AI providers.
 * All providers (OpenAI, Claude, Gemini) must implement this.
 */
export abstract class BaseProvider {
  protected config: ProviderConfig;
  
  abstract readonly name: AIProvider;
  abstract readonly providerName: ProviderName;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  /**
   * Generates text or structured output based on the provided request.
   */
  abstract generate<T>(request: AIRequest<T>): Promise<AIResponse<T>>;

  /**
   * Generic backwards-compatible implementation of the AIGateway complete interface.
   */
  async complete(req: CompletionRequest): Promise<CompletionResponse> {
    const systemPrompt = req.systemPrompt || req.messages.find(m => m.role === 'system')?.content;
    const userMessage = req.messages.find(m => m.role === 'user')?.content || '';

    let modelTier: ModelTier = 'CAPABLE';
    if (req.tier === 'fast') {
      modelTier = 'FAST';
    } else if (req.tier === 'smart') {
      modelTier = 'CAPABLE';
    } else if (req.tier === 'FAST' || req.tier === 'CAPABLE' || req.tier === 'REASONING') {
      modelTier = req.tier;
    }

    const response = await this.generate({
      prompt: userMessage,
      systemPrompt,
      modelTier,
      temperature: req.temperature,
      maxTokens: req.maxTokens,
    });

    return {
      text: response.content,
      provider: this.name,
      model: response.model,
      usage: response.usage,
      cached: false,
      latencyMs: 0, // Will be calculated by AIGateway
    };
  }
}
