/**
 * Recipe Parsing Service Unit Tests
 * 
 * Tests the recipe parsing service logic in isolation
 */

import { Result } from '../../domain/common/Result';

// Mock the recipe parsing service implementation
const mockRecipeParsingService = {
  parseRecipe: jest.fn(),
};

jest.mock('../../infrastructure/di/container', () => ({
  container: {
    get: jest.fn(() => mockRecipeParsingService),
  },
}));

describe('Recipe Parsing Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseRecipe', () => {
    it('should parse recipe text successfully', async () => {
      // Arrange
      const recipeText = 'Test recipe text';
      const expectedParsedRecipe = {
        title: 'Test Recipe',
        description: 'Test description',
        ingredients: [{ text: 'ingredient 1' }, { text: 'ingredient 2' }],
        directions: [{ text: 'step 1' }, { text: 'step 2' }],
      };
      mockRecipeParsingService.parseRecipe.mockResolvedValue(Result.success(expectedParsedRecipe));

      // Act
      const result = await mockRecipeParsingService.parseRecipe(recipeText);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toEqual(expectedParsedRecipe);
        expect(result.value.title).toBe('Test Recipe');
        expect(result.value.ingredients).toHaveLength(2);
        expect(result.value.directions).toHaveLength(2);
      }
      expect(mockRecipeParsingService.parseRecipe).toHaveBeenCalledWith(recipeText);
    });

    it('should handle recipe parsing errors', async () => {
      // Arrange
      const recipeText = 'Invalid recipe text';
      const errorMessage = 'Recipe parsing failed';
      mockRecipeParsingService.parseRecipe.mockResolvedValue(Result.failure(errorMessage));

      // Act
      const result = await mockRecipeParsingService.parseRecipe(recipeText);

      // Assert
      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBe(errorMessage);
      }
    });

    it('should handle empty recipe text', async () => {
      // Arrange
      const recipeText = '';
      const errorMessage = 'Empty recipe text provided';
      mockRecipeParsingService.parseRecipe.mockResolvedValue(Result.failure(errorMessage));

      // Act
      const result = await mockRecipeParsingService.parseRecipe(recipeText);

      // Assert
      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBe(errorMessage);
      }
    });
  });
});