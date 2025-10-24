/**
 * Page Object Tests
 * 
 * Tests to verify page object functionality
 */

import { device } from 'detox';
import { RecipesListPage } from '../pageObjects/RecipesListPage';
import { CameraPage } from '../pageObjects/CameraPage';
import { RecipeReviewPage } from '../pageObjects/RecipeReviewPage';
import { RecipeBooksPage } from '../pageObjects/RecipeBooksPage';
import { SettingsPage } from '../pageObjects/SettingsPage';

describe('Page Object Tests', () => {
  let recipesListPage: RecipesListPage;
  let cameraPage: CameraPage;
  let reviewPage: RecipeReviewPage;
  let recipeBooksPage: RecipeBooksPage;
  let settingsPage: SettingsPage;

  beforeEach(async () => {
    recipesListPage = new RecipesListPage();
    cameraPage = new CameraPage();
    reviewPage = new RecipeReviewPage();
    recipeBooksPage = new RecipeBooksPage();
    settingsPage = new SettingsPage();
    
    // Launch app fresh for each test
    await device.launchApp({ newInstance: true });
  });

  describe('RecipesListPage', () => {
    it('should have all required methods', () => {
      expect(typeof recipesListPage.searchRecipes).toBe('function');
      expect(typeof recipesListPage.clearSearch).toBe('function');
      expect(typeof recipesListPage.openAddRecipe).toBe('function');
      expect(typeof recipesListPage.selectRecipe).toBe('function');
      expect(typeof recipesListPage.expectRecipeVisible).toBe('function');
      expect(typeof recipesListPage.expectRecipeNotVisible).toBe('function');
      expect(typeof recipesListPage.openFilters).toBe('function');
      expect(typeof recipesListPage.selectCategory).toBe('function');
      expect(typeof recipesListPage.selectTag).toBe('function');
      expect(typeof recipesListPage.applyFilters).toBe('function');
      expect(typeof recipesListPage.clearFilters).toBe('function');
      expect(typeof recipesListPage.expectEmptyState).toBe('function');
      expect(typeof recipesListPage.expectLoadingState).toBe('function');
      expect(typeof recipesListPage.expectErrorState).toBe('function');
      expect(typeof recipesListPage.retryLoad).toBe('function');
      expect(typeof recipesListPage.refreshList).toBe('function');
      expect(typeof recipesListPage.loadMoreRecipes).toBe('function');
    });
  });

  describe('CameraPage', () => {
    it('should have all required methods', () => {
      expect(typeof cameraPage.capturePhoto).toBe('function');
      expect(typeof cameraPage.selectFromGallery).toBe('function');
      expect(typeof cameraPage.confirmImage).toBe('function');
      expect(typeof cameraPage.retakePhoto).toBe('function');
      expect(typeof cameraPage.cancelCapture).toBe('function');
      expect(typeof cameraPage.expectCameraReady).toBe('function');
      expect(typeof cameraPage.expectImagePreview).toBe('function');
      expect(typeof cameraPage.expectPermissionRequest).toBe('function');
      expect(typeof cameraPage.grantCameraPermission).toBe('function');
      expect(typeof cameraPage.denyCameraPermission).toBe('function');
      expect(typeof cameraPage.expectPermissionDenied).toBe('function');
      expect(typeof cameraPage.openSettings).toBe('function');
      expect(typeof cameraPage.switchCamera).toBe('function');
      expect(typeof cameraPage.toggleFlash).toBe('function');
      expect(typeof cameraPage.expectFlashOn).toBe('function');
      expect(typeof cameraPage.expectFlashOff).toBe('function');
    });
  });

  describe('RecipeReviewPage', () => {
    it('should have all required methods', () => {
      expect(typeof reviewPage.expectOCRProcessing).toBe('function');
      expect(typeof reviewPage.expectParsedRecipe).toBe('function');
      expect(typeof reviewPage.expectErrorState).toBe('function');
      expect(typeof reviewPage.editRecipeTitle).toBe('function');
      expect(typeof reviewPage.clearRecipeTitle).toBe('function');
      expect(typeof reviewPage.editRecipeDescription).toBe('function');
      expect(typeof reviewPage.addIngredient).toBe('function');
      expect(typeof reviewPage.removeIngredient).toBe('function');
      expect(typeof reviewPage.clearIngredients).toBe('function');
      expect(typeof reviewPage.addInstruction).toBe('function');
      expect(typeof reviewPage.removeInstruction).toBe('function');
      expect(typeof reviewPage.clearInstructions).toBe('function');
      expect(typeof reviewPage.selectCategory).toBe('function');
      expect(typeof reviewPage.addTag).toBe('function');
      expect(typeof reviewPage.removeTag).toBe('function');
      expect(typeof reviewPage.setPrepTime).toBe('function');
      expect(typeof reviewPage.setCookTime).toBe('function');
      expect(typeof reviewPage.setServings).toBe('function');
      expect(typeof reviewPage.saveRecipe).toBe('function');
      expect(typeof reviewPage.cancelEdit).toBe('function');
      expect(typeof reviewPage.retakePhoto).toBe('function');
      expect(typeof reviewPage.retryOCR).toBe('function');
      expect(typeof reviewPage.expectValidationError).toBe('function');
      expect(typeof reviewPage.expectSuccessMessage).toBe('function');
      expect(typeof reviewPage.expectImagePreview).toBe('function');
      expect(typeof reviewPage.expectFormFields).toBe('function');
      expect(typeof reviewPage.expectActionButtons).toBe('function');
    });
  });

  describe('RecipeBooksPage', () => {
    it('should have all required methods', () => {
      expect(typeof recipeBooksPage.navigateToRecipes).toBe('function');
      expect(typeof recipeBooksPage.navigateToSettings).toBe('function');
      expect(typeof recipeBooksPage.createNewBook).toBe('function');
      expect(typeof recipeBooksPage.enterBookName).toBe('function');
      expect(typeof recipeBooksPage.enterBookDescription).toBe('function');
      expect(typeof recipeBooksPage.saveBook).toBe('function');
      expect(typeof recipeBooksPage.cancelBookCreation).toBe('function');
      expect(typeof recipeBooksPage.selectBook).toBe('function');
      expect(typeof recipeBooksPage.expectBookVisible).toBe('function');
      expect(typeof recipeBooksPage.expectBookNotVisible).toBe('function');
      expect(typeof recipeBooksPage.editBook).toBe('function');
      expect(typeof recipeBooksPage.deleteBook).toBe('function');
      expect(typeof recipeBooksPage.confirmDelete).toBe('function');
      expect(typeof recipeBooksPage.cancelDelete).toBe('function');
      expect(typeof recipeBooksPage.expectDeleteConfirmation).toBe('function');
      expect(typeof recipeBooksPage.addRecipeToBook).toBe('function');
      expect(typeof recipeBooksPage.removeRecipeFromBook).toBe('function');
      expect(typeof recipeBooksPage.selectRecipe).toBe('function');
      expect(typeof recipeBooksPage.searchBooks).toBe('function');
      expect(typeof recipeBooksPage.clearBookSearch).toBe('function');
      expect(typeof recipeBooksPage.sortBooksBy).toBe('function');
      expect(typeof recipeBooksPage.expectEmptyState).toBe('function');
      expect(typeof recipeBooksPage.expectLoadingState).toBe('function');
      expect(typeof recipeBooksPage.expectErrorState).toBe('function');
      expect(typeof recipeBooksPage.retryLoadBooks).toBe('function');
      expect(typeof recipeBooksPage.refreshBooks).toBe('function');
      expect(typeof recipeBooksPage.expectBookForm).toBe('function');
      expect(typeof recipeBooksPage.expectBookList).toBe('function');
    });
  });

  describe('SettingsPage', () => {
    it('should have all required methods', () => {
      expect(typeof settingsPage.navigateToRecipes).toBe('function');
      expect(typeof settingsPage.navigateToBooks).toBe('function');
      expect(typeof settingsPage.selectTheme).toBe('function');
      expect(typeof settingsPage.expectThemeSelected).toBe('function');
      expect(typeof settingsPage.expectThemeNotSelected).toBe('function');
      expect(typeof settingsPage.expectAvailableThemes).toBe('function');
      expect(typeof settingsPage.openAbout).toBe('function');
      expect(typeof settingsPage.openPrivacyPolicy).toBe('function');
      expect(typeof settingsPage.openTermsOfService).toBe('function');
      expect(typeof settingsPage.exportData).toBe('function');
      expect(typeof settingsPage.importData).toBe('function');
      expect(typeof settingsPage.clearCache).toBe('function');
      expect(typeof settingsPage.resetApp).toBe('function');
      expect(typeof settingsPage.confirmReset).toBe('function');
      expect(typeof settingsPage.cancelReset).toBe('function');
      expect(typeof settingsPage.expectResetConfirmation).toBe('function');
      expect(typeof settingsPage.expectExportSuccess).toBe('function');
      expect(typeof settingsPage.expectImportSuccess).toBe('function');
      expect(typeof settingsPage.expectCacheCleared).toBe('function');
      expect(typeof settingsPage.expectAboutScreen).toBe('function');
      expect(typeof settingsPage.expectPrivacyPolicyScreen).toBe('function');
      expect(typeof settingsPage.expectTermsOfServiceScreen).toBe('function');
    });
  });
});
