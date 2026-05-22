/**
 * Seed Manager
 * 
 * Manages seeds for deterministic AI generation.
 * Ensures reproducible outputs by controlling randomness.
 */

import { logger } from '../../shared/utils/logger';

export interface SeedRecord {
  seed: string;
  timestamp: string;
  context: string;
  used: boolean;
  outputHash?: string;
}

export interface SeedConfig {
  autoGenerate: boolean;
  seedLength: number;
  trackUsage: boolean;
  enforceDeterminism: boolean;
}

const DEFAULT_CONFIG: SeedConfig = {
  autoGenerate: true,
  seedLength: 16,
  trackUsage: true,
  enforceDeterminism: true,
};

/**
 * Seed Manager
 * 
 * Manages seeds for deterministic AI generation:
 * - Seed generation
 * - Seed tracking
 * - Seed validation
 * - Reproducibility enforcement
 */
export class SeedManager {
  private config: SeedConfig;
  private seedHistory: Map<string, SeedRecord> = new Map();
  private currentSeed: string | null = null;

  constructor(config: Partial<SeedConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate a new seed
   */
  generateSeed(context: string): string {
    const seed = this.generateRandomSeed(this.config.seedLength);
    
    const record: SeedRecord = {
      seed,
      timestamp: new Date().toISOString(),
      context,
      used: false,
    };

    this.seedHistory.set(seed, record);
    this.currentSeed = seed;

    logger.info('SeedManager', 'SEED_GENERATED', 'New seed generated', {
      seed,
      context,
    });

    return seed;
  }

  /**
   * Use a specific seed
   */
  useSeed(seed: string, context: string): boolean {
    const record = this.seedHistory.get(seed);
    
    if (record) {
      record.used = true;
      record.context = context;
      this.currentSeed = seed;
      
      logger.info('SeedManager', 'SEED_USED', 'Existing seed used', {
        seed,
        context,
      });
      
      return true;
    }

    // Create new record for external seed
    const newRecord: SeedRecord = {
      seed,
      timestamp: new Date().toISOString(),
      context,
      used: true,
    };

    this.seedHistory.set(seed, newRecord);
    this.currentSeed = seed;

    logger.info('SeedManager', 'SEED_REGISTERED', 'External seed registered', {
      seed,
      context,
    });

    return true;
  }

  /**
   * Get current seed
   */
  getCurrentSeed(): string | null {
    return this.currentSeed;
  }

  /**
   * Record output hash for seed
   */
  recordOutputHash(seed: string, outputHash: string): void {
    const record = this.seedHistory.get(seed);
    
    if (record) {
      record.outputHash = outputHash;
      
      logger.info('SeedManager', 'OUTPUT_HASH_RECORDED', 'Output hash recorded', {
        seed,
        outputHash,
      });
    }
  }

  /**
   * Validate seed determinism
   */
  validateDeterminism(seed: string, expectedOutputHash: string): boolean {
    const record = this.seedHistory.get(seed);
    
    if (!record || !record.outputHash) {
      logger.warn('SeedManager', 'VALIDATION_FAILED', 'Seed or output hash not found', { seed });
      return false;
    }

    const matches = record.outputHash === expectedOutputHash;
    
    if (this.config.enforceDeterminism && !matches) {
      logger.error('SeedManager', 'DETERMINISM_VIOLATION', 'Output hash mismatch', {
        seed,
        expected: expectedOutputHash,
        actual: record.outputHash,
      });
    }

    return matches;
  }

  /**
   * Get seed history
   */
  getSeedHistory(): SeedRecord[] {
    return Array.from(this.seedHistory.values());
  }

  /**
   * Get seed record
   */
  getSeedRecord(seed: string): SeedRecord | undefined {
    return this.seedHistory.get(seed);
  }

  /**
   * Clear seed history
   */
  clearHistory(): void {
    this.seedHistory.clear();
    this.currentSeed = null;
    
    logger.info('SeedManager', 'HISTORY_CLEARED', 'Seed history cleared');
  }

  /**
   * Generate random seed
   */
  private generateRandomSeed(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  /**
   * Generate deterministic seed from context
   */
  generateDeterministicSeed(context: string): string {
    // Simple hash-based seed generation
    let hash = 0;
    for (let i = 0; i < context.length; i++) {
      const char = context.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Convert to base36 and pad
    const seed = Math.abs(hash).toString(36).padStart(this.config.seedLength, '0').slice(0, this.config.seedLength);
    
    const record: SeedRecord = {
      seed,
      timestamp: new Date().toISOString(),
      context,
      used: false,
    };

    this.seedHistory.set(seed, record);
    this.currentSeed = seed;

    logger.info('SeedManager', 'DETERMINISTIC_SEED_GENERATED', 'Deterministic seed generated', {
      seed,
      context,
    });

    return seed;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SeedConfig>): void {
    this.config = { ...this.config, ...config };
    
    logger.info('SeedManager', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): SeedConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSeeds: number;
    usedSeeds: number;
    unusedSeeds: number;
    currentSeed: string | null;
  } {
    const seeds = Array.from(this.seedHistory.values());
    
    return {
      totalSeeds: seeds.length,
      usedSeeds: seeds.filter(s => s.used).length,
      unusedSeeds: seeds.filter(s => !s.used).length,
      currentSeed: this.currentSeed,
    };
  }
}

export const seedManager = new SeedManager();
