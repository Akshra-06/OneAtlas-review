/**
 * Domain Knowledge Base
 * 
 * Stores domain-specific patterns and knowledge.
 * Provides context-aware recommendations for generation.
 */

import { logger } from '../../shared/utils/logger';

export interface DomainKnowledge {
  domain: string;
  description: string;
  commonEntities: string[];
  typicalWorkflows: string[];
  uiPatterns: string[];
  bestPractices: string[];
  commonMetrics: string[];
  dataModels: string[];
  integrations: string[];
  securityConsiderations: string[];
}

export interface KnowledgeConfig {
  enableLearning: boolean;
  autoUpdate: boolean;
  knowledgeRetentionDays: number;
}

const DEFAULT_CONFIG: KnowledgeConfig = {
  enableLearning: true,
  autoUpdate: false,
  knowledgeRetentionDays: 90,
};

/**
 * Domain Knowledge Base
 * 
 * Manages domain-specific knowledge:
 * - Domain patterns
 * - Best practices
 * - Common workflows
 * - UI patterns
 * - Security considerations
 */
export class DomainKnowledgeBase {
  private config: KnowledgeConfig;
  private knowledge: Map<string, DomainKnowledge> = new Map();
  private usageHistory: Map<string, number> = new Map();

  constructor(config: Partial<KnowledgeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeKnowledge();
  }

  /**
   * Initialize domain knowledge
   */
  private initializeKnowledge(): void {
    // E-commerce knowledge
    this.knowledge.set('ecommerce', {
      domain: 'ecommerce',
      description: 'Online shopping and retail applications',
      commonEntities: ['Product', 'Category', 'Order', 'Customer', 'Cart', 'Payment', 'Shipping', 'Review', 'Wishlist', 'Coupon'],
      typicalWorkflows: ['Browse products', 'Add to cart', 'Checkout', 'Payment processing', 'Order tracking', 'Review submission'],
      uiPatterns: ['Product grid', 'Shopping cart sidebar', 'Checkout wizard', 'Order history table', 'Product detail page'],
      bestPractices: ['Implement search with filters', 'Show product images from multiple angles', 'Provide clear pricing', 'Enable guest checkout', 'Show stock availability'],
      commonMetrics: ['Conversion rate', 'Average order value', 'Cart abandonment rate', 'Customer lifetime value', 'Return rate'],
      dataModels: ['Product catalog', 'Order management', 'Customer profiles', 'Inventory tracking'],
      integrations: ['Payment gateways', 'Shipping providers', 'Email marketing', 'Analytics platforms'],
      securityConsiderations: ['PCI compliance for payments', 'Secure customer data storage', 'Fraud detection', 'Secure checkout process'],
    });

    // Healthcare knowledge
    this.knowledge.set('healthcare', {
      domain: 'healthcare',
      description: 'Medical and healthcare applications',
      commonEntities: ['Patient', 'Doctor', 'Appointment', 'Diagnosis', 'Prescription', 'MedicalRecord', 'Insurance', 'Medication', 'VitalSigns'],
      typicalWorkflows: ['Patient registration', 'Appointment scheduling', 'Diagnosis recording', 'Prescription management', 'Medical history review'],
      uiPatterns: ['Patient dashboard', 'Appointment calendar', 'Medical record timeline', 'Prescription list', 'Vital signs chart'],
      bestPractices: ['HIPAA compliance', 'Clear patient identification', 'Secure medical records', 'Emergency contact display', 'Medication interaction warnings'],
      commonMetrics: ['Patient satisfaction', 'Appointment no-show rate', 'Treatment outcomes', 'Readmission rate', 'Patient wait time'],
      dataModels: ['Patient records', 'Appointment scheduling', 'Medical history', 'Prescription database'],
      integrations: ['EHR systems', 'Lab systems', 'Pharmacy systems', 'Insurance providers'],
      securityConsiderations: ['HIPAA compliance', 'Encrypted patient data', 'Access controls', 'Audit logging', 'Secure messaging'],
    });

    // Finance knowledge
    this.knowledge.set('finance', {
      domain: 'finance',
      description: 'Financial and banking applications',
      commonEntities: ['Account', 'Transaction', 'Investment', 'Budget', 'Expense', 'Income', 'Loan', 'CreditCard', 'Bank'],
      typicalWorkflows: ['Account management', 'Transaction recording', 'Budget tracking', 'Investment monitoring', 'Loan application'],
      uiPatterns: ['Account overview dashboard', 'Transaction list', 'Budget progress bars', 'Investment portfolio', 'Financial reports'],
      bestPractices: ['Multi-factor authentication', 'Real-time transaction updates', 'Clear financial summaries', 'Budget alerts', 'Investment risk indicators'],
      commonMetrics: ['Account balance', 'Spending trends', 'Savings rate', 'Investment returns', 'Debt-to-income ratio'],
      dataModels: ['Account ledger', 'Transaction history', 'Budget categories', 'Investment portfolio'],
      integrations: ['Bank APIs', 'Payment processors', 'Tax services', 'Financial data providers'],
      securityConsiderations: ['PCI compliance', 'Encryption of financial data', 'Fraud detection', 'Secure authentication', 'Regulatory compliance'],
    });

    // Education knowledge
    this.knowledge.set('education', {
      domain: 'education',
      description: 'Educational and learning management applications',
      commonEntities: ['Student', 'Teacher', 'Course', 'Assignment', 'Exam', 'Grade', 'Class', 'Curriculum', 'Enrollment'],
      typicalWorkflows: ['Course enrollment', 'Assignment submission', 'Grading', 'Progress tracking', 'Attendance recording'],
      uiPatterns: ['Course catalog', 'Student dashboard', 'Assignment submission form', 'Grade book', 'Progress tracker'],
      bestPractices: ['Clear learning objectives', 'Progress visualization', 'Assignment deadlines', 'Grade transparency', 'Communication tools'],
      commonMetrics: ['Student engagement', 'Course completion rate', 'Average grade', 'Assignment submission rate', 'Attendance rate'],
      dataModels: ['Student records', 'Course catalog', 'Assignment database', 'Grade book'],
      integrations: ['LMS systems', 'Video conferencing', 'Plagiarism detection', 'Communication tools'],
      securityConsiderations: ['FERPA compliance', 'Student data privacy', 'Secure grade storage', 'Access controls', 'Parental access controls'],
    });

    // Project Management knowledge
    this.knowledge.set('project_management', {
      domain: 'project_management',
      description: 'Project and task management applications',
      commonEntities: ['Project', 'Task', 'Milestone', 'Team', 'Assignee', 'Sprint', 'Workflow', 'Timeline', 'Resource'],
      typicalWorkflows: ['Project creation', 'Task assignment', 'Progress tracking', 'Sprint planning', 'Resource allocation'],
      uiPatterns: ['Kanban board', 'Gantt chart', 'Task list', 'Sprint backlog', 'Team dashboard'],
      bestPractices: ['Clear task priorities', 'Deadline visibility', 'Team workload balance', 'Progress indicators', 'Dependency tracking'],
      commonMetrics: ['Project completion rate', 'Task velocity', 'Sprint burndown', 'Team utilization', 'On-time delivery rate'],
      dataModels: ['Project hierarchy', 'Task dependencies', 'Sprint backlog', 'Team assignments'],
      integrations: ['Version control', 'Communication tools', 'Time tracking', 'Documentation tools'],
      securityConsiderations: ['Project access controls', 'Team member privacy', 'Secure task data', 'Audit logging'],
    });

    // CRM knowledge
    this.knowledge.set('crm', {
      domain: 'crm',
      description: 'Customer relationship management applications',
      commonEntities: ['Lead', 'Contact', 'Deal', 'Pipeline', 'Opportunity', 'Customer', 'Campaign', 'Interaction'],
      typicalWorkflows: ['Lead capture', 'Contact management', 'Deal progression', 'Pipeline management', 'Campaign execution'],
      uiPatterns: ['Pipeline view', 'Contact list', 'Deal dashboard', 'Campaign calendar', 'Interaction timeline'],
      bestPractices: ['Lead scoring', 'Pipeline visibility', 'Customer communication history', 'Deal stage tracking', 'Campaign analytics'],
      commonMetrics: ['Lead conversion rate', 'Deal velocity', 'Pipeline value', 'Customer acquisition cost', 'Campaign ROI'],
      dataModels: ['Lead database', 'Contact records', 'Pipeline stages', 'Campaign data'],
      integrations: ['Email marketing', 'Social media', 'Phone systems', 'Analytics platforms'],
      securityConsiderations: ['GDPR compliance', 'Customer data privacy', 'Secure communication', 'Access controls', 'Data retention policies'],
    });

    // CMS knowledge
    this.knowledge.set('cms', {
      domain: 'cms',
      description: 'Content management applications',
      commonEntities: ['Article', 'Blog', 'Media', 'Category', 'Tag', 'Author', 'Comment', 'Page'],
      typicalWorkflows: ['Content creation', 'Media upload', 'Publishing', 'Content scheduling', 'Comment moderation'],
      uiPatterns: ['Content editor', 'Media library', 'Content calendar', 'Publishing workflow', 'Comment moderation queue'],
      bestPractices: ['Rich text editing', 'Media optimization', 'SEO tools', 'Content scheduling', 'Version control'],
      commonMetrics: ['Content engagement', 'Page views', 'Time on page', 'Bounce rate', 'Social shares'],
      dataModels: ['Content repository', 'Media library', 'Taxonomy system', 'User permissions'],
      integrations: ['Social media', 'Analytics', 'CDN services', 'SEO tools'],
      securityConsiderations: ['Content access controls', 'Secure file uploads', 'XSS prevention', 'CSRF protection', 'User authentication'],
    });

    // Analytics knowledge
    this.knowledge.set('analytics', {
      domain: 'analytics',
      description: 'Data analytics and reporting applications',
      commonEntities: ['Metric', 'Chart', 'Dashboard', 'Report', 'Insight', 'KPI', 'DataPoint', 'Trend'],
      typicalWorkflows: ['Data collection', 'Metric calculation', 'Visualization', 'Report generation', 'Insight discovery'],
      uiPatterns: ['Dashboard grid', 'Chart library', 'Report builder', 'Data table', 'Filter panel'],
      bestPractices: ['Real-time updates', 'Interactive charts', 'Drill-down capabilities', 'Customizable dashboards', 'Export options'],
      commonMetrics: ['User engagement', 'Conversion rate', 'Retention rate', 'Session duration', 'Page views'],
      dataModels: ['Event tracking', 'Metric definitions', 'Dashboard configurations', 'Report templates'],
      integrations: ['Data sources', 'Visualization libraries', 'Export services', 'Notification systems'],
      securityConsiderations: ['Data access controls', 'Query rate limiting', 'Secure data storage', 'Audit logging', 'Data anonymization'],
    });

    // HR knowledge
    this.knowledge.set('hr', {
      domain: 'hr',
      description: 'Human resources management applications',
      commonEntities: ['Employee', 'Recruitment', 'Payroll', 'Leave', 'Performance', 'Training', 'Department', 'Position'],
      typicalWorkflows: ['Recruitment process', 'Onboarding', 'Payroll processing', 'Leave management', 'Performance reviews'],
      uiPatterns: ['Employee directory', 'Recruitment pipeline', 'Payroll dashboard', 'Leave calendar', 'Performance review form'],
      bestPractices: ['Employee self-service', 'Clear leave policies', 'Performance tracking', 'Training records', 'Compliance monitoring'],
      commonMetrics: ['Employee satisfaction', 'Turnover rate', 'Time-to-hire', 'Training completion rate', 'Leave utilization'],
      dataModels: ['Employee records', 'Recruitment pipeline', 'Payroll data', 'Leave balances'],
      integrations: ['Payroll providers', 'Background check services', 'Training platforms', 'Compliance systems'],
      securityConsiderations: ['Employee data privacy', 'Secure payroll data', 'Access controls', 'Compliance reporting', 'Audit logging'],
    });

    // Inventory knowledge
    this.knowledge.set('inventory', {
      domain: 'inventory',
      description: 'Inventory and warehouse management applications',
      commonEntities: ['Stock', 'Warehouse', 'Item', 'SKU', 'Shipment', 'Receiving', 'Fulfillment', 'Supplier', 'Vendor'],
      typicalWorkflows: ['Stock receiving', 'Inventory counting', 'Order fulfillment', 'Shipment tracking', 'Supplier management'],
      uiPatterns: ['Inventory dashboard', 'Warehouse map', 'Shipment tracker', 'Stock level indicators', 'Supplier list'],
      bestPractices: ['Real-time stock levels', 'Low stock alerts', 'Barcode scanning', 'Batch tracking', 'Multi-warehouse support'],
      commonMetrics: ['Stock accuracy', 'Order fulfillment rate', 'Inventory turnover', 'Stockout rate', 'Supplier performance'],
      dataModels: ['Inventory ledger', 'Warehouse locations', 'Shipment records', 'Supplier database'],
      integrations: ['Barcode scanners', 'Shipping carriers', 'Supplier systems', 'POS systems'],
      securityConsiderations: ['Inventory access controls', 'Secure supplier data', 'Audit logging', 'Fraud detection', 'Data integrity'],
    });

    logger.info('DomainKnowledgeBase', 'KNOWLEDGE_INITIALIZED', 'Domain knowledge initialized', {
      domains: this.knowledge.size,
    });
  }

  /**
   * Get domain knowledge
   */
  getKnowledge(domain: string): DomainKnowledge | undefined {
    const knowledge = this.knowledge.get(domain);
    
    if (knowledge) {
      // Track usage
      this.usageHistory.set(domain, (this.usageHistory.get(domain) || 0) + 1);
    }

    return knowledge;
  }

  /**
   * Add domain knowledge
   */
  addKnowledge(knowledge: DomainKnowledge): void {
    this.knowledge.set(knowledge.domain, knowledge);

    logger.info('DomainKnowledgeBase', 'KNOWLEDGE_ADDED', 'Domain knowledge added', {
      domain: knowledge.domain,
    });
  }

  /**
   * Update domain knowledge
   */
  updateKnowledge(domain: string, updates: Partial<DomainKnowledge>): boolean {
    const existing = this.knowledge.get(domain);
    
    if (!existing) {
      return false;
    }

    const updated = { ...existing, ...updates };
    this.knowledge.set(domain, updated);

    logger.info('DomainKnowledgeBase', 'KNOWLEDGE_UPDATED', 'Domain knowledge updated', {
      domain,
    });

    return true;
  }

  /**
   * Remove domain knowledge
   */
  removeKnowledge(domain: string): boolean {
    const deleted = this.knowledge.delete(domain);

    if (deleted) {
      this.usageHistory.delete(domain);
      logger.info('DomainKnowledgeBase', 'KNOWLEDGE_REMOVED', 'Domain knowledge removed', {
        domain,
      });
    }

    return deleted;
  }

  /**
   * List all domains
   */
  listDomains(): string[] {
    return Array.from(this.knowledge.keys());
  }

  /**
   * Get recommendations for domain
   */
  getRecommendations(domain: string, context?: string): string[] {
    const knowledge = this.knowledge.get(domain);
    
    if (!knowledge) {
      return [];
    }

    const recommendations: string[] = [];

    // Add best practices
    recommendations.push(...knowledge.bestPractices);

    // Add context-specific recommendations
    if (context) {
      const lowerContext = context.toLowerCase();
      
      if (lowerContext.includes('security') || lowerContext.includes('auth')) {
        recommendations.push(...knowledge.securityConsiderations);
      }
      
      if (lowerContext.includes('ui') || lowerContext.includes('interface')) {
        recommendations.push(...knowledge.uiPatterns);
      }
      
      if (lowerContext.includes('data') || lowerContext.includes('model')) {
        recommendations.push(...knowledge.dataModels);
      }
    }

    return recommendations;
  }

  /**
   * Get common entities for domain
   */
  getCommonEntities(domain: string): string[] {
    const knowledge = this.knowledge.get(domain);
    return knowledge?.commonEntities || [];
  }

  /**
   * Get typical workflows for domain
   */
  getTypicalWorkflows(domain: string): string[] {
    const knowledge = this.knowledge.get(domain);
    return knowledge?.typicalWorkflows || [];
  }

  /**
   * Get UI patterns for domain
   */
  getUIPatterns(domain: string): string[] {
    const knowledge = this.knowledge.get(domain);
    return knowledge?.uiPatterns || [];
  }

  /**
   * Get common metrics for domain
   */
  getCommonMetrics(domain: string): string[] {
    const knowledge = this.knowledge.get(domain);
    return knowledge?.commonMetrics || [];
  }

  /**
   * Get usage statistics
   */
  getUsageStatistics(): Record<string, number> {
    return Object.fromEntries(this.usageHistory);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<KnowledgeConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('DomainKnowledgeBase', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): KnowledgeConfig {
    return { ...this.config };
  }

  /**
   * Clear all knowledge
   */
  clearAll(): void {
    this.knowledge.clear();
    this.usageHistory.clear();

    logger.info('DomainKnowledgeBase', 'ALL_CLEARED', 'All knowledge cleared');
  }
}

export const domainKnowledgeBase = new DomainKnowledgeBase();
