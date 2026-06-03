import { BaseProvider } from '../providers/base.provider';
import { OpenAIProvider } from '../providers/openai.provider';
import { GroqProvider } from '../providers/groq.provider';
import { GeminiProvider } from '../providers/gemini.provider';
import { ClaudeProvider } from '../providers/claude.provider';
import { DeepSeekProvider } from '../providers/deepseek.provider';
import { OpenRouterProvider } from '../providers/openrouter.provider';
import { MistralProvider } from '../providers/mistral.provider';
import { ROUTING_CONFIG, RouteConfig } from './routing.config';
import { ProviderName, MODELS_CONFIG } from '../config/models.config';
import { ProviderHealthTracker } from './provider.health';
import { logger } from '../../shared/utils/logger';

export class ModelRouter {
  private providers: Map<ProviderName, BaseProvider> = new Map();
  private healthTracker = new ProviderHealthTracker();
  public onProviderSelected?: (providerName: ProviderName, attempt: number, modelName?: string) => void;

  constructor(keys: { 
    openaiKey?: string; 
    anthropicKey?: string; 
    geminiKey?: string; 
    groqKey?: string; 
    deepseekKey?: string; 
    openrouterKey?: string; 
    mistralKey?: string 
  } = {}) {
    // Principal Infra Strategy: Load from env if not explicitly provided (prevents test-runner collapse)
    const activeKeys = {
      openaiKey: keys.openaiKey || process.env.OPENAI_API_KEY,
      anthropicKey: keys.anthropicKey || process.env.ANTHROPIC_API_KEY,
      geminiKey: keys.geminiKey || process.env.GOOGLE_API_KEY,
      groqKey: keys.groqKey || process.env.GROQ_API_KEY,
      deepseekKey: keys.deepseekKey || process.env.DEEPSEEK_API_KEY,
      openrouterKey: keys.openrouterKey || process.env.OPENROUTER_API_KEY,
      mistralKey: keys.mistralKey || process.env.MISTRAL_API_KEY
    };
    console.log("Provider key status:", {
      openai: !!activeKeys.openaiKey,
      anthropic: !!activeKeys.anthropicKey,
      gemini: !!activeKeys.geminiKey,
      groq: !!activeKeys.groqKey,
      deepseek: !!activeKeys.deepseekKey,
      openrouter: !!activeKeys.openrouterKey,
      mistral: !!activeKeys.mistralKey,
    });

    if (activeKeys.openaiKey) this.providers.set('OPENAI', new OpenAIProvider({ apiKey: activeKeys.openaiKey }));
    if (activeKeys.groqKey) this.providers.set('GROQ', new GroqProvider({ apiKey: activeKeys.groqKey }));
    if (activeKeys.geminiKey) this.providers.set('GEMINI', new GeminiProvider({ apiKey: activeKeys.geminiKey }));
    if (activeKeys.anthropicKey) this.providers.set('ANTHROPIC', new ClaudeProvider({ apiKey: activeKeys.anthropicKey }));
    if (activeKeys.deepseekKey) this.providers.set('DEEPSEEK', new DeepSeekProvider({ apiKey: activeKeys.deepseekKey }));
    if (activeKeys.openrouterKey) this.providers.set('OPENROUTER', new OpenRouterProvider({ apiKey: activeKeys.openrouterKey }));
    if (activeKeys.mistralKey) this.providers.set('MISTRAL', new MistralProvider({ apiKey: activeKeys.mistralKey }));

    console.log(
      "Registered providers:",
      Array.from(this.providers.keys())
    );
    logger.info('ModelRouter', 'INITIALIZED', `Registered ${this.providers.size} providers.`, {
      available: Array.from(this.providers.keys())
    });
  }

  getProviderForTask(taskType: string, attempt: number = 0): { provider: BaseProvider, config: RouteConfig, name: ProviderName } {
    const baseConfig = ROUTING_CONFIG[taskType] || ROUTING_CONFIG['DEFAULT'];
    if (!baseConfig) {
      throw new Error(`[ModelRouter] ROUTING_CONFIG['DEFAULT'] is missing`);
    }
    
    const routeConfig = { ...baseConfig };

    // Normalize taskType for robust comparison
    const normalizedTask = taskType.toLowerCase().replace(/[-_]/g, ' ');

    const requiresCapableOrReasoning = 
      normalizedTask.includes('app understanding') ||
      normalizedTask.includes('architecture design') ||
      normalizedTask.includes('intent extraction') ||
      normalizedTask.includes('feature extraction') ||
      normalizedTask.includes('schema') ||
      normalizedTask.includes('workflow') ||
      normalizedTask.includes('page') ||
      normalizedTask.includes('component') ||
      normalizedTask.includes('repair') ||
      normalizedTask.includes('recovery') ||
      normalizedTask.includes('ontology');
  
    if (requiresCapableOrReasoning && routeConfig.preferredTier === 'FAST') {
      routeConfig.preferredTier = 'CAPABLE';
      logger.info('ModelRouter', 'TIER_PROMOTION', `Promoted tier for task '${taskType}' from FAST to CAPABLE`);
    }

    const getModelForProvider = (pName: ProviderName) => {
      const modelTier = routeConfig.preferredTier;
      const providerModels = MODELS_CONFIG[pName];
      return providerModels ? (providerModels as any)[modelTier] : undefined;
    };
    
    const candidates: ProviderName[] = [routeConfig.primaryProvider, ...routeConfig.fallbackProviders];
    
    for (let i = 0; i < candidates.length; i++) {
      const idx = (i + attempt) % candidates.length;
      const providerName = candidates[idx];
      if (!providerName) continue;
      const provider = this.providers.get(providerName);
      
      if (provider && this.healthTracker.isHealthy(providerName)) {
        const modelName = getModelForProvider(providerName);
        if (this.onProviderSelected) {
          this.onProviderSelected(providerName, attempt + 1, modelName);
        }
        if (i > 0 || attempt > 0) {
          logger.info('ModelRouter', 'ADAPTIVE_ROUTING', `Routing to ${providerName} (${modelName}) (Attempt: ${attempt}, Index: ${i})`);
        }
        return { provider, config: routeConfig, name: providerName };
      }
    }

    // Last resort: Return primary if everything is unhealthy but configured
    const primary = this.providers.get(routeConfig.primaryProvider);
    if (primary) {
      const modelName = getModelForProvider(routeConfig.primaryProvider);
      if (this.onProviderSelected) {
        this.onProviderSelected(routeConfig.primaryProvider, attempt + 1, modelName);
      }
      return { provider: primary, config: routeConfig, name: routeConfig.primaryProvider };
    }

    throw new Error(`[ModelRouter] No configured and healthy providers available for task: ${taskType}`);
  }

  recordFailure(providerName: ProviderName, error: any): void {
    this.healthTracker.recordFailure(providerName, error);
  }

  recordSuccess(providerName: ProviderName): void {
    this.healthTracker.recordSuccess(providerName);
  }
}
