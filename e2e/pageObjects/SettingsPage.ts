/**
 * Settings Page Object
 * 
 * Actions and assertions for the settings screen
 */

import { element, by, expect as detoxExpect } from 'detox';
import { BasePage } from './BasePage';

export class SettingsPage extends BasePage {
  async navigateToRecipes() {
    await this.tapButton('recipes-tab');
  }

  async navigateToBooks() {
    await this.tapButton('books-tab');
  }

  async selectTheme(theme: string) {
    await this.tapButton(`theme-${theme.toLowerCase()}`);
  }

  async expectThemeSelected(theme: string) {
    await this.expectVisible(`theme-${theme.toLowerCase()}-selected`);
  }

  async expectThemeNotSelected(theme: string) {
    await this.expectNotVisible(`theme-${theme.toLowerCase()}-selected`);
  }

  async expectAvailableThemes() {
    await this.expectVisible('theme-warm-inviting');
    await this.expectVisible('theme-clean-modern');
    await this.expectVisible('theme-earthy-natural');
  }

  async openAbout() {
    await this.tapButton('about-button');
  }

  async openPrivacyPolicy() {
    await this.tapButton('privacy-policy-button');
  }

  async openTermsOfService() {
    await this.tapButton('terms-of-service-button');
  }

  async exportData() {
    await this.tapButton('export-data-button');
  }

  async importData() {
    await this.tapButton('import-data-button');
  }

  async clearCache() {
    await this.tapButton('clear-cache-button');
  }

  async resetApp() {
    await this.tapButton('reset-app-button');
  }

  async confirmReset() {
    await this.tapButton('confirm-reset-button');
  }

  async cancelReset() {
    await this.tapButton('cancel-reset-button');
  }

  async expectResetConfirmation() {
    await this.expectVisible('reset-confirmation-dialog');
    await this.expectText('reset-message', 'This will delete all your data. Are you sure?');
  }

  async expectExportSuccess() {
    await this.expectVisible('export-success-message');
    await this.expectText('export-message', 'Data exported successfully');
  }

  async expectImportSuccess() {
    await this.expectVisible('import-success-message');
    await this.expectText('import-message', 'Data imported successfully');
  }

  async expectCacheCleared() {
    await this.expectVisible('cache-cleared-message');
    await this.expectText('cache-message', 'Cache cleared successfully');
  }

  async expectAboutScreen() {
    await this.expectVisible('about-screen');
    await this.expectText('app-version', 'Version 1.0.0');
  }

  async expectPrivacyPolicyScreen() {
    await this.expectVisible('privacy-policy-screen');
  }

  async expectTermsOfServiceScreen() {
    await this.expectVisible('terms-of-service-screen');
  }
}
