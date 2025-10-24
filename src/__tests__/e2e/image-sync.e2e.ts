import { device, element, by, waitFor, expect } from 'detox';
import { TestHelpers } from './utils/TestHelpers';

describe('Image Sync E2E Tests', () => {
  let testHelpers: TestHelpers;

  beforeAll(async () => {
    testHelpers = new TestHelpers();
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should sync image successfully', async () => {
    // Navigate to image capture screen
    await element(by.id('capture-image-button')).tap();
    
    // Wait for image capture
    await waitFor(element(by.id('image-preview')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Tap sync button
    await element(by.id('sync-image-button')).tap();
    
    // Wait for sync completion
    await waitFor(element(by.id('sync-success-indicator')))
      .toBeVisible()
      .withTimeout(15000);
    
    // Verify sync status
    await expect(element(by.id('sync-status'))).toHaveText('Synced');
  });

  it('should handle sync failure gracefully', async () => {
    // Mock API failure
    await testHelpers.mockApiFailure();
    
    // Navigate to image capture screen
    await element(by.id('capture-image-button')).tap();
    
    // Wait for image capture
    await waitFor(element(by.id('image-preview')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Tap sync button
    await element(by.id('sync-image-button')).tap();
    
    // Wait for error indicator
    await waitFor(element(by.id('sync-error-indicator')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Verify error message
    await expect(element(by.id('error-message'))).toHaveText('Sync failed. Please try again.');
  });

  it('should show sync status correctly', async () => {
    // Navigate to sync status screen
    await element(by.id('sync-status-button')).tap();
    
    // Wait for status screen
    await waitFor(element(by.id('sync-status-screen')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Verify status elements
    await expect(element(by.id('total-images'))).toBeVisible();
    await expect(element(by.id('synced-images'))).toBeVisible();
    await expect(element(by.id('pending-images'))).toBeVisible();
    await expect(element(by.id('failed-images'))).toBeVisible();
  });
});
