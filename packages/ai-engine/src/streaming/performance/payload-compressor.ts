/**
 * Payload Compressor
 * 
 * Compresses streaming payloads for efficiency.
 * Reduces payload size for faster transmission.
 */

import { logger } from '../../shared/utils/logger';

export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  compressed: boolean;
}

export interface CompressionConfig {
  enableCompression: boolean;
  compressionLevel: number; // 0-9
  minSizeThreshold: number; // bytes
}

const DEFAULT_CONFIG: CompressionConfig = {
  enableCompression: true,
  compressionLevel: 6,
  minSizeThreshold: 1024, // 1KB
};

/**
 * Payload Compressor
 * 
 * Compresses streaming payloads:
 * - Payload compression
 * - Compression ratio tracking
 * - Size optimization
 * - Compression statistics
 */
export class PayloadCompressor {
  private config: CompressionConfig;
  private compressionHistory: Map<string, CompressionResult[]> = new Map();

  constructor(config: Partial<CompressionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Compress a payload
   */
  compress(sessionId: string, payload: string): CompressionResult {
    const originalSize = Buffer.byteLength(payload, 'utf8');
    const result: CompressionResult = {
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      compressed: false,
    };

    // Check if compression is enabled and payload is large enough
    if (!this.config.enableCompression || originalSize < this.config.minSizeThreshold) {
      this.recordResult(sessionId, result);
      return result;
    }

    try {
      // In a real implementation, this would use actual compression (e.g., gzip, brotli)
      // For now, simulate compression
      const compressedPayload = this.simulateCompression(payload);
      result.compressedSize = Buffer.byteLength(compressedPayload, 'utf8');
      result.compressionRatio = result.originalSize / result.compressedSize;
      result.compressed = true;

      logger.info('PayloadCompressor', 'PAYLOAD_COMPRESSED', 'Payload compressed', {
        sessionId,
        originalSize,
        compressedSize: result.compressedSize,
        compressionRatio: result.compressionRatio,
      });

    } catch (error) {
      logger.error('PayloadCompressor', 'COMPRESSION_ERROR', 'Compression error', {
        sessionId,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    this.recordResult(sessionId, result);
    return result;
  }

  /**
   * Simulate compression (placeholder for actual compression)
   */
  private simulateCompression(payload: string): string {
    // In a real implementation, this would use actual compression
    // For now, just return the payload
    return payload;
  }

  /**
   * Record compression result
   */
  private recordResult(sessionId: string, result: CompressionResult): void {
    if (!this.compressionHistory.has(sessionId)) {
      this.compressionHistory.set(sessionId, []);
    }

    this.compressionHistory.get(sessionId)!.push(result);
  }

  /**
   * Get compression history for a session
   */
  getCompressionHistory(sessionId: string): CompressionResult[] {
    return this.compressionHistory.get(sessionId) || [];
  }

  /**
   * Calculate average compression ratio for a session
   */
  getAverageCompressionRatio(sessionId: string): number | undefined {
    const history = this.compressionHistory.get(sessionId);
    if (!history || history.length === 0) {
      return undefined;
    }

    const compressedResults = history.filter(r => r.compressed);
    if (compressedResults.length === 0) {
      return 1;
    }

    const totalRatio = compressedResults.reduce((sum, r) => sum + r.compressionRatio, 0);
    return totalRatio / compressedResults.length;
  }

  /**
   * Calculate total bytes saved for a session
   */
  getTotalBytesSaved(sessionId: string): number {
    const history = this.compressionHistory.get(sessionId);
    if (!history) {
      return 0;
    }

    return history.reduce((sum, r) => {
      if (r.compressed) {
        return sum + (r.originalSize - r.compressedSize);
      }
      return sum;
    }, 0);
  }

  /**
   * Clear compression history for a session
   */
  clearHistory(sessionId: string): void {
    this.compressionHistory.delete(sessionId);

    logger.info('PayloadCompressor', 'HISTORY_CLEARED', 'Compression history cleared', {
      sessionId,
    });
  }

  /**
   * Clear all compression history
   */
  clearAllHistory(): void {
    this.compressionHistory.clear();

    logger.info('PayloadCompressor', 'ALL_HISTORY_CLEARED', 'All compression history cleared');
  }

  /**
   * Get statistics for a session
   */
  getSessionStatistics(sessionId: string): {
    totalCompressions: number;
    successfulCompressions: number;
    averageCompressionRatio: number | undefined;
    totalBytesSaved: number;
  } {
    const history = this.compressionHistory.get(sessionId);
    if (!history) {
      return {
        totalCompressions: 0,
        successfulCompressions: 0,
        averageCompressionRatio: undefined,
        totalBytesSaved: 0,
      };
    }

    const totalCompressions = history.length;
    const successfulCompressions = history.filter(r => r.compressed).length;
    const averageCompressionRatio = this.getAverageCompressionRatio(sessionId);
    const totalBytesSaved = this.getTotalBytesSaved(sessionId);

    return {
      totalCompressions,
      successfulCompressions,
      averageCompressionRatio,
      totalBytesSaved,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CompressionConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('PayloadCompressor', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): CompressionConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSessions: number;
    totalCompressions: number;
    averageCompressionRatio: number;
    totalBytesSaved: number;
    config: CompressionConfig;
  } {
    const totalSessions = this.compressionHistory.size;
    const totalCompressions = Array.from(this.compressionHistory.values()).reduce(
      (sum, history) => sum + history.length,
      0
    );

    let totalRatio = 0;
    let ratioCount = 0;
    let totalBytesSaved = 0;

    for (const history of this.compressionHistory.values()) {
      for (const result of history) {
        if (result.compressed) {
          totalRatio += result.compressionRatio;
          ratioCount++;
          totalBytesSaved += result.originalSize - result.compressedSize;
        }
      }
    }

    const averageCompressionRatio = ratioCount > 0 ? totalRatio / ratioCount : 1;

    return {
      totalSessions,
      totalCompressions,
      averageCompressionRatio,
      totalBytesSaved,
      config: this.getConfig(),
    };
  }
}

export const payloadCompressor = new PayloadCompressor();
