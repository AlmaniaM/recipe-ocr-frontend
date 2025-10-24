# E2E Testing Troubleshooting Guide

This guide helps resolve common issues with E2E testing in the Recipe OCR app.

## 🚨 Common Issues

### 1. App Not Building

**Symptoms:**
- Build fails with Gradle errors
- APK not generated
- Detox can't find app binary

**Solutions:**
```bash
# Clean build
cd android && ./gradlew clean

# Rebuild
npm run e2e:build:android

# Check Android Studio setup
# Verify SDK versions match
# Check Gradle configuration
```

### 2. Detox Not Connecting

**Symptoms:**
- "Detox worker instance not installed" error
- Tests fail to start
- Device not found

**Solutions:**
```bash
# Check device status
adb devices

# Restart ADB
adb kill-server && adb start-server

# Check Detox configuration
cat .detoxrc.js

# Verify device/emulator is running
```

### 3. Tests Timing Out

**Symptoms:**
- Tests fail with timeout errors
- Elements not found
- App not responding

**Solutions:**
```typescript
// Increase timeout
await pageObject.waitForElement('element-id', 10000);

// Check element selectors
// Verify app state
// Add proper waits
```

### 4. Element Not Found

**Symptoms:**
- "Element not found" errors
- Tests fail on element interaction
- Selectors not working

**Solutions:**
```typescript
// Check testID attributes
<Button testID="my-button" />

// Use proper selectors
element(by.id('my-button'))
element(by.text('Button Text'))
element(by.type('RCTButton'))

// Verify element visibility
await pageObject.expectVisible('element-id');
```

### 5. App Crashes During Tests

**Symptoms:**
- App crashes unexpectedly
- Tests fail with crash errors
- Memory issues

**Solutions:**
```bash
# Check app logs
adb logcat | grep -i "recipe"

# Check memory usage
adb shell dumpsys meminfo

# Restart device/emulator
# Check for memory leaks
```

### 6. Network Issues

**Symptoms:**
- API calls failing
- Network timeouts
- Offline errors

**Solutions:**
```typescript
// Set network conditions
await TestHelpers.setNetworkCondition('online');

// Check network configuration
// Verify API endpoints
// Test with different network conditions
```

### 7. Permission Issues

**Symptoms:**
- Camera permission denied
- Storage access denied
- Permission dialogs not handled

**Solutions:**
```typescript
// Set permissions
await TestHelpers.setPermissions({ camera: 'YES' });

// Handle permission dialogs
await cameraPage.grantCameraPermission();

// Check permission handling in app
```

## 🔧 Debugging Techniques

### 1. Enable Debug Mode

```bash
# Run with debug output
npm run e2e:android -- --debug

# Enable verbose logging
DEBUG=detox* npm run e2e:android
```

### 2. Take Screenshots

```typescript
import { TestHelpers } from '../helpers/TestHelpers';

// Take screenshot at specific point
await TestHelpers.takeScreenshot('before-action');

// Take screenshot on failure
try {
  await pageObject.tapButton('button');
} catch (error) {
  await TestHelpers.takeScreenshot('button-tap-failed');
  throw error;
}
```

### 3. Check Element State

```typescript
// Check if element exists
const exists = await TestHelpers.elementExists('element-id');

// Check element visibility
const visible = await TestHelpers.isElementVisible('element-id');

// Get element text
const text = await TestHelpers.getElementText('element-id');
```

### 4. Inspect App State

```typescript
// Get device info
const deviceInfo = await TestHelpers.getDeviceInfo();

// Check app state
await device.getCurrentActivity();

// Get app logs
await device.getLogs();
```

## 🛠️ Environment Setup

### 1. Android Setup

```bash
# Install Android Studio
# Set up SDK
# Create AVD
# Enable USB debugging

# Check setup
adb devices
android list avd
```

### 2. iOS Setup

```bash
# Install Xcode
# Set up simulators
# Check certificates

# Check setup
xcrun simctl list devices
```

### 3. Detox Setup

```bash
# Install Detox
npm install -g detox-cli

# Initialize Detox
detox init

# Check configuration
detox test --configuration android.debug --dry-run
```

## 📱 Device Configuration

### 1. Android Emulator

```bash
# Create AVD
android create avd -n "Pixel_3a_API_30_x86" -k "system-images;android-30;google_apis;x86"

# Start emulator
emulator -avd Pixel_3a_API_30_x86

# Check status
adb devices
```

### 2. iOS Simulator

```bash
# List simulators
xcrun simctl list devices

# Boot simulator
xcrun simctl boot "iPhone 12"

# Check status
xcrun simctl list devices | grep Booted
```

## 🔍 Log Analysis

### 1. Android Logs

```bash
# View all logs
adb logcat

# Filter by app
adb logcat | grep -i "recipe"

# Filter by level
adb logcat *:E

# Save logs
adb logcat > logs.txt
```

### 2. iOS Logs

```bash
# View simulator logs
xcrun simctl spawn booted log stream

# Filter by app
xcrun simctl spawn booted log stream --predicate 'process == "RecipeOCR"'
```

### 3. Detox Logs

```bash
# Enable debug logging
DEBUG=detox* npm run e2e:android

# Check test results
cat detox.log

# View screenshots
ls screenshots/
```

## 🚀 Performance Optimization

### 1. Test Performance

```typescript
// Use parallel tests when possible
describe.parallel('Feature', () => {
  // Tests run in parallel
});

// Optimize waits
await pageObject.waitForElement('element-id', 5000); // 5s timeout
```

### 2. App Performance

```bash
# Check memory usage
adb shell dumpsys meminfo com.recipeocr

# Check CPU usage
adb shell top | grep recipe

# Monitor network
adb shell netstat -tulpn
```

## 📋 Checklist

### Before Running Tests

- [ ] Device/emulator is running
- [ ] App is built and installed
- [ ] Detox configuration is correct
- [ ] Test environment is clean
- [ ] Dependencies are installed

### During Test Execution

- [ ] Monitor logs for errors
- [ ] Check element selectors
- [ ] Verify app state
- [ ] Take screenshots on failures
- [ ] Check network connectivity

### After Test Execution

- [ ] Review test results
- [ ] Check screenshots
- [ ] Analyze logs
- [ ] Clean up test data
- [ ] Report issues

## 🆘 Getting Help

1. **Check Documentation**
   - E2E Testing Guide
   - Detox Documentation
   - Jest Documentation

2. **Review Logs**
   - Test execution logs
   - App logs
   - Device logs

3. **Search Issues**
   - GitHub Issues
   - Stack Overflow
   - Detox Community

4. **Create Issue**
   - Include error messages
   - Attach logs
   - Provide reproduction steps
   - Include environment details

## 📚 Additional Resources

- [Detox Documentation](https://github.com/wix/Detox)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing](https://reactnative.dev/docs/testing-overview)
- [Android Testing](https://developer.android.com/training/testing)
- [iOS Testing](https://developer.apple.com/documentation/xctest)
