// =============================================================================
// apps/api/src/services/function.service.ts
// Placeholder service for the function engine boundary.
// =============================================================================

class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotImplementedError";
  }
}

export interface FunctionDefinitionInput {
  name: string;
  description?: string;
  language: "typescript" | "javascript";
  code: string;
}

export interface FunctionUpdateInput {
  name?: string;
  description?: string;
  language?: "typescript" | "javascript";
  code?: string;
}

export class FunctionService {
  private fail(method: string): never {
    throw new NotImplementedError(
      `Function service method ${method} is not implemented yet. The function-engine package is a placeholder.`
    );
  }

  async createFunction(
    _orgId: string,
    _projectId: string,
    _input: FunctionDefinitionInput
  ): Promise<never> {
    return this.fail("createFunction");
  }

  async updateFunction(
    _orgId: string,
    _projectId: string,
    _functionId: string,
    _input: FunctionUpdateInput
  ): Promise<never> {
    return this.fail("updateFunction");
  }

  async deleteFunction(
    _orgId: string,
    _projectId: string,
    _functionId: string
  ): Promise<never> {
    return this.fail("deleteFunction");
  }

  async listFunctions(
    _orgId: string,
    _projectId: string
  ): Promise<never> {
    return this.fail("listFunctions");
  }
}
