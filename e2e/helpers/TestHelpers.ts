/**
 * Test Helpers
 * 
 * Utility functions for E2E tests
 */

import { device } from 'detox';

export class TestHelpers {
  /**
   * Take a screenshot for debugging
   */
  static async takeScreenshot(name: string): Promise<void> {
    await device.takeScreenshot(name);
  }

  /**
   * Generate test data
   */
  static generateTestRecipe() {
    return {
      title: `Test Recipe ${Date.now()}`,
      description: 'A test recipe for E2E testing',
      ingredients: ['2 cups flour', '1 cup sugar', '3 eggs'],
      instructions: ['Mix ingredients', 'Bake at 350°F', 'Cool and serve'],
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      category: 'dessert',
      tags: ['test', 'e2e']
    };
  }

  /**
   * Generate test recipe book
   */
  static generateTestBook() {
    return {
      name: `Test Book ${Date.now()}`,
      description: 'A test recipe book for E2E testing'
    };
  }

  /**
   * Wait for a specific condition
   */
  static async waitFor(condition: () => Promise<boolean>, timeout: number = 5000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Clear app data
   */
  static async clearAppData(): Promise<void> {
    await device.clearKeychain();
    await device.resetContentAndSettings();
  }

  /**
   * Set network conditions
   */
  static async setNetworkCondition(condition: 'online' | 'offline' | 'slow'): Promise<void> {
    switch (condition) {
      case 'offline':
        await device.setURLBlacklist(['.*']);
        break;
      case 'slow':
        await device.setURLBlacklist(['.*api.*']);
        break;
      case 'online':
        // Note: clearURLBlacklist doesn't exist, use setURLBlacklist with empty array
        await device.setURLBlacklist([]);
        break;
    }
  }

  /**
   * Set device permissions
   */
  static async setPermissions(permissions: { camera?: 'YES' | 'NO' | 'unset' }): Promise<void> {
    // Note: setPermissions doesn't exist in Detox, this would need to be handled differently
    console.log('Setting permissions:', permissions);
  }

  /**
   * Simulate device rotation
   */
  static async rotateDevice(orientation: 'portrait' | 'landscape'): Promise<void> {
    await device.setOrientation(orientation);
  }

  /**
   * Get device info
   */
  static async getDeviceInfo(): Promise<any> {
    return await device.getPlatform();
  }

  /**
   * Generate random string
   */
  static generateRandomString(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate random email
   */
  static generateRandomEmail(): string {
    return `test-${this.generateRandomString(8)}@example.com`;
  }

  /**
   * Generate random phone number
   */
  static generateRandomPhone(): string {
    return `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
  }

  /**
   * Wait for element to be visible
   */
  static async waitForElementVisible(testId: string, timeout: number = 5000): Promise<void> {
    await this.waitFor(async () => {
      try {
        const element = require('detox').element(require('detox').by.id(testId));
        await element.tap();
        return true;
      } catch {
        return false;
      }
    }, timeout);
  }

  /**
   * Wait for element to disappear
   */
  static async waitForElementToDisappear(testId: string, timeout: number = 5000): Promise<void> {
    await this.waitFor(async () => {
      try {
        const element = require('detox').element(require('detox').by.id(testId));
        await element.tap();
        return false;
      } catch {
        return true;
      }
    }, timeout);
  }

  /**
   * Get element text
   */
  static async getElementText(testId: string): Promise<string> {
    const element = require('detox').element(require('detox').by.id(testId));
    const attributes = await element.getAttributes();
    return attributes.text || '';
  }

  /**
   * Check if element exists
   */
  static async elementExists(testId: string): Promise<boolean> {
    try {
      const element = require('detox').element(require('detox').by.id(testId));
      await element.tap();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Scroll to element
   */
  static async scrollToElement(testId: string, scrollViewTestId: string): Promise<void> {
    const scrollView = require('detox').element(require('detox').by.id(scrollViewTestId));
    const element = require('detox').element(require('detox').by.id(testId));
    await scrollView.scrollToElement(element);
  }

  /**
   * Swipe in direction
   */
  static async swipe(testId: string, direction: 'up' | 'down' | 'left' | 'right'): Promise<void> {
    const element = require('detox').element(require('detox').by.id(testId));
    await element.swipe(direction);
  }

  /**
   * Long press element
   */
  static async longPress(testId: string, duration: number = 1000): Promise<void> {
    const element = require('detox').element(require('detox').by.id(testId));
    await element.longPress(duration);
  }

  /**
   * Multi-tap element
   */
  static async multiTap(testId: string, times: number = 2): Promise<void> {
    const element = require('detox').element(require('detox').by.id(testId));
    await element.multiTap(times);
  }

  /**
   * Pinch element
   */
  static async pinch(testId: string, scale: number, speed: number = 0.5): Promise<void> {
    const element = require('detox').element(require('detox').by.id(testId));
    await element.pinch(scale, speed);
  }

  /**
   * Get element bounds
   */
  static async getElementBounds(testId: string): Promise<any> {
    const element = require('detox').element(require('detox').by.id(testId));
    const attributes = await element.getAttributes();
    return attributes.bounds;
  }

  /**
   * Check if element is visible
   */
  static async isElementVisible(testId: string): Promise<boolean> {
    try {
      const element = require('detox').element(require('detox').by.id(testId));
      await element.tap();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if element is enabled
   */
  static async isElementEnabled(testId: string): Promise<boolean> {
    try {
      const element = require('detox').element(require('detox').by.id(testId));
      const attributes = await element.getAttributes();
      return attributes.enabled !== false;
    } catch {
      return false;
    }
  }

  /**
   * Get element accessibility label
   */
  static async getElementAccessibilityLabel(testId: string): Promise<string> {
    const element = require('detox').element(require('detox').by.id(testId));
    const attributes = await element.getAttributes();
    return attributes.accessibilityLabel || '';
  }

  /**
   * Get element accessibility hint
   */
  static async getElementAccessibilityHint(testId: string): Promise<string> {
    const element = require('detox').element(require('detox').by.id(testId));
    const attributes = await element.getAttributes();
    return attributes.accessibilityHint || '';
  }

  /**
   * Get element accessibility value
   */
  static async getElementAccessibilityValue(testId: string): Promise<string> {
    const element = require('detox').element(require('detox').by.id(testId));
    const attributes = await element.getAttributes();
    return attributes.accessibilityValue || '';
  }

  /**
   * Get element accessibility role
   */
  static async getElementAccessibilityRole(testId: string): Promise<string> {
    const element = require('detox').element(require('detox').by.id(testId));
    const attributes = await element.getAttributes();
    return attributes.accessibilityRole || '';
  }

  /**
   * Get element accessibility state
   */
  static async getElementAccessibilityState(testId: string): Promise<any> {
    const element = require('detox').element(require('detox').by.id(testId));
    const attributes = await element.getAttributes();
    return attributes.accessibilityState || {};
  }

  /**
   * Get element accessibility actions
   */
  static async getElementAccessibilityActions(testId: string): Promise<string[]> {
    const element = require('detox').element(require('detox').by.id(testId));
    const attributes = await element.getAttributes();
    return attributes.accessibilityActions || [];
  }

  /**
   * Get element accessibility elements
   */
  static async getElementAccessibilityElements(testId: string): Promise<string[]> {
    const element = require('detox').element(require('detox').by.id(testId));
    const attributes = await element.getAttributes();
    return attributes.accessibilityElements || [];
  }

  /**
   * Get element accessibility traits
   */
  static async getElementAccessibilityTraits(testId: string): Promise<string[]> {
    const element = require('detox').element(require('detox').by.id(testId));
    const attributes = await element.getAttributes();
    return attributes.accessibilityTraits || [];
  }

  /**
   * Get element accessibility identifier
   */
  static async getElementAccessibilityIdentifier(testId: string): Promise<string> {
    const element = require('detox').element(require('detox').by.id(testId));
    const attributes = await element.getAttributes();
    return attributes.accessibilityIdentifier || '';
  }
}
