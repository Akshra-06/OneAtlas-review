/**
 * Domain-Specific Entity Knowledge Base
 * Contains domain-specific information about entities, fields, and patterns
 */

import type { EntitySchema, FieldSchema } from '@oneatlas/shared';

export interface DomainEntityPattern {
  entityName: string;
  domain: string;
  typicalFields: string[];
  commonRelationships: string[];
  businessRules: string[];
  validationPatterns: Record<string, string>;
}

export interface DomainKnowledge {
  domain: string;
  entities: Map<string, DomainEntityPattern>;
  fieldPatterns: Map<string, string>;
  relationshipPatterns: Map<string, string>;
  businessRules: Map<string, string>;
}

class DomainKnowledgeBase {
  private knowledge: Map<string, DomainKnowledge> = new Map();

  constructor() {
    this.initializeHealthcareKnowledge();
    this.initializeCRMKnowledge();
    this.initializeEcommerceKnowledge();
    this.initializeFinanceKnowledge();
    this.initializeProjectManagementKnowledge();
  }

  /**
   * Initialize healthcare domain knowledge
   */
  private initializeHealthcareKnowledge(): void {
    const healthcareKnowledge: DomainKnowledge = {
      domain: 'healthcare',
      entities: new Map(),
      fieldPatterns: new Map(),
      relationshipPatterns: new Map(),
      businessRules: new Map(),
    };

    // Patient entity pattern
    healthcareKnowledge.entities.set('patient', {
      entityName: 'Patient',
      domain: 'healthcare',
      typicalFields: [
        'firstName', 'lastName', 'dateOfBirth', 'email', 'phone', 'address',
        'bloodType', 'allergies', 'medicalHistory', 'emergencyContact', 'insurance',
      ],
      commonRelationships: ['Doctor', 'Appointment', 'Prescription', 'MedicalRecord'],
      businessRules: [
        'Patient must have at least one contact method',
        'Date of birth cannot be in the future',
        'Blood type must be a valid ABO type',
        'Medical history must be HIPAA compliant',
      ],
      validationPatterns: {
        'dateOfBirth': 'max(new Date())',
        'email': 'email()',
        'phone': 'regex(/^\\+?[1-9]\\d{1,14}$/)',
        'bloodType': 'enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])',
      },
    });

    // Doctor entity pattern
    healthcareKnowledge.entities.set('doctor', {
      entityName: 'Doctor',
      domain: 'healthcare',
      typicalFields: [
        'firstName', 'lastName', 'specialty', 'licenseNumber', 'email', 'phone',
        'department', 'availability', 'education', 'certifications',
      ],
      commonRelationships: ['Patient', 'Appointment', 'Prescription'],
      businessRules: [
        'Doctor must have a valid license number',
        'Specialty must be from approved list',
        'License number must be unique',
      ],
      validationPatterns: {
        'licenseNumber': 'regex(/^[A-Z]{2}\\d{6}$/)',
        'specialty': 'enum(["Cardiology", "Dermatology", "Neurology", "Pediatrics", "General Practice"])',
      },
    });

    // Appointment entity pattern
    healthcareKnowledge.entities.set('appointment', {
      entityName: 'Appointment',
      domain: 'healthcare',
      typicalFields: [
        'patientId', 'doctorId', 'dateTime', 'duration', 'status', 'reason',
        'notes', 'followUpRequired', 'type',
      ],
      commonRelationships: ['Patient', 'Doctor'],
      businessRules: [
        'Appointment must have valid patient and doctor',
        'DateTime cannot be in the past for new appointments',
        'Duration must be between 15 and 180 minutes',
      ],
      validationPatterns: {
        'status': 'enum(["Scheduled", "Confirmed", "In Progress", "Completed", "Cancelled", "No Show"])',
        'duration': 'min(15).max(180)',
      },
    });

    this.knowledge.set('healthcare', healthcareKnowledge);
  }

  /**
   * Initialize CRM domain knowledge
   */
  private initializeCRMKnowledge(): void {
    const crmKnowledge: DomainKnowledge = {
      domain: 'crm',
      entities: new Map(),
      fieldPatterns: new Map(),
      relationshipPatterns: new Map(),
      businessRules: new Map(),
    };

    // Customer entity pattern
    crmKnowledge.entities.set('customer', {
      entityName: 'Customer',
      domain: 'crm',
      typicalFields: [
        'firstName', 'lastName', 'email', 'phone', 'company', 'industry',
        'tier', 'leadSource', 'status', 'annualRevenue', 'employeeCount',
      ],
      commonRelationships: ['Opportunity', 'Interaction', 'SupportTicket', 'Invoice'],
      businessRules: [
        'Customer must have at least one contact method',
        'Email must be unique',
        'Tier assignment based on revenue',
      ],
      validationPatterns: {
        'email': 'email()',
        'tier': 'enum(["Bronze", "Silver", "Gold", "Platinum"])',
        'leadSource': 'enum(["Website", "Referral", "Social Media", "Email", "Phone", "Event"])',
      },
    });

    // Lead entity pattern
    crmKnowledge.entities.set('lead', {
      entityName: 'Lead',
      domain: 'crm',
      typicalFields: [
        'firstName', 'lastName', 'email', 'phone', 'company', 'industry',
        'source', 'status', 'score', 'assignedTo', 'convertedAt',
      ],
      commonRelationships: ['Opportunity', 'Campaign', 'Activity'],
      businessRules: [
        'Lead must have contact information',
        'Score between 0 and 100',
        'Source tracking required',
      ],
      validationPatterns: {
        'score': 'min(0).max(100)',
        'source': 'enum(["Website", "Referral", "Social Media", "Email", "Phone", "Event"])',
      },
    });

    // Opportunity entity pattern
    crmKnowledge.entities.set('opportunity', {
      entityName: 'Opportunity',
      domain: 'crm',
      typicalFields: [
        'customerId', 'name', 'stage', 'value', 'probability', 'closeDate',
        'assignedTo', 'products', 'competitors', 'notes',
      ],
      commonRelationships: ['Customer', 'Product', 'Quote'],
      businessRules: [
        'Opportunity must be associated with customer',
        'Stage must follow sales pipeline',
        'Probability must match stage',
      ],
      validationPatterns: {
        'stage': 'enum(["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"])',
        'probability': 'min(0).max(100)',
      },
    });

    this.knowledge.set('crm', crmKnowledge);
  }

  /**
   * Initialize e-commerce domain knowledge
   */
  private initializeEcommerceKnowledge(): void {
    const ecommerceKnowledge: DomainKnowledge = {
      domain: 'ecommerce',
      entities: new Map(),
      fieldPatterns: new Map(),
      relationshipPatterns: new Map(),
      businessRules: new Map(),
    };

    // Product entity pattern
    ecommerceKnowledge.entities.set('product', {
      entityName: 'Product',
      domain: 'ecommerce',
      typicalFields: [
        'name', 'sku', 'description', 'price', 'quantity', 'category',
        'images', 'isActive', 'weight', 'dimensions', 'tags',
      ],
      commonRelationships: ['Category', 'Order', 'Review', 'Inventory'],
      businessRules: [
        'SKU must be unique',
        'Price must be positive',
        'Quantity cannot be negative',
      ],
      validationPatterns: {
        'price': 'min(0)',
        'quantity': 'min(0)',
        'sku': 'regex(/^[A-Z0-9-]+$/)',
      },
    });

    // Order entity pattern
    ecommerceKnowledge.entities.set('order', {
      entityName: 'Order',
      domain: 'ecommerce',
      typicalFields: [
        'customerId', 'orderNumber', 'status', 'total', 'subtotal', 'tax',
        'shipping', 'items', 'paymentMethod', 'trackingNumber', 'orderDate',
      ],
      commonRelationships: ['Customer', 'Product', 'Payment', 'Shipping'],
      businessRules: [
        'Order must have at least one item',
        'Total must equal subtotal + tax + shipping',
        'Order number must be unique',
      ],
      validationPatterns: {
        'status': 'enum(["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"])',
        'total': 'min(0)',
      },
    });

    this.knowledge.set('ecommerce', ecommerceKnowledge);
  }

  /**
   * Initialize finance domain knowledge
   */
  private initializeFinanceKnowledge(): void {
    const financeKnowledge: DomainKnowledge = {
      domain: 'finance',
      entities: new Map(),
      fieldPatterns: new Map(),
      relationshipPatterns: new Map(),
      businessRules: new Map(),
    };

    // Invoice entity pattern
    financeKnowledge.entities.set('invoice', {
      entityName: 'Invoice',
      domain: 'finance',
      typicalFields: [
        'invoiceNumber', 'customerId', 'dueDate', 'amount', 'status',
        'lineItems', 'tax', 'discount', 'paidAmount', 'notes',
      ],
      commonRelationships: ['Customer', 'Payment', 'LineItem'],
      businessRules: [
        'Invoice number must be unique',
        'Due date must be after invoice date',
        'Amount must equal line items total',
      ],
      validationPatterns: {
        'invoiceNumber': 'regex(/^[A-Z]{2}\\d{8}$/)',
        'status': 'enum(["Draft", "Sent", "Paid", "Overdue", "Cancelled"])',
        'amount': 'min(0)',
      },
    });

    // Payment entity pattern
    financeKnowledge.entities.set('payment', {
      entityName: 'Payment',
      domain: 'finance',
      typicalFields: [
        'paymentNumber', 'invoiceId', 'amount', 'method', 'status',
        'paymentDate', 'reference', 'notes',
      ],
      commonRelationships: ['Invoice', 'Method'],
      businessRules: [
        'Payment amount cannot exceed invoice amount',
        'Payment must be associated with invoice',
        'Reference must be unique',
      ],
      validationPatterns: {
        'method': 'enum(["Credit Card", "Bank Transfer", "Check", "Cash", "PayPal"])',
        'status': 'enum(["Pending", "Completed", "Failed", "Refunded"])',
      },
    });

    this.knowledge.set('finance', financeKnowledge);
  }

  /**
   * Initialize project management domain knowledge
   */
  private initializeProjectManagementKnowledge(): void {
    const pmKnowledge: DomainKnowledge = {
      domain: 'project_management',
      entities: new Map(),
      fieldPatterns: new Map(),
      relationshipPatterns: new Map(),
      businessRules: new Map(),
    };

    // Task entity pattern
    pmKnowledge.entities.set('task', {
      entityName: 'Task',
      domain: 'project_management',
      typicalFields: [
        'title', 'description', 'status', 'priority', 'assignee',
        'dueDate', 'estimatedHours', 'actualHours', 'project', 'dependencies',
      ],
      commonRelationships: ['Project', 'Assignee', 'Dependency'],
      businessRules: [
        'Task must be assigned to project',
        'Due date must be after project start',
        'Priority must be from approved list',
      ],
      validationPatterns: {
        'status': 'enum(["To Do", "In Progress", "Review", "Done", "Blocked"])',
        'priority': 'enum(["Low", "Medium", "High", "Critical"])',
      },
    });

    // Project entity pattern
    pmKnowledge.entities.set('project', {
      entityName: 'Project',
      domain: 'project_management',
      typicalFields: [
        'name', 'description', 'status', 'startDate', 'endDate',
        'budget', 'manager', 'team', 'milestones', 'progress',
      ],
      commonRelationships: ['Task', 'Manager', 'Team'],
      businessRules: [
        'Project must have manager',
        'End date must be after start date',
        'Budget must be positive',
      ],
      validationPatterns: {
        'status': 'enum(["Planning", "Active", "On Hold", "Completed", "Cancelled"])',
        'progress': 'min(0).max(100)',
      },
    });

    this.knowledge.set('project_management', pmKnowledge);
  }

  /**
   * Get domain knowledge
   */
  getDomainKnowledge(domain: string): DomainKnowledge | null {
    return this.knowledge.get(domain) || null;
  }

  /**
   * Get entity pattern for domain
   */
  getEntityPattern(domain: string, entityName: string): DomainEntityPattern | null {
    const domainKnowledge = this.knowledge.get(domain);
    if (!domainKnowledge) return null;

    return domainKnowledge.entities.get(entityName.toLowerCase()) || null;
  }

  /**
   * Suggest fields for entity based on domain
   */
  suggestFields(domain: string, entityName: string): string[] {
    const pattern = this.getEntityPattern(domain, entityName);
    if (!pattern) return [];

    return pattern.typicalFields;
  }

  /**
   * Get validation patterns for entity
   */
  getValidationPatterns(domain: string, entityName: string): Record<string, string> {
    const pattern = this.getEntityPattern(domain, entityName);
    if (!pattern) return {};

    return pattern.validationPatterns;
  }

  /**
   * Get business rules for entity
   */
  getBusinessRules(domain: string, entityName: string): string[] {
    const pattern = this.getEntityPattern(domain, entityName);
    if (!pattern) return [];

    return pattern.businessRules;
  }

  /**
   * Suggest relationships for entity
   */
  suggestRelationships(domain: string, entityName: string): string[] {
    const pattern = this.getEntityPattern(domain, entityName);
    if (!pattern) return [];

    return pattern.commonRelationships;
  }

  /**
   * Add custom domain knowledge
   */
  addDomainKnowledge(domain: string, knowledge: DomainKnowledge): void {
    this.knowledge.set(domain, knowledge);
  }

  /**
   * Add entity pattern to domain
   */
  addEntityPattern(domain: string, pattern: DomainEntityPattern): void {
    const domainKnowledge = this.knowledge.get(domain);
    if (domainKnowledge) {
      domainKnowledge.entities.set(pattern.entityName.toLowerCase(), pattern);
    } else {
      const newKnowledge: DomainKnowledge = {
        domain,
        entities: new Map([[pattern.entityName.toLowerCase(), pattern]]),
        fieldPatterns: new Map(),
        relationshipPatterns: new Map(),
        businessRules: new Map(),
      };
      this.knowledge.set(domain, newKnowledge);
    }
  }

  /**
   * Get all supported domains
   */
  getSupportedDomains(): string[] {
    return Array.from(this.knowledge.keys());
  }

  /**
   * Check if domain is supported
   */
  isDomainSupported(domain: string): boolean {
    return this.knowledge.has(domain);
  }
}

export const domainKnowledgeBase = new DomainKnowledgeBase();
