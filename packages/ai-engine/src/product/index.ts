/**
 * Product Intelligence Module Entry Point
 * 
 * Exports all product intelligence and UI archetype components.
 */

export {
  ArchetypeRegistry,
  archetypeRegistry,
  ArchetypeClassifier,
  archetypeClassifier,
  ArchetypeSelector,
  archetypeSelector,
  UIArchetypeEngine,
  uiArchetypeEngine,
  type ArchetypeDefinition,
} from './archetype';

export {
  AdaptiveDashboardEngine,
  adaptiveDashboardEngine,
  DashboardComposer,
  dashboardComposer,
  WidgetPriorityEngine,
  widgetPriorityEngine,
  ContextualLayoutEngine,
  contextualLayoutEngine,
  type DashboardLayout,
  type DashboardSection,
  type LayoutGrid,
  type LayoutCell,
} from './dashboard';

export {
  SemanticMetricsEngine,
  semanticMetricsEngine,
  MetricsInference,
  metricsInference,
  DomainKPIGenerator,
  domainKPIGenerator,
  ContextualStatistics,
  contextualStatistics,
  type MetricDefinition,
  type InferenceRequest,
  type InferenceResult,
  type KPIGenerationRequest,
  type KPIGenerationResult,
  type StatisticDefinition,
} from './metrics';

export {
  WorkflowUIEngine,
  workflowUIEngine,
  OperationalFlowMapper,
  operationalFlowMapper,
  UserIntentComposer,
  userIntentComposer,
  TaskPriorityEngine,
  taskPriorityEngine,
  type WorkflowStep,
  type WorkflowUI,
  type OperationFlow,
  type FlowMapping,
  type UserIntent,
  type IntentComposition,
  type Task,
  type TaskPriority,
} from './workflow';

export {
  VisualHierarchyEngine,
  visualHierarchyEngine,
  AttentionMapper,
  attentionMapper,
  SpacingIntelligence,
  spacingIntelligence,
  TypographyScaler,
  typographyScaler,
  EmphasisEngine,
  emphasisEngine,
  type VisualHierarchy,
  type HierarchyLevel,
  type VisualRhythm,
  type TypographyScale,
  type AttentionPoint,
  type AttentionMap,
  type SpacingSystem,
  type TypographySystem,
  type EmphasisRule,
} from './visual';

export {
  ComponentIntelligenceEngine,
  componentIntelligenceEngine,
  DomainComponentSelector,
  domainComponentSelector,
  ContextualWidgetGenerator,
  contextualWidgetGenerator,
  InteractionPatternEngine,
  interactionPatternEngine,
  type ComponentDefinition,
  type ComponentIntelligenceConfig,
  type SelectionCriteria,
  type SelectionResult,
  type WidgetConfig,
  type InteractionPattern,
} from './component';

export {
  InformationArchitectureEngine,
  informationArchitectureEngine,
  SemanticSectionComposer,
  semanticSectionComposer,
  ContextualNavigationEngine,
  contextualNavigationEngine,
  ContentPriorityMapper,
  contentPriorityMapper,
  type InformationArchitecture,
  type IASection,
  type IAHierarchy,
  type IANavigation,
  type INavigationItem,
  type SemanticSection,
  type NavigationStructure,
  type ContentPriority,
} from './architecture';

export {
  IntelligentEmptyStates,
  intelligentEmptyStates,
  ContextualCTAEngine,
  contextualCTAEngine,
  MicrointeractionEngine,
  microinteractionEngine,
  AdaptiveLoadingExperience,
  adaptiveLoadingExperience,
  type EmptyState,
  type EmptyStateAction,
  type CTA,
  type Microinteraction,
  type LoadingExperience,
} from './ux';
