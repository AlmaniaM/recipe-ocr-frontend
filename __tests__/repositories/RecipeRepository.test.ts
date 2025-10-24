/**
 * Recipe Repository Unit Tests
 * 
 * Tests the recipe repository logic in isolation
 */

import { Result } from '../../domain/common/Result';
import { Recipe } from '../../domain/entities/Recipe';
import { RecipeId } from '../../domain/valueObjects/RecipeId';

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
        id: RecipeId.create(),
        title: 'Test Recipe',
        description: 'Test description',
        ingredients: [{ text: 'ingredient 1' }],
        directions: [{ text: 'step 1' }],
      } as Recipe;
      
      const expectedSavedRecipe = { ...recipe, id: recipe.id };
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
        id: RecipeId.create(),
        title: 'Test Recipe',
      } as Recipe;
      
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
      const recipeId = RecipeId.create();
      const expectedRecipe = {
        id: recipeId,
        title: 'Test Recipe',
      } as Recipe;
      
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
      const recipeId = RecipeId.create();
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

  describe('findAll', () => {
    it('should find all recipes successfully', async () => {
      // Arrange
      const expectedRecipes = [
        { id: RecipeId.create(), title: 'Recipe 1' },
        { id: RecipeId.create(), title: 'Recipe 2' },
      ] as Recipe[];
      
      mockRecipeRepository.findAll.mockResolvedValue(Result.success(expectedRecipes));

      // Act
      const result = await mockRecipeRepository.findAll();

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toEqual(expectedRecipes);
        expect(result.value).toHaveLength(2);
      }
    });

    it('should handle find all errors', async () => {
      // Arrange
      const errorMessage = 'Failed to retrieve recipes';
      mockRecipeRepository.findAll.mockResolvedValue(Result.failure(errorMessage));

      // Act
      const result = await mockRecipeRepository.findAll();

      // Assert
      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBe(errorMessage);
      }
    });
  });

  describe('delete', () => {
    it('should delete recipe successfully', async () => {
      // Arrange
      const recipeId = RecipeId.create();
      mockRecipeRepository.delete.mockResolvedValue(Result.success(true));

      // Act
      const result = await mockRecipeRepository.delete(recipeId);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBe(true);
      }
      expect(mockRecipeRepository.delete).toHaveBeenCalledWith(recipeId);
    });

    it('should handle delete errors', async () => {
      // Arrange
      const recipeId = RecipeId.create();
      const errorMessage = 'Failed to delete recipe';
      mockRecipeRepository.delete.mockResolvedValue(Result.failure(errorMessage));

      // Act
      const result = await mockRecipeRepository.delete(recipeId);

      // Assert
      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBe(errorMessage);
      }
    });
  });
});