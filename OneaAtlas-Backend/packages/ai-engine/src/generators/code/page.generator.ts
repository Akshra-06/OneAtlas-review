import type {
  EntitySchema,
  FieldSchema,
  GeneratedFile,
} from '@oneatlas/shared';
import { uxCopy } from '../shared/ux-copy.helper';
import { enumRenderer } from '../shared/enum-renderer';
import { DynamicSectionPlanner } from '../dynamic/dynamic-section-planner';
import { ContextAwareSectionGeneration } from '../dynamic/context-aware-section-generation';

const SYSTEM_FIELDS = [
  'id',
  'createdAt',
  'updatedAt',
  'tenantId',
];

// Initialize dynamic section planner and context-aware generation
const dynamicSectionPlanner = new DynamicSectionPlanner();
const contextAwareSectionGeneration = new ContextAwareSectionGeneration();

/**
 * Get display fields with semantic awareness
 */
const getDisplayFields = (
  fields: FieldSchema[],
): FieldSchema[] => {
  return fields
    .filter((field) => !SYSTEM_FIELDS.includes(field.name))
    .slice(0, 4);
};

/**
 * Generate table columns with semantic labels
 */
const generateColumns = (
  fields: FieldSchema[],
): string => {
  return fields
    .map((field) => {
      const header = field.label || uxCopy.toTitleCase(field.name);
      return `{
    accessorKey: '${field.name}',
    header: '${header}',
  }`;
    })
    .join(',\n');
};

/**
 * Generate form input with semantic intelligence
 */
const generateInput = (field: FieldSchema, domain?: string, entityName?: string): string => {
  const label = field.label || uxCopy.toTitleCase(field.name);
  const placeholder = field.placeholder || `Enter ${label.toLowerCase()}...`;

  switch (field.uiComponent) {
    case 'Textarea':
      return `
<div className="grid gap-2">
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
<div className="grid gap-2">
  <label className="text-sm font-medium">${label}</label>
  <Input
    type="date"
    {...register('${field.name}')}
    placeholder="${placeholder}"
  />
</div>`;

    case 'NumberInput':
      return `
<div className="grid gap-2">
  <label className="text-sm font-medium">${label}</label>
  <Input
    type="number"
    {...register('${field.name}')}
    placeholder="${placeholder}"
    ${field.semanticType === 'currency' ? 'step="0.01"' : ''}
  />
</div>`;

    case 'Select':
      // Generate semantic enum options with domain-aware inference
      let enumValues = field.enumValues;
      
      // If enum values not provided, infer them from semantic type and domain
      if (!enumValues || enumValues.length === 0) {
        const inferred = enumRenderer.inferEnumValuesFromSemantic(field.semanticType || field.name, domain, entityName);
        if (inferred && inferred.length > 0) {
          enumValues = inferred;
        }
      }
      
      const options = enumValues && enumValues.length > 0
        ? enumRenderer.renderEnumOptions(enumValues, field.name)
          .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
          .join('\n')
        : '<option value="">Select an option</option>';

      return `
<div className="grid gap-2">
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
      // Intelligent input type based on semantic type
      let inputType = 'text';
      if (field.semanticType === 'email') inputType = 'email';
      if (field.semanticType === 'password') inputType = 'password';
      if (field.semanticType === 'url') inputType = 'url';
      if (field.semanticType === 'phone') inputType = 'tel';

      return `
<div className="grid gap-2">
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
 * Create a generateInput function with domain context
 */
const createGenerateInput = (domain?: string, entityName?: string) => {
  return (field: FieldSchema) => generateInput(field, domain, entityName);
};

/**
 * Build list page with semantic rendering
 */
const buildListPage = (
  entity: EntitySchema,
): GeneratedFile => {
  const displayFields = getDisplayFields(entity.fields);
  const emptyStateMessage = uxCopy.generateEmptyStateMessage(
    entity.name,
    'no-data',
  );
  const createButtonText = uxCopy.generateButtonText('create', entity.name);

  return {
    filePath: `${entity.pagePath}/page.tsx`,
    fileType: 'page',
    entityName: entity.name,
    content: `'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { Plus } from 'lucide-react';

import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const columns = [
${generateColumns(displayFields)}
];

const getMockData = () => Array.from({ length: 8 }).map((_, idx) => ({
  id: String(idx + 1),
${displayFields
  .map((field) => {
    const key = field.name;
    if (field.semanticType === 'date' || field.semanticType === 'datetime') {
      return `  ${key}: new Date(Date.now() - idx * 86400000).toISOString(),`;
    }
    if (field.semanticType === 'currency' || field.prismaType === 'Int' || field.prismaType === 'Float') {
      return `  ${key}: (idx + 1) * 10,`;
    }
    if (field.semanticType === 'boolean' || field.prismaType === 'Boolean') {
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
  const mockData = useMemo(() => getMockData(), []);

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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">${entity.namePlural}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your ${entity.namePlural?.toLowerCase() || 'items'}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search ${entity.namePlural?.toLowerCase() || 'items'}…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="sm:w-64"
          />

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
          <p className="text-base font-semibold">
            ${emptyStateMessage.replace('to get started.', '')}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            ${emptyStateMessage}
          </p>
          <Button asChild className="mt-6">
            <Link href="/${entity.nameSlug}/new">
              Create Your First ${entity.name}
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
 * Build detail/edit page with semantic rendering
 */
const buildDetailPage = (
  entity: EntitySchema,
  domain?: string,
): GeneratedFile => {
  const inferredDomain = domain || inferDomainFromEntity(entity);
  const editableFields = entity.fields.filter(
    (field) => !SYSTEM_FIELDS.includes(field.name),
  );
  const updateButtonText = uxCopy.generateButtonText('update', entity.name);

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
    <div className="mx-auto max-w-2xl space-y-8">
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
          <div className="p-6 space-y-6">
            ${editableFields.map(createGenerateInput(inferredDomain, entity.name)).join('\n')}
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
 * Infer domain from entity schema
 */
const inferDomainFromEntity = (entity: EntitySchema): string => {
  const entityName = entity.name.toLowerCase();
  const entityNames = [entityName];
  
  if (entityName.includes('patient') || entityName.includes('doctor') || entityName.includes('medical') || entityName.includes('appointment')) return 'healthcare';
  if (entityName.includes('customer') || entityName.includes('lead') || entityName.includes('opportunity')) return 'crm';
  if (entityName.includes('order') || entityName.includes('product') || entityName.includes('cart')) return 'ecommerce';
  if (entityName.includes('candidate') || entityName.includes('job') || entityName.includes('application')) return 'ats';
  if (entityName.includes('invoice') || entityName.includes('payment') || entityName.includes('expense')) return 'finance';
  if (entityName.includes('shipment') || entityName.includes('delivery') || entityName.includes('logistics')) return 'logistics';
  if (entityName.includes('ticket') || entityName.includes('support') || entityName.includes('issue')) return 'support';
  if (entityName.includes('task') || entityName.includes('project') || entityName.includes('workflow')) return 'project_management';
  if (entityName.includes('course') || entityName.includes('student') || entityName.includes('enrollment')) return 'education';
  
  return 'generic';
};

/**
 * Build create page with semantic rendering
 */
const buildCreatePage = (
  entity: EntitySchema,
  domain?: string,
): GeneratedFile => {
  const inferredDomain = domain || inferDomainFromEntity(entity);
  const createFields = entity.fields.filter(
    (field) => !SYSTEM_FIELDS.includes(field.name),
  );
  const createButtonText = uxCopy.generateButtonText('create', entity.name);

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
    <div className="mx-auto max-w-2xl space-y-8">
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
          <div className="p-6 space-y-6">
            ${createFields.map(createGenerateInput(inferredDomain, entity.name)).join('\n')}
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
 * Get domain-specific UI components and styling
 */
const getDomainSpecificUI = (domain: string): { components: string[], styling: string[], icons: string[] } => {
  const domainConfig: Record<string, { components: string[], styling: string[], icons: string[] }> = {
    healthcare: {
      components: ['PatientCard', 'AppointmentCalendar', 'MedicalRecordViewer', 'VitalSignsChart'],
      styling: ['medical-blue', 'health-green', 'urgent-red', 'calm-teal'],
      icons: ['Stethoscope', 'HeartPulse', 'Activity', 'Calendar', 'User'],
    },
    crm: {
      components: ['LeadCard', 'PipelineView', 'ActivityFeed', 'ContactManager'],
      styling: ['sales-blue', 'growth-green', 'warning-orange', 'success-green'],
      icons: ['Users', 'TrendingUp', 'Phone', 'Mail', 'Building2'],
    },
    ecommerce: {
      components: ['ProductCard', 'OrderTracker', 'InventoryWidget', 'CustomerReview'],
      styling: ['shop-purple', 'cart-blue', 'deal-orange', 'stock-green'],
      icons: ['ShoppingCart', 'Package', 'CreditCard', 'Truck', 'Star'],
    },
    ats: {
      components: ['CandidateCard', 'InterviewScheduler', 'HiringFunnel', 'SkillAssessment'],
      styling: ['hire-blue', 'interview-purple', 'offer-green', 'reject-red'],
      icons: ['UserCheck', 'Calendar', 'TrendingUp', 'Briefcase', 'GraduationCap'],
    },
    finance: {
      components: ['TransactionCard', 'BudgetChart', 'InvoiceWidget', 'FinancialReport'],
      styling: ['money-green', 'expense-red', 'profit-blue', 'neutral-gray'],
      icons: ['DollarSign', 'TrendingUp', 'PieChart', 'FileText', 'Calculator'],
    },
    logistics: {
      components: ['ShipmentTracker', 'FleetMap', 'DeliveryCard', 'RouteOptimizer'],
      styling: ['fleet-blue', 'delivery-green', 'delay-orange', 'route-purple'],
      icons: ['Truck', 'MapPin', 'Navigation', 'Package', 'Clock'],
    },
    support: {
      components: ['TicketCard', 'SLAMonitor', 'AgentDashboard', 'KnowledgeBase'],
      styling: ['support-blue', 'ticket-orange', 'resolved-green', 'escalated-red'],
      icons: ['Headphones', 'MessageSquare', 'AlertCircle', 'CheckCircle', 'User'],
    },
    project_management: {
      components: ['TaskCard', 'GanttChart', 'TeamBoard', 'MilestoneTracker'],
      styling: ['task-blue', 'progress-green', 'blocked-red', 'completed-purple'],
      icons: ['CheckSquare', 'Calendar', 'Users', 'BarChart', 'Target'],
    },
    education: {
      components: ['CourseCard', 'StudentProgress', 'AssignmentTracker', 'GradeBook'],
      styling: ['learn-blue', 'grade-green', 'assignment-orange', 'progress-purple'],
      icons: ['BookOpen', 'GraduationCap', 'Award', 'Users', 'Clipboard'],
    },
    analytics: {
      components: ['DataCard', 'TrendChart', 'MetricWidget', 'ReportGenerator'],
      styling: ['data-blue', 'insight-green', 'alert-orange', 'neutral-gray'],
      icons: ['BarChart', 'LineChart', 'PieChart', 'TrendingUp', 'Database'],
    },
  };

  return domainConfig[domain] || domainConfig.analytics || {
    components: ['DataCard', 'TrendChart', 'MetricWidget', 'ReportGenerator'],
    styling: ['data-blue', 'insight-green', 'alert-orange', 'neutral-gray'],
    icons: ['BarChart', 'LineChart', 'PieChart', 'TrendingUp', 'Database'],
  };
};

/**
 * Build dynamic dashboard that adapts to entities from prompt
 * Uses workflow-native layout generation instead of static templates
 */
const buildDashboard = (
  entities: EntitySchema[],
): GeneratedFile => {
  const entityEndpoints = entities.map(e => ({
    name: e.namePlural,
    slug: e.nameSlug,
    label: e.name,
  }));

  // Infer domain and workflow from entities for dynamic section planning
  const domain = inferDomainFromEntities(entities);
  const workflow = inferWorkflowFromEntities(entities);

  // Get domain-specific UI components and styling
  const domainUI = getDomainSpecificUI(domain);

  // Generate dynamic section graph based on domain and workflow
  const sectionGraph = dynamicSectionPlanner.planSections(domain, { id: 'default', name: 'default' } as any, workflow);

  // Apply context-aware section generation for adaptive composition
  const context = {
    user: {
      id: 'default',
      role: 'admin',
      permissions: ['read', 'write', 'delete'],
      preferences: {},
    },
    session: {
      id: 'default',
      startTime: new Date().toISOString(),
      duration: 0,
      device: 'web',
    },
    application: {
      state: 'active',
      workflow: workflow,
      stage: 'production',
      data: {},
    },
    environment: {
      time: new Date().toISOString(),
      timezone: 'UTC',
      language: 'en',
      theme: 'light' as const,
    },
  };

  const contextAwareGraph = contextAwareSectionGeneration.generateContextAwareSections(
    context,
    sectionGraph,
    { id: 'default', name: 'default' } as any
  );

  return {
    filePath: 'app/(dashboard)/page.tsx',
    fileType: 'page',
    entityName: 'Dashboard',
    content: `"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, TrendingUp, Activity } from "lucide-react";

const ENTITY_ENDPOINTS = ${JSON.stringify(entityEndpoints)};

// Domain-specific configuration for ${domain}
const DOMAIN_CONFIG = ${JSON.stringify(domainUI)};

// Dynamic section configuration based on workflow-native layout generation
// with adaptive composition based on context (user role, workflow, state)
const DYNAMIC_SECTIONS = ${JSON.stringify(contextAwareGraph.nodes.map(n => ({
  id: n.id,
  type: n.type,
  title: n.title,
  span: n.span,
  height: n.height,
  priority: n.priority
})))};

export default function DashboardHome() {
  const [entityData, setEntityData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    const loadAllData = async () => {
      const data: Record<string, any> = {};
      let total = 0;

      const promises = ENTITY_ENDPOINTS.map(async (entity: any) => {
        try {
          const response = await fetch(\`/api/\${entity.slug}\`);
          if (response.ok) {
            const result = await response.json();
            data[entity.slug] = result.data || [];
            total += (result.data || []).length;
          }
        } catch (error) {
          data[entity.slug] = [];
        }
      });

      await Promise.all(promises);
      setEntityData(data);
      setTotalRecords(total);
      setIsLoading(false);
    };

    loadAllData();
  }, []);

  const activeEntities = ENTITY_ENDPOINTS.filter((e: any) => entityData[e.slug] && entityData[e.slug].length > 0);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{totalRecords}</div>
            <div className="text-sm text-muted-foreground">Across all entities</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Active Entities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-blue-600">{activeEntities.length}</div>
            <div className="text-sm text-muted-foreground">With data</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Data Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-green-600">+{totalRecords}</div>
            <div className="text-sm text-muted-foreground">Total created</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-500" />
              Entity Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-purple-600">{ENTITY_ENDPOINTS.length}</div>
            <div className="text-sm text-muted-foreground">Available</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {activeEntities.map((entity: any) => {
          const data = entityData[entity.slug] || [];
          const displayFields = data.length > 0 ? Object.keys(data[0]).filter((k: string) => !['id', 'createdAt', 'updatedAt', 'tenantId'].includes(k)).slice(0, 3) : [];
          const columns = displayFields.map((field: string) => ({
            accessorKey: field,
            header: field.charAt(0).toUpperCase() + field.slice(1),
          }));

          return (
            <Card key={entity.slug}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{entity.name}</span>
                  <Badge variant="secondary">{data.length} records</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.length === 0 ? (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    No {entity.label.toLowerCase()}s yet
                  </div>
                ) : (
                  <DataTable columns={columns} data={data.slice(0, 5)} />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {activeEntities.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No data yet. Create your first record to see it appear on the dashboard.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
`,
  };
};

/**
 * Infer domain from entities for workflow-native layout generation
 */
const inferDomainFromEntities = (entities: EntitySchema[]): string => {
  const entityNames = entities.map(e => e.name.toLowerCase()).join(' ');
  
  if (entityNames.includes('patient') || entityNames.includes('medical') || entityNames.includes('doctor')) return 'healthcare';
  if (entityNames.includes('customer') || entityNames.includes('lead') || entityNames.includes('deal')) return 'crm';
  if (entityNames.includes('order') || entityNames.includes('product') || entityNames.includes('inventory')) return 'ecommerce';
  if (entityNames.includes('candidate') || entityNames.includes('job') || entityNames.includes('application')) return 'ats';
  if (entityNames.includes('invoice') || entityNames.includes('payment') || entityNames.includes('budget')) return 'finance';
  if (entityNames.includes('shipment') || entityNames.includes('delivery') || entityNames.includes('fleet')) return 'logistics';
  if (entityNames.includes('ticket') || entityNames.includes('support') || entityNames.includes('issue')) return 'support';
  if (entityNames.includes('task') || entityNames.includes('project') || entityNames.includes('milestone')) return 'project_management';
  if (entityNames.includes('course') || entityNames.includes('student') || entityNames.includes('enrollment')) return 'education';
  
  return 'analytics'; // Default domain
};

/**
 * Infer workflow from entities for workflow-native layout generation
 */
const inferWorkflowFromEntities = (entities: EntitySchema[]): string => {
  const entityNames = entities.map(e => e.name.toLowerCase()).join(' ');
  
  if (entityNames.includes('calendar') || entityNames.includes('appointment') || entityNames.includes('schedule')) return 'scheduling';
  if (entityNames.includes('pipeline') || entityNames.includes('stage') || entityNames.includes('opportunity')) return 'selling';
  if (entityNames.includes('task') || entityNames.includes('workflow') || entityNames.includes('process')) return 'task_management';
  
  return 'general'; // Default workflow
};

export const generatePages = (
  entity: EntitySchema,
  domain?: string,
): GeneratedFile[] => {
  const inferredDomain = domain || inferDomainFromEntity(entity);
  return [
    buildListPage(entity),
    buildDetailPage(entity, inferredDomain),
    buildCreatePage(entity, inferredDomain),
  ];
};

export const generateDashboard = (
  entities: EntitySchema[],
): GeneratedFile => {
  return buildDashboard(entities);
};

export const pageGenerator = {
  generate: generatePages,
  generateDashboard,
};

export default pageGenerator;
