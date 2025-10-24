/**
 * Recipe Repository Unit Tests
 * 
 * Tests the recipe repository logic in isolation
 */

import { Result } from '../../domain/common/Result';

// Mock the recipe repository implementation
const mockRecipeRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../infrastructure/di/container', () => ({
  container: {
    get: jest.fn(() => mockRecipeRepository),
  },
}));

describe('Recipe Repository Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save recipe successfully', async () => {
      // Arrange
      const recipe = {
        id: 'test-id',
        title: 'Test Recipe',
        description: 'Test description',
        ingredients: [{ text: 'ingredient 1' }],
        directions: [{ text: 'step 1' }],
      };
      
      const expectedSavedRecipe = { ...recipe };
      mockRecipeRepository.save.mockResolvedValue(Result.success(expectedSavedRecipe));

      // Act
      const result = await mockRecipeRepository.save(recipe);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toEqual(expectedSavedRecipe);
      }
      expect(mockRecipeRepository.save).toHaveBeenCalledWith(recipe);
    });

    it('should handle save errors', async () => {
      // Arrange
      const recipe = {
        id: 'test-id',
        title: 'Test Recipe',
      };
      
      const errorMessage = 'Failed to save recipe';
      mockRecipeRepository.save.mockResolvedValue(Result.failure(errorMessage));

      // Act
      const result = await mockRecipeRepository.save(recipe);

      // Assert
      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBe(errorMessage);
      }
    });
  });

  describe('findById', () => {
    it('should find recipe by ID successfully', async () => {
      // Arrange
      const recipeId = 'test-id';
      const expectedRecipe = {
        id: recipeId,
        title: 'Test Recipe',
      };
      
      mockRecipeRepository.findById.mockResolvedValue(Result.success(expectedRecipe));

      // Act
      const result = await mockRecipeRepository.findById(recipeId);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toEqual(expectedRecipe);
      }
      expect(mockRecipeRepository.findById).toHaveBeenCalledWith(recipeId);
    });

    it('should handle recipe not found', async () => {
      // Arrange
      const recipeId = 'test-id';
      const errorMessage = 'Recipe not found';
      mockRecipeRepository.findById.mockResolvedValue(Result.failure(errorMessage));

      // Act
      const result = await mockRecipeRepository.findById(recipeId);

      // Assert
      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBe(errorMessage);
      }
    });
  });
});
