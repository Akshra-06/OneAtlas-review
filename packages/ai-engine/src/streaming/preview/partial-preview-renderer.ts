/**
 * Partial Preview Renderer
 * 
 * Renders partial UI updates incrementally.
 * Supports optimistic rendering and avoids full reloads.
 */

import { logger } from '../../shared/utils/logger';

export interface PreviewComponent {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: PreviewComponent[];
}

export interface PreviewPatch {
  type: 'add' | 'update' | 'remove';
  componentId?: string;
  path: string;
  data: unknown;
}

export interface PreviewState {
  components: Map<string, PreviewComponent>;
  rendered: Set<string>;
  pending: Set<string>;
}

/**
 * Partial Preview Renderer
 * 
 * Renders partial UI updates incrementally:
 * - Render navbar before full app complete
 * - Render dashboard shell immediately
 * - Progressively inject widgets/components
 * - Patch changed components only
 */
export class PartialPreviewRenderer {
  private state: PreviewState;
  private renderCallbacks: Map<string, (component: PreviewComponent) => void> = new Map();

  constructor() {
    this.state = {
      components: new Map(),
      rendered: new Set(),
      pending: new Set(),
    };
  }

  /**
   * Register a render callback for a component
   */
  registerRenderCallback(componentId: string, callback: (component: PreviewComponent) => void): void {
    this.renderCallbacks.set(componentId, callback);

    logger.info('PartialPreviewRenderer', 'CALLBACK_REGISTERED', 'Render callback registered', {
      componentId,
    });
  }

  /**
   * Unregister a render callback
   */
  unregisterRenderCallback(componentId: string): void {
    this.renderCallbacks.delete(componentId);

    logger.info('PartialPreviewRenderer', 'CALLBACK_UNREGISTERED', 'Render callback unregistered', {
      componentId,
    });
  }

  /**
   * Add a component to the preview
   */
  addComponent(component: PreviewComponent): void {
    this.state.components.set(component.id, component);
    this.state.pending.add(component.id);

    logger.info('PartialPreviewRenderer', 'COMPONENT_ADDED', 'Component added to preview', {
      componentId: component.id,
      type: component.type,
    });
  }

  /**
   * Update a component in the preview
   */
  updateComponent(componentId: string, updates: Partial<PreviewComponent>): void {
    const component = this.state.components.get(componentId);
    if (!component) {
      logger.warn('PartialPreviewRenderer', 'COMPONENT_NOT_FOUND', 'Component not found for update', {
        componentId,
      });
      return;
    }

    const updated = { ...component, ...updates };
    this.state.components.set(componentId, updated);
    this.state.pending.add(componentId);

    logger.info('PartialPreviewRenderer', 'COMPONENT_UPDATED', 'Component updated in preview', {
      componentId,
    });
  }

  /**
   * Remove a component from the preview
   */
  removeComponent(componentId: string): void {
    this.state.components.delete(componentId);
    this.state.rendered.delete(componentId);
    this.state.pending.delete(componentId);

    logger.info('PartialPreviewRenderer', 'COMPONENT_REMOVED', 'Component removed from preview', {
      componentId,
    });
  }

  /**
   * Render a component
   */
  renderComponent(componentId: string): void {
    const component = this.state.components.get(componentId);
    if (!component) {
      logger.warn('PartialPreviewRenderer', 'COMPONENT_NOT_FOUND', 'Component not found for render', {
        componentId,
      });
      return;
    }

    // Call render callback if registered
    const callback = this.renderCallbacks.get(componentId);
    if (callback) {
      callback(component);
    }

    this.state.rendered.add(componentId);
    this.state.pending.delete(componentId);

    logger.info('PartialPreviewRenderer', 'COMPONENT_RENDERED', 'Component rendered', {
      componentId,
    });
  }

  /**
   * Render all pending components
   */
  renderPending(): void {
    const pendingIds = Array.from(this.state.pending);

    for (const componentId of pendingIds) {
      this.renderComponent(componentId);
    }

    logger.info('PartialPreviewRenderer', 'PENDING_RENDERED', 'All pending components rendered', {
      count: pendingIds.length,
    });
  }

  /**
   * Apply a patch to the preview
   */
  applyPatch(patch: PreviewPatch): void {
    switch (patch.type) {
      case 'add':
        this.addComponent(patch.data as PreviewComponent);
        break;
      case 'update':
        if (patch.componentId) {
          this.updateComponent(patch.componentId, patch.data as Partial<PreviewComponent>);
        }
        break;
      case 'remove':
        if (patch.componentId) {
          this.removeComponent(patch.componentId);
        }
        break;
    }

    logger.info('PartialPreviewRenderer', 'PATCH_APPLIED', 'Patch applied to preview', {
      patchType: patch.type,
      componentId: patch.componentId,
    });
  }

  /**
   * Apply multiple patches
   */
  applyPatches(patches: PreviewPatch[]): void {
    for (const patch of patches) {
      this.applyPatch(patch);
    }

    logger.info('PartialPreviewRenderer', 'PATCHES_APPLIED', 'Multiple patches applied', {
      count: patches.length,
    });
  }

  /**
   * Get a component by ID
   */
  getComponent(componentId: string): PreviewComponent | undefined {
    return this.state.components.get(componentId);
  }

  /**
   * Get all components
   */
  getAllComponents(): PreviewComponent[] {
    return Array.from(this.state.components.values());
  }

  /**
   * Get rendered components
   */
  getRenderedComponents(): PreviewComponent[] {
    return Array.from(this.state.rendered)
      .map(id => this.state.components.get(id))
      .filter((c): c is PreviewComponent => c !== undefined);
  }

  /**
   * Get pending components
   */
  getPendingComponents(): PreviewComponent[] {
    return Array.from(this.state.pending)
      .map(id => this.state.components.get(id))
      .filter((c): c is PreviewComponent => c !== undefined);
  }

  /**
   * Check if a component is rendered
   */
  isRendered(componentId: string): boolean {
    return this.state.rendered.has(componentId);
  }

  /**
   * Check if a component is pending
   */
  isPending(componentId: string): boolean {
    return this.state.pending.has(componentId);
  }

  /**
   * Get render progress
   */
  getRenderProgress(): {
    total: number;
    rendered: number;
    pending: number;
    percentage: number;
  } {
    const total = this.state.components.size;
    const rendered = this.state.rendered.size;
    const pending = this.state.pending.size;
    const percentage = total > 0 ? (rendered / total) * 100 : 0;

    return {
      total,
      rendered,
      pending,
      percentage,
    };
  }

  /**
   * Clear all components
   */
  clear(): void {
    this.state.components.clear();
    this.state.rendered.clear();
    this.state.pending.clear();

    logger.info('PartialPreviewRenderer', 'CLEARED', 'Preview cleared');
  }

  /**
   * Reset render state (keep components, reset rendered/pending)
   */
  resetRenderState(): void {
    this.state.rendered.clear();
    this.state.pending.clear();

    logger.info('PartialPreviewRenderer', 'RENDER_STATE_RESET', 'Render state reset');
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalComponents: number;
    renderedComponents: number;
    pendingComponents: number;
    registeredCallbacks: number;
  } {
    return {
      totalComponents: this.state.components.size,
      renderedComponents: this.state.rendered.size,
      pendingComponents: this.state.pending.size,
      registeredCallbacks: this.renderCallbacks.size,
    };
  }
}

export const partialPreviewRenderer = new PartialPreviewRenderer();
