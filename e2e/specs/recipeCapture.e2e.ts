/**
 * Recipe Capture Flow E2E Tests
 * 
 * Tests the complete recipe capture user journey:
 * Camera → OCR → Review → Save
 */

import { device } from 'detox';
import { RecipesListPage } from '../pageObjects/RecipesListPage';
import { CameraPage } from '../pageObjects/CameraPage';
import { RecipeReviewPage } from '../pageObjects/RecipeReviewPage';

describe('Recipe Capture Flow', () => {
  let recipesListPage: RecipesListPage;
  let cameraPage: CameraPage;
  let reviewPage: RecipeReviewPage;

  beforeEach(async () => {
    recipesListPage = new RecipesListPage();
    cameraPage = new CameraPage();
    reviewPage = new RecipeReviewPage();
    
    // Launch app fresh for each test
    await device.launchApp({ newInstance: true });
  });

  it('should capture recipe from camera and save successfully', async () => {
    // Navigate to recipes list
    await recipesListPage.expectVisible('recipes-list-screen');
    
    // Open add recipe flow
    await recipesListPage.openAddRecipe();
    
    // Navigate to camera
    await cameraPage.expectVisible('camera-screen');
    
    // Capture photo
    await cameraPage.capturePhoto();
    await cameraPage.confirmImage();
    
    // Wait for OCR and parsing
    await reviewPage.expectOCRProcessing();
    await reviewPage.expectParsedRecipe();
    
    // Edit and save recipe
    await reviewPage.editRecipeTitle('My Test Recipe');
    await reviewPage.saveRecipe();
    
    // Verify recipe appears in list
    await recipesListPage.expectRecipeVisible('My Test Recipe');
  });

  it('should handle OCR errors gracefully', async () => {
    // Navigate to camera
    await recipesListPage.openAddRecipe();
    await cameraPage.expectVisible('camera-screen');
    
    // Capture photo that will cause OCR error
    await cameraPage.capturePhoto();
    await cameraPage.confirmImage();
    
    // Should show error handling
    await reviewPage.expectOCRProcessing();
    await reviewPage.expectErrorState();
    
    // Should allow retry
    await reviewPage.retryOCR();
  });

  it('should allow recipe editing before saving', async () => {
    // Navigate through capture flow
    await recipesListPage.openAddRecipe();
    await cameraPage.capturePhoto();
    await cameraPage.confirmImage();
    await reviewPage.expectParsedRecipe();
    
    // Edit recipe details
    await reviewPage.editRecipeTitle('Edited Recipe Title');
    await reviewPage.editRecipeDescription('Edited description');
    await reviewPage.addIngredient('New ingredient');
    await reviewPage.addInstruction('New instruction');
    
    // Save edited recipe
    await reviewPage.saveRecipe();
    
    // Verify edited recipe appears
    await recipesListPage.expectRecipeVisible('Edited Recipe Title');
  });

  it('should validate required fields before saving', async () => {
    // Navigate through capture flow
    await recipesListPage.openAddRecipe();
    await cameraPage.capturePhoto();
    await cameraPage.confirmImage();
    await reviewPage.expectParsedRecipe();
    
    // Clear required fields
    await reviewPage.clearRecipeTitle();
    await reviewPage.clearIngredients();
    await reviewPage.clearInstructions();
    
    // Try to save without required fields
    await reviewPage.saveRecipe();
    
    // Should show validation errors
    await reviewPage.expectValidationError('title');
    await reviewPage.expectValidationError('ingredients');
    await reviewPage.expectValidationError('instructions');
  });

  it('should allow canceling the capture flow', async () => {
    // Navigate to camera
    await recipesListPage.openAddRecipe();
    await cameraPage.expectVisible('camera-screen');
    
    // Cancel from camera
    await cameraPage.cancelCapture();
    
    // Should return to recipes list
    await recipesListPage.expectVisible('recipes-list-screen');
  });

  it('should allow retaking photo', async () => {
    // Navigate to camera
    await recipesListPage.openAddRecipe();
    await cameraPage.capturePhoto();
    await cameraPage.confirmImage();
    
    // Retake photo
    await reviewPage.retakePhoto();
    await cameraPage.expectVisible('camera-screen');
    
    // Capture new photo
    await cameraPage.capturePhoto();
    await cameraPage.confirmImage();
    
    // Should proceed with new photo
    await reviewPage.expectParsedRecipe();
  });
});
