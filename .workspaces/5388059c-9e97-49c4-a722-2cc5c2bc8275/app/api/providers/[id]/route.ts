import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';
import { ProviderUpdateSchema } from '@/lib/validations/providers';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const data = await prisma.provider.findFirst({
    where: {
      id,
      tenantId: await getTenantId(request),
    },
  });

  if (!data) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const tenantId = await getTenantId(request);
    const validated = ProviderUpdateSchema.parse(await request.json());

    const existing = await prisma.provider.findFirst({ where: { id, tenantId } });
    if (!existing) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    const data = await prisma.provider.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json({ data });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Invalid request',
        code: 'VALIDATION_ERROR',
      },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const tenantId = await getTenantId(request);

  const existing = await prisma.provider.findFirst({ where: { id, tenantId } });
  if (!existing) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  await prisma.provider.delete({ where: { id } });
  return NextResponse.json({ data: { id } });
}
