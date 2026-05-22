import { ProviderName, ModelTier } from '../config/models.config';

export interface RouteConfig {
  primaryProvider: ProviderName;
  fallbackProviders: ProviderName[];
  preferredTier: ModelTier;
}

/**
 * Maps task complexities or categories to optimal routing paths.
 * FAST: cheap, fast models (e.g., recovery, intent extraction)
 * CAPABLE: medium complexity (e.g., app architecture design, schema inference)
 * REASONING: highly complex logic (future use)
 */
export const ROUTING_CONFIG: Record<string, RouteConfig> = {
  RECOVERY: {
    primaryProvider: 'GROQ',
    fallbackProviders: ['OPENROUTER', 'GEMINI', 'DEEPSEEK', 'OPENAI', 'ANTHROPIC'],
    preferredTier: 'FAST',
  },

  INTENT_EXTRACTION: {
    primaryProvider: 'GROQ',
    fallbackProviders: ['OPENROUTER', 'GEMINI', 'DEEPSEEK', 'OPENAI', 'ANTHROPIC'],
    preferredTier: 'FAST',
  },

  FEATURE_EXTRACTION: {
    primaryProvider: 'GROQ',
    fallbackProviders: ['OPENROUTER', 'GEMINI', 'DEEPSEEK', 'OPENAI', 'ANTHROPIC'],
    preferredTier: 'CAPABLE',
  },

  MUTATION_CLASSIFICATION: {
    primaryProvider: 'GROQ',
    fallbackProviders: ['OPENROUTER', 'GEMINI', 'DEEPSEEK', 'OPENAI', 'ANTHROPIC'],
    preferredTier: 'FAST',
  },

  GRAPH_MUTATION: {
    primaryProvider: 'GROQ',
    fallbackProviders: ['OPENROUTER', 'GEMINI', 'DEEPSEEK', 'OPENAI', 'ANTHROPIC'],
    preferredTier: 'CAPABLE',
  },

  WORKFLOW_EXTRACTION: {
    primaryProvider: 'GROQ',
    fallbackProviders: ['OPENROUTER', 'GEMINI', 'DEEPSEEK', 'OPENAI', 'ANTHROPIC'],
    preferredTier: 'REASONING',
  },

  LONG_CONTEXT_ANALYSIS: {
    primaryProvider: 'GROQ',
    fallbackProviders: ['OPENROUTER', 'GEMINI', 'DEEPSEEK', 'OPENAI', 'ANTHROPIC'],
    preferredTier: 'REASONING',
  },

  NORMALIZATION_REPAIR: {
    primaryProvider: 'GROQ',
    fallbackProviders: ['OPENROUTER', 'GEMINI', 'DEEPSEEK', 'OPENAI', 'ANTHROPIC'],
    preferredTier: 'FAST',
  },

  DEFAULT: {
    primaryProvider: 'GROQ',
    fallbackProviders: ['OPENROUTER', 'GEMINI', 'DEEPSEEK', 'OPENAI', 'ANTHROPIC'],
    preferredTier: 'CAPABLE',
  }
};
