/**
 * User Journey E2E Tests
 * 
 * Tests complete user workflows and journeys
 */

import { device } from 'detox';
import { RecipesListPage } from '../pageObjects/RecipesListPage';
import { SettingsPage } from '../pageObjects/SettingsPage';
import { RecipeBooksPage } from '../pageObjects/RecipeBooksPage';
import { CameraPage } from '../pageObjects/CameraPage';
import { RecipeReviewPage } from '../pageObjects/RecipeReviewPage';

describe('User Journey Flow', () => {
  let recipesListPage: RecipesListPage;
  let settingsPage: SettingsPage;
  let recipeBooksPage: RecipeBooksPage;
  let cameraPage: CameraPage;
  let reviewPage: RecipeReviewPage;

  beforeEach(async () => {
    recipesListPage = new RecipesListPage();
    settingsPage = new SettingsPage();
    recipeBooksPage = new RecipeBooksPage();
    cameraPage = new CameraPage();
    reviewPage = new RecipeReviewPage();
    
    // Launch app fresh for each test
    await device.launchApp({ newInstance: true });
  });

  describe('App Launch Flow', () => {
    it('should launch app and show default screen', async () => {
      // Should show recipes tab by default
      await recipesListPage.expectVisible('recipes-list-screen');
      await recipesListPage.expectVisible('add-recipe-button');
    });

    it('should load saved theme on app launch', async () => {
      // Should load theme from storage
      await recipesListPage.expectVisible('recipes-list-screen');
      
      // Navigate to settings to verify theme
      await recipesListPage.navigateToSettings();
      await settingsPage.expectVisible('settings-screen');
    });
  });

  describe('Navigation Flow', () => {
    it('should navigate between tabs', async () => {
      // Start on recipes tab
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
  });

  describe('Recipe Management Flow', () => {
    it('should search for recipes', async () => {
      // Navigate to recipes tab
      await recipesListPage.expectVisible('recipes-list-screen');
      
      // Search for recipes
      await recipesListPage.searchRecipes('chocolate');
      
      // Should show search results
      await recipesListPage.expectVisible('search-results');
    });

    it('should add new recipe', async () => {
      // Navigate to recipes tab
      await recipesListPage.expectVisible('recipes-list-screen');
      
      // Press add recipe button
      await recipesListPage.openAddRecipe();
      
      // Should navigate to camera
      await cameraPage.expectVisible('camera-screen');
    });

    it('should complete full recipe capture flow', async () => {
      // Start recipe capture
      await recipesListPage.openAddRecipe();
      await cameraPage.capturePhoto();
      await cameraPage.confirmImage();
      
      // Wait for processing
      await reviewPage.expectOCRProcessing();
      await reviewPage.expectParsedRecipe();
      
      // Edit and save recipe
      await reviewPage.editRecipeTitle('My Test Recipe');
      await reviewPage.saveRecipe();
      await reviewPage.expectSuccessMessage();
      
      // Verify recipe appears in list
      await recipesListPage.expectRecipeVisible('My Test Recipe');
    });
  });

  describe('Settings Flow', () => {
    it('should change theme', async () => {
      // Navigate to settings tab
      await recipesListPage.navigateToSettings();
      await settingsPage.expectVisible('settings-screen');
      
      // Change to clean modern theme
      await settingsPage.selectTheme('clean-modern');
      await settingsPage.expectThemeSelected('clean-modern');
    });

    it('should change to all available themes', async () => {
      // Navigate to settings tab
      await recipesListPage.navigateToSettings();
      await settingsPage.expectVisible('settings-screen');
      
      // Test all theme options
      const themes = ['warm-inviting', 'clean-modern', 'earthy-natural'];
      
      for (const theme of themes) {
        await settingsPage.selectTheme(theme);
        await settingsPage.expectThemeSelected(theme);
      }
    });

    it('should export and import data', async () => {
      // Navigate to settings tab
      await recipesListPage.navigateToSettings();
      await settingsPage.expectVisible('settings-screen');
      
      // Export data
      await settingsPage.exportData();
      await settingsPage.expectExportSuccess();
      
      // Import data
      await settingsPage.importData();
      await settingsPage.expectImportSuccess();
    });

    it('should clear cache', async () => {
      // Navigate to settings tab
      await recipesListPage.navigateToSettings();
      await settingsPage.expectVisible('settings-screen');
      
      // Clear cache
      await settingsPage.clearCache();
      await settingsPage.expectCacheCleared();
    });
  });

  describe('Recipe Books Flow', () => {
    it('should create new recipe book', async () => {
      // Navigate to books tab
      await recipesListPage.navigateToBooks();
      await recipeBooksPage.expectVisible('recipe-books-screen');
      
      // Create new book
      await recipeBooksPage.createNewBook();
      await recipeBooksPage.expectBookForm();
      
      // Fill book details
      await recipeBooksPage.enterBookName('My Cookbook');
      await recipeBooksPage.enterBookDescription('My favorite recipes');
      await recipeBooksPage.saveBook();
      
      // Verify book appears
      await recipeBooksPage.expectBookVisible('My Cookbook');
    });

    it('should add recipe to book', async () => {
      // Create a recipe first
      await recipesListPage.openAddRecipe();
      await cameraPage.capturePhoto();
      await cameraPage.confirmImage();
      await reviewPage.expectParsedRecipe();
      await reviewPage.editRecipeTitle('Test Recipe');
      await reviewPage.saveRecipe();
      
      // Create a book
      await recipesListPage.navigateToBooks();
      await recipeBooksPage.createNewBook();
      await recipeBooksPage.enterBookName('My Cookbook');
      await recipeBooksPage.saveBook();
      
      // Add recipe to book
      await recipeBooksPage.addRecipeToBook(0, 0);
      
      // Verify recipe is in book
      await recipeBooksPage.selectBook(0);
      await recipeBooksPage.expectRecipeVisible('Test Recipe');
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle storage errors gracefully', async () => {
      // Simulate storage error
      await device.setURLBlacklist(['.*storage.*']);
      
      // App should still function
      await recipesListPage.expectVisible('recipes-list-screen');
    });

    it('should handle network errors gracefully', async () => {
      // Simulate network error
      await device.setURLBlacklist(['.*api.*']);
      
      // Try to add recipe
      await recipesListPage.openAddRecipe();
      await cameraPage.capturePhoto();
      await cameraPage.confirmImage();
      
      // Should handle error gracefully
      await reviewPage.expectErrorState();
    });

    it('should handle camera permission denial', async () => {
      // Note: Camera permission handling would need to be implemented differently
      // This is a placeholder for the test structure
      
      // Try to add recipe
      await recipesListPage.openAddRecipe();
      
      // Should show permission denied message
      await cameraPage.expectPermissionDenied();
    });
  });

  describe('Performance Flow', () => {
    it('should handle rapid navigation without issues', async () => {
      // Rapidly switch between tabs
      for (let i = 0; i < 10; i++) {
        await recipesListPage.navigateToBooks();
        await recipeBooksPage.navigateToSettings();
        await settingsPage.navigateToRecipes();
      }
      
      // Should still be functional
      await recipesListPage.expectVisible('recipes-list-screen');
    });

    it('should handle rapid theme changes without issues', async () => {
      // Navigate to settings
      await recipesListPage.navigateToSettings();
      
      // Rapidly change themes
      const themes = ['warm-inviting', 'clean-modern', 'earthy-natural'];
      for (let i = 0; i < 5; i++) {
        for (const theme of themes) {
          await settingsPage.selectTheme(theme);
        }
      }
      
      // Should still be functional
      await settingsPage.expectVisible('settings-screen');
    });
  });
});
