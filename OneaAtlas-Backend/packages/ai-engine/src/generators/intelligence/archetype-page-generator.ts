/**
 * Archetype-Driven Page Generator
 * 
 * Generates pages with archetype-specific layouts and behaviors.
 * Connects archetype engine directly into page generation.
 */

import type {
  EntitySchema,
  FieldSchema,
  GeneratedFile,
} from '@oneatlas/shared';

import { logger } from '../../shared/utils/logger';
import { uxCopy } from '../shared/ux-copy.helper';
import { enumRenderer } from '../shared/enum-renderer';

import {
  uiArchetypeEngine,
  type ArchetypeDefinition,
} from '../../product/archetype/ui-archetype-engine';

import {
  adaptiveDashboardEngine,
} from '../../product/dashboard';

import {
  contextualWidgetGenerator,
} from '../../product/component';

import {
  intelligentEmptyStates,
} from '../../product/ux';

const SYSTEM_FIELDS = [
  'id',
  'createdAt',
  'updatedAt',
  'tenantId',
];

/**
 * Get display fields with archetype awareness
 */
const getDisplayFields = (
  fields: FieldSchema[],
  archetype: ArchetypeDefinition,
): FieldSchema[] => {
  const displayFields = fields
    .filter((field) => !SYSTEM_FIELDS.includes(field.name));

  // Adjust field count based on archetype density
  const fieldCount = archetype.layoutDensity === 'dense' ? 3 
    : archetype.layoutDensity === 'compact' ? 4 
    : archetype.layoutDensity === 'comfortable' ? 5 
    : 6;

  return displayFields.slice(0, fieldCount);
};

/**
 * Generate table columns with archetype-specific styling
 */
const generateColumns = (
  fields: FieldSchema[],
  archetype: ArchetypeDefinition,
): string => {
  return fields
    .map((field) => {
      const header = field.label || uxCopy.toTitleCase(field.name);
      const columnWidth = archetype.layoutDensity === 'dense' ? 'w-32' 
        : archetype.layoutDensity === 'compact' ? 'w-40' 
        : archetype.layoutDensity === 'comfortable' ? 'w-48' 
        : 'w-56';

      return `{
    accessorKey: '${field.name}',
    header: '${header}',
    className: '${columnWidth}',
  }`;
    })
    .join(',\n');
};

/**
 * Generate form input with archetype-aware styling
 */
const generateInput = (field: FieldSchema, archetype: ArchetypeDefinition): string => {
  const label = field.label || uxCopy.toTitleCase(field.name);
  const placeholder = field.placeholder || `Enter ${label.toLowerCase()}...`;

  // Archetype-specific spacing
  const spacingClass = archetype.layoutDensity === 'dense' ? 'gap-1' 
    : archetype.layoutDensity === 'compact' ? 'gap-2' 
    : archetype.layoutDensity === 'comfortable' ? 'gap-3' 
    : 'gap-4';

  switch (field.uiComponent) {
    case 'Textarea':
      return `
<div className="grid ${spacingClass}">
  <label className="text-sm font-medium">${label}</label>
  <Textarea
    {...register('${field.name}')}
    placeholder="${placeholder}"
    className="min-h-[120px]"
  />
</div>`;

    case 'Switch':
      return `
<div className="flex items-center justify-between gap-4 rounded-xl border bg-background px-4 py-3 shadow-sm">
  <div className="min-w-0">
    <label className="block text-sm font-medium">${label}</label>
    <p className="mt-1 text-sm text-muted-foreground">Toggle as needed</p>
  </div>
  <input
    type="checkbox"
    {...register('${field.name}')}
    className="h-4 w-4"
  />
</div>`;

    case 'DatePicker':
      return `
<div className="grid ${spacingClass}">
  <label className="text-sm font-medium">${label}</label>
  <Input
    type="date"
    {...register('${field.name}')}
    placeholder="${placeholder}"
  />
</div>`;

    case 'NumberInput':
      return `
<div className="grid ${spacingClass}">
  <label className="text-sm font-medium">${label}</label>
  <Input
    type="number"
    {...register('${field.name}')}
    placeholder="${placeholder}"
    ${field.semanticType === 'currency' ? 'step="0.01"' : ''}
  />
</div>`;

    case 'Select':
      const options = field.enumValues
        ? enumRenderer.renderEnumOptions(field.enumValues, field.name)
          .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
          .join('\n')
        : '<option value="">Select an option</option>';

      return `
<div className="grid ${spacingClass}">
  <label className="text-sm font-medium">${label}</label>
  <select
    {...register('${field.name}')}
    className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/30"
  >
    <option value="">Select ${label.toLowerCase()}...</option>
    ${options}
  </select>
</div>`;

    default:
      let inputType = 'text';
      if (field.semanticType === 'email') inputType = 'email';
      if (field.semanticType === 'password') inputType = 'password';
      if (field.semanticType === 'url') inputType = 'url';
      if (field.semanticType === 'phone') inputType = 'tel';

      return `
<div className="grid ${spacingClass}">
  <label className="text-sm font-medium">${label}</label>
  <Input
    type="${inputType}"
    {...register('${field.name}')}
    placeholder="${placeholder}"
  />
</div>`;
  }
};

/**
 * Build archetype-specific list page
 */
const buildArchetypeListPage = (
  entity: EntitySchema,
  archetype: ArchetypeDefinition,
): GeneratedFile => {
  const displayFields = getDisplayFields(entity.fields, archetype);
  const emptyState = intelligentEmptyStates.generateEmptyState(entity.name, archetype);
  const emptyStateMessage = uxCopy.generateEmptyStateMessage(entity.name, 'no-data');
  const createButtonText = uxCopy.generateButtonText('create', entity.name);

  // Archetype-specific layout classes
  const layoutClass = archetype.layoutDensity === 'dense' ? 'space-y-4' 
    : archetype.layoutDensity === 'compact' ? 'space-y-6' 
    : archetype.layoutDensity === 'comfortable' ? 'space-y-8' 
    : 'space-y-10';

  const containerClass = archetype.layoutDensity === 'dense' ? 'max-w-6xl' 
    : archetype.layoutDensity === 'compact' ? 'max-w-7xl' 
    : 'max-w-7xl';

  return {
    filePath: `${entity.pagePath}/page.tsx`,
    fileType: 'page',
    entityName: entity.name,
    content: `'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const columns = [
${generateColumns(displayFields, archetype)}
];

const mockData = Array.from({ length: 8 }).map((_, idx) => ({
  id: String(idx + 1),
${displayFields
  .map((field) => {
    const key = field.name;
    if (field.semanticType === 'date' || field.semanticType === 'datetime') {
      return `  ${key}: new Date(Date.now() - idx * 86400000).toISOString(),`;
    }
    if (field.semanticType === 'currency' || (field.prismaType && field.prismaType.toLowerCase().includes('number')) || (field.prismaType && field.prismaType.toLowerCase().includes('int')) || (field.prismaType && field.prismaType.toLowerCase().includes('float'))) {
      return `  ${key}: (idx + 1) * 10,`;
    }
    if (field.semanticType === 'boolean' || (field.prismaType && field.prismaType.toLowerCase().includes('bool'))) {
      return `  ${key}: idx % 2 === 0,`;
    }
    if (field.enumValues?.length) {
      return `  ${key}: ${JSON.stringify(field.enumValues)}[idx % ${field.enumValues.length}],`;
    }
    return `  ${key}: \`${field.label} \${idx + 1}\`,`;
  })
  .join('\n')}
}));

export default function ${entity.namePlural}Page() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsError(false);
      setIsLoading(true);
      try {
        const url = new URL('${entity.apiPath}', window.location.origin);
        if (search.trim()) url.searchParams.set('search', search.trim());
        const response = await fetch(url.toString());
        const result = await response.json();
        if (active) setData(result.data ?? []);
      } catch {
        if (active) {
          setIsError(true);
          setData(mockData);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [search]);

  return (
    <div className="${layoutClass}">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">${entity.namePlural}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your ${entity.namePlural?.toLowerCase() || 'items'}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          ${archetype.navigationStyle === 'command-palette' ? `
          <div className="relative">
            <Input
              placeholder="Search ${entity.namePlural?.toLowerCase() || 'items'}…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="sm:w-64"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
          ` : `
          <Input
            placeholder="Search ${entity.namePlural?.toLowerCase() || 'items'}…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="sm:w-64"
          />
          `}

          <Button asChild>
            <Link href="/${entity.nameSlug}/new" className="gap-2">
              <Plus className="h-4 w-4" />
              ${createButtonText}
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="space-y-3">
          <div className="rounded-xl border bg-background p-4 text-sm text-muted-foreground">
            Showing mock data to keep preview stable.
          </div>
          <DataTable columns={columns} data={data} />
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-background p-10 text-center shadow-sm">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center rounded-full bg-muted p-4">
              <span className="text-2xl">${emptyState.icon === 'empty' ? '📋' : emptyState.icon === 'user' ? '👤' : emptyState.icon === 'folder' ? '📁' : '📊'}</span>
            </div>
          </div>
          <p className="text-base font-semibold">
            ${emptyState.title}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            ${emptyState.description}
          </p>
          <Button asChild className="mt-6">
            <Link href="/${entity.nameSlug}/new">
              ${emptyState.actions[0]?.label || `Create Your First ${entity.name}`}
            </Link>
          </Button>
        </div>
      ) : (
        <DataTable columns={columns} data={data} />
      )}
    </div>
  );
}
`,
  };
};

/**
 * Build archetype-specific detail page
 */
const buildArchetypeDetailPage = (
  entity: EntitySchema,
  archetype: ArchetypeDefinition,
): GeneratedFile => {
  const editableFields = entity.fields.filter(
    (field) => !SYSTEM_FIELDS.includes(field.name),
  );
  const updateButtonText = uxCopy.generateButtonText('update', entity.name);

  const spacingClass = archetype.layoutDensity === 'dense' ? 'gap-1' 
    : archetype.layoutDensity === 'compact' ? 'gap-2' 
    : archetype.layoutDensity === 'comfortable' ? 'gap-3' 
    : 'gap-4';

  const maxWidthClass = archetype.layoutDensity === 'dense' ? 'max-w-3xl' 
    : archetype.layoutDensity === 'compact' ? 'max-w-4xl' 
    : 'max-w-5xl';

  return {
    filePath: `${entity.pagePath}/[id]/page.tsx`,
    fileType: 'page',
    entityName: entity.name,
    content: `'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ${entity.name}DetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { register, handleSubmit, reset } = useForm();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadRecord = async () => {
      try {
        if (!id) return;
        const response = await fetch('${entity.apiPath}/' + id);
        const result = await response.json();
        reset(result.data);
      } catch (error) {
        toast.error('Failed to load record');
      } finally {
        setIsLoading(false);
      }
    };

    void loadRecord();
  }, [id, reset]);

  const onSubmit = async (values: unknown) => {
    setIsSaving(true);
    try {
      if (!id) return;
      const response = await fetch('${entity.apiPath}/' + id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        toast.error('Failed to update record');
        return;
      }

      toast.success('${entity.name} updated successfully');
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="rounded-md border p-8 text-center text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto ${maxWidthClass} space-y-8">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/${entity.nameSlug}">
          <ChevronLeft className="h-4 w-4" />
          Back to ${entity.namePlural}
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Edit ${entity.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update ${entity.name?.toLowerCase() || 'item'} details
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <Card className="shadow-sm">
          <div className="p-6 space-y-${archetype.layoutDensity === 'dense' ? '3' : archetype.layoutDensity === 'compact' ? '4' : archetype.layoutDensity === 'comfortable' ? '5' : '6'}">
            ${editableFields.map(field => generateInput(field, archetype)).join('\n')}
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/${entity.nameSlug}">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : '${updateButtonText}'}
          </Button>
        </div>
      </form>
    </div>
  );
}
`,
  };
};

/**
 * Build archetype-specific create page
 */
const buildArchetypeCreatePage = (
  entity: EntitySchema,
  archetype: ArchetypeDefinition,
): GeneratedFile => {
  const createFields = entity.fields.filter(
    (field) => !SYSTEM_FIELDS.includes(field.name),
  );
  const createButtonText = uxCopy.generateButtonText('create', entity.name);

  const spacingClass = archetype.layoutDensity === 'dense' ? 'gap-1' 
    : archetype.layoutDensity === 'compact' ? 'gap-2' 
    : archetype.layoutDensity === 'comfortable' ? 'gap-3' 
    : 'gap-4';

  const maxWidthClass = archetype.layoutDensity === 'dense' ? 'max-w-3xl' 
    : archetype.layoutDensity === 'compact' ? 'max-w-4xl' 
    : 'max-w-5xl';

  return {
    filePath: `${entity.pagePath}/new/page.tsx`,
    fileType: 'page',
    entityName: entity.name,
    content: `'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function Create${entity.name}Page() {
  const router = useRouter();
  const { register, handleSubmit } = useForm();
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (values: unknown) => {
    setIsSaving(true);
    try {
      const response = await fetch('${entity.apiPath}', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        toast.error('Could not create ${entity.name}');
        return;
      }

      toast.success('${entity.name} created successfully');
      router.push('/${entity.nameSlug}');
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto ${maxWidthClass} space-y-8">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/${entity.nameSlug}">
          <ChevronLeft className="h-4 w-4" />
          Back to ${entity.namePlural}
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Create ${entity.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new ${entity.name?.toLowerCase() || 'item'} to your system
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <Card className="shadow-sm">
          <div className="p-6 space-y-${archetype.layoutDensity === 'dense' ? '3' : archetype.layoutDensity === 'compact' ? '4' : archetype.layoutDensity === 'comfortable' ? '5' : '6'}">
            ${createFields.map(field => generateInput(field, archetype)).join('\n')}
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/${entity.nameSlug}">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Creating...' : '${createButtonText}'}
          </Button>
        </div>
      </form>
    </div>
  );
}
`,
  };
};

/**
 * Generate archetype-specific pages
 */
export const generateArchetypePages = (
  entity: EntitySchema,
  archetype: ArchetypeDefinition,
): GeneratedFile[] => {
  logger.info('ArchetypePageGenerator', 'PAGES_GENERATED', 'Archetype-specific pages generated', {
    entity: entity.name,
    archetype: archetype.id,
  });

  return [
    buildArchetypeListPage(entity, archetype),
    buildArchetypeDetailPage(entity, archetype),
    buildArchetypeCreatePage(entity, archetype),
  ];
};

export const archetypePageGenerator = {
  generate: generateArchetypePages,
};

export default archetypePageGenerator;
