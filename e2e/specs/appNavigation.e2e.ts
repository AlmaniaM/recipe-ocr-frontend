/**
 * App Navigation Flow E2E Tests
 * 
 * Tests the complete app navigation and user journey
 */

import { device } from 'detox';
import { RecipesListPage } from '../pageObjects/RecipesListPage';
import { SettingsPage } from '../pageObjects/SettingsPage';
import { RecipeBooksPage } from '../pageObjects/RecipeBooksPage';

describe('App Navigation Flow', () => {
  let recipesListPage: RecipesListPage;
  let settingsPage: SettingsPage;
  let recipeBooksPage: RecipeBooksPage;

  beforeEach(async () => {
    recipesListPage = new RecipesListPage();
    settingsPage = new SettingsPage();
    recipeBooksPage = new RecipeBooksPage();
    
    // Launch app fresh for each test
    await device.launchApp({ newInstance: true });
  });

  it('should navigate through all main tabs', async () => {
    // Start on recipes tab (default)
    await recipesListPage.expectVisible('recipes-list-screen');
    
    // Navigate to books tab
    await recipesListPage.navigateToBooks();
    await recipeBooksPage.expectVisible('recipe-books-screen');
    
    // Navigate to settings tab
    await recipeBooksPage.navigateToSettings();
    await settingsPage.expectVisible('settings-screen');
    
    // Navigate back to recipes tab
    await settingsPage.navigateToRecipes();
    await recipesListPage.expectVisible('recipes-list-screen');
  });

  it('should maintain state across tab switches', async () => {
    // Start on recipes tab
    await recipesListPage.expectVisible('recipes-list-screen');
    
    // Search for recipes
    await recipesListPage.searchRecipes('chocolate');
    
    // Switch to settings tab
    await recipesListPage.navigateToSettings();
    await settingsPage.expectVisible('settings-screen');
    
    // Switch back to recipes tab
    await settingsPage.navigateToRecipes();
    await recipesListPage.expectVisible('recipes-list-screen');
    
    // Search should still be active
    await recipesListPage.expectSearchQuery('chocolate');
  });

  it('should handle deep linking', async () => {
    // Test deep link to specific recipe
    await device.openURL({ url: 'recipeapp://recipe/123' });
    await recipesListPage.expectVisible('recipe-detail-screen');
    
    // Test deep link to settings
    await device.openURL({ url: 'recipeapp://settings' });
    await settingsPage.expectVisible('settings-screen');
  });

  it('should handle app backgrounding and foregrounding', async () => {
    // Start on recipes tab
    await recipesListPage.expectVisible('recipes-list-screen');
    
    // Background the app
    await device.sendToHome();
    
    // Foreground the app
    await device.launchApp({ newInstance: false });
    
    // Should still be on recipes tab
    await recipesListPage.expectVisible('recipes-list-screen');
  });

  it('should handle app termination and restart', async () => {
    // Start on recipes tab
    await recipesListPage.expectVisible('recipes-list-screen');
    
    // Terminate app
    await device.terminateApp();
    
    // Restart app
    await device.launchApp({ newInstance: true });
    
    // Should start fresh on recipes tab
    await recipesListPage.expectVisible('recipes-list-screen');
  });

  it('should handle rapid tab switching', async () => {
    // Rapidly switch between tabs
    for (let i = 0; i < 5; i++) {
      await recipesListPage.navigateToBooks();
      await recipeBooksPage.expectVisible('recipe-books-screen');
      
      await recipeBooksPage.navigateToSettings();
      await settingsPage.expectVisible('settings-screen');
      
      await settingsPage.navigateToRecipes();
      await recipesListPage.expectVisible('recipes-list-screen');
    }
  });

  it('should handle navigation with back button', async () => {
    // Navigate to a detail screen
    await recipesListPage.selectRecipe(0);
    await recipesListPage.expectVisible('recipe-detail-screen');
    
    // Use back button
    await recipesListPage.goBack();
    await recipesListPage.expectVisible('recipes-list-screen');
  });

  it('should handle navigation stack properly', async () => {
    // Navigate through multiple screens
    await recipesListPage.selectRecipe(0);
    await recipesListPage.expectVisible('recipe-detail-screen');
    
    await recipesListPage.editRecipe();
    await recipesListPage.expectVisible('recipe-edit-screen');
    
    // Go back should return to detail screen
    await recipesListPage.goBack();
    await recipesListPage.expectVisible('recipe-detail-screen');
    
    // Go back again should return to list
    await recipesListPage.goBack();
    await recipesListPage.expectVisible('recipes-list-screen');
  });
});
