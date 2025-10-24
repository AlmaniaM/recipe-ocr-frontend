# E2E Testing Guide

This directory contains end-to-end (E2E) tests for the Recipe OCR app using Detox.

## 📁 Directory Structure

```
e2e/
├── pageObjects/          # Page Object Model classes
│   ├── BasePage.ts       # Base page with common actions
│   ├── CameraPage.ts     # Camera screen interactions
│   ├── RecipesListPage.ts # Recipes list screen
│   ├── RecipeReviewPage.ts # Recipe review screen
│   ├── RecipeBooksPage.ts # Recipe books screen
│   ├── SettingsPage.ts   # Settings screen
│   └── index.ts          # Page object exports
├── specs/                # E2E test specifications
│   ├── appNavigation.e2e.ts    # Navigation flow tests
│   ├── recipeCapture.e2e.ts    # Recipe capture tests
│   ├── recipeParsing.e2e.ts    # Recipe parsing tests
│   └── userJourney.e2e.ts      # Complete user journey tests
├── helpers/              # Test helper utilities
│   ├── TestHelpers.ts    # Common test utilities
│   ├── PageObjectTests.ts # Page object validation tests
│   └── index.ts          # Helper exports
├── setup.ts              # Global test setup
├── jest.config.js        # Jest configuration
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm
- Expo CLI
- Android Studio (for Android testing)
- Xcode (for iOS testing)

### Installation

1. **Install project dependencies**
```bash
npm install
```

2. **Install Detox CLI globally**
```bash
npm install -g detox-cli
```

3. **Build the app for testing**
```bash
npm run e2e:build:android
```

### Running Tests

#### Run All E2E Tests
```bash
npm run e2e:android
```

#### Run Specific Test Files
```bash
# Run navigation tests
npm run e2e:android -- --testNamePattern="App Navigation"

# Run recipe capture tests
npm run e2e:android -- --testNamePattern="Recipe Capture"

# Run specific test
npm run e2e:android -- --testNamePattern="should capture recipe from camera"
```

#### Run Tests in Debug Mode
```bash
npm run e2e:android -- --debug
```

## 📝 Writing Tests

### Page Object Model

We use the Page Object Model pattern to organize our E2E tests:

```typescript
// Example page object
export class RecipesListPage extends BasePage {
  async searchRecipes(query: string) {
    await this.typeText('search-input', query);
    await this.waitForElement('search-results');
  }

  async expectRecipeVisible(recipeTitle: string) {
    await detoxExpect(element(by.text(recipeTitle))).toBeVisible();
  }
}
```

### Test Structure

```typescript
describe('Feature Name', () => {
  let pageObject: PageObject;

  beforeEach(async () => {
    pageObject = new PageObject();
    await device.launchApp({ newInstance: true });
  });

  it('should do something', async () => {
    // Test implementation
  });
});
```

### Common Patterns

#### Waiting for Elements
```typescript
// Wait for element to be visible
await pageObject.waitForElement('element-id', 5000);

// Wait for element to disappear
await pageObject.waitForElementToDisappear('element-id', 5000);
```

#### Interacting with Elements
```typescript
// Tap button
await pageObject.tapButton('button-id');

// Type text
await pageObject.typeText('input-id', 'text');

// Clear text
await pageObject.clearText('input-id');
```

#### Assertions
```typescript
// Check visibility
await pageObject.expectVisible('element-id');
await pageObject.expectNotVisible('element-id');

// Check text
await pageObject.expectText('element-id', 'expected text');
```

## 🔧 Configuration

### Detox Configuration

The Detox configuration is in `.detoxrc.js`:

```javascript
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/jest.config.js',
  configurations: {
    'android.debug': {
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_3a_API_30_x86'
      }
    }
  }
};
```

### Jest Configuration

Jest configuration is in `e2e/jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/e2e/specs/**/*.e2e.ts'],
  setupFilesAfterEnv: ['<rootDir>/e2e/setup.ts'],
  testTimeout: 60000
};
```

## 🐛 Troubleshooting

### Common Issues

1. **App not building**
   - Check Android Studio setup
   - Verify Gradle configuration
   - Clean build: `cd android && ./gradlew clean`
   - Rebuild: `npm run e2e:build:android`

2. **Tests timing out**
   - Increase timeout in test
   - Check element selectors
   - Verify app state

3. **Element not found**
   - Check testID attributes
   - Verify element visibility
   - Use proper selectors

4. **Detox not connecting**
   - Check device/emulator status
   - Restart ADB: `adb kill-server && adb start-server`
   - Check Detox configuration

### Debug Mode

Run tests in debug mode to see detailed logs:

```bash
npm run e2e:android -- --debug
```

### Screenshots

Take screenshots for debugging:

```typescript
import { TestHelpers } from '../helpers/TestHelpers';

// Take screenshot
await TestHelpers.takeScreenshot('test-step-1');
```

## 📊 Test Reports

Test results are generated in:
- Console output
- Coverage reports in `coverage/e2e/`
- Screenshots in `screenshots/`

## 🔄 CI/CD Integration

E2E tests are integrated with GitHub Actions:

```yaml
- name: Run E2E Tests
  run: |
    npm install
    npm run e2e:build:android
    npm run e2e:android
```

## 📚 Best Practices

1. **Use Page Objects**: Organize test code with page objects
2. **Wait for Elements**: Always wait for elements before interacting
3. **Clean State**: Reset app state between tests
4. **Meaningful Names**: Use descriptive test and element names
5. **Error Handling**: Handle errors gracefully in tests
6. **Screenshots**: Take screenshots for debugging
7. **Parallel Tests**: Run tests in parallel when possible
8. **Data Cleanup**: Clean up test data after tests

## 🆘 Support

For issues with E2E tests:
1. Check the troubleshooting guide
2. Review test logs
3. Check Detox documentation
4. Create an issue in the repository
