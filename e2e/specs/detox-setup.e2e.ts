/**
 * Detox Setup E2E Tests
 * 
 * Basic tests to verify Detox setup is working
 */

import { device } from 'detox';

describe('Detox Setup', () => {
  it('should launch app successfully', async () => {
    await device.launchApp({ newInstance: true });
    expect(device).toBeDefined();
  });

  it('should have device available', async () => {
    expect(device).toBeDefined();
    expect(typeof device.launchApp).toBe('function');
  });

  it('should be able to terminate app', async () => {
    await device.launchApp({ newInstance: true });
    await device.terminateApp();
    expect(device).toBeDefined();
  });
});