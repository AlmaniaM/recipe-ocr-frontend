/**
 * Recipe Review Page Object
 * 
 * Actions and assertions for the recipe review screen
 */

import { element, by, expect as detoxExpect } from 'detox';
import { BasePage } from './BasePage';

export class RecipeReviewPage extends BasePage {
  async expectOCRProcessing() {
    await this.waitForElement('ocr-processing-indicator', 15000);
    await this.expectText('processing-status', 'Extracting text from image...');
  }

  async expectParsedRecipe() {
    await this.waitForElement('recipe-title-input', 20000);
    await this.expectVisible('recipe-form');
  }

  async expectErrorState() {
    await this.expectVisible('error-state');
    await this.expectText('error-message', 'Failed to process image');
  }

  async editRecipeTitle(title: string) {
    await this.clearText('recipe-title-input');
    await this.typeText('recipe-title-input', title);
  }

  async clearRecipeTitle() {
    await this.clearText('recipe-title-input');
  }

  async editRecipeDescription(description: string) {
    await this.clearText('recipe-description-input');
    await this.typeText('recipe-description-input', description);
  }

  async addIngredient(ingredient: string) {
    await this.typeText('ingredient-input', ingredient);
    await this.tapButton('add-ingredient-button');
  }

  async removeIngredient(index: number) {
    await this.tapButton(`remove-ingredient-${index}`);
  }

  async clearIngredients() {
    await this.tapButton('clear-all-ingredients-button');
  }

  async addInstruction(instruction: string) {
    await this.typeText('instruction-input', instruction);
    await this.tapButton('add-instruction-button');
  }

  async removeInstruction(index: number) {
    await this.tapButton(`remove-instruction-${index}`);
  }

  async clearInstructions() {
    await this.tapButton('clear-all-instructions-button');
  }

  async selectCategory(category: string) {
    await this.tapButton('category-selector');
    await this.tapButton(`category-${category.toLowerCase()}`);
  }

  async addTag(tag: string) {
    await this.typeText('tag-input', tag);
    await this.tapButton('add-tag-button');
  }

  async removeTag(tag: string) {
    await this.tapButton(`remove-tag-${tag.toLowerCase()}`);
  }

  async setPrepTime(minutes: number) {
    await this.typeText('prep-time-input', minutes.toString());
  }

  async setCookTime(minutes: number) {
    await this.typeText('cook-time-input', minutes.toString());
  }

  async setServings(servings: number) {
    await this.typeText('servings-input', servings.toString());
  }

  async saveRecipe() {
    await this.tapButton('save-recipe-button');
  }

  async cancelEdit() {
    await this.tapButton('cancel-button');
  }

  async retakePhoto() {
    await this.tapButton('retake-photo-button');
  }

  async retryOCR() {
    await this.tapButton('retry-ocr-button');
  }

  async expectValidationError(field: string) {
    await this.expectVisible(`${field}-error`);
    await this.expectText(`${field}-error`, `${field} is required`);
  }

  async expectSuccessMessage() {
    await this.waitForElement('success-message', 5000);
    await this.expectText('success-message', 'Recipe saved successfully');
  }

  async expectImagePreview() {
    await this.expectVisible('recipe-image-preview');
  }

  async expectFormFields() {
    await this.expectVisible('recipe-title-input');
    await this.expectVisible('recipe-description-input');
    await this.expectVisible('ingredients-section');
    await this.expectVisible('instructions-section');
    await this.expectVisible('category-selector');
  }

  async expectActionButtons() {
    await this.expectVisible('save-recipe-button');
    await this.expectVisible('cancel-button');
  }

  async expectAIParsing() {
    await this.waitForElement('ai-parsing-indicator', 15000);
    await this.expectText('parsing-status', 'Parsing recipe with AI...');
  }

  async expectAIParsingError() {
    await this.expectVisible('ai-parsing-error');
    await this.expectText('parsing-error-message', 'AI parsing failed');
  }

  async retryAIParsing() {
    await this.tapButton('retry-ai-parsing-button');
  }

  async selectAIParser(parser: string) {
    await this.tapButton('ai-parser-selector');
    await this.tapButton(`ai-parser-${parser}`);
  }

  async openBatchParsing() {
    await this.tapButton('batch-parsing-button');
  }

  async selectMultipleImages(count: number) {
    for (let i = 0; i < count; i++) {
      await this.tapButton(`select-image-${i}`);
    }
  }

  async startBatchParsing() {
    await this.tapButton('start-batch-parsing-button');
  }

  async expectBatchParsingProgress(count: number) {
    await this.expectText('batch-progress', `Processing ${count} recipes...`);
  }

  async expectBatchParsingComplete() {
    await this.expectVisible('batch-complete-message');
  }

  async selectBatchRecipe(index: number) {
    await this.tapButton(`batch-recipe-${index}`);
  }

  async saveBatchRecipe() {
    await this.tapButton('save-batch-recipe-button');
  }
}
