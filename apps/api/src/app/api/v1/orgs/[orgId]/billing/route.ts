// =============================================================================
// apps/api/src/app/api/v1/orgs/[orgId]/billing/route.ts
// GET  /billing — read billing state
// POST /billing — update plan, quotas, or Stripe linkage
// =============================================================================

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { z } from "zod";
import { requireOrgMember } from "../../../../../../lib/auth";
import { ok, created, errorResponse } from "../../../../../../lib/response";
import { BillingService } from "../../../../../../services/billing.service";

interface RouteContext {
  params: Promise<{ orgId: string }>;
}

const billingService = new BillingService();

const updateBillingSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("plan"),
    plan: z.enum(["FREE", "PRO", "ENTERPRISE"]),
    stripeCustomerId: z.string().optional(),
    stripeSubscriptionId: z.string().optional(),
    planExpiresAt: z.coerce.date().optional().nullable(),
  }),
  z.object({
    action: z.literal("quotas"),
    maxApps: z.number().int().optional(),
    maxWorkflows: z.number().int().optional(),
    maxMembers: z.number().int().optional(),
    maxStorageMb: z.number().int().optional(),
    aiCallsPerMonth: z.number().int().optional(),
  }),
  z.object({
    action: z.literal("stripe-customer"),
    stripeCustomerId: z.string().min(1),
  }),
  z.object({
    action: z.literal("stripe-subscription"),
    stripeSubscriptionId: z.string().min(1),
  }),
]);

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId } = await params;
    await requireOrgMember(orgId);

    const billing = await billingService.getByOrgId(orgId);
    return ok(billing);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId } = await params;
    await requireOrgMember(orgId, "ADMIN");

    const body = updateBillingSchema.parse(await req.json());

    if (body.action === "plan") {
      const result = await billingService.updatePlan(orgId, body);
      return created(result);
    }

    if (body.action === "quotas") {
      const result = await billingService.updateQuotas(orgId, body);
      return created(result);
    }

    if (body.action === "stripe-customer") {
      const result = await billingService.setStripeCustomerId(orgId, body.stripeCustomerId);
      return created(result);
    }

    const result = await billingService.setStripeSubscriptionId(orgId, body.stripeSubscriptionId);
    return created(result);
  } catch (error) {
    return errorResponse(error);
  }
}
