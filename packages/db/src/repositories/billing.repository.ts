// =============================================================================
// packages/db/src/repositories/billing.repository.ts
// Data-access layer for billing-related data on Organization.
//
// NOTE: There is no dedicated Billing table in the current schema.
// Billing state (plan, Stripe IDs, quotas, expiry) lives directly on the
// Organization model. This repository encapsulates those fields so
// consumers don't need to know the storage layout. When a dedicated
// Billing/Subscription model is added, swap the implementation here.
//
// All queries are scoped by orgId.
// =============================================================================

import { prisma } from "../client";
import type { Organization, OrgPlan } from "@prisma/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Billing-specific slice of the Organization record. */
export interface BillingInfo {
  orgId: string;
  plan: OrgPlan;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  planExpiresAt: Date | null;
  maxApps: number;
  maxWorkflows: number;
  maxMembers: number;
  maxStorageMb: number;
  aiCallsPerMonth: number;
}

export interface UpdatePlanParams {
  plan: OrgPlan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  planExpiresAt?: Date | null;
}

export interface UpdateQuotasParams {
  maxApps?: number;
  maxWorkflows?: number;
  maxMembers?: number;
  maxStorageMb?: number;
  aiCallsPerMonth?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BILLING_SELECT = {
  id: true,
  plan: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  planExpiresAt: true,
  maxApps: true,
  maxWorkflows: true,
  maxMembers: true,
  maxStorageMb: true,
  aiCallsPerMonth: true,
} as const;

function toBillingInfo(
  org: Pick<Organization, keyof typeof BILLING_SELECT>
): BillingInfo {
  return {
    orgId: org.id,
    plan: org.plan,
    stripeCustomerId: org.stripeCustomerId,
    stripeSubscriptionId: org.stripeSubscriptionId,
    planExpiresAt: org.planExpiresAt,
    maxApps: org.maxApps,
    maxWorkflows: org.maxWorkflows,
    maxMembers: org.maxMembers,
    maxStorageMb: org.maxStorageMb,
    aiCallsPerMonth: org.aiCallsPerMonth,
  };
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export class BillingRepository {
  // -------------------------------------------------------------------------
  // Read
  // -------------------------------------------------------------------------

  /** Get billing info for an org. */
  async findByOrgId(orgId: string): Promise<BillingInfo | null> {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: BILLING_SELECT,
    });
    return org ? toBillingInfo(org) : null;
  }

  /** Get billing info by Stripe customer id. */
  async findByStripeCustomerId(
    stripeCustomerId: string
  ): Promise<BillingInfo | null> {
    const org = await prisma.organization.findUnique({
      where: { stripeCustomerId },
      select: BILLING_SELECT,
    });
    return org ? toBillingInfo(org) : null;
  }

  /** Get billing info by Stripe subscription id. */
  async findByStripeSubscriptionId(
    stripeSubscriptionId: string
  ): Promise<BillingInfo | null> {
    const org = await prisma.organization.findUnique({
      where: { stripeSubscriptionId },
      select: BILLING_SELECT,
    });
    return org ? toBillingInfo(org) : null;
  }

  /** Get the current plan for an org. */
  async getPlan(orgId: string): Promise<OrgPlan | null> {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { plan: true },
    });
    return org?.plan ?? null;
  }

  // -------------------------------------------------------------------------
  // Write
  // -------------------------------------------------------------------------

  /** Update the org's plan and Stripe identifiers. */
  async updatePlan(
    orgId: string,
    params: UpdatePlanParams
  ): Promise<BillingInfo> {
    const org = await prisma.organization.update({
      where: { id: orgId },
      data: {
        plan: params.plan,
        ...(params.stripeCustomerId !== undefined
          ? { stripeCustomerId: params.stripeCustomerId }
          : {}),
        ...(params.stripeSubscriptionId !== undefined
          ? { stripeSubscriptionId: params.stripeSubscriptionId }
          : {}),
        ...(params.planExpiresAt !== undefined
          ? { planExpiresAt: params.planExpiresAt }
          : {}),
      },
      select: BILLING_SELECT,
    });
    return toBillingInfo(org);
  }

  /** Update quota limits for an org. */
  async updateQuotas(
    orgId: string,
    params: UpdateQuotasParams
  ): Promise<BillingInfo> {
    const org = await prisma.organization.update({
      where: { id: orgId },
      data: {
        ...(params.maxApps !== undefined ? { maxApps: params.maxApps } : {}),
        ...(params.maxWorkflows !== undefined
          ? { maxWorkflows: params.maxWorkflows }
          : {}),
        ...(params.maxMembers !== undefined
          ? { maxMembers: params.maxMembers }
          : {}),
        ...(params.maxStorageMb !== undefined
          ? { maxStorageMb: params.maxStorageMb }
          : {}),
        ...(params.aiCallsPerMonth !== undefined
          ? { aiCallsPerMonth: params.aiCallsPerMonth }
          : {}),
      },
      select: BILLING_SELECT,
    });
    return toBillingInfo(org);
  }

  /** Link a Stripe customer id to an org. */
  async setStripeCustomerId(
    orgId: string,
    stripeCustomerId: string
  ): Promise<BillingInfo> {
    const org = await prisma.organization.update({
      where: { id: orgId },
      data: { stripeCustomerId },
      select: BILLING_SELECT,
    });
    return toBillingInfo(org);
  }

  /** Link a Stripe subscription id to an org. */
  async setStripeSubscriptionId(
    orgId: string,
    stripeSubscriptionId: string
  ): Promise<BillingInfo> {
    const org = await prisma.organization.update({
      where: { id: orgId },
      data: { stripeSubscriptionId },
      select: BILLING_SELECT,
    });
    return toBillingInfo(org);
  }

  // -------------------------------------------------------------------------
  // Quota checks
  // -------------------------------------------------------------------------

  /** Check whether the org has capacity for another project. */
  async canCreateProject(orgId: string): Promise<boolean> {
    const [org, count] = await prisma.$transaction([
      prisma.organization.findUnique({
        where: { id: orgId },
        select: { maxApps: true },
      }),
      prisma.project.count({
        where: { orgId, status: { not: "DELETED" } },
      }),
    ]);
    if (!org) return false;
    return count < org.maxApps;
  }

  /** Check whether the org has capacity for another workflow. */
  async canCreateWorkflow(orgId: string): Promise<boolean> {
    const [org, count] = await prisma.$transaction([
      prisma.organization.findUnique({
        where: { id: orgId },
        select: { maxWorkflows: true },
      }),
      prisma.workflow.count({
        where: { project: { orgId }, status: { not: "ARCHIVED" } },
      }),
    ]);
    if (!org) return false;
    return count < org.maxWorkflows;
  }

  /** Check whether the org has capacity for another member. */
  async canAddMember(orgId: string): Promise<boolean> {
    const [org, count] = await prisma.$transaction([
      prisma.organization.findUnique({
        where: { id: orgId },
        select: { maxMembers: true },
      }),
      prisma.orgMember.count({ where: { orgId } }),
    ]);
    if (!org) return false;
    return count < org.maxMembers;
  }
}
