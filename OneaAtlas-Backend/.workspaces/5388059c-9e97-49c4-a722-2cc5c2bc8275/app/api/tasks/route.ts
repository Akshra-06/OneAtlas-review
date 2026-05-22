import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';
import { TaskCreateSchema } from '@/lib/validations/tasks';
import { mockStorage } from '@/lib/mock-storage';

const USE_MOCK_STORAGE = process.env.PREVIEW_MODE === 'true' || !process.env.DATABASE_URL;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(Number(searchParams.get('page') ?? '1'), 1);
  const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? '20'), 1), 100);
  const search = searchParams.get('search')?.trim();
  const tenantId = await getTenantId(request);

  if (USE_MOCK_STORAGE) {
    const where: any = { tenantId };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { status: { contains: search } },
        { priority: { contains: search } },
      ];
    }

    const result = await mockStorage.findMany('task', where, {
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      data: result.data,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  }

  const where = {
    tenantId,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
              { status: { contains: search, mode: 'insensitive' as const } },
              { priority: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {})
  };

  const [data, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.task.count({ where }),
  ]);

  return NextResponse.json({
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const validated = TaskCreateSchema.parse(await request.json());
    const tenantId = await getTenantId(request);

    if (USE_MOCK_STORAGE) {
      const data = await mockStorage.create('task', {
        ...validated,
        tenantId,
      });
      return NextResponse.json({ data }, { status: 201 });
    }

    const data = await prisma.task.create({
      data: {
        ...validated,
        tenantId,
      },
    });

    return NextResponse.json({ data }, { status: 201 });
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
