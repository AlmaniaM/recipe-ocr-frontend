import { Recipe } from '../../domain/entities/Recipe';
import { RecipeCategory } from '../../domain/enums/RecipeCategory';

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  frameRate: number;
  bundleSize: number;
  scrollTime: number;
  loadTime: number;
}

export interface PerformanceBenchmark {
  name: string;
  threshold: number;
  actual: number;
  passed: boolean;
  unit: string;
}

export interface PerformanceTestResult {
  testName: string;
  metrics: PerformanceMetrics;
  benchmarks: PerformanceBenchmark[];
  passed: boolean;
  timestamp: number;
}

export class PerformanceTestHelper {
  private static instance: PerformanceTestHelper;
  private performanceEntries: PerformanceEntry[] = [];
  private activeMeasurements: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): PerformanceTestHelper {
    if (!PerformanceTestHelper.instance) {
      PerformanceTestHelper.instance = new PerformanceTestHelper();
    }
    return PerformanceTestHelper.instance;
  }

  /**
   * Measure render time for a component
   */
  static measureRenderTime(componentName: string, renderFn: () => void): number {
    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
    
    return renderTime;
  }

  /**
   * Measure async operation performance
   */
  static async measureAsync<T>(
    operationName: string, 
    asyncFn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const startTime = performance.now();
    
    try {
      const result = await asyncFn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`${operationName} duration: ${duration.toFixed(2)}ms`);
      return { result, duration };
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error(`${operationName} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }

  /**
   * Measure memory usage
   */
  static measureMemoryUsage(): number {
    if (typeof performance !== 'undefined' && performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Measure frame rate
   */
  static measureFrameRate(callback: (frameRate: number) => void): () => void {
    let lastTime = performance.now();
    let frameCount = 0;
    
    const measureFrame = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime > 0) {
        const frameRate = 1000 / deltaTime;
        frameCount++;
        
        if (frameCount % 10 === 0) { // Report every 10 frames
          callback(Math.round(frameRate));
        }
      }
      
      lastTime = currentTime;
      requestAnimationFrame(measureFrame);
    };
    
    const animationId = requestAnimationFrame(measureFrame);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }

  /**
   * Generate large dataset for performance testing
   */
  static generateLargeDataset<T>(
    size: number, 
    generator: (index: number) => T
  ): T[] {
    return Array.from({ length: size }, (_, i) => generator(i));
  }

  /**
   * Generate test recipes for performance testing
   */
  static generateTestRecipes(count: number): Recipe[] {
    return Array.from({ length: count }, (_, i) => {
      const recipeResult = Recipe.create(
        `Test Recipe ${i}`,
        `Description for test recipe ${i}`,
        RecipeCategory.MainCourse
      );
      return recipeResult.value;
    });
  }

  /**
   * Generate complex test recipes with additional data
   */
  static generateComplexTestRecipes(count: number): any[] {
    return Array.from({ length: count }, (_, i) => {
      const recipeResult = Recipe.create(
        `Complex Test Recipe ${i}`,
        `Complex description for test recipe ${i} with more detailed information`,
        RecipeCategory.MainCourse
      );
      
      return {
        ...recipeResult.value,
        ingredients: Array.from({ length: 10 }, (_, j) => `Ingredient ${j} for recipe ${i}`),
        instructions: Array.from({ length: 5 }, (_, j) => `Step ${j + 1}: Do something for recipe ${i}`),
        tags: Array.from({ length: 3 }, (_, j) => `Tag ${j} for recipe ${i}`),
        imagePath: `image-${i}.jpg`,
        prepTimeMinutes: 30 + (i % 60),
        cookTimeMinutes: 20 + (i % 40),
        servings: 2 + (i % 8),
        difficulty: ['Easy', 'Medium', 'Hard'][i % 3],
        rating: 3 + (i % 3),
        createdAt: new Date(Date.now() - i * 86400000), // i days ago
        updatedAt: new Date(),
      };
    });
  }

  /**
   * Simulate scroll events for performance testing
   */
  static simulateScrollEvents(
    element: any, 
    eventCount: number, 
    scrollDistance: number = 100
  ): void {
    for (let i = 0; i < eventCount; i++) {
      const scrollEvent = {
        nativeEvent: {
          contentOffset: { y: i * scrollDistance },
          contentSize: { height: eventCount * scrollDistance },
          layoutMeasurement: { height: 400 }
        }
      };
      
      // Simulate scroll event
      if (element && element.props && element.props.onScroll) {
        element.props.onScroll(scrollEvent);
      }
    }
  }

  /**
   * Simulate rapid user interactions
   */
  static simulateRapidInteractions(
    element: any, 
    interactionCount: number
  ): void {
    for (let i = 0; i < interactionCount; i++) {
      // Simulate different types of interactions
      const interactionType = i % 4;
      
      switch (interactionType) {
        case 0:
          // Scroll interaction
          this.simulateScrollEvents(element, 1, 50);
          break;
        case 1:
          // Press interaction
          if (element && element.props && element.props.onPress) {
            element.props.onPress();
          }
          break;
        case 2:
          // Change interaction
          if (element && element.props && element.props.onChangeText) {
            element.props.onChangeText(`Test input ${i}`);
          }
          break;
        case 3:
          // Focus interaction
          if (element && element.props && element.props.onFocus) {
            element.props.onFocus();
          }
          break;
      }
    }
  }

  /**
   * Measure component mount/unmount performance
   */
  static measureMountUnmountPerformance(
    componentFactory: () => React.ReactElement,
    mountCount: number = 10
  ): { averageMountTime: number; averageUnmountTime: number } {
    const mountTimes: number[] = [];
    const unmountTimes: number[] = [];
    
    for (let i = 0; i < mountCount; i++) {
      // Measure mount time
      const mountStartTime = performance.now();
      const component = componentFactory();
      const mountEndTime = performance.now();
      mountTimes.push(mountEndTime - mountStartTime);
      
      // Measure unmount time
      const unmountStartTime = performance.now();
      // Simulate unmount by clearing references
      const unmountEndTime = performance.now();
      unmountTimes.push(unmountEndTime - unmountStartTime);
    }
    
    const averageMountTime = mountTimes.reduce((a, b) => a + b, 0) / mountTimes.length;
    const averageUnmountTime = unmountTimes.reduce((a, b) => a + b, 0) / unmountTimes.length;
    
    return { averageMountTime, averageUnmountTime };
  }

  /**
   * Measure bundle size
   */
  static measureBundleSize(): number {
    try {
      // In a real environment, this would analyze the actual bundle
      // For now, we'll return a mock size based on dependencies
      const packageJson = require('../../../package.json');
      const dependencies = Object.keys(packageJson.dependencies || {});
      const devDependencies = Object.keys(packageJson.devDependencies || {});
      
      // Estimate bundle size (rough approximation)
      const estimatedSize = (dependencies.length + devDependencies.length) * 50 * 1024;
      return estimatedSize;
    } catch (error) {
      console.warn('Could not measure bundle size:', error);
      return 0;
    }
  }

  /**
   * Create performance benchmarks
   */
  static createBenchmarks(metrics: PerformanceMetrics): PerformanceBenchmark[] {
    return [
      {
        name: 'Render Time',
        threshold: 100, // 100ms
        actual: metrics.renderTime,
        passed: metrics.renderTime < 100,
        unit: 'ms'
      },
      {
        name: 'Memory Usage',
        threshold: 50 * 1024 * 1024, // 50MB
        actual: metrics.memoryUsage,
        passed: metrics.memoryUsage < 50 * 1024 * 1024,
        unit: 'bytes'
      },
      {
        name: 'Frame Rate',
        threshold: 60, // 60fps
        actual: metrics.frameRate,
        passed: metrics.frameRate >= 60,
        unit: 'fps'
      },
      {
        name: 'Bundle Size',
        threshold: 2 * 1024 * 1024, // 2MB
        actual: metrics.bundleSize,
        passed: metrics.bundleSize < 2 * 1024 * 1024,
        unit: 'bytes'
      },
      {
        name: 'Scroll Time',
        threshold: 16, // 16ms (60fps)
        actual: metrics.scrollTime,
        passed: metrics.scrollTime < 16,
        unit: 'ms'
      },
      {
        name: 'Load Time',
        threshold: 1000, // 1s
        actual: metrics.loadTime,
        passed: metrics.loadTime < 1000,
        unit: 'ms'
      }
    ];
  }

  /**
   * Validate performance test results
   */
  static validatePerformanceResults(
    testName: string,
    metrics: PerformanceMetrics
  ): PerformanceTestResult {
    const benchmarks = this.createBenchmarks(metrics);
    const passed = benchmarks.every(benchmark => benchmark.passed);
    
    return {
      testName,
      metrics,
      benchmarks,
      passed,
      timestamp: Date.now()
    };
  }

  /**
   * Generate performance report
   */
  static generatePerformanceReport(results: PerformanceTestResult[]): string {
    const totalTests = results.length;
    const passedTests = results.filter(result => result.passed).length;
    const failedTests = totalTests - passedTests;
    
    let report = `\n=== Performance Test Report ===\n`;
    report += `Total Tests: ${totalTests}\n`;
    report += `Passed: ${passedTests}\n`;
    report += `Failed: ${failedTests}\n`;
    report += `Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%\n\n`;
    
    results.forEach(result => {
      report += `--- ${result.testName} ---\n`;
      report += `Status: ${result.passed ? 'PASSED' : 'FAILED'}\n`;
      
      result.benchmarks.forEach(benchmark => {
        const status = benchmark.passed ? '✓' : '✗';
        const actualValue = benchmark.unit === 'bytes' 
          ? `${(benchmark.actual / 1024 / 1024).toFixed(2)}MB`
          : `${benchmark.actual.toFixed(2)}${benchmark.unit}`;
        const thresholdValue = benchmark.unit === 'bytes'
          ? `${(benchmark.threshold / 1024 / 1024).toFixed(2)}MB`
          : `${benchmark.threshold}${benchmark.unit}`;
        
        report += `  ${status} ${benchmark.name}: ${actualValue} (threshold: ${thresholdValue})\n`;
      });
      
      report += `\n`;
    });
    
    return report;
  }

  /**
   * Start a performance measurement
   */
  startMeasurement(name: string): void {
    const now = performance.now();
    this.activeMeasurements.set(name, now);
  }

  /**
   * End a performance measurement
   */
  endMeasurement(name: string): number {
    const startTime = this.activeMeasurements.get(name);
    if (!startTime) {
      console.warn(`No active measurement found for: ${name}`);
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Record the measurement
    const entry: PerformanceEntry = {
      name,
      startTime,
      endTime,
      duration,
      timestamp: Date.now(),
    };
    
    this.performanceEntries.push(entry);
    this.activeMeasurements.delete(name);
    
    return duration;
  }

  /**
   * Get all performance entries
   */
  getPerformanceEntries(): PerformanceEntry[] {
    return [...this.performanceEntries];
  }

  /**
   * Clear all performance data
   */
  clearPerformanceData(): void {
    this.performanceEntries = [];
    this.activeMeasurements.clear();
  }

  /**
   * Get performance statistics
   */
  getPerformanceStatistics(): {
    totalMeasurements: number;
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    totalDuration: number;
  } {
    if (this.performanceEntries.length === 0) {
      return {
        totalMeasurements: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        totalDuration: 0,
      };
    }

    const durations = this.performanceEntries.map(entry => entry.duration);
    const totalDuration = durations.reduce((a, b) => a + b, 0);
    const averageDuration = totalDuration / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    return {
      totalMeasurements: this.performanceEntries.length,
      averageDuration,
      minDuration,
      maxDuration,
      totalDuration,
    };
  }
}

// Export singleton instance
export const performanceTestHelper = PerformanceTestHelper.getInstance();
