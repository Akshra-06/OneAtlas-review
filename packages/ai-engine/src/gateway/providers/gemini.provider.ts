import { GoogleGenAI, Type } from '@google/genai';
import { BaseProvider } from './base.provider';
import { ProviderConfig, AIRequest, AIResponse } from '../types/gateway.types';
import { MODELS_CONFIG } from '../config/models.config';
import { PROVIDER_CONFIG } from '../config/provider.config';

/**
 * Gemini Provider using the official @google/genai SDK.
 */
export class GeminiProvider extends BaseProvider {
  readonly name = 'google' as const;
  readonly providerName = 'GEMINI' as const;
  private client: GoogleGenAI;

  constructor(config: Partial<ProviderConfig> = {}) {
    const apiKey = config.apiKey || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key is missing. Set GOOGLE_AI_API_KEY or GOOGLE_API_KEY.");
    }
    super({ ...config, apiKey });
    this.client = new GoogleGenAI({ apiKey });
  }

  async generate<T>(request: AIRequest<T>): Promise<AIResponse<T>> {
    const model = MODELS_CONFIG.GEMINI[request.modelTier || 'CAPABLE'];

    // Map configuration to Gemini's expected format
    const generateConfig: any = {
      temperature: request.temperature ?? 0.2,
    };

    if (request.systemPrompt) {
      generateConfig.systemInstruction = request.systemPrompt;
    }

    if (request.schema) {
      generateConfig.responseMimeType = 'application/json';
      // Note: We could map Zod to Gemini's responseSchema, but our ValidationOrchestrator 
      // natively handles strict JSON parsing + recovery perfectly. We'll use JSON mode.
    }

    if (request.maxTokens) {
      generateConfig.maxOutputTokens = request.maxTokens;
    }

    try {
      const response = await this.client.models.generateContent({
        model,
        contents: request.prompt,
        config: generateConfig,
      });

      const content = response.text || '';

      return {
        content,
        // We leave parsedOutput undefined. The ValidationOrchestrator will 
        // parse the raw content through the Zod schema natively.
        parsedOutput: undefined,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
        },
        model,
      };
    } catch (error) {
      console.error('[GeminiProvider] Generation failed:', error);
      throw error;
    }
  }
}
