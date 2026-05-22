import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';
import { UserUpdateSchema } from '@/lib/validations/users';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const data = await prisma.user.findFirst({
    where: {
      id,
      tenantId: await getTenantId(request),
    },
  });

  if (!data) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const tenantId = await getTenantId(request);
    const validated = UserUpdateSchema.parse(await request.json());

    const existing = await prisma.user.findFirst({ where: { id, tenantId } });
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data = await prisma.user.update({
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

  const existing = await prisma.user.findFirst({ where: { id, tenantId } });
  if (!existing) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ data: { id } });
}
