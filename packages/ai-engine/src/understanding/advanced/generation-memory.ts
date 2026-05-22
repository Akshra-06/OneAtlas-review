/**
 * Generation Memory System
 * 
 * Maintains context persistence and consistency across generations:
 * - Generation memory system
 * - Contextual reasoning persistence
 * - Generation continuity tracking
 * - Consistency validation
 */

import type { AppUnderstanding, EntityNode, WorkflowNode, PageNode } from '@oneatlas/shared';

export interface GenerationMemory {
  sessionId: string;
  timestamp: number;
  prompt: string;
  understanding: AppUnderstanding;
  generationDecisions: GenerationDecision[];
  stylePreferences: StylePreferences;
  entityHistory: EntityHistory[];
  workflowHistory: WorkflowHistory[];
  layoutHistory: LayoutHistory[];
}

export interface GenerationDecision {
  type: 'entity' | 'workflow' | 'page' | 'layout' | 'component' | 'navigation';
  entityId?: string;
  decision: string;
  rationale: string;
  confidence: number;
}

export interface StylePreferences {
  colorScheme: 'light' | 'dark' | 'auto';
  layoutDensity: 'compact' | 'comfortable' | 'spacious';
  componentStyle: 'minimal' | 'detailed' | 'rich';
  navigationStyle: 'sidebar' | 'topbar' | 'mixed';
  primaryColor?: string;
  secondaryColor?: string;
}

export interface EntityHistory {
  entityId: string;
  name: string;
  timestamp: number;
  changeType: 'created' | 'modified' | 'deleted' | 'renamed';
  previousState?: EntityNode;
  currentState: EntityNode;
}

export interface WorkflowHistory {
  workflowId: string;
  name: string;
  timestamp: number;
  changeType: 'created' | 'modified' | 'deleted' | 'steps_changed';
  previousState?: WorkflowNode;
  currentState: WorkflowNode;
}

export interface LayoutHistory {
  pageId: string;
  layoutTemplate: string;
  timestamp: number;
  components: string[];
  changeType: 'created' | 'modified' | 'layout_changed';
}

export interface ConsistencyCheck {
  isConsistent: boolean;
  driftDetected: boolean;
  driftAreas: string[];
  suggestions: string[];
  confidence: number;
}

export class GenerationMemorySystem {
  private memory: Map<string, GenerationMemory> = new Map();
  private currentSessionId: string | null = null;

  /**
   * Start a new generation session
   */
  startSession(prompt: string): string {
    const sessionId = this.generateSessionId();
    this.currentSessionId = sessionId;

    const memory: GenerationMemory = {
      sessionId,
      timestamp: Date.now(),
      prompt,
      understanding: {
        appName: '',
        appType: 'other',
        features: [],
        pages: [],
        entities: [],
        workflows: [],
      },
      generationDecisions: [],
      stylePreferences: this.inferInitialStylePreferences(prompt),
      entityHistory: [],
      workflowHistory: [],
      layoutHistory: [],
    };

    this.memory.set(sessionId, memory);
    return sessionId;
  }

  /**
   * Record a generation decision
   */
  recordDecision(decision: GenerationDecision): void {
    if (!this.currentSessionId) return;

    const memory = this.memory.get(this.currentSessionId);
    if (memory) {
      memory.generationDecisions.push(decision);
    }
  }

  /**
   * Update the understanding for current session
   */
  updateUnderstanding(understanding: AppUnderstanding): void {
    if (!this.currentSessionId) return;

    const memory = this.memory.get(this.currentSessionId);
    if (memory) {
      memory.understanding = understanding;
    }
  }

  /**
   * Record entity change
   */
  recordEntityChange(
    entityId: string,
    changeType: 'created' | 'modified' | 'deleted' | 'renamed',
    previousState?: EntityNode,
    currentState?: EntityNode
  ): void {
    if (!this.currentSessionId) return;

    const memory = this.memory.get(this.currentSessionId);
    if (memory) {
      memory.entityHistory.push({
        entityId,
        name: currentState?.name || previousState?.name || 'Unknown',
        timestamp: Date.now(),
        changeType,
        previousState,
        currentState: currentState || previousState!,
      });
    }
  }

  /**
   * Record workflow change
   */
  recordWorkflowChange(
    workflowId: string,
    changeType: 'created' | 'modified' | 'deleted' | 'steps_changed',
    previousState?: WorkflowNode,
    currentState?: WorkflowNode
  ): void {
    if (!this.currentSessionId) return;

    const memory = this.memory.get(this.currentSessionId);
    if (memory) {
      memory.workflowHistory.push({
        workflowId,
        name: currentState?.name || previousState?.name || 'Unknown',
        timestamp: Date.now(),
        changeType,
        previousState,
        currentState: currentState || previousState!,
      });
    }
  }

  /**
   * Record layout change
   */
  recordLayoutChange(
    pageId: string,
    layoutTemplate: string,
    components: string[],
    changeType: 'created' | 'modified' | 'layout_changed'
  ): void {
    if (!this.currentSessionId) return;

    const memory = this.memory.get(this.currentSessionId);
    if (memory) {
      memory.layoutHistory.push({
        pageId,
        layoutTemplate,
        components,
        timestamp: Date.now(),
        changeType,
      });
    }
  }

  /**
   * Update style preferences
   */
  updateStylePreferences(preferences: Partial<StylePreferences>): void {
    if (!this.currentSessionId) return;

    const memory = this.memory.get(this.currentSessionId);
    if (memory) {
      memory.stylePreferences = { ...memory.stylePreferences, ...preferences };
    }
  }

  /**
   * Check consistency across generations
   */
  checkConsistency(currentUnderstanding: AppUnderstanding): ConsistencyCheck {
    if (!this.currentSessionId) {
      return {
        isConsistent: true,
        driftDetected: false,
        driftAreas: [],
        suggestions: [],
        confidence: 1.0,
      };
    }

    const memory = this.memory.get(this.currentSessionId);
    if (!memory) {
      return {
        isConsistent: true,
        driftDetected: false,
        driftAreas: [],
        suggestions: [],
        confidence: 1.0,
      };
    }

    const driftAreas: string[] = [];
    const suggestions: string[] = [];

    // Check for entity drift
    const entityDrift = this.checkEntityDrift(memory.understanding.entities, currentUnderstanding.entities);
    if (entityDrift.hasDrift) {
      driftAreas.push('Entity structure drift');
      suggestions.push(...entityDrift.suggestions);
    }

    // Check for workflow drift
    const workflowDrift = this.checkWorkflowDrift(memory.understanding.workflows, currentUnderstanding.workflows);
    if (workflowDrift.hasDrift) {
      driftAreas.push('Workflow logic drift');
      suggestions.push(...workflowDrift.suggestions);
    }

    // Check for layout drift
    const layoutDrift = this.checkLayoutDrift(memory.understanding.pages, currentUnderstanding.pages);
    if (layoutDrift.hasDrift) {
      driftAreas.push('Layout pattern drift');
      suggestions.push(...layoutDrift.suggestions);
    }

    // Check for archetype drift
    const archetypeDrift = this.checkArchetypeDrift(memory.understanding.appType, currentUnderstanding.appType);
    if (archetypeDrift.hasDrift) {
      driftAreas.push('Archetype drift');
      suggestions.push(...archetypeDrift.suggestions);
    }

    const hasDrift = driftAreas.length > 0;
    const confidence = hasDrift ? 0.6 : 0.95;

    return {
      isConsistent: !hasDrift,
      driftDetected: hasDrift,
      driftAreas,
      suggestions,
      confidence,
    };
  }

  /**
   * Check for entity structure drift
   */
  private checkEntityDrift(previous: EntityNode[], current: EntityNode[]): { hasDrift: boolean; suggestions: string[] } {
    const suggestions: string[] = [];
    let hasDrift = false;

    const previousNames = new Set(previous.map(e => e.name));
    const currentNames = new Set(current.map(e => e.name));

    // Check for deleted entities
    for (const name of previousNames) {
      if (!currentNames.has(name)) {
        hasDrift = true;
        suggestions.push(`Entity "${name}" was deleted - ensure this is intentional`);
      }
    }

    // Check for renamed entities
    for (const currentEntity of current) {
      const previousEntity = previous.find(e => e.id === currentEntity.id);
      if (previousEntity && previousEntity.name !== currentEntity.name) {
        hasDrift = true;
        suggestions.push(`Entity renamed from "${previousEntity.name}" to "${currentEntity.name}"`);
      }
    }

    // Check for attribute changes
    for (const currentEntity of current) {
      const previousEntity = previous.find(e => e.id === currentEntity.id);
      if (previousEntity) {
        const previousAttrs = new Set(previousEntity.attributes.map(a => a.name));
        const currentAttrs = new Set(currentEntity.attributes.map(a => a.name));

        for (const attr of previousAttrs) {
          if (!currentAttrs.has(attr)) {
            hasDrift = true;
            suggestions.push(`Attribute "${attr}" removed from "${currentEntity.name}"`);
          }
        }
      }
    }

    return { hasDrift, suggestions };
  }

  /**
   * Check for workflow logic drift
   */
  private checkWorkflowDrift(previous: WorkflowNode[], current: WorkflowNode[]): { hasDrift: boolean; suggestions: string[] } {
    const suggestions: string[] = [];
    let hasDrift = false;

    const previousNames = new Set(previous.map(w => w.name));
    const currentNames = new Set(current.map(w => w.name));

    // Check for deleted workflows
    for (const name of previousNames) {
      if (!currentNames.has(name)) {
        hasDrift = true;
        suggestions.push(`Workflow "${name}" was deleted - ensure this is intentional`);
      }
    }

    // Check for step changes
    for (const currentWorkflow of current) {
      const previousWorkflow = previous.find(w => w.id === currentWorkflow.id);
      if (previousWorkflow) {
        if (previousWorkflow.steps.length !== currentWorkflow.steps.length) {
          hasDrift = true;
          suggestions.push(`Workflow "${currentWorkflow.name}" steps changed from ${previousWorkflow.steps.length} to ${currentWorkflow.steps.length}`);
        }
      }
    }

    return { hasDrift, suggestions };
  }

  /**
   * Check for layout pattern drift
   */
  private checkLayoutDrift(previous: PageNode[], current: PageNode[]): { hasDrift: boolean; suggestions: string[] } {
    const suggestions: string[] = [];
    let hasDrift = false;

    // Check for layout template changes
    for (const currentPage of current) {
      const previousPage = previous.find(p => p.id === currentPage.id);
      if (previousPage && previousPage.layoutTemplate !== currentPage.layoutTemplate) {
        hasDrift = true;
        suggestions.push(`Page "${currentPage.name}" layout changed from "${previousPage.layoutTemplate}" to "${currentPage.layoutTemplate}"`);
      }
    }

    return { hasDrift, suggestions };
  }

  /**
   * Check for archetype drift
   */
  private checkArchetypeDrift(previous: string, current: string): { hasDrift: boolean; suggestions: string[] } {
    const suggestions: string[] = [];

    if (previous !== current) {
      return {
        hasDrift: true,
        suggestions: [`App type changed from "${previous}" to "${current}" - ensure this aligns with user intent`],
      };
    }

    return { hasDrift: false, suggestions };
  }

  /**
   * Infer initial style preferences from prompt
   */
  private inferInitialStylePreferences(prompt: string): StylePreferences {
    const preferences: StylePreferences = {
      colorScheme: 'light',
      layoutDensity: 'comfortable',
      componentStyle: 'detailed',
      navigationStyle: 'sidebar',
    };

    const lowerPrompt = prompt.toLowerCase();

    // Infer color scheme
    if (lowerPrompt.includes('dark mode') || lowerPrompt.includes('dark theme')) {
      preferences.colorScheme = 'dark';
    }

    // Infer layout density
    if (lowerPrompt.includes('minimal') || lowerPrompt.includes('simple')) {
      preferences.layoutDensity = 'compact';
      preferences.componentStyle = 'minimal';
    } else if (lowerPrompt.includes('spacious') || lowerPrompt.includes('clean')) {
      preferences.layoutDensity = 'spacious';
    }

    // Infer navigation style
    if (lowerPrompt.includes('top navigation') || lowerPrompt.includes('topbar')) {
      preferences.navigationStyle = 'topbar';
    }

    return preferences;
  }

  /**
   * Get current session memory
   */
  getCurrentSession(): GenerationMemory | null {
    if (!this.currentSessionId) return null;
    return this.memory.get(this.currentSessionId) || null;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): GenerationMemory | null {
    return this.memory.get(sessionId) || null;
  }

  /**
   * End current session
   */
  endSession(): void {
    this.currentSessionId = null;
  }

  /**
   * Clear all memory
   */
  clearMemory(): void {
    this.memory.clear();
    this.currentSessionId = null;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get consistency suggestions based on history
   */
  getConsistencySuggestions(): string[] {
    if (!this.currentSessionId) return [];

    const memory = this.memory.get(this.currentSessionId);
    if (!memory) return [];

    const suggestions: string[] = [];

    // Check for repeated patterns in decisions
    const decisionTypes = new Map<string, number>();
    for (const decision of memory.generationDecisions) {
      const count = decisionTypes.get(decision.type) || 0;
      decisionTypes.set(decision.type, count + 1);
    }

    for (const [type, count] of decisionTypes) {
      if (count > 5) {
        suggestions.push(`High frequency of ${type} decisions - consider consolidating`);
      }
    }

    // Check for style consistency
    const layoutChanges = memory.layoutHistory.filter(h => h.changeType === 'layout_changed');
    if (layoutChanges.length > 3) {
      suggestions.push('Multiple layout changes detected - consider establishing consistent layout pattern');
    }

    return suggestions;
  }
}

export const generationMemory = new GenerationMemorySystem();
