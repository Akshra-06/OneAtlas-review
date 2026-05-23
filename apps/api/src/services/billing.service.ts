// =============================================================================
// apps/api/src/services/billing.service.ts
// Billing orchestration service.
// =============================================================================

import {
  BillingRepository,
  type BillingInfo,
  type OrgPlan,
} from "@oneatlas/db";

export interface UpdatePlanInput {
  plan: OrgPlan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  planExpiresAt?: Date | null;
}

export interface UpdateQuotasInput {
  maxApps?: number;
  maxWorkflows?: number;
  maxMembers?: number;
  maxStorageMb?: number;
  aiCallsPerMonth?: number;
}

export class BillingService {
  constructor(private readonly billing = new BillingRepository()) {}

  async getByOrgId(orgId: string): Promise<BillingInfo | null> {
    return this.billing.findByOrgId(orgId);
  }

  async getByStripeCustomerId(
    stripeCustomerId: string
  ): Promise<BillingInfo | null> {
    return this.billing.findByStripeCustomerId(stripeCustomerId);
  }

  async getByStripeSubscriptionId(
    stripeSubscriptionId: string
  ): Promise<BillingInfo | null> {
    return this.billing.findByStripeSubscriptionId(stripeSubscriptionId);
  }

  async getPlan(orgId: string): Promise<OrgPlan | null> {
    return this.billing.getPlan(orgId);
  }

  async updatePlan(orgId: string, input: UpdatePlanInput): Promise<BillingInfo> {
    return this.billing.updatePlan(orgId, input);
  }

  async updateQuotas(
    orgId: string,
    input: UpdateQuotasInput
  ): Promise<BillingInfo> {
    return this.billing.updateQuotas(orgId, input);
  }

  async setStripeCustomerId(
    orgId: string,
    stripeCustomerId: string
  ): Promise<BillingInfo> {
    return this.billing.setStripeCustomerId(orgId, stripeCustomerId);
  }

  async setStripeSubscriptionId(
    orgId: string,
    stripeSubscriptionId: string
  ): Promise<BillingInfo> {
    return this.billing.setStripeSubscriptionId(orgId, stripeSubscriptionId);
  }

  async canCreateProject(orgId: string): Promise<boolean> {
    return this.billing.canCreateProject(orgId);
  }

  async canCreateWorkflow(orgId: string): Promise<boolean> {
    return this.billing.canCreateWorkflow(orgId);
  }

  async canAddMember(orgId: string): Promise<boolean> {
    return this.billing.canAddMember(orgId);
  }
}
