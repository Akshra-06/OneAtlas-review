/**
 * Workflow Inference Engine
 * Derives domain-specific workflows and dashboard layouts from app semantics
 */

import type { AppUnderstanding, EntityNode } from '@oneatlas/shared';

interface WorkflowPattern {
  name: string;
  description: string;
  actions: string[];
  metrics: Array<{ label: string; description: string }>;
}

interface DomainConfig {
  domain: string;
  workflows: WorkflowPattern[];
  dashboardMetrics: Array<{ label: string; description: string }>;
  dashboardActions: string[];
  entityCards: Record<string, string[]>;
}

/**
 * Domain-specific workflow patterns
 */
const DOMAIN_PATTERNS: Record<string, DomainConfig> = {
  crm: {
    domain: 'crm',
    workflows: [
      {
        name: 'Lead Nurturing',
        description: 'Convert leads into customers',
        actions: ['Create lead', 'Advance stage', 'Schedule follow-up', 'Create deal'],
        metrics: [],
      },
      {
        name: 'Deal Management',
        description: 'Track and manage sales opportunities',
        actions: ['Create deal', 'Update stage', 'Add activity', 'Close deal'],
        metrics: [],
      },
      {
        name: 'Activity Tracking',
        description: 'Log and track customer interactions',
        actions: ['Log call', 'Send email', 'Schedule meeting', 'Add note'],
        metrics: [],
      },
    ],
    dashboardMetrics: [
      { label: 'Active Leads', description: 'New opportunities in pipeline' },
      { label: 'Pipeline Value', description: 'Total weighted revenue' },
      { label: 'Conversion Rate', description: 'Leads to deals ratio' },
      { label: 'Activities This Week', description: 'Team engagement metric' },
    ],
    dashboardActions: ['Create lead', 'Create deal', 'Schedule activity', 'View pipeline'],
    entityCards: {
      Lead: ['name', 'company', 'email', 'stage', 'value'],
      Contact: ['name', 'email', 'phone', 'company', 'status'],
      Deal: ['name', 'value', 'stage', 'owner', 'closeDate'],
      Activity: ['type', 'subject', 'relatedTo', 'dueDate', 'owner'],
    },
  },

  inventory: {
    domain: 'inventory',
    workflows: [
      {
        name: 'Stock Management',
        description: 'Monitor and manage inventory levels',
        actions: ['Add stock', 'Remove stock', 'Adjust count', 'Check reorder'],
        metrics: [],
      },
      {
        name: 'Reorder Processing',
        description: 'Handle low stock notifications and purchasing',
        actions: ['Create reorder', 'Approve purchase', 'Receive goods', 'Process invoice'],
        metrics: [],
      },
      {
        name: 'Warehouse Operations',
        description: 'Manage warehouse transfers and locations',
        actions: ['Create transfer', 'Move stock', 'Scan barcode', 'Close transfer'],
        metrics: [],
      },
    ],
    dashboardMetrics: [
      { label: 'Low Stock Items', description: 'Products at or below reorder point' },
      { label: 'Warehouse Transfers', description: 'Open transfer workflows' },
      { label: 'Reorder Queue', description: 'Purchase actions ready for review' },
      { label: 'Total Inventory Value', description: 'Overall stock value' },
    ],
    dashboardActions: ['Create reorder', 'Transfer stock', 'Review low stock', 'Add product'],
    entityCards: {
      Product: ['sku', 'name', 'quantity', 'reorderPoint', 'price'],
      Warehouse: ['name', 'code', 'capacity', 'utilization', 'status'],
      Inventory: ['sku', 'quantity', 'location', 'lastCountDate', 'status'],
      Transfer: ['from', 'to', 'items', 'status', 'createdDate'],
    },
  },

  project: {
    domain: 'project',
    workflows: [
      {
        name: 'Sprint Management',
        description: 'Organize and track sprint cycles',
        actions: ['Create sprint', 'Add task to sprint', 'Start sprint', 'Complete sprint'],
        metrics: [],
      },
      {
        name: 'Task Management',
        description: 'Create and manage individual work items',
        actions: ['Create task', 'Assign owner', 'Update status', 'Add subtask'],
        metrics: [],
      },
      {
        name: 'Progress Tracking',
        description: 'Monitor project and team progress',
        actions: ['Log hours', 'Update progress', 'Report blocker', 'Close task'],
        metrics: [],
      },
    ],
    dashboardMetrics: [
      { label: 'Open Tasks', description: 'Work items not yet completed' },
      { label: 'Blocked Items', description: 'Tasks requiring intervention' },
      { label: 'Due This Week', description: 'Upcoming delivery commitments' },
      { label: 'Team Velocity', description: 'Average completion rate' },
    ],
    dashboardActions: ['Create task', 'Start sprint', 'Update status', 'Assign work'],
    entityCards: {
      Task: ['title', 'status', 'assignee', 'dueDate', 'priority'],
      Sprint: ['name', 'startDate', 'endDate', 'goal', 'status'],
      Project: ['name', 'status', 'owner', 'dueDate', 'progress'],
      Team: ['name', 'members', 'lead', 'status', 'active'],
    },
  },

  ecommerce: {
    domain: 'ecommerce',
    workflows: [
      {
        name: 'Order Processing',
        description: 'Handle customer orders from creation to delivery',
        actions: ['Create order', 'Process payment', 'Pack items', 'Ship order', 'Deliver'],
        metrics: [],
      },
      {
        name: 'Product Management',
        description: 'Manage product catalog and inventory',
        actions: ['Create product', 'Update listing', 'Set price', 'Upload image'],
        metrics: [],
      },
      {
        name: 'Customer Management',
        description: 'Handle customer accounts and interactions',
        actions: ['Create customer', 'Process return', 'Issue refund', 'Send feedback request'],
        metrics: [],
      },
    ],
    dashboardMetrics: [
      { label: 'Orders Today', description: 'New orders received' },
      { label: 'Revenue', description: 'Total sales amount' },
      { label: 'Pending Shipments', description: 'Orders ready to ship' },
      { label: 'Customer Satisfaction', description: 'Review score' },
    ],
    dashboardActions: ['Create order', 'View orders', 'Process return', 'View products'],
    entityCards: {
      Order: ['number', 'customer', 'total', 'status', 'createdDate'],
      Product: ['name', 'sku', 'price', 'stock', 'category'],
      Customer: ['name', 'email', 'orders', 'lastOrder', 'status'],
      Shipment: ['trackingNumber', 'carrier', 'estimatedDelivery', 'status'],
    },
  },

  blog: {
    domain: 'blog',
    workflows: [
      {
        name: 'Content Creation',
        description: 'Write and publish blog posts',
        actions: ['Create post', 'Write content', 'Add media', 'Schedule publish'],
        metrics: [],
      },
      {
        name: 'Comment Moderation',
        description: 'Manage reader comments',
        actions: ['Approve comment', 'Reject comment', 'Reply', 'Mark spam'],
        metrics: [],
      },
    ],
    dashboardMetrics: [
      { label: 'Published Posts', description: 'Live articles' },
      { label: 'Total Views', description: 'Cumulative page views' },
      { label: 'Pending Comments', description: 'Awaiting moderation' },
      { label: 'Subscribers', description: 'Email subscribers' },
    ],
    dashboardActions: ['Create post', 'View analytics', 'Approve comments', 'Email newsletter'],
    entityCards: {
      Post: ['title', 'author', 'publishedDate', 'views', 'status'],
      Comment: ['author', 'post', 'createdDate', 'status'],
      Category: ['name', 'postCount', 'subscribers'],
    },
  },
};

/**
 * Infer domain from app understanding
 */
export function inferDomain(understanding: AppUnderstanding): string {
  const keywords = [
    understanding.appName,
    understanding.appType,
    ...understanding.features.map((f) => f.name),
    ...understanding.entities.map((e) => e.name),
    ...understanding.workflows.map((w) => w.name),
    understanding.metadata?.rawPrompt || '',
  ]
    .join(' ')
    .toLowerCase();

  if (
    keywords.includes('crm') ||
    keywords.includes('lead') ||
    keywords.includes('contact') ||
    keywords.includes('pipeline') ||
    keywords.includes('deal')
  ) {
    return 'crm';
  }

  if (
    keywords.includes('inventory') ||
    keywords.includes('warehouse') ||
    keywords.includes('stock') ||
    keywords.includes('reorder') ||
    keywords.includes('product')
  ) {
    return 'inventory';
  }

  if (
    keywords.includes('project') ||
    keywords.includes('kanban') ||
    keywords.includes('task') ||
    keywords.includes('sprint') ||
    keywords.includes('assignee')
  ) {
    return 'project';
  }

  if (
    keywords.includes('ecommerce') ||
    keywords.includes('store') ||
    keywords.includes('order') ||
    keywords.includes('customer') ||
    keywords.includes('product')
  ) {
    return 'ecommerce';
  }

  if (
    keywords.includes('blog') ||
    keywords.includes('post') ||
    keywords.includes('article') ||
    keywords.includes('comment')
  ) {
    return 'blog';
  }

  return 'generic';
}

/**
 * Get domain configuration
 */
export function getDomainConfig(domain: string): DomainConfig | null {
  return DOMAIN_PATTERNS[domain] || null;
}

/**
 * Get workflow patterns for a domain
 */
export function getWorkflowPatterns(domain: string): WorkflowPattern[] {
  const config = getDomainConfig(domain);
  return config?.workflows || [];
}

/**
 * Get dashboard metrics for a domain
 */
export function getDashboardMetrics(domain: string): Array<{ label: string; description: string }> {
  const config = getDomainConfig(domain);
  return config?.dashboardMetrics || [];
}

/**
 * Get recommended actions for a domain
 */
export function getDashboardActions(domain: string): string[] {
  const config = getDomainConfig(domain);
  return config?.dashboardActions || [];
}

/**
 * Map entities to card fields based on domain
 */
export function getEntityCardFields(
  entityName: string,
  domain: string,
): string[] {
  const config = getDomainConfig(domain);
  return config?.entityCards[entityName] || [];
}

/**
 * Generate workflow definitions for a domain
 */
export function generateDomainWorkflows(domain: string): Array<{
  name: string;
  description: string;
  steps: string[];
}> {
  const patterns = getWorkflowPatterns(domain);

  return patterns.map((pattern) => ({
    name: pattern.name,
    description: pattern.description,
    steps: pattern.actions,
  }));
}

/**
 * Infer which entities form the core data model for a domain
 */
export function inferCoreEntities(
  entities: EntityNode[],
  domain: string,
): EntityNode[] {
  const config = getDomainConfig(domain);
  if (!config) return entities;

  const coreNames = Object.keys(config.entityCards);
  return entities.filter((e) =>
    coreNames.some((name) =>
      e.name.toLowerCase().includes(name.toLowerCase()),
    ),
  );
}

/**
 * Get layout template for a page based on domain and page type
 */
export function inferLayoutTemplate(
  pageName: string,
  domain: string,
  isDetailPage: boolean,
): string {
  const lowerPage = pageName.toLowerCase();

  if (isDetailPage) {
    if (domain === 'crm' && lowerPage.includes('lead')) return 'crm-lead-detail';
    if (domain === 'crm' && lowerPage.includes('deal')) return 'crm-deal-detail';
    if (domain === 'inventory') return 'inventory-product-detail';
    if (domain === 'project') return 'project-task-detail';
    return 'detail';
  }

  if (domain === 'crm' && lowerPage.includes('pipeline')) return 'crm-pipeline';
  if (domain === 'crm' && lowerPage.includes('lead')) return 'crm-leads-list';
  if (domain === 'inventory' && lowerPage.includes('stock')) return 'inventory-stock-grid';
  if (domain === 'project' && lowerPage.includes('board')) return 'project-kanban';
  if (domain === 'project' && lowerPage.includes('task')) return 'project-task-list';

  return 'list';
}

export const workflowInference = {
  inferDomain,
  getDomainConfig,
  getWorkflowPatterns,
  getDashboardMetrics,
  getDashboardActions,
  getEntityCardFields,
  generateDomainWorkflows,
  inferCoreEntities,
  inferLayoutTemplate,
};
