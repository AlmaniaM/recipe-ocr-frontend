export class TestHelpers {
  async mockApiFailure(): Promise<void> {
    // Mock API failure for testing error scenarios
    // This would typically involve setting up a mock server or intercepting network calls
    // For Detox, we can use device.setURLBlacklist to simulate API failures
    await device.setURLBlacklist(['api.example.com']);
  }

  async mockApiSuccess(): Promise<void> {
    // Mock API success for testing success scenarios
    // This would typically involve setting up a mock server or intercepting network calls
    await device.clearURLBlacklist();
  }

  async simulateOfflineMode(): Promise<void> {
    // Simulate offline mode for testing offline functionality
    // This would typically involve disabling network connectivity
    await device.setURLBlacklist(['.*']);
  }

  async restoreOnlineMode(): Promise<void> {
    // Restore online mode after testing offline functionality
    // This would typically involve re-enabling network connectivity
    await device.clearURLBlacklist();
  }

  async navigateToScreen(screenId: string): Promise<void> {
    await element(by.id(screenId)).tap();
    await waitFor(element(by.id(`${screenId}-screen`)))
      .toBeVisible()
      .withTimeout(5000);
  }

  async captureImage(): Promise<void> {
    await element(by.id('capture-button')).tap();
    await waitFor(element(by.id('image-preview')))
      .toBeVisible()
      .withTimeout(10000);
  }

  async syncImage(): Promise<void> {
    await element(by.id('sync-image-button')).tap();
  }

  async verifySyncSuccess(): Promise<void> {
    await waitFor(element(by.id('sync-success-indicator')))
      .toBeVisible()
      .withTimeout(15000);
    await expect(element(by.id('sync-status'))).toHaveText('Synced');
  }

  async verifySyncError(): Promise<void> {
    await waitFor(element(by.id('sync-error-indicator')))
      .toBeVisible()
      .withTimeout(10000);
    await expect(element(by.id('error-message'))).toHaveText('Sync failed. Please try again.');
  }

  async verifyOfflineIndicator(): Promise<void> {
    await expect(element(by.id('offline-indicator'))).toBeVisible();
    await expect(element(by.id('queued-for-sync'))).toBeVisible();
  }

  async retrySync(): Promise<void> {
    await element(by.id('retry-sync-button')).tap();
  }

  async openSyncStatus(): Promise<void> {
    await element(by.id('sync-status-button')).tap();
    await waitFor(element(by.id('sync-status-screen')))
      .toBeVisible()
      .withTimeout(5000);
  }

  async verifySyncStatusElements(): Promise<void> {
    await expect(element(by.id('total-images'))).toBeVisible();
    await expect(element(by.id('synced-images'))).toBeVisible();
    await expect(element(by.id('pending-images'))).toBeVisible();
    await expect(element(by.id('failed-images'))).toBeVisible();
  }

  async cleanup(): Promise<void> {
    // Clear any test data or state
    await device.clearURLBlacklist();
  }
}
