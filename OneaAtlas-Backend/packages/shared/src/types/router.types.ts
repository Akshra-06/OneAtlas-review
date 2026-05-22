// Shared router types for AI model routing

export interface ModelRouter {
  getProviderForTask(taskType: string): { provider: any; name: string };
  recordSuccess?(providerName: string): void;
  recordFailure?(providerName: string, error: Error): void;
}
