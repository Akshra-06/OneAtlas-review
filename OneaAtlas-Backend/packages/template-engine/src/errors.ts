/**
 * Specific Error Types for Template Modification
 * Provides detailed error information for better debugging and handling
 */

export enum TemplateModificationErrorCode {
  // AI-related errors
  AI_PROVIDER_UNAVAILABLE = 'AI_PROVIDER_UNAVAILABLE',
  AI_RATE_LIMIT_EXCEEDED = 'AI_RATE_LIMIT_EXCEEDED',
  AI_TIMEOUT = 'AI_TIMEOUT',
  AI_INVALID_RESPONSE = 'AI_INVALID_RESPONSE',
  AI_MALFORMED_RESPONSE = 'AI_MALFORMED_RESPONSE',
  
  // Template-related errors
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  TEMPLATE_INVALID = 'TEMPLATE_INVALID',
  TEMPLATE_MISMATCH = 'TEMPLATE_MISMATCH',
  
  // Validation errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  SYNTAX_ERROR = 'SYNTAX_ERROR',
  TYPE_ERROR = 'TYPE_ERROR',
  
  // Context errors
  CONTEXT_INSUFFICIENT = 'CONTEXT_INSUFFICIENT',
  ENTITY_INVALID = 'ENTITY_INVALID',
  DOMAIN_MISMATCH = 'DOMAIN_MISMATCH',
  
  // Cache errors
  CACHE_ERROR = 'CACHE_ERROR',
  CACHE_MISS = 'CACHE_MISS',
  
  // General errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class TemplateModificationError extends Error {
  public readonly code: TemplateModificationErrorCode;
  public readonly details?: Record<string, unknown>;
  public readonly originalError?: Error;
  public readonly timestamp: string;
  public readonly retryable: boolean;

  constructor(
    message: string,
    code: TemplateModificationErrorCode,
    details?: Record<string, unknown>,
    originalError?: Error,
    retryable: boolean = false,
  ) {
    super(message);
    this.name = 'TemplateModificationError';
    this.code = code;
    this.details = details;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
    this.retryable = retryable;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TemplateModificationError);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      originalError: this.originalError?.message,
      timestamp: this.timestamp,
      retryable: this.retryable,
      stack: this.stack,
    };
  }
}

/**
 * Create specific error types
 */
export class AIProviderError extends TemplateModificationError {
  constructor(message: string, provider: string, originalError?: Error) {
    super(
      `AI Provider Error (${provider}): ${message}`,
      TemplateModificationErrorCode.AI_PROVIDER_UNAVAILABLE,
      { provider },
      originalError,
      true, // AI provider errors are typically retryable
    );
    this.name = 'AIProviderError';
  }
}

export class AIRateLimitError extends TemplateModificationError {
  constructor(provider: string, retryAfter?: number) {
    super(
      `AI Rate Limit Exceeded (${provider})`,
      TemplateModificationErrorCode.AI_RATE_LIMIT_EXCEEDED,
      { provider, retryAfter },
      undefined,
      true, // Rate limit errors are retryable after delay
    );
    this.name = 'AIRateLimitError';
  }
}

export class AITimeoutError extends TemplateModificationError {
  constructor(provider: string, timeout: number) {
    super(
      `AI Timeout (${provider}): Request exceeded ${timeout}ms`,
      TemplateModificationErrorCode.AI_TIMEOUT,
      { provider, timeout },
      undefined,
      true, // Timeout errors are retryable
    );
    this.name = 'AITimeoutError';
  }
}

export class TemplateValidationError extends TemplateModificationError {
  constructor(message: string, templateId: string, validationErrors?: string[]) {
    super(
      `Template Validation Error (${templateId}): ${message}`,
      TemplateModificationErrorCode.VALIDATION_FAILED,
      { templateId, validationErrors },
      undefined,
      false, // Validation errors are not retryable without changes
    );
    this.name = 'TemplateValidationError';
  }
}

export class ContextInsufficientError extends TemplateModificationError {
  constructor(message: string, missingFields?: string[]) {
    super(
      `Context Insufficient: ${message}`,
      TemplateModificationErrorCode.CONTEXT_INSUFFICIENT,
      { missingFields },
      undefined,
      false, // Context errors require additional information
    );
    this.name = 'ContextInsufficientError';
  }
}

/**
 * Error factory for creating appropriate error types
 */
export class ErrorFactory {
  static fromAIError(error: unknown, provider: string): TemplateModificationError {
    const message = error instanceof Error ? error.message : String(error);
    
    if (message.includes('rate limit') || message.includes('429')) {
      return new AIRateLimitError(provider);
    }
    
    if (message.includes('timeout') || message.includes('ETIMEDOUT')) {
      return new AITimeoutError(provider, 30000);
    }
    
    return new AIProviderError(message, provider, error instanceof Error ? error : undefined);
  }

  static fromValidationError(message: string, templateId: string, errors?: string[]): TemplateValidationError {
    return new TemplateValidationError(message, templateId, errors);
  }

  static fromContextError(message: string, missingFields?: string[]): ContextInsufficientError {
    return new ContextInsufficientError(message, missingFields);
  }

  static fromUnknownError(error: unknown): TemplateModificationError {
    const message = error instanceof Error ? error.message : String(error);
    return new TemplateModificationError(
      `Unknown Error: ${message}`,
      TemplateModificationErrorCode.UNKNOWN_ERROR,
      undefined,
      error instanceof Error ? error : undefined,
      false,
    );
  }
}
