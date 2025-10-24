/**
 * Test Coverage Configuration for Image Sync Tests
 * 
 * Provides coverage configuration and reporting for all image sync related tests
 */

import { CoverageThreshold } from '@jest/types';

// Coverage thresholds for image sync components
export const COVERAGE_THRESHOLDS: CoverageThreshold = {
  global: {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  },
  // Specific thresholds for image sync components
  'src/infrastructure/services/ImageSyncService.ts': {
    branches: 95,
    functions: 95,
    lines: 95,
    statements: 95
  },
  'src/infrastructure/storage/AsyncStorageRepository.ts': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  },
  'src/infrastructure/api/ImageApiClient.ts': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  },
  'src/domain/entities/ImageSyncRecord.ts': {
    branches: 95,
    functions: 95,
    lines: 95,
    statements: 95
  },
  'src/domain/entities/SyncStatus.ts': {
    branches: 95,
    functions: 95,
    lines: 95,
    statements: 95
  },
  'src/infrastructure/storage/StorageConfiguration.ts': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  }
};

// Test patterns to include in coverage
export const COVERAGE_PATTERNS = [
  'src/infrastructure/services/ImageSyncService.ts',
  'src/infrastructure/storage/AsyncStorageRepository.ts',
  'src/infrastructure/api/ImageApiClient.ts',
  'src/domain/entities/ImageSyncRecord.ts',
  'src/domain/entities/SyncStatus.ts',
  'src/infrastructure/storage/StorageConfiguration.ts',
  'src/application/ports/IImageSyncService.ts',
  'src/application/ports/IStorageRepository.ts',
  'src/application/ports/IImageApiClient.ts'
];

// Test patterns to exclude from coverage
export const COVERAGE_EXCLUDE_PATTERNS = [
  'src/__tests__/**/*',
  'src/**/*.test.ts',
  'src/**/*.spec.ts',
  'src/**/*.d.ts',
  'src/**/index.ts',
  'src/**/types.ts'
];

// Coverage reporters
export const COVERAGE_REPORTERS = [
  'text',
  'text-summary',
  'html',
  'lcov',
  'json'
];

// Coverage output directory
export const COVERAGE_OUTPUT_DIR = 'coverage';

// Coverage report configuration
export const COVERAGE_REPORT_CONFIG = {
  // HTML report configuration
  html: {
    outputDir: `${COVERAGE_OUTPUT_DIR}/html`,
    openReport: false
  },
  
  // LCOV report configuration
  lcov: {
    outputDir: `${COVERAGE_OUTPUT_DIR}/lcov`,
    includeAllFiles: true
  },
  
  // JSON report configuration
  json: {
    outputDir: `${COVERAGE_OUTPUT_DIR}/json`,
    includeAllFiles: true
  }
};

// Test coverage utilities
export const coverageUtils = {
  /**
   * Check if coverage meets thresholds
   */
  checkCoverage: (coverage: any, thresholds: CoverageThreshold): boolean => {
    const globalThresholds = thresholds.global;
    if (!globalThresholds) return true;

    const { branches, functions, lines, statements } = coverage;
    
    return (
      (branches >= (globalThresholds.branches || 0)) &&
      (functions >= (globalThresholds.functions || 0)) &&
      (lines >= (globalThresholds.lines || 0)) &&
      (statements >= (globalThresholds.statements || 0))
    );
  },

  /**
   * Generate coverage report
   */
  generateCoverageReport: (coverage: any): string => {
    const { branches, functions, lines, statements } = coverage;
    
    return `
Coverage Report:
- Branches: ${branches}%
- Functions: ${functions}%
- Lines: ${lines}%
- Statements: ${statements}%

Thresholds:
- Branches: ${COVERAGE_THRESHOLDS.global?.branches || 0}%
- Functions: ${COVERAGE_THRESHOLDS.global?.functions || 0}%
- Lines: ${COVERAGE_THRESHOLDS.global?.lines || 0}%
- Statements: ${COVERAGE_THRESHOLDS.global?.statements || 0}%

Status: ${coverageUtils.checkCoverage(coverage, COVERAGE_THRESHOLDS) ? 'PASS' : 'FAIL'}
    `.trim();
  },

  /**
   * Get coverage summary for specific file
   */
  getFileCoverage: (coverage: any, filePath: string): any => {
    return coverage[filePath] || null;
  },

  /**
   * Check if file coverage meets thresholds
   */
  checkFileCoverage: (fileCoverage: any, thresholds: CoverageThreshold): boolean => {
    if (!fileCoverage) return false;
    
    const { branches, functions, lines, statements } = fileCoverage;
    const globalThresholds = thresholds.global;
    
    return (
      (branches >= (globalThresholds?.branches || 0)) &&
      (functions >= (globalThresholds?.functions || 0)) &&
      (lines >= (globalThresholds?.lines || 0)) &&
      (statements >= (globalThresholds?.statements || 0))
    );
  }
};

// Test coverage configuration for Jest
export const jestCoverageConfig = {
  collectCoverage: true,
  collectCoverageFrom: COVERAGE_PATTERNS,
  coveragePathIgnorePatterns: COVERAGE_EXCLUDE_PATTERNS,
  coverageReporters: COVERAGE_REPORTERS,
  coverageDirectory: COVERAGE_OUTPUT_DIR,
  coverageThreshold: COVERAGE_THRESHOLDS,
  coverageProvider: 'v8',
  coverageDirectory: COVERAGE_OUTPUT_DIR,
  coverageReporters: COVERAGE_REPORTERS,
  coverageThreshold: COVERAGE_THRESHOLDS
};

// Test coverage monitoring
export const coverageMonitoring = {
  /**
   * Monitor coverage during test execution
   */
  monitorCoverage: (testName: string, coverage: any) => {
    const report = coverageUtils.generateCoverageReport(coverage);
    console.log(`\nCoverage Report for ${testName}:`);
    console.log(report);
    
    if (!coverageUtils.checkCoverage(coverage, COVERAGE_THRESHOLDS)) {
      throw new Error(`Coverage thresholds not met for ${testName}`);
    }
  },

  /**
   * Track coverage changes over time
   */
  trackCoverageChanges: (currentCoverage: any, previousCoverage: any) => {
    const changes = {
      branches: currentCoverage.branches - previousCoverage.branches,
      functions: currentCoverage.functions - previousCoverage.functions,
      lines: currentCoverage.lines - previousCoverage.lines,
      statements: currentCoverage.statements - previousCoverage.statements
    };

    return changes;
  }
};

// Export default configuration
export default {
  thresholds: COVERAGE_THRESHOLDS,
  patterns: COVERAGE_PATTERNS,
  excludePatterns: COVERAGE_EXCLUDE_PATTERNS,
  reporters: COVERAGE_REPORTERS,
  outputDir: COVERAGE_OUTPUT_DIR,
  reportConfig: COVERAGE_REPORT_CONFIG,
  utils: coverageUtils,
  monitoring: coverageMonitoring,
  jestConfig: jestCoverageConfig
};
