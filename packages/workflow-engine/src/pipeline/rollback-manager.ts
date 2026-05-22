/**
 * Rollback Manager for Generation Pipeline
 * Manages state snapshots and rollback capabilities
 */

import type { PipelineContext } from './generation.pipeline';

export interface PipelineSnapshot {
  timestamp: string;
  stage: string;
  context: PipelineContext;
}

class RollbackManager {
  private snapshots: Map<string, PipelineSnapshot> = new Map();
  private maxSnapshots = 10;

  /**
   * Create a snapshot of the current pipeline state
   */
  createSnapshot(stage: string, context: PipelineContext): string {
    const snapshotId = `${stage}-${Date.now()}`;
    
    // Deep clone the context to avoid reference issues
    const snapshot: PipelineSnapshot = {
      timestamp: new Date().toISOString(),
      stage,
      context: JSON.parse(JSON.stringify(context)),
    };

    this.snapshots.set(snapshotId, snapshot);

    // Maintain only the last N snapshots
    if (this.snapshots.size > this.maxSnapshots) {
      const iterator = this.snapshots.keys();
      const oldestKey = iterator.next().value;
      if (oldestKey) {
        this.snapshots.delete(oldestKey);
      }
    }

    return snapshotId;
  }

  /**
   * Rollback to a specific snapshot
   */
  rollbackToSnapshot(snapshotId: string): PipelineContext | null {
    const snapshot = this.snapshots.get(snapshotId);
    if (!snapshot) {
      return null;
    }

    // Deep clone to avoid reference issues
    return JSON.parse(JSON.stringify(snapshot.context));
  }

  /**
   * Rollback to a specific stage
   */
  rollbackToStage(stage: string): PipelineContext | null {
    // Find the most recent snapshot for the given stage
    let latestSnapshot: PipelineSnapshot | null = null;

    for (const snapshot of this.snapshots.values()) {
      if (snapshot.stage === stage) {
        if (!latestSnapshot || new Date(snapshot.timestamp) > new Date(latestSnapshot.timestamp)) {
          latestSnapshot = snapshot;
        }
      }
    }

    if (!latestSnapshot) {
      return null;
    }

    // Deep clone to avoid reference issues
    return JSON.parse(JSON.stringify(latestSnapshot.context));
  }

  /**
   * Get the most recent snapshot
   */
  getLatestSnapshot(): PipelineSnapshot | null {
    let latest: PipelineSnapshot | null = null;

    for (const snapshot of this.snapshots.values()) {
      if (!latest || new Date(snapshot.timestamp) > new Date(latest.timestamp)) {
        latest = snapshot;
      }
    }

    return latest;
  }

  /**
   * Clear all snapshots
   */
  clearSnapshots(): void {
    this.snapshots.clear();
  }

  /**
   * Get snapshot history
   */
  getSnapshotHistory(): PipelineSnapshot[] {
    return Array.from(this.snapshots.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Delete a specific snapshot
   */
  deleteSnapshot(snapshotId: string): boolean {
    return this.snapshots.delete(snapshotId);
  }
}

export const rollbackManager = new RollbackManager();
