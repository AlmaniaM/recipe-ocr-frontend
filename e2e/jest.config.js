/**
 * Jest Configuration for E2E Tests
 * 
 * Configuration for running E2E tests with Jest
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/e2e/specs/**/*.e2e.ts'],
  setupFilesAfterEnv: ['<rootDir>/e2e/setup.ts'],
  collectCoverageFrom: [
    'e2e/**/*.ts',
    '!e2e/**/*.d.ts',
    '!e2e/setup.ts',
    '!e2e/jest.config.js'
  ],
  coverageDirectory: 'coverage/e2e',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  testTimeout: 60000,
  maxWorkers: 1,
  globalSetup: '<rootDir>/e2e/global-setup.ts',
  globalTeardown: '<rootDir>/e2e/global-teardown.ts'
};