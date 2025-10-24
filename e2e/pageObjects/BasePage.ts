/**
 * Base Page Object
 * 
 * Common actions and utilities for all page objects
 */

import { device, element, by, expect as detoxExpect, waitFor } from 'detox';

export class BasePage {
  async tapButton(testId: string) {
    await element(by.id(testId)).tap();
  }

  async typeText(testId: string, text: string) {
    await element(by.id(testId)).typeText(text);
  }

  async clearText(testId: string) {
    await element(by.id(testId)).clearText();
  }

  async expectVisible(testId: string) {
    await detoxExpect(element(by.id(testId))).toBeVisible();
  }

  async expectNotVisible(testId: string) {
    await detoxExpect(element(by.id(testId))).not.toBeVisible();
  }

  async expectText(testId: string, text: string) {
    await detoxExpect(element(by.id(testId))).toHaveText(text);
  }

  async scrollTo(testId: string, scrollViewTestId: string) {
    await element(by.id(scrollViewTestId)).scrollTo('bottom');
    await detoxExpect(element(by.id(testId))).toBeVisible();
  }

  async waitForElement(testId: string, timeout: number = 5000) {
    await waitFor(element(by.id(testId)))
      .toBeVisible()
      .withTimeout(timeout);
  }

  async waitForElementToDisappear(testId: string, timeout: number = 5000) {
    await waitFor(element(by.id(testId)))
      .not.toBeVisible()
      .withTimeout(timeout);
  }

  async swipeLeft(testId: string) {
    await element(by.id(testId)).swipe('left');
  }

  async swipeRight(testId: string) {
    await element(by.id(testId)).swipe('right');
  }

  async swipeUp(testId: string) {
    await element(by.id(testId)).swipe('up');
  }

  async swipeDown(testId: string) {
    await element(by.id(testId)).swipe('down');
  }
}
