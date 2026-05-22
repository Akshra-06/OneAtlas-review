import type {
  EntitySchema,
  FieldSchema,
  GeneratedFile,
} from '@oneatlas/shared';

const EXCLUDED_FIELDS = ['id', 'createdAt', 'updatedAt', 'tenantId'];

const lowerFirst = (value: string): string =>
  value.charAt(0).toLowerCase() + value.slice(1);

const getSearchableFields = (entity: EntitySchema): FieldSchema[] =>
  entity.fields
    .filter((field) => !EXCLUDED_FIELDS.includes(field.name))
    .filter((field) => field.prismaType === 'String' && !field.enumValues?.length)
    .slice(0, 4);

const buildSearchWhere = (entity: EntitySchema): string => {
  const searchable = getSearchableFields(entity);
  if (!searchable.length) return '';

  return `,
      ...(search
        ? {
            OR: [
${searchable
  .map((field) => `              { ${field.name}: { contains: search, mode: 'insensitive' as const } },`)
  .join('\n')}
            ],
          }
        : {})`;
};

const buildListRoute = (
  entity: EntitySchema,
): GeneratedFile => {
  const delegate = lowerFirst(entity.name);
  const searchable = getSearchableFields(entity);

  return {
    filePath: `app/api/${entity.nameSlug}/route.ts`,
    fileType: 'api-route',
    entityName: entity.name,
    content: `import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';
import { ${entity.name}CreateSchema } from '@/lib/validations/${entity.nameSlug}';
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
${searchable.map((field) => `        { ${field.name}: { contains: search } },`).join('\n')}
      ];
    }

    const result = await mockStorage.findMany('${delegate}', where, {
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
    tenantId${buildSearchWhere(entity)}
  };

  const [data, total] = await Promise.all([
    prisma.${delegate}.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.${delegate}.count({ where }),
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
    const validated = ${entity.name}CreateSchema.parse(await request.json());
    const tenantId = await getTenantId(request);

    if (USE_MOCK_STORAGE) {
      const data = await mockStorage.create('${delegate}', {
        ...validated,
        tenantId,
      });
      return NextResponse.json({ data }, { status: 201 });
    }

    const data = await prisma.${delegate}.create({
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
`,
  };
};

const buildDetailRoute = (
  entity: EntitySchema,
): GeneratedFile => {
  const delegate = lowerFirst(entity.name);

  return {
    filePath: `app/api/${entity.nameSlug}/[id]/route.ts`,
    fileType: 'api-route',
    entityName: entity.name,
    content: `import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';
import { ${entity.name}UpdateSchema } from '@/lib/validations/${entity.nameSlug}';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const data = await prisma.${delegate}.findFirst({
    where: {
      id,
      tenantId: await getTenantId(request),
    },
  });

  if (!data) {
    return NextResponse.json({ error: '${entity.name} not found' }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const tenantId = await getTenantId(request);
    const validated = ${entity.name}UpdateSchema.parse(await request.json());

    const existing = await prisma.${delegate}.findFirst({ where: { id, tenantId } });
    if (!existing) {
      return NextResponse.json({ error: '${entity.name} not found' }, { status: 404 });
    }

    const data = await prisma.${delegate}.update({
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

  const existing = await prisma.${delegate}.findFirst({ where: { id, tenantId } });
  if (!existing) {
    return NextResponse.json({ error: '${entity.name} not found' }, { status: 404 });
  }

  await prisma.${delegate}.delete({ where: { id } });
  return NextResponse.json({ data: { id } });
}
`,
  };
};

export const generateCrudRoutes = (
  entity: EntitySchema,
): GeneratedFile[] => {
  return [
    buildListRoute(entity),
    buildDetailRoute(entity),
  ];
};

export const crudGenerator = {
  generate: generateCrudRoutes,
};

export default crudGenerator;
