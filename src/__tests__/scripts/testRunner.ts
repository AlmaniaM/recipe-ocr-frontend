#!/usr/bin/env node

/**
 * Test Runner for Image Sync Tests
 * 
 * Provides a comprehensive test runner for all image sync related tests
 * with coverage reporting and performance monitoring
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { COVERAGE_THRESHOLDS, coverageUtils, coverageMonitoring } from './coverageConfig';
import { testUtils, TEST_CONSTANTS, performanceUtils } from './testConfig';

// Test configuration
const TEST_CONFIG = {
  // Test patterns
  patterns: [
    'src/__tests__/services/ImageSyncService.test.ts',
    'src/__tests__/storage/AsyncStorageRepository.test.ts',
    'src/__tests__/api/ImageApiClient.test.ts',
    'src/__tests__/domain/entities/ImageSyncRecord.test.ts',
    'src/__tests__/domain/entities/SyncStatus.test.ts',
    'src/__tests__/infrastructure/storage/StorageConfiguration.test.ts',
    'src/__tests__/integration/ImageSyncService.integration.test.ts'
  ],
  
  // Test types
  types: {
    unit: 'src/__tests__/**/*.test.ts',
    integration: 'src/__tests__/integration/**/*.test.ts',
    e2e: 'src/__tests__/e2e/**/*.test.ts'
  },
  
  // Coverage thresholds
  thresholds: COVERAGE_THRESHOLDS,
  
  // Performance thresholds
  performance: {
    maxExecutionTime: TEST_CONSTANTS.TIMEOUTS.LONG,
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    maxTestDuration: TEST_CONSTANTS.TIMEOUTS.VERY_LONG
  }
};

// Test runner class
class TestRunner {
  private results: any[] = [];
  private coverage: any = null;
  private performance: any = null;

  constructor() {
    this.setupTestEnvironment();
  }

  /**
   * Setup test environment
   */
  private setupTestEnvironment(): void {
    // Create coverage directory
    if (!existsSync('coverage')) {
      mkdirSync('coverage', { recursive: true });
    }

    // Create test results directory
    if (!existsSync('test-results')) {
      mkdirSync('test-results', { recursive: true });
    }

    console.log('Test environment setup complete');
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log('Starting comprehensive test run...\n');

    try {
      // Run unit tests
      await this.runUnitTests();
      
      // Run integration tests
      await this.runIntegrationTests();
      
      // Run E2E tests
      await this.runE2ETests();
      
      // Generate coverage report
      await this.generateCoverageReport();
      
      // Generate performance report
      await this.generatePerformanceReport();
      
      // Generate final report
      await this.generateFinalReport();
      
      console.log('\n✅ All tests completed successfully!');
      
    } catch (error) {
      console.error('\n❌ Test run failed:', error);
      process.exit(1);
    }
  }

  /**
   * Run unit tests
   */
  private async runUnitTests(): Promise<void> {
    console.log('Running unit tests...');
    
    const startTime = Date.now();
    
    try {
      const command = `npx jest ${TEST_CONFIG.types.unit} --coverage --verbose`;
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: TEST_CONFIG.performance.maxTestDuration
      });
      
      const duration = Date.now() - startTime;
      
      this.results.push({
        type: 'unit',
        status: 'passed',
        duration,
        output: output.toString()
      });
      
      console.log(`✅ Unit tests passed (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        type: 'unit',
        status: 'failed',
        duration,
        error: error.toString()
      });
      
      console.log(`❌ Unit tests failed (${duration}ms)`);
      throw error;
    }
  }

  /**
   * Run integration tests
   */
  private async runIntegrationTests(): Promise<void> {
    console.log('Running integration tests...');
    
    const startTime = Date.now();
    
    try {
      const command = `npx jest ${TEST_CONFIG.types.integration} --coverage --verbose`;
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: TEST_CONFIG.performance.maxTestDuration
      });
      
      const duration = Date.now() - startTime;
      
      this.results.push({
        type: 'integration',
        status: 'passed',
        duration,
        output: output.toString()
      });
      
      console.log(`✅ Integration tests passed (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        type: 'integration',
        status: 'failed',
        duration,
        error: error.toString()
      });
      
      console.log(`❌ Integration tests failed (${duration}ms)`);
      throw error;
    }
  }

  /**
   * Run E2E tests
   */
  private async runE2ETests(): Promise<void> {
    console.log('Running E2E tests...');
    
    const startTime = Date.now();
    
    try {
      const command = `npx jest ${TEST_CONFIG.types.e2e} --coverage --verbose`;
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: TEST_CONFIG.performance.maxTestDuration
      });
      
      const duration = Date.now() - startTime;
      
      this.results.push({
        type: 'e2e',
        status: 'passed',
        duration,
        output: output.toString()
      });
      
      console.log(`✅ E2E tests passed (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        type: 'e2e',
        status: 'failed',
        duration,
        error: error.toString()
      });
      
      console.log(`❌ E2E tests failed (${duration}ms)`);
      throw error;
    }
  }

  /**
   * Generate coverage report
   */
  private async generateCoverageReport(): Promise<void> {
    console.log('Generating coverage report...');
    
    try {
      const command = 'npx jest --coverage --coverageReporters=json --coverageReporters=html --coverageReporters=lcov';
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: TEST_CONFIG.performance.maxTestDuration
      });
      
      // Parse coverage data
      const coverageData = JSON.parse(output.toString());
      this.coverage = coverageData;
      
      // Check coverage thresholds
      const meetsThresholds = coverageUtils.checkCoverage(coverageData, TEST_CONFIG.thresholds);
      
      if (!meetsThresholds) {
        throw new Error('Coverage thresholds not met');
      }
      
      console.log('✅ Coverage report generated successfully');
      
    } catch (error) {
      console.log('❌ Coverage report generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate performance report
   */
  private async generatePerformanceReport(): Promise<void> {
    console.log('Generating performance report...');
    
    try {
      const totalDuration = this.results.reduce((sum, result) => sum + result.duration, 0);
      const averageDuration = totalDuration / this.results.length;
      
      this.performance = {
        totalDuration,
        averageDuration,
        results: this.results.map(result => ({
          type: result.type,
          duration: result.duration,
          status: result.status
        }))
      };
      
      // Check performance thresholds
      if (totalDuration > TEST_CONFIG.performance.maxTestDuration) {
        throw new Error('Test execution time exceeded threshold');
      }
      
      console.log('✅ Performance report generated successfully');
      
    } catch (error) {
      console.log('❌ Performance report generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate final report
   */
  private async generateFinalReport(): Promise<void> {
    console.log('Generating final report...');
    
    try {
      const report = {
        timestamp: new Date().toISOString(),
        summary: {
          totalTests: this.results.length,
          passedTests: this.results.filter(r => r.status === 'passed').length,
          failedTests: this.results.filter(r => r.status === 'failed').length,
          totalDuration: this.results.reduce((sum, r) => sum + r.duration, 0)
        },
        coverage: this.coverage,
        performance: this.performance,
        results: this.results
      };
      
      // Write report to file
      const reportPath = join('test-results', `test-report-${Date.now()}.json`);
      writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      console.log(`✅ Final report generated: ${reportPath}`);
      
    } catch (error) {
      console.log('❌ Final report generation failed:', error);
      throw error;
    }
  }

  /**
   * Run specific test type
   */
  async runTestType(type: 'unit' | 'integration' | 'e2e'): Promise<void> {
    console.log(`Running ${type} tests...`);
    
    const startTime = Date.now();
    
    try {
      const command = `npx jest ${TEST_CONFIG.types[type]} --coverage --verbose`;
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: TEST_CONFIG.performance.maxTestDuration
      });
      
      const duration = Date.now() - startTime;
      
      console.log(`✅ ${type} tests passed (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ ${type} tests failed (${duration}ms)`);
      throw error;
    }
  }

  /**
   * Run tests with specific pattern
   */
  async runTestsWithPattern(pattern: string): Promise<void> {
    console.log(`Running tests matching pattern: ${pattern}`);
    
    const startTime = Date.now();
    
    try {
      const command = `npx jest ${pattern} --coverage --verbose`;
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: TEST_CONFIG.performance.maxTestDuration
      });
      
      const duration = Date.now() - startTime;
      
      console.log(`✅ Tests matching pattern passed (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ Tests matching pattern failed (${duration}ms)`);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const runner = new TestRunner();
  
  if (args.length === 0) {
    // Run all tests
    await runner.runAllTests();
  } else if (args[0] === 'unit') {
    // Run unit tests only
    await runner.runTestType('unit');
  } else if (args[0] === 'integration') {
    // Run integration tests only
    await runner.runTestType('integration');
  } else if (args[0] === 'e2e') {
    // Run E2E tests only
    await runner.runTestType('e2e');
  } else if (args[0] === 'pattern') {
    // Run tests with specific pattern
    if (args[1]) {
      await runner.runTestsWithPattern(args[1]);
    } else {
      console.error('Pattern argument required');
      process.exit(1);
    }
  } else {
    console.error('Invalid argument. Use: unit, integration, e2e, or pattern <pattern>');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

export default TestRunner;
