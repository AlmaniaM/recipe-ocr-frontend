import { device, element, by, waitFor, expect } from 'detox';
import { TestHelpers } from './utils/TestHelpers';

describe('Offline Mode E2E Tests', () => {
  let testHelpers: TestHelpers;

  beforeAll(async () => {
    testHelpers = new TestHelpers();
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should handle offline mode correctly', async () => {
    // Simulate offline mode
    await device.setURLBlacklist(['.*']);
    
    // Navigate to image capture screen
    await element(by.id('capture-image-button')).tap();
    
    // Wait for image capture
    await waitFor(element(by.id('image-preview')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Tap sync button
    await element(by.id('sync-image-button')).tap();
    
    // Verify offline indicator
    await expect(element(by.id('offline-indicator'))).toBeVisible();
    
    // Verify image is queued for sync
    await expect(element(by.id('queued-for-sync'))).toBeVisible();
    
    // Restore network
    await device.clearURLBlacklist();
    
    // Wait for background sync
    await waitFor(element(by.id('sync-success-indicator')))
      .toBeVisible()
      .withTimeout(30000);
  });

  it('should retry failed syncs when back online', async () => {
    // Mock API failure initially
    await testHelpers.mockApiFailure();
    
    // Navigate to image capture screen
    await element(by.id('capture-image-button')).tap();
    
    // Wait for image capture
    await waitFor(element(by.id('image-preview')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Tap sync button
    await element(by.id('sync-image-button')).tap();
    
    // Wait for error
    await waitFor(element(by.id('sync-error-indicator')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Mock API success
    await testHelpers.mockApiSuccess();
    
    // Tap retry button
    await element(by.id('retry-sync-button')).tap();
    
    // Wait for success
    await waitFor(element(by.id('sync-success-indicator')))
      .toBeVisible()
      .withTimeout(15000);
  });
});
