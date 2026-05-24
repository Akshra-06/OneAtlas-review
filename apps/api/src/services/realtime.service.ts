// =============================================================================
// apps/api/src/services/realtime.service.ts
// Placeholder realtime service for the empty realtime-engine package.
// =============================================================================

class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotImplementedError";
  }
}

export interface RealtimeChannelInput {
  orgId: string;
  projectId?: string;
  channel: string;
}

export class RealtimeService {
  private fail(method: string): never {
    throw new NotImplementedError(
      `Realtime service method ${method} is not implemented yet. The realtime-engine package is a placeholder.`
    );
  }

  async publish(_input: RealtimeChannelInput, _payload: string): Promise<never> {
    return this.fail("publish");
  }

  async subscribe(_input: RealtimeChannelInput): Promise<never> {
    return this.fail("subscribe");
  }

  async unsubscribe(_input: RealtimeChannelInput): Promise<never> {
    return this.fail("unsubscribe");
  }

  async broadcast(_input: RealtimeChannelInput, _payload: string): Promise<never> {
    return this.fail("broadcast");
  }
}
