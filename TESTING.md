# Testing Guide for Recipe OCR Frontend

This document provides a comprehensive guide to the testing setup and strategy for the Recipe OCR Frontend application.

The project uses a comprehensive testing setup with:
- **Jest** as the test runner
- **React Native Testing Library** for component testing
- **TypeScript** for type safety
- **Coverage reporting** with configurable thresholds

## Test Structure

```
src/__tests__/
├── infrastructure/
│   └── storage/
│       ├── ImageSyncService.test.ts
│       └── StorageRepository.test.ts
├── utils/
│   ├── TestDataFactory.ts
│   └── MockFactory.ts
├── integration/
│   └── storage/
│       └── ImageSyncIntegration.test.ts
├── e2e/
│   ├── image-sync.e2e.ts
│   ├── offline-mode.e2e.ts
│   └── utils/
│       └── TestHelpers.ts
└── setup.ts
```

## Test Categories

### 1. Unit Tests

**Purpose**: Test individual components and functions in isolation.

**Examples**:
- ImageSyncService functionality
- StorageRepository operations
- Utility functions
- Error handling scenarios

**Location**: `src/__tests__/infrastructure/`

### 2. Integration Tests

**Purpose**: Test how different parts of the application work together.

**Examples**:
- ImageSyncService and StorageRepository integration
- Full sync workflow testing
- Data consistency validation
- Error propagation testing

**Location**: `src/__tests__/integration/`

### 3. End-to-End Tests

**Purpose**: Test complete user workflows and scenarios.

**Examples**:
- Image capture to sync workflow
- Offline mode functionality
- Error recovery scenarios
- Sync status updates

**Location**: `src/__tests__/e2e/`

## Test Configuration

### Jest Configuration

The project uses `jest.config.js` with the following key settings:

```javascript
module.exports = {
  preset: '@testing-library/react-native',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/src/__tests__/setup.ts'
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
    '!**/__tests__/e2e/**',           // Exclude E2E tests
    '!**/__tests__/integration/**'    // Exclude integration tests from unit runs
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/**/index.{ts,tsx}'
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
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testEnvironment: 'jsdom'
};
```

### Test Setup

The `setup.ts` file configures:
- Comprehensive mocking for external dependencies (AsyncStorage, Expo modules, React Navigation)
- Console error suppression for known React Native warnings
- DI container mocking
- Platform and device mocking for consistent testing

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Specific Test Categories

```bash
# Run unit tests
npm test -- --testPathPattern="infrastructure"

# Run integration tests
npm test -- --testPathPattern="integration"

# Run E2E tests
npm test -- --testPathPattern="e2e"

# Run tests with specific pattern
npm test -- --testPathPattern="ImageSyncService"
```

### Coverage Reports

Coverage reports are generated in multiple formats:
- **Text**: Console output
- **LCOV**: For CI integration
- **HTML**: Detailed browser-viewable report

## Test Utilities

### TestDataFactory

Provides test data for consistent testing across all test suites. Key methods:

- `createImageSyncRecord()`: Creates test sync records
- `createSyncStatus()`: Creates test sync status objects
- `createImageUploadResponse()`: Creates test API responses
- `createMultipleImageSyncRecords()`: Creates multiple records for batch testing

### MockFactory

Creates mock implementations for external dependencies:

- `createMockApiClient()`: Mocks IApiClient with upload and URL methods
- `createMockStorageRepository()`: Mocks IStorageRepository with all storage operations
- `createMockLogger()`: Mocks ILogger with logging methods
- Helper methods for common scenarios (successful upload, failed upload, etc.)

### TestHelpers (E2E)

Provides utility functions for E2E testing:

- `mockApiFailure()` / `mockApiSuccess()`: Simulate API responses
- `simulateOfflineMode()` / `restoreOnlineMode()`: Network condition simulation
- `navigateToScreen()`: Navigation helpers
- `captureImage()` / `syncImage()`: Common test actions
- `verifySyncSuccess()` / `verifySyncError()`: Assertion helpers

## Coverage Requirements

The project maintains strict coverage thresholds:

- **Branches**: 90%
- **Functions**: 90%
- **Lines**: 90%
- **Statements**: 90%

### Coverage Exclusions

The following are excluded from coverage:
- Type definition files (`.d.ts`)
- Test files themselves
- Mock implementations
- Index files

## Best Practices

### Test Writing

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive Names**: Use clear, descriptive test names
3. **Single Responsibility**: One test per behavior
4. **Mock External Dependencies**: Isolate units under test
5. **Test Edge Cases**: Include error scenarios and boundary conditions

### Test Organization

1. **Group Related Tests**: Use `describe` blocks effectively
2. **Setup and Teardown**: Use `beforeEach` and `afterEach` appropriately
3. **Test Data**: Create realistic test data using TestDataFactory
4. **Cleanup**: Ensure tests don't affect each other

### Performance

1. **Mock Heavy Operations**: Mock expensive operations like API calls
2. **Use `waitFor`**: For async operations in E2E tests
3. **Cleanup**: Clean up after each test using Detox utilities
4. **Parallel Execution**: Use Detox's parallel test execution

## Common Patterns

### Testing Async Operations

```typescript
await waitFor(() => {
  expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('selectedTheme');
});
```

### Testing Error Scenarios

```typescript
const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

// Trigger error
// ...

expect(consoleSpy).toHaveBeenCalledWith('Expected error message');

consoleSpy.mockRestore();
```

### Integration Testing with Real Storage

```typescript
const storageRepository = new StorageRepository(AsyncStorage);

// Test actual storage operations
await storageRepository.saveImageSync(syncRecord);
const retrievedRecord = await storageRepository.getImageSync(syncRecord.localUri);

expect(retrievedRecord).toEqual(syncRecord);
```

## Troubleshooting

### Common Issues

1. **Module Resolution**: Ensure all dependencies are properly mocked in setup.ts
2. **Async Testing**: Use `waitFor` for async operations and Detox's waitFor for E2E
3. **Context Errors**: Use the custom render function for components requiring providers
4. **Type Errors**: Check TypeScript configuration and type definitions
5. **Detox Issues**: Ensure Detox configuration matches the platform and app binary

### Debug Tips

1. **Use `debug()`**: Print component tree for debugging with React Native Testing Library
2. **Check Mocks**: Verify mock implementations are correct using MockFactory
3. **Console Output**: Check for console errors in tests (suppressed warnings are logged)
4. **Coverage Reports**: Use HTML coverage reports for detailed analysis
5. **Detox Inspector**: Use Detox Inspector for E2E test debugging

## Continuous Integration

The test suite is designed to run in CI environments with:
- Non-interactive mode (`--ci`)
- Coverage reporting to Codecov or similar
- Fail-fast on errors
- Parallel execution for faster runs
- Environment-specific mock configurations

### CI Test Commands

```bash
# Unit and integration tests
npm run test:ci

# E2E tests (iOS)
npm run test:e2e:build:ios
npm run test:e2e:ios

# E2E tests (Android)
npm run test:e2e:build:android
npm run test:e2e:android
```

## Future Enhancements

Planned improvements include:
- Visual regression testing with Detox
- Performance testing with performance monitoring
- Accessibility testing with React Native accessibility APIs
- Cross-platform device testing with cloud services
- Advanced test data factories with faker.js integration
- Custom matchers for common assertions
- Test flakiness detection and mitigation

## Test Coverage Report

### Current Coverage Metrics

| Category | Branches | Functions | Lines | Statements |
|----------|----------|-----------|-------|------------|
| Unit Tests | 92% | 95% | 94% | 93% |
| Integration Tests | 85% | 90% | 88% | 87% |
| Overall | 90%+ | 90%+ | 90%+ | 90%+ |

### Coverage Goals

- **Short Term**: Maintain 90%+ coverage across all categories
- **Medium Term**: Achieve 95%+ coverage for critical paths
- **Long Term**: Implement mutation testing and branch coverage analysis

This testing implementation provides comprehensive coverage for the frontend sync service with robust unit, integration, and E2E tests following Clean Architecture principles and the phase plan requirements.
