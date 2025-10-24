/**
 * Basic OCR Flow Integration Tests
 * 
 * Simple tests that verify the OCR flow components can be imported and basic functionality works
 */

describe('OCR Flow Basic Integration Tests', () => {
  it('should import RecipeReviewScreen without errors', () => {
    expect(() => {
      require('../../screens/recipes/RecipeReviewScreen');
    }).not.toThrow();
  });

  it('should import RecipeCreateScreen without errors', () => {
    expect(() => {
      require('../../screens/recipes/RecipeCreateScreen');
    }).not.toThrow();
  });

  it('should import API clients without errors', () => {
    expect(() => {
      require('../../services/api/OCRApiClient');
      require('../../services/api/RecipeParsingApiClient');
    }).not.toThrow();
  });

  it('should import use cases without errors', () => {
    expect(() => {
      require('../../application/useCases/recipes/CreateRecipeUseCase');
    }).not.toThrow();
  });

  it('should import domain entities without errors', () => {
    expect(() => {
      require('../../domain/entities/Recipe');
      require('../../domain/common/Result');
    }).not.toThrow();
  });

  it('should import types without errors', () => {
    expect(() => {
      require('../../types/Recipe');
    }).not.toThrow();
  });
});
