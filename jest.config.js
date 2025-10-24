module.exports = {
  preset: '@testing-library/react-native',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/src/__tests__/setup.ts'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
    '!**/__tests__/e2e/**',           // Exclude old e2e tests
    '!**/__tests__/integration/**',   // Exclude old integration tests
    '!**/__tests__/utils/**',         // Exclude utility files
    '!**/__tests__/data/**'           // Exclude data files
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/**/index.{ts,tsx}',
    '!src/**/*.e2e.{ts,tsx}'         // Exclude E2E tests from coverage
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  testEnvironment: 'jsdom',
  // Performance testing configuration
  testTimeout: 30000, // 30 seconds for performance tests
  maxWorkers: 1, // Run performance tests sequentially to avoid interference
  // Performance test specific configuration
  globals: {
    '__DEV__': true,
    'performance': {
      now: () => Date.now(),
      memory: {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0
      }
    }
  },
  // Setup performance testing environment
  setupFiles: [
    '<rootDir>/src/__tests__/globals.ts',
    '<rootDir>/src/__tests__/setup.ts'
  ]
};
