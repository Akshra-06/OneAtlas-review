/**
 * Intelligence-Driven Generation Pipeline
 * 
 * Transforms generation from entity-first to intelligence-first.
 * Uses product intelligence engines as the source of truth.
 */

import crypto from 'node:crypto';

import type { AppUnderstanding } from '@oneatlas/shared';
import type {
  GeneratedFile,
  GenerationResult,
} from '@oneatlas/shared';

import { logger } from '../../shared/utils/logger';

// Product Intelligence Imports
import {
  ArchetypeDefinition,
} from '../../product/archetype/archetype-registry';

import {
  uiArchetypeEngine,
} from '../../product/archetype/ui-archetype-engine';

import {
  workflowUIEngine,
  operationalFlowMapper,
  userIntentComposer,
  taskPriorityEngine,
} from '../../product/workflow';

import {
  visualHierarchyEngine,
  attentionMapper,
  spacingIntelligence,
  typographyScaler,
  emphasisEngine,
} from '../../product/visual';

import {
  componentIntelligenceEngine,
  domainComponentSelector,
  contextualWidgetGenerator,
  interactionPatternEngine,
} from '../../product/component';

import {
  informationArchitectureEngine,
  semanticSectionComposer,
  contextualNavigationEngine,
  contentPriorityMapper,
} from '../../product/architecture';

import {
  semanticMetricsEngine,
  metricsInference,
  domainKPIGenerator,
  contextualStatistics,
} from '../../product/metrics';

import {
  adaptiveDashboardEngine,
  dashboardComposer,
  widgetPriorityEngine,
  contextualLayoutEngine,
} from '../../product/dashboard';

import {
  intelligentEmptyStates,
  contextualCTAEngine,
  microinteractionEngine,
  adaptiveLoadingExperience,
} from '../../product/ux';

// Existing Generator Imports
import {
  generateEntitySchemas,
} from '../schema/entity.generator';

import {
  prismaBuilder,
} from '../schema/prisma.builder';

import {
  routeGenerator,
} from '../code/route.generator';

import {
  pageGenerator,
} from '../code/page.generator';

import {
  crudGenerator,
} from '../code/crud.generator';

import {
  componentGenerator,
} from '../code/component.generator';

import {
  validationGenerator,
} from '../code/validation.generator';

import {
  supportGenerator,
} from '../code/support.generator';

import {
  workflowGenerator,
} from '../code/workflow.generator';

import {
  layoutGenerator,
} from '../code/layout.generator';

import archetypePageGenerator from './archetype-page-generator';

import {
  workflowFirstComposer,
} from './workflow-first-composer';

import {
  visualHierarchyApplicationEngine,
} from './visual-hierarchy-application';

import {
  metricsIntegrationEngine,
} from './metrics-integration-engine';

import {
  componentRenderingEngine,
} from './component-rendering-engine';

// Rendering Mutation Imports
import {
  layoutMutationEngine,
} from '../rendering/layout-mutation-engine';

import {
  dashboardCompositionEngine,
} from '../rendering/dashboard-composition-engine';

import {
  widgetDiversityEngine,
} from '../rendering/widget-diversity-engine';

import {
  visualHierarchyMutationEngine,
} from '../rendering/visual-hierarchy-mutation';

import {
  workflowCentricRenderingEngine,
} from '../rendering/workflow-centric-rendering';

import {
  productArchetypeRenderingEngine,
} from '../rendering/product-archetype-rendering';

// Dynamic UI Composition Imports
import {
  dynamicSectionPlanner,
} from '../dynamic/dynamic-section-planner';

import {
  workflowDrivenPageOrchestration,
} from '../dynamic/workflow-driven-page-orchestration';

import {
  dynamicJSXTreeGeneration,
} from '../dynamic/dynamic-jsx-tree-generation';

import {
  archetypeNativePageBuilders,
} from '../dynamic/archetype-native-page-builders';

import {
  widgetGraphComposition,
} from '../dynamic/widget-graph-composition';

import {
  layoutGraphGeneration,
} from '../dynamic/layout-graph-generation';

import {
  dynamicDashboardSchema,
} from '../dynamic/dynamic-dashboard-schema';

import {
  contextAwareSectionGeneration,
} from '../dynamic/context-aware-section-generation';

import {
  componentGraphOrchestration,
} from '../dynamic/component-graph-orchestration';

export interface IntelligenceGenerationContext {
  prompt: string;
  appName: string;
  domain: string;
  archetype: ArchetypeDefinition;
  workflow: string;
  uiIntent: string;
  informationArchitecture: any;
  visualHierarchy: any;
  dashboardLayout: any;
  components: any[];
  metrics: any[];
  navigation: any;
  layoutMutation: any;
  dashboardComposition: any;
  widgetDiversity: any;
  visualHierarchyMutation: any;
  workflowCentricLayout: any;
  productArchetypeRendering: any;
  sectionGraph: any;
  pageOrchestration: any;
  jsxTree: any;
  widgetGraph: any;
  layoutGraph: any;
  dashboardSchema: any;
  componentGraph: any;
}

export interface IntelligenceGenerationConfig {
  enableArchetypeSelection: boolean;
  enableWorkflowMapping: boolean;
  enableVisualHierarchy: boolean;
  enableComponentIntelligence: boolean;
  enableMetricsIntelligence: boolean;
  enableInformationArchitecture: boolean;
  enableRenderingMutation: boolean;
  enableDynamicUIComposition: boolean;
}

const DEFAULT_CONFIG: IntelligenceGenerationConfig = {
  enableArchetypeSelection: true,
  enableWorkflowMapping: true,
  enableVisualHierarchy: true,
  enableComponentIntelligence: true,
  enableMetricsIntelligence: true,
  enableInformationArchitecture: true,
  enableRenderingMutation: true,
  enableDynamicUIComposition: true,
};

/**
 * Intelligence-Driven Generation Pipeline
 * 
 * Orchestrates the full intelligence-driven generation flow:
 * Prompt → Domain Classification → Product Archetype → Workflow Mapping → 
 * UI Intent Detection → Information Architecture → Visual Hierarchy → 
 * Dashboard Composition → Component Selection → Metrics Generation → 
 * Adaptive Layout → Final UI Rendering
 */
export class IntelligenceGenerationPipeline {
  private config: IntelligenceGenerationConfig;

  constructor(config: Partial<IntelligenceGenerationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate application using intelligence-driven pipeline
   */
  async generate(understanding: AppUnderstanding): Promise<GenerationResult> {
    logger.info('IntelligenceGenerationPipeline', 'GENERATION_STARTED', 'Intelligence-driven generation started', {
      appName: understanding.appName,
    });

    // Step 1: Build intelligence context
    const context = await this.buildIntelligenceContext(understanding);

    // Step 2: Generate entity schemas (still needed for data model)
    const entitySchemas = generateEntitySchemas(understanding);
    const prismaSchema = prismaBuilder.build(prismaBuilder.normalize(entitySchemas));

    // Step 3: Generate route config with archetype awareness
    const routeConfig = this.generateIntelligentRouteConfig(context, entitySchemas);

    // Step 4: Generate pages with intelligence
    const files = await this.generateIntelligentPages(context, entitySchemas);

    // Step 5: Generate CRUD with workflow awareness
    files.push(...this.generateIntelligentCRUD(context, entitySchemas));

    // Step 6: Generate components with component intelligence
    files.push(...this.generateIntelligentComponents(context, entitySchemas));

    // Step 7: Generate validation
    files.push(...await this.generateValidation(entitySchemas));

    // Step 8: Generate support files
    files.push(...supportGenerator.generate());

    // Step 9: Generate workflow with workflow mapping
    files.push(...this.generateIntelligentWorkflow(context, understanding, entitySchemas));

    // Step 10: Generate layout with archetype-driven design
    files.push(...this.generateIntelligentLayout(context, routeConfig));

    // Step 10.5: Apply rendering mutations to generated files
    if (this.config.enableRenderingMutation) {
      this.applyRenderingMutations(files, context);
    }

    // Step 11: Add Prisma schema
    files.push({
      filePath: 'prisma/schema.prisma',
      content: prismaSchema,
      fileType: 'prisma-schema',
    });

    const appId = crypto.randomUUID();
    const generatedAt = new Date().toISOString();

    // TODO: Integrate comprehensive validation pipeline
    // Currently ValidationOrchestrator is for AI request validation only
    // Comprehensive output validation will be added in next phase

    logger.info('IntelligenceGenerationPipeline', 'GENERATION_COMPLETED', 'Intelligence-driven generation completed', {
      appName: understanding.appName,
      fileCount: files.length,
      archetype: context.archetype.id,
    });

    return {
      appId,
      appName: understanding.appName,
      prismaSchema,
      files,
      routeConfig,
      entitySchemas,
      generatedAt,
      validation: {
        valid: true,
        issues: [],
      },
    };
  }

  /**
   * Build intelligence context
   */
  private async buildIntelligenceContext(understanding: AppUnderstanding): Promise<IntelligenceGenerationContext> {
    const prompt = understanding.appName || '';
    const appName = understanding.appName;

    // Domain classification (using existing domain system)
    const domain = this.inferDomain(prompt, understanding);

    // Archetype selection
    const archetypeSelection = this.config.enableArchetypeSelection 
      ? uiArchetypeEngine.determineArchetype(prompt, domain)
      : uiArchetypeEngine.determineArchetype(prompt, domain);
    const archetype = archetypeSelection.selectedArchetype;

    // Workflow mapping
    const workflow = this.config.enableWorkflowMapping
      ? this.inferWorkflow(prompt, archetype)
      : 'default';

    // UI intent detection
    const uiIntent = this.detectUIIntent(prompt, archetype);

    // Information architecture
    const informationArchitecture = this.config.enableInformationArchitecture
      ? informationArchitectureEngine.generateArchitecture([appName], archetype)
      : null;

    // Visual hierarchy
    const visualHierarchy = this.config.enableVisualHierarchy
      ? visualHierarchyEngine.generateHierarchy(archetype, [appName])
      : null;

    // Dashboard layout
    const dashboardLayout = adaptiveDashboardEngine.generateLayout(archetype, [appName]);

    // Component selection
    const components = this.config.enableComponentIntelligence
      ? componentIntelligenceEngine.selectComponents(domain, archetype)
      : [];

    // Metrics generation
    const metrics = this.config.enableMetricsIntelligence
      ? semanticMetricsEngine.generateMetrics(domain, archetype)
      : [];

    // Navigation
    const navigation = contextualNavigationEngine.generateNavigation([appName], archetype);

    // Rendering mutations
    const layoutMutation = this.config.enableRenderingMutation
      ? layoutMutationEngine.mutateLayout(domain, archetype, workflow)
      : null;

    const dashboardComposition = this.config.enableRenderingMutation
      ? dashboardCompositionEngine.composeDashboard(domain, archetype, workflow)
      : null;

    const widgetDiversity = this.config.enableRenderingMutation
      ? widgetDiversityEngine.generateWidgets(domain, archetype, workflow)
      : null;

    const visualHierarchyMutation = this.config.enableRenderingMutation
      ? visualHierarchyMutationEngine.mutateVisualHierarchy(domain, archetype, workflow)
      : null;

    const workflowCentricLayout = this.config.enableRenderingMutation
      ? workflowCentricRenderingEngine.renderWorkflowCentricLayout(domain, archetype, workflow)
      : null;

    const productArchetypeRendering = this.config.enableRenderingMutation
      ? productArchetypeRenderingEngine.renderProductArchetype(domain, archetype)
      : null;

    // Dynamic UI composition
    const sectionGraph = this.config.enableDynamicUIComposition
      ? dynamicSectionPlanner.planSections(domain, archetype, workflow)
      : null;

    const pageOrchestration = this.config.enableDynamicUIComposition && sectionGraph
      ? workflowDrivenPageOrchestration.orchestratePages(domain, archetype, workflow, sectionGraph)
      : null;

    const widgetGraph = this.config.enableDynamicUIComposition && sectionGraph
      ? widgetGraphComposition.composeWidgetGraph(sectionGraph, archetype)
      : null;

    const layoutGraph = this.config.enableDynamicUIComposition && widgetGraph
      ? layoutGraphGeneration.generateLayoutGraph(archetype, workflow, widgetGraph)
      : null;

    const dashboardSchema = this.config.enableDynamicUIComposition && sectionGraph && widgetGraph && layoutGraph
      ? dynamicDashboardSchema.generateDashboardSchema(domain, archetype, workflow, sectionGraph, widgetGraph, layoutGraph)
      : null;

    const componentGraph = this.config.enableDynamicUIComposition && sectionGraph && widgetGraph && layoutGraph
      ? componentGraphOrchestration.orchestrateComponentGraph(sectionGraph, widgetGraph, layoutGraph, archetype)
      : null;

    const jsxTree = this.config.enableDynamicUIComposition && pageOrchestration && sectionGraph && pageOrchestration.pages.length > 0
      ? dynamicJSXTreeGeneration.generateJSXTree(pageOrchestration.pages[0]!, sectionGraph, archetype)
      : null;

    return {
      prompt,
      appName,
      domain,
      archetype,
      workflow,
      uiIntent,
      informationArchitecture,
      visualHierarchy,
      dashboardLayout,
      components,
      metrics,
      navigation,
      layoutMutation,
      dashboardComposition,
      widgetDiversity,
      visualHierarchyMutation,
      workflowCentricLayout,
      productArchetypeRendering,
      sectionGraph,
      pageOrchestration,
      jsxTree,
      widgetGraph,
      layoutGraph,
      dashboardSchema,
      componentGraph,
    };
  }

  /**
   * Infer domain from prompt
   */
  private inferDomain(prompt: string, understanding: AppUnderstanding): string {
    const lowerPrompt = prompt.toLowerCase();

    // Simple domain inference
    if (lowerPrompt.includes('health') || lowerPrompt.includes('medical') || lowerPrompt.includes('patient')) {
      return 'healthcare';
    } else if (lowerPrompt.includes('crm') || lowerPrompt.includes('sales') || lowerPrompt.includes('lead')) {
      return 'crm';
    } else if (lowerPrompt.includes('ecommerce') || lowerPrompt.includes('shop') || lowerPrompt.includes('store')) {
      return 'ecommerce';
    } else if (lowerPrompt.includes('analytics') || lowerPrompt.includes('data') || lowerPrompt.includes('chart')) {
      return 'analytics';
    } else if (lowerPrompt.includes('logistics') || lowerPrompt.includes('shipping') || lowerPrompt.includes('delivery')) {
      return 'logistics';
    } else if (lowerPrompt.includes('finance') || lowerPrompt.includes('money') || lowerPrompt.includes('bank')) {
      return 'finance';
    } else if (lowerPrompt.includes('project') || lowerPrompt.includes('task') || lowerPrompt.includes('kanban')) {
      return 'project_management';
    } else if (lowerPrompt.includes('support') || lowerPrompt.includes('ticket') || lowerPrompt.includes('help')) {
      return 'support';
    }

    return 'generic';
  }

  /**
   * Infer workflow from prompt and archetype
   */
  private inferWorkflow(prompt: string, archetype: ArchetypeDefinition): string {
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('monitor') || lowerPrompt.includes('track') || lowerPrompt.includes('status')) {
      return 'monitoring';
    } else if (lowerPrompt.includes('analyze') || lowerPrompt.includes('report') || lowerPrompt.includes('insight')) {
      return 'analysis';
    } else if (lowerPrompt.includes('collaborate') || lowerPrompt.includes('team') || lowerPrompt.includes('share')) {
      return 'collaboration';
    } else if (lowerPrompt.includes('operate') || lowerPrompt.includes('manage') || lowerPrompt.includes('control')) {
      return 'operation';
    } else if (lowerPrompt.includes('schedule') || lowerPrompt.includes('calendar') || lowerPrompt.includes('appointment')) {
      return 'scheduling';
    } else if (lowerPrompt.includes('sell') || lowerPrompt.includes('deal') || lowerPrompt.includes('pipeline')) {
      return 'selling';
    } else if (lowerPrompt.includes('support') || lowerPrompt.includes('ticket') || lowerPrompt.includes('resolve')) {
      return 'support';
    }

    return archetype.workflowEmphasis;
  }

  /**
   * Detect UI intent
   */
  private detectUIIntent(prompt: string, archetype: ArchetypeDefinition): string {
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('dashboard') || lowerPrompt.includes('overview')) {
      return 'dashboard';
    } else if (lowerPrompt.includes('list') || lowerPrompt.includes('table')) {
      return 'list';
    } else if (lowerPrompt.includes('form') || lowerPrompt.includes('input')) {
      return 'form';
    } else if (lowerPrompt.includes('detail') || lowerPrompt.includes('view')) {
      return 'detail';
    } else if (lowerPrompt.includes('report') || lowerPrompt.includes('analytics')) {
      return 'report';
    } else if (lowerPrompt.includes('timeline') || lowerPrompt.includes('schedule')) {
      return 'timeline';
    }

    return 'dashboard';
  }

  /**
   * Generate intelligent route config
   */
  private generateIntelligentRouteConfig(context: IntelligenceGenerationContext, entitySchemas: any[]): any {
    const baseRouteConfig = routeGenerator.generate(entitySchemas, context.appName);

    // Apply archetype-specific route modifications
    return {
      ...baseRouteConfig,
      navigationStyle: context.archetype.navigationStyle,
      layoutDensity: context.archetype.layoutDensity,
    };
  }

  /**
   * Generate intelligent pages
   */
  private async generateIntelligentPages(context: IntelligenceGenerationContext, entitySchemas: any[]): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    for (const entity of entitySchemas) {
      // Generate pages with archetype awareness
      const pageFiles = pageGenerator.generate(entity);
      
      // Apply intelligence context to pages
      const enhancedPageFiles = pageFiles.map(file => ({
        ...file,
        content: this.enhancePageWithIntelligence(file.content, context, entity),
      }));

      files.push(...enhancedPageFiles);
    }

    // Generate dynamic dashboard that adapts to entities from prompt
    const dashboardFile = pageGenerator.generateDashboard(entitySchemas);
    files.push(dashboardFile);

    return files;
  }

  /**
   * Enhance page with intelligence context
   */
  private enhancePageWithIntelligence(content: string, context: IntelligenceGenerationContext, entity: any): string {
    // Apply archetype-specific enhancements
    let enhanced = content;

    // Add archetype-specific classes
    enhanced = enhanced.replace(/className="([^"]*)"/g, (match, className) => {
      return `className="${className} ${context.archetype.id}"`;
    });

    // Add workflow-specific data attributes
    enhanced = enhanced.replace(/<([a-z]+)/gi, (match, tag) => {
      return `<${tag} data-workflow="${context.workflow}" data-archetype="${context.archetype.id}"`;
    });

    return enhanced;
  }

  /**
   * Generate intelligent CRUD
   */
  private generateIntelligentCRUD(context: IntelligenceGenerationContext, entitySchemas: any[]): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    for (const entity of entitySchemas) {
      const crudFiles = crudGenerator.generate(entity);
      
      const enhancedCrudFiles = crudFiles.map(file => ({
        ...file,
        content: this.enhanceCRUDWithIntelligence(file.content, context, entity),
      }));

      files.push(...enhancedCrudFiles);
    }

    return files;
  }

  /**
   * Enhance CRUD with intelligence context
   */
  private enhanceCRUDWithIntelligence(content: string, context: IntelligenceGenerationContext, entity: any): string {
    let enhanced = content;

    // Apply workflow-aware action prioritization
    if (context.workflow === 'selling' || context.workflow === 'pipeline') {
      enhanced = enhanced.replace(/<!-- actions -->/gi, `
        <div className="workflow-actions">
          <button className="primary-action">Move to Next Stage</button>
          <button className="secondary-action">Add Note</button>
        </div>
      `);
    }

    return enhanced;
  }

  /**
   * Generate intelligent components
   */
  private generateIntelligentComponents(context: IntelligenceGenerationContext, entitySchemas: any[]): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    for (const entity of entitySchemas) {
      const componentFile = componentGenerator.generate(entity);
      
      const enhancedComponentFile: GeneratedFile = {
        ...componentFile,
        content: this.enhanceComponentWithIntelligence(componentFile.content, context, entity),
      };

      files.push(enhancedComponentFile);
    }

    return files;
  }

  /**
   * Enhance component with intelligence context
   */
  private enhanceComponentWithIntelligence(content: string, context: IntelligenceGenerationContext, entity: any): string {
    let enhanced = content;

    // Apply component intelligence
    if (context.components.length > 0) {
      const domainComponent = context.components[0];
      enhanced = enhanced.replace(/<!-- component-content -->/gi, `
        <div className="domain-component ${domainComponent.type}">
          <h3>${domainComponent.name}</h3>
          <p>${domainComponent.description}</p>
        </div>
      `);
    }

    return enhanced;
  }

  /**
   * Apply rendering mutations to generated files
   */
  private applyRenderingMutations(files: GeneratedFile[], context: IntelligenceGenerationContext): void {
    logger.info('IntelligenceGenerationPipeline', 'APPLYING_RENDERING_MUTATIONS', 'Applying rendering mutations to generated files', {
      domain: context.domain,
      workflow: context.workflow,
      fileCount: files.length,
    });

    for (const file of files) {
      // Apply layout mutation
      if (context.layoutMutation) {
        file.content = this.applyLayoutMutation(file.content, context.layoutMutation);
      }

      // Apply dashboard composition
      if (context.dashboardComposition) {
        file.content = this.applyDashboardComposition(file.content, context.dashboardComposition);
      }

      // Apply widget diversity
      if (context.widgetDiversity) {
        file.content = this.applyWidgetDiversity(file.content, context.widgetDiversity);
      }

      // Apply visual hierarchy mutation
      if (context.visualHierarchyMutation) {
        file.content = this.applyVisualHierarchyMutation(file.content, context.visualHierarchyMutation);
      }

      // Apply workflow-centric layout
      if (context.workflowCentricLayout) {
        file.content = this.applyWorkflowCentricLayout(file.content, context.workflowCentricLayout);
      }

      // Apply product archetype rendering
      if (context.productArchetypeRendering) {
        file.content = this.applyProductArchetypeRendering(file.content, context.productArchetypeRendering);
      }
    }

    logger.info('IntelligenceGenerationPipeline', 'RENDERING_MUTATIONS_APPLIED', 'Rendering mutations applied to generated files');
  }

  /**
   * Apply layout mutation to file content
   */
  private applyLayoutMutation(content: string, layoutMutation: any): string {
    let mutated = content;

    // Apply grid system
    if (layoutMutation.gridSystem) {
      mutated = mutated.replace(/grid-cols-12/gi, `grid-cols-${layoutMutation.gridSystem.columns}`);
      mutated = mutated.replace(/gap-4/gi, `gap-[${layoutMutation.gridSystem.gutter}px]`);
    }

    // Apply navigation structure
    if (layoutMutation.navigationStructure) {
      if (layoutMutation.navigationStructure.type === 'sidebar') {
        mutated = mutated.replace(/<!-- navigation-type -->/gi, 'sidebar');
      } else if (layoutMutation.navigationStructure.type === 'topbar') {
        mutated = mutated.replace(/<!-- navigation-type -->/gi, 'topbar');
      }
    }

    return mutated;
  }

  /**
   * Apply dashboard composition to file content
   */
  private applyDashboardComposition(content: string, dashboardComposition: any): string {
    let mutated = content;

    // Apply layout type
    if (dashboardComposition.layout) {
      mutated = mutated.replace(/<!-- dashboard-layout -->/gi, dashboardComposition.layout);
    }

    // Apply density
    if (dashboardComposition.density) {
      mutated = mutated.replace(/<!-- dashboard-density -->/gi, dashboardComposition.density);
    }

    return mutated;
  }

  /**
   * Apply widget diversity to file content
   */
  private applyWidgetDiversity(content: string, widgetDiversity: any): string {
    let mutated = content;

    // Apply widget-specific styling
    for (const widget of widgetDiversity) {
      if (widget.styling) {
        const widgetRegex = new RegExp(`data-widget="${widget.id}"`, 'gi');
        mutated = mutated.replace(widgetRegex, `data-widget="${widget.id}" data-size="${widget.styling.size}" data-density="${widget.styling.density}" data-emphasis="${widget.styling.emphasis}"`);
      }
    }

    return mutated;
  }

  /**
   * Apply visual hierarchy mutation to file content
   */
  private applyVisualHierarchyMutation(content: string, visualHierarchyMutation: any): string {
    let mutated = content;

    // Apply spacing system
    if (visualHierarchyMutation.spacingSystem) {
      mutated = mutated.replace(/<!-- spacing-base -->/gi, `${visualHierarchyMutation.spacingSystem.base}px`);
    }

    // Apply typography system
    if (visualHierarchyMutation.typographySystem) {
      mutated = mutated.replace(/<!-- font-size-base -->/gi, `${visualHierarchyMutation.typographySystem.base.fontSize}px`);
    }

    return mutated;
  }

  /**
   * Apply workflow-centric layout to file content
   */
  private applyWorkflowCentricLayout(content: string, workflowCentricLayout: any): string {
    let mutated = content;

    // Apply workflow type
    if (workflowCentricLayout.workflowType) {
      mutated = mutated.replace(/<!-- workflow-type -->/gi, workflowCentricLayout.workflowType);
    }

    // Apply section order
    if (workflowCentricLayout.sectionOrder) {
      const sectionOrder = workflowCentricLayout.sectionOrder.join(',');
      mutated = mutated.replace(/<!-- section-order -->/gi, sectionOrder);
    }

    return mutated;
  }

  /**
   * Apply product archetype rendering to file content
   */
  private applyProductArchetypeRendering(content: string, productArchetypeRendering: any): string {
    let mutated = content;

    // Apply visual identity
    if (productArchetypeRendering.visualIdentity) {
      mutated = mutated.replace(/<!-- primary-color -->/gi, productArchetypeRendering.visualIdentity.primaryColor);
      mutated = mutated.replace(/<!-- secondary-color -->/gi, productArchetypeRendering.visualIdentity.secondaryColor);
    }

    // Apply border radius
    if (productArchetypeRendering.borderRadius) {
      mutated = mutated.replace(/<!-- border-radius -->/gi, `${productArchetypeRendering.borderRadius}px`);
    }

    // Apply font family
    if (productArchetypeRendering.fontFamily) {
      mutated = mutated.replace(/<!-- font-family -->/gi, productArchetypeRendering.fontFamily);
    }

    return mutated;
  }

  /**
   * Generate validation
   */
  private async generateValidation(entitySchemas: any[]): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    for (const entity of entitySchemas) {
      files.push(await validationGenerator.generate(entity));
    }

    return files;
  }

  /**
   * Generate intelligent workflow
   */
  private generateIntelligentWorkflow(context: IntelligenceGenerationContext, understanding: AppUnderstanding, entitySchemas: any[]): GeneratedFile[] {
    const baseWorkflowFiles = workflowGenerator.generate(understanding, entitySchemas);
    
    const enhancedWorkflowFiles = baseWorkflowFiles.map(file => ({
      ...file,
      content: this.enhanceWorkflowWithIntelligence(file.content, context),
    }));

    return enhancedWorkflowFiles;
  }

  /**
   * Enhance workflow with intelligence context
   */
  private enhanceWorkflowWithIntelligence(content: string, context: IntelligenceGenerationContext): string {
    let enhanced = content;

    // Apply workflow mapping
    const workflowUI = workflowUIEngine.generateFromWorkflow(context.workflow, [
      {
        id: '1',
        name: context.workflow,
        type: 'action',
        priority: 1.0,
        frequency: 0.9,
        uiComponent: 'primary',
      },
    ]);

    enhanced = enhanced.replace(/<!-- workflow-steps -->/gi, `
      <div className="workflow-steps">
        ${workflowUI.steps.map((step: any) => `
          <div className="workflow-step priority-${step.priority}">
            <h4>${step.name}</h4>
          </div>
        `).join('')}
      </div>
    `);

    return enhanced;
  }

  /**
   * Generate intelligent layout
   */
  private generateIntelligentLayout(context: IntelligenceGenerationContext, routeConfig: any): GeneratedFile[] {
    const baseLayoutFiles = layoutGenerator.generate(routeConfig, context.appName);
    
    const enhancedLayoutFiles = baseLayoutFiles.map(file => ({
      ...file,
      content: this.enhanceLayoutWithIntelligence(file.content, context),
    }));

    return enhancedLayoutFiles;
  }

  /**
   * Enhance layout with intelligence context
   */
  private enhanceLayoutWithIntelligence(content: string, context: IntelligenceGenerationContext): string {
    let enhanced = content;

    // Apply visual hierarchy
    if (context.visualHierarchy) {
      enhanced = enhanced.replace(/<!-- layout-content -->/gi, `
        <div className="layout-container density-${context.archetype.layoutDensity}">
          ${context.visualHierarchy.levels.map((level: any, index: number) => `
            <div className="hierarchy-level-${level.level}" style="spacing: ${level.spacing}px">
              ${level.elements.map((element: string) => `
                <div className="hierarchy-element emphasis-${level.emphasis}">
                  ${element}
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      `);
    }

    // Apply navigation
    if (context.navigation) {
      enhanced = enhanced.replace(/<!-- navigation -->/gi, `
        <nav className="navigation-${context.navigation.type}">
          ${context.navigation.items.map((item: any) => `
            <a href="${item.path}" className="nav-item level-${item.level}">${item.label}</a>
          `).join('')}
        </nav>
      `);
    }

    return enhanced;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<IntelligenceGenerationConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('IntelligenceGenerationPipeline', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): IntelligenceGenerationConfig {
    return { ...this.config };
  }
}

export const intelligenceGenerationPipeline = new IntelligenceGenerationPipeline();
