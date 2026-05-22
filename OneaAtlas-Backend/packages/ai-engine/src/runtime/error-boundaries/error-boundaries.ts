/**
 * Runtime Error Boundaries
 * 
 * Hierarchical error handling for generated apps.
 * Provides error boundaries at different levels with fallback UI.
 */

export interface ErrorBoundaryConfig {
  enableRootBoundary: boolean;
  enableComponentBoundaries: boolean;
  enableErrorLogging: boolean;
  enableErrorReporting: boolean;
  fallbackUI: 'minimal' | 'detailed' | 'custom';
}

const DEFAULT_CONFIG: ErrorBoundaryConfig = {
  enableRootBoundary: true,
  enableComponentBoundaries: true,
  enableErrorLogging: true,
  enableErrorReporting: false,
  fallbackUI: 'detailed',
};

export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  timestamp: string;
}

export interface ErrorContext {
  error: Error;
  errorInfo: ErrorInfo;
  resetError: () => void;
}

/**
 * Root Error Boundary Component Code
 * This will be injected into the generated app's root layout
 */
export const ROOT_ERROR_BOUNDARY_CODE = `
'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class RootErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error to console
    console.error('[Root Error Boundary]', error, errorInfo);
    
    // Store error in sessionStorage for debugging
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('oneatlas-error', JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      }));
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <svg className="h-5 w-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h1 className="text-lg font-semibold">Something went wrong</h1>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                An unexpected error occurred. This has been logged for debugging.
              </p>

              {this.state.error && (
                <details className="mb-4">
                  <summary className="text-sm font-medium cursor-pointer text-muted-foreground hover:text-foreground">
                    Error details
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}

              <div className="flex gap-2">
                <button
                  onClick={this.handleReset}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Try again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Reload page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RootErrorBoundary;
`;

/**
 * Component Error Boundary Component Code
 * This can be wrapped around specific components
 */
export const COMPONENT_ERROR_BOUNDARY_CODE = `
'use client';

import React from 'react';

interface ComponentErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ComponentErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ComponentErrorBoundary extends React.Component<
  ComponentErrorBoundaryProps,
  ComponentErrorBoundaryState
> {
  constructor(props: ComponentErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ComponentErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Component Error Boundary]', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            This component encountered an error and could not be rendered.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ComponentErrorBoundary;
`;

/**
 * Error Boundary Manager
 * Manages error boundary configuration and code generation
 */
export class ErrorBoundaryManager {
  private config: ErrorBoundaryConfig;

  constructor(config: Partial<ErrorBoundaryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate root error boundary code
   */
  generateRootErrorBoundary(): string {
    if (!this.config.enableRootBoundary) {
      return '';
    }

    return ROOT_ERROR_BOUNDARY_CODE;
  }

  /**
   * Generate component error boundary code
   */
  generateComponentErrorBoundary(): string {
    if (!this.config.enableComponentBoundaries) {
      return '';
    }

    return COMPONENT_ERROR_BOUNDARY_CODE;
  }

  /**
   * Generate error boundary wrapper code
   */
  generateErrorBoundaryWrapper(componentName: string): string {
    if (!this.config.enableComponentBoundaries) {
      return '';
    }

    return `
<ErrorBoundary
  fallback={<div className="p-4 text-sm text-muted-foreground">Error loading ${componentName}</div>}
  onError={(error, errorInfo) => {
    console.error(\`[${componentName} Error]\`, error, errorInfo);
  }}
>
  {/* ${componentName} content */}
</ErrorBoundary>
    `.trim();
  }

  /**
   * Generate error logging utility
   */
  generateErrorLogger(): string {
    if (!this.config.enableErrorLogging) {
      return '';
    }

    return `
// Error logging utility
export const logError = (error: Error, context?: Record<string, any>) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  };
  
  console.error('[Error Logger]', errorData);
  
  if (typeof sessionStorage !== 'undefined') {
    const errors = JSON.parse(sessionStorage.getItem('oneatlas-errors') || '[]');
    errors.push(errorData);
    sessionStorage.setItem('oneatlas-errors', JSON.stringify(errors.slice(-10))); // Keep last 10 errors
  }
};

export const getErrors = () => {
  if (typeof sessionStorage === 'undefined') return [];
  return JSON.parse(sessionStorage.getItem('oneatlas-errors') || '[]');
};

export const clearErrors = () => {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('oneatlas-errors');
  }
};
    `.trim();
  }

  /**
   * Generate error reporting utility
   */
  generateErrorReporter(): string {
    if (!this.config.enableErrorReporting) {
      return '';
    }

    return `
// Error reporting utility
export const reportError = async (error: Error, context?: Record<string, any>) => {
  try {
    // This would send error to your error reporting service
    // For now, just log to console
    console.error('[Error Reporter]', error, context);
    
    // Example: Send to error tracking service
    // await fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ error, context }),
    // });
  } catch (e) {
    console.error('Failed to report error:', e);
  }
};
    `.trim();
  }

  /**
   * Get error boundary configuration
   */
  getConfig(): ErrorBoundaryConfig {
    return { ...this.config };
  }

  /**
   * Update error boundary configuration
   */
  updateConfig(config: Partial<ErrorBoundaryConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export const errorBoundaryManager = new ErrorBoundaryManager();
