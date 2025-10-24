/**
 * Recipe Parsing Flow E2E Tests
 * 
 * Tests the complete recipe parsing user journey:
 * Image → OCR → AI Parsing → Review → Save
 */

import { device } from 'detox';
import { RecipesListPage } from '../pageObjects/RecipesListPage';
import { CameraPage } from '../pageObjects/CameraPage';
import { RecipeReviewPage } from '../pageObjects/RecipeReviewPage';

describe('Recipe Parsing Flow', () => {
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

  it('should parse recipe from image and save', async () => {
    // Navigate to recipes list
    await recipesListPage.expectVisible('recipes-list-screen');
    
    // Open add recipe flow
    await recipesListPage.openAddRecipe();
    
    // Navigate to camera
    await cameraPage.expectVisible('camera-screen');
    
    // Capture photo
    await cameraPage.capturePhoto();
    await cameraPage.confirmImage();
    
    // Wait for OCR processing
    await reviewPage.expectOCRProcessing();
    
    // Wait for AI parsing
    await reviewPage.expectAIParsing();
    
    // Wait for parsed recipe
    await reviewPage.expectParsedRecipe();
    
    // Verify parsed content
    await reviewPage.expectFormFields();
    await reviewPage.expectActionButtons();
    
    // Edit recipe if needed
    await reviewPage.editRecipeTitle('My Parsed Recipe');
    
    // Save recipe
    await reviewPage.saveRecipe();
    await reviewPage.expectSuccessMessage();
    
    // Verify recipe appears in list
    await recipesListPage.expectRecipeVisible('My Parsed Recipe');
  });

  it('should handle AI parsing errors gracefully', async () => {
    // Navigate through capture flow
    await recipesListPage.openAddRecipe();
    await cameraPage.capturePhoto();
    await cameraPage.confirmImage();
    
    // Wait for OCR processing
    await reviewPage.expectOCRProcessing();
    
    // Simulate AI parsing error
    await reviewPage.expectAIParsingError();
    
    // Should show error state
    await reviewPage.expectErrorState();
    
    // Should allow retry
    await reviewPage.retryAIParsing();
    
    // Should retry parsing
    await reviewPage.expectAIParsing();
  });

  it('should allow manual editing of parsed recipe', async () => {
    // Navigate through capture flow
    await recipesListPage.openAddRecipe();
    await cameraPage.capturePhoto();
    await cameraPage.confirmImage();
    await reviewPage.expectParsedRecipe();
    
    // Edit parsed content
    await reviewPage.editRecipeTitle('Edited Recipe Title');
    await reviewPage.editRecipeDescription('Edited description');
    
    // Add more ingredients
    await reviewPage.addIngredient('Additional ingredient');
    
    // Add more instructions
    await reviewPage.addInstruction('Additional instruction');
    
    // Change category
    await reviewPage.selectCategory('dessert');
    
    // Add tags
    await reviewPage.addTag('homemade');
    await reviewPage.addTag('delicious');
    
    // Set timing
    await reviewPage.setPrepTime(20);
    await reviewPage.setCookTime(30);
    await reviewPage.setServings(6);
    
    // Save edited recipe
    await reviewPage.saveRecipe();
    await reviewPage.expectSuccessMessage();
    
    // Verify edited recipe appears
    await recipesListPage.expectRecipeVisible('Edited Recipe Title');
  });

  it('should validate parsed recipe before saving', async () => {
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
    
    // Fill required fields
    await reviewPage.editRecipeTitle('Valid Recipe');
    await reviewPage.addIngredient('Valid ingredient');
    await reviewPage.addInstruction('Valid instruction');
    
    // Should now save successfully
    await reviewPage.saveRecipe();
    await reviewPage.expectSuccessMessage();
  });

  it('should handle different recipe formats', async () => {
    // Test with different recipe formats
    const recipeFormats = [
      'Traditional format with ingredients and directions',
      'Modern format with steps and components',
      'Minimal format with just ingredients and instructions'
    ];

    for (const format of recipeFormats) {
      // Navigate through capture flow
      await recipesListPage.openAddRecipe();
      await cameraPage.capturePhoto();
      await cameraPage.confirmImage();
      
      // Wait for parsing
      await reviewPage.expectOCRProcessing();
      await reviewPage.expectAIParsing();
      await reviewPage.expectParsedRecipe();
      
      // Should parse successfully regardless of format
      await reviewPage.expectFormFields();
      
      // Save recipe
      await reviewPage.editRecipeTitle(`Recipe ${format}`);
      await reviewPage.saveRecipe();
      await reviewPage.expectSuccessMessage();
      
      // Verify recipe appears
      await recipesListPage.expectRecipeVisible(`Recipe ${format}`);
    }
  });

  it('should allow switching between AI parsers', async () => {
    // Navigate through capture flow
    await recipesListPage.openAddRecipe();
    await cameraPage.capturePhoto();
    await cameraPage.confirmImage();
    
    // Wait for OCR processing
    await reviewPage.expectOCRProcessing();
    
    // Try Claude AI first
    await reviewPage.selectAIParser('claude');
    await reviewPage.expectAIParsing();
    
    // If parsing fails, try Local LLM
    await reviewPage.expectAIParsingError();
    await reviewPage.selectAIParser('local-llm');
    await reviewPage.retryAIParsing();
    await reviewPage.expectAIParsing();
    
    // Should eventually parse successfully
    await reviewPage.expectParsedRecipe();
  });

  it('should handle batch recipe parsing', async () => {
    // Navigate to batch parsing mode
    await recipesListPage.openBatchParsing();
    
    // Select multiple images
    await cameraPage.selectMultipleImages(3);
    
    // Start batch parsing
    await reviewPage.startBatchParsing();
    
    // Wait for all recipes to be parsed
    await reviewPage.expectBatchParsingProgress(3);
    await reviewPage.expectBatchParsingComplete();
    
    // Review and edit each recipe
    for (let i = 0; i < 3; i++) {
      await reviewPage.selectBatchRecipe(i);
      await reviewPage.editRecipeTitle(`Batch Recipe ${i + 1}`);
      await reviewPage.saveBatchRecipe();
    }
    
    // Verify all recipes appear in list
    await recipesListPage.expectRecipeVisible('Batch Recipe 1');
    await recipesListPage.expectRecipeVisible('Batch Recipe 2');
    await recipesListPage.expectRecipeVisible('Batch Recipe 3');
  });
});
