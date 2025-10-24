export interface MemorySnapshot {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

export interface MemoryLeakDetection {
  isLeakDetected: boolean;
  leakSeverity: 'low' | 'medium' | 'high' | 'critical';
  leakRate: number; // bytes per second
  estimatedLeakSize: number; // bytes
  recommendations: string[];
}

export interface MemoryTrend {
  snapshots: MemorySnapshot[];
  trend: 'stable' | 'increasing' | 'decreasing' | 'volatile';
  averageGrowthRate: number; // bytes per second
  peakMemory: number;
  lowestMemory: number;
  memoryVariance: number;
}

export interface MemoryAlert {
  type: 'warning' | 'error' | 'critical';
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: number;
}

export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private snapshots: MemorySnapshot[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alertCallbacks: ((alert: MemoryAlert) => void)[] = [];
  private isMonitoring = false;
  private maxSnapshots = 1000; // Keep last 1000 snapshots
  private monitoringIntervalMs = 1000; // Check every second
  private memoryThresholds = {
    warning: 50 * 1024 * 1024, // 50MB
    error: 100 * 1024 * 1024,  // 100MB
    critical: 200 * 1024 * 1024, // 200MB
  };

  private constructor() {}

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  /**
   * Start monitoring memory usage
   */
  startMonitoring(intervalMs: number = 1000): void {
    if (this.isMonitoring) {
      console.warn('Memory monitoring is already running');
      return;
    }

    this.monitoringIntervalMs = intervalMs;
    this.isMonitoring = true;

    this.monitoringInterval = setInterval(() => {
      this.takeSnapshot();
      this.checkMemoryThresholds();
    }, intervalMs);

    console.log(`Memory monitoring started with ${intervalMs}ms interval`);
  }

  /**
   * Stop monitoring memory usage
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      console.warn('Memory monitoring is not running');
      return;
    }

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.isMonitoring = false;
    console.log('Memory monitoring stopped');
  }

  /**
   * Take a memory snapshot
   */
  takeSnapshot(): MemorySnapshot | null {
    if (typeof performance === 'undefined' || !performance.memory) {
      console.warn('Performance.memory API not available');
      return null;
    }

    const snapshot: MemorySnapshot = {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      timestamp: Date.now(),
    };

    this.snapshots.push(snapshot);

    // Keep only the last maxSnapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots = this.snapshots.slice(-this.maxSnapshots);
    }

    return snapshot;
  }

  /**
   * Get current memory usage
   */
  getCurrentMemoryUsage(): MemorySnapshot | null {
    return this.takeSnapshot();
  }

  /**
   * Get memory trend analysis
   */
  getMemoryTrend(): MemoryTrend {
    if (this.snapshots.length < 2) {
      return {
        snapshots: this.snapshots,
        trend: 'stable',
        averageGrowthRate: 0,
        peakMemory: 0,
        lowestMemory: 0,
        memoryVariance: 0,
      };
    }

    const usedSizes = this.snapshots.map(s => s.usedJSHeapSize);
    const peakMemory = Math.max(...usedSizes);
    const lowestMemory = Math.min(...usedSizes);
    
    // Calculate growth rate
    const firstSnapshot = this.snapshots[0];
    const lastSnapshot = this.snapshots[this.snapshots.length - 1];
    const timeDiff = (lastSnapshot.timestamp - firstSnapshot.timestamp) / 1000; // seconds
    const memoryDiff = lastSnapshot.usedJSHeapSize - firstSnapshot.usedJSHeapSize;
    const averageGrowthRate = timeDiff > 0 ? memoryDiff / timeDiff : 0;

    // Calculate variance
    const mean = usedSizes.reduce((a, b) => a + b, 0) / usedSizes.length;
    const variance = usedSizes.reduce((acc, size) => acc + Math.pow(size - mean, 2), 0) / usedSizes.length;
    const memoryVariance = Math.sqrt(variance);

    // Determine trend
    let trend: 'stable' | 'increasing' | 'decreasing' | 'volatile' = 'stable';
    
    if (Math.abs(averageGrowthRate) < 1024) { // Less than 1KB/s
      trend = 'stable';
    } else if (averageGrowthRate > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }

    // Check for volatility (high variance)
    if (memoryVariance > mean * 0.2) { // More than 20% variance
      trend = 'volatile';
    }

    return {
      snapshots: [...this.snapshots],
      trend,
      averageGrowthRate,
      peakMemory,
      lowestMemory,
      memoryVariance,
    };
  }

  /**
   * Detect memory leaks
   */
  detectMemoryLeaks(): MemoryLeakDetection {
    const trend = this.getMemoryTrend();
    const isLeakDetected = trend.trend === 'increasing' && trend.averageGrowthRate > 1024; // More than 1KB/s growth
    
    let leakSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let recommendations: string[] = [];

    if (isLeakDetected) {
      const growthRateKB = trend.averageGrowthRate / 1024;
      
      if (growthRateKB < 10) {
        leakSeverity = 'low';
        recommendations = [
          'Monitor memory usage closely',
          'Check for potential memory leaks in event listeners',
          'Ensure proper cleanup of timers and intervals'
        ];
      } else if (growthRateKB < 50) {
        leakSeverity = 'medium';
        recommendations = [
          'Investigate memory leaks immediately',
          'Check for circular references',
          'Review component cleanup logic',
          'Use memory profiling tools'
        ];
      } else if (growthRateKB < 100) {
        leakSeverity = 'high';
        recommendations = [
          'Critical memory leak detected',
          'Stop the application immediately',
          'Use heap snapshots to identify leaks',
          'Review all memory allocations',
          'Consider restarting the application'
        ];
      } else {
        leakSeverity = 'critical';
        recommendations = [
          'CRITICAL: Memory leak detected',
          'Application may crash soon',
          'Immediate action required',
          'Restart application immediately',
          'Investigate root cause with heap profiler'
        ];
      }
    }

    return {
      isLeakDetected,
      leakSeverity,
      leakRate: trend.averageGrowthRate,
      estimatedLeakSize: isLeakDetected ? trend.averageGrowthRate * 60 : 0, // Estimate for 1 minute
      recommendations,
    };
  }

  /**
   * Check memory thresholds and trigger alerts
   */
  private checkMemoryThresholds(): void {
    const currentSnapshot = this.snapshots[this.snapshots.length - 1];
    if (!currentSnapshot) return;

    const currentMemory = currentSnapshot.usedJSHeapSize;
    let alertType: 'warning' | 'error' | 'critical' | null = null;
    let message = '';

    if (currentMemory >= this.memoryThresholds.critical) {
      alertType = 'critical';
      message = `Critical memory usage: ${this.formatBytes(currentMemory)} (limit: ${this.formatBytes(this.memoryThresholds.critical)})`;
    } else if (currentMemory >= this.memoryThresholds.error) {
      alertType = 'error';
      message = `High memory usage: ${this.formatBytes(currentMemory)} (limit: ${this.formatBytes(this.memoryThresholds.error)})`;
    } else if (currentMemory >= this.memoryThresholds.warning) {
      alertType = 'warning';
      message = `Memory usage warning: ${this.formatBytes(currentMemory)} (limit: ${this.formatBytes(this.memoryThresholds.warning)})`;
    }

    if (alertType) {
      const alert: MemoryAlert = {
        type: alertType,
        message,
        threshold: this.memoryThresholds[alertType],
        currentValue: currentMemory,
        timestamp: Date.now(),
      };

      this.triggerAlert(alert);
    }
  }

  /**
   * Trigger memory alert
   */
  private triggerAlert(alert: MemoryAlert): void {
    console.warn(`Memory Alert [${alert.type.toUpperCase()}]: ${alert.message}`);
    
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in memory alert callback:', error);
      }
    });
  }

  /**
   * Add alert callback
   */
  addAlertCallback(callback: (alert: MemoryAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Remove alert callback
   */
  removeAlertCallback(callback: (alert: MemoryAlert) => void): void {
    const index = this.alertCallbacks.indexOf(callback);
    if (index > -1) {
      this.alertCallbacks.splice(index, 1);
    }
  }

  /**
   * Set memory thresholds
   */
  setMemoryThresholds(thresholds: Partial<typeof this.memoryThresholds>): void {
    this.memoryThresholds = { ...this.memoryThresholds, ...thresholds };
  }

  /**
   * Get memory statistics
   */
  getMemoryStatistics(): {
    currentMemory: number;
    peakMemory: number;
    averageMemory: number;
    memoryTrend: string;
    isLeakDetected: boolean;
    leakSeverity: string;
    snapshotsCount: number;
    monitoringDuration: number;
  } {
    const trend = this.getMemoryTrend();
    const leakDetection = this.detectMemoryLeaks();
    const currentSnapshot = this.snapshots[this.snapshots.length - 1];
    
    const currentMemory = currentSnapshot?.usedJSHeapSize || 0;
    const averageMemory = this.snapshots.length > 0 
      ? this.snapshots.reduce((sum, s) => sum + s.usedJSHeapSize, 0) / this.snapshots.length 
      : 0;
    
    const monitoringDuration = this.snapshots.length > 1 
      ? (this.snapshots[this.snapshots.length - 1].timestamp - this.snapshots[0].timestamp) / 1000 
      : 0;

    return {
      currentMemory,
      peakMemory: trend.peakMemory,
      averageMemory,
      memoryTrend: trend.trend,
      isLeakDetected: leakDetection.isLeakDetected,
      leakSeverity: leakDetection.leakSeverity,
      snapshotsCount: this.snapshots.length,
      monitoringDuration,
    };
  }

  /**
   * Clear all memory data
   */
  clearMemoryData(): void {
    this.snapshots = [];
    this.alertCallbacks = [];
  }

  /**
   * Force garbage collection if available
   */
  forceGarbageCollection(): boolean {
    if (global.gc) {
      global.gc();
      return true;
    }
    return false;
  }

  /**
   * Get memory usage report
   */
  getMemoryReport(): string {
    const stats = this.getMemoryStatistics();
    const trend = this.getMemoryTrend();
    const leakDetection = this.detectMemoryLeaks();

    let report = `\n=== Memory Usage Report ===\n`;
    report += `Current Memory: ${this.formatBytes(stats.currentMemory)}\n`;
    report += `Peak Memory: ${this.formatBytes(stats.peakMemory)}\n`;
    report += `Average Memory: ${this.formatBytes(stats.averageMemory)}\n`;
    report += `Memory Trend: ${stats.memoryTrend}\n`;
    report += `Monitoring Duration: ${stats.monitoringDuration.toFixed(2)}s\n`;
    report += `Snapshots Count: ${stats.snapshotsCount}\n\n`;

    if (leakDetection.isLeakDetected) {
      report += `=== Memory Leak Detection ===\n`;
      report += `Leak Detected: YES\n`;
      report += `Leak Severity: ${leakDetection.leakSeverity.toUpperCase()}\n`;
      report += `Leak Rate: ${this.formatBytes(leakDetection.leakRate)}/s\n`;
      report += `Estimated Leak Size: ${this.formatBytes(leakDetection.estimatedLeakSize)}\n\n`;
      
      report += `Recommendations:\n`;
      leakDetection.recommendations.forEach(rec => {
        report += `- ${rec}\n`;
      });
    } else {
      report += `=== Memory Leak Detection ===\n`;
      report += `Leak Detected: NO\n`;
      report += `Memory usage is stable\n`;
    }

    return report;
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if memory monitoring is available
   */
  static isMemoryMonitoringAvailable(): boolean {
    return typeof performance !== 'undefined' && !!performance.memory;
  }

  /**
   * Get memory monitoring status
   */
  getMonitoringStatus(): {
    isMonitoring: boolean;
    isAvailable: boolean;
    snapshotsCount: number;
    intervalMs: number;
  } {
    return {
      isMonitoring: this.isMonitoring,
      isAvailable: MemoryMonitor.isMemoryMonitoringAvailable(),
      snapshotsCount: this.snapshots.length,
      intervalMs: this.monitoringIntervalMs,
    };
  }
}

// Export singleton instance
export const memoryMonitor = MemoryMonitor.getInstance();
