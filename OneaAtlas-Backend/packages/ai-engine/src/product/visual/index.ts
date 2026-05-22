/**
 * Visual Module Entry Point
 * 
 * Exports all visual hierarchy components.
 */

export {
  VisualHierarchyEngine,
  visualHierarchyEngine,
  type VisualHierarchy,
  type HierarchyLevel,
  type VisualRhythm,
  type TypographyScale as VisualTypographyScale,
} from './visual-hierarchy-engine';

export {
  AttentionMapper,
  attentionMapper,
  type AttentionPoint,
  type AttentionMap,
} from './attention-mapper';

export {
  SpacingIntelligence,
  spacingIntelligence,
  type SpacingSystem,
} from './spacing-intelligence';

export {
  TypographyScaler,
  typographyScaler,
  type TypographyScale,
  type TypographySystem,
} from './typography-scaler';

export {
  EmphasisEngine,
  emphasisEngine,
  type EmphasisRule,
} from './emphasis-engine';
