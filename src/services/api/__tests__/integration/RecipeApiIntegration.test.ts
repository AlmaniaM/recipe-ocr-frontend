/**
 * Recipe API Integration Tests
 * 
 * Integration tests for Recipe API endpoints
 * These tests require a running backend server.
 */

import { RecipeApiClient } from '../../RecipeApiClient';
import { ApiError, ApiErrorType } from '../../types';

// Skip integration tests in CI/CD unless explicitly enabled
const runIntegrationTests = process.env.RUN_INTEGRATION_TESTS === 'true';

(runIntegrationTests ? describe : describe.skip)('Recipe API Integration Tests', () => {
  let recipeApiClient: RecipeApiClient;

  beforeAll(() => {
    recipeApiClient = new RecipeApiClient();
  });

  describe('Recipe CRUD Operations', () => {
    let createdRecipeId: string;

    it('should create a new recipe', async () => {
      const createRequest = {
        title: 'Integration Test Recipe',
        description: 'A recipe created during integration testing',
        ingredients: [
          {
            id: '1',
            text: '2 cups all-purpose flour',
            amount: '2',
            unit: 'cups',
            name: 'all-purpose flour',
          },
          {
            id: '2',
            text: '1 cup granulated sugar',
            amount: '1',
            unit: 'cup',
            name: 'granulated sugar',
          },
        ],
        instructions: [
          'Preheat oven to 350°F (175°C)',
          'Mix dry ingredients in a large bowl',
          'Add wet ingredients and mix until combined',
          'Pour into prepared pan and bake for 30-35 minutes',
        ],
        prepTimeMinutes: 15,
        cookTimeMinutes: 35,
        servings: 8,
        source: 'Integration Test',
        category: 'dessert',
        tags: ['cake', 'dessert', 'baking'],
      };

      const result = await recipeApiClient.createRecipe(createRequest);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe(createRequest.title);
      expect(result.ingredients).toHaveLength(2);
      expect(result.instructions).toHaveLength(4);
      expect(result.category).toBe('dessert');

      createdRecipeId = result.id;
    });

    it('should get the created recipe', async () => {
      const result = await recipeApiClient.getRecipe(createdRecipeId);

      expect(result).toBeDefined();
      expect(result.id).toBe(createdRecipeId);
      expect(result.title).toBe('Integration Test Recipe');
    });

    it('should update the recipe', async () => {
      const updateRequest = {
        id: createdRecipeId,
        title: 'Updated Integration Test Recipe',
        description: 'An updated recipe for integration testing',
        ingredients: [
          {
            id: '1',
            text: '2.5 cups all-purpose flour',
            amount: '2.5',
            unit: 'cups',
            name: 'all-purpose flour',
          },
          {
            id: '2',
            text: '1.25 cups granulated sugar',
            amount: '1.25',
            unit: 'cups',
            name: 'granulated sugar',
          },
        ],
        instructions: [
          'Preheat oven to 375°F (190°C)',
          'Mix dry ingredients in a large bowl',
          'Add wet ingredients and mix until combined',
          'Pour into prepared pan and bake for 25-30 minutes',
          'Let cool before serving',
        ],
        prepTimeMinutes: 20,
        cookTimeMinutes: 30,
        servings: 10,
        source: 'Updated Integration Test',
        category: 'dessert',
        tags: ['cake', 'dessert', 'baking', 'updated'],
      };

      const result = await recipeApiClient.updateRecipe(createdRecipeId, updateRequest);

      expect(result).toBeDefined();
      expect(result.id).toBe(createdRecipeId);
      expect(result.title).toBe('Updated Integration Test Recipe');
      expect(result.ingredients).toHaveLength(2);
      expect(result.instructions).toHaveLength(5);
      expect(result.servings).toBe(10);
    });

    it('should search for the recipe', async () => {
      const result = await recipeApiClient.searchRecipes({
        q: 'Integration Test',
        pageNumber: 1,
        pageSize: 10,
      });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items.some(recipe => recipe.id === createdRecipeId)).toBe(true);
    });

    it('should get recipes with pagination', async () => {
      const result = await recipeApiClient.getRecipes({
        pageNumber: 1,
        pageSize: 10,
      });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(result.totalCount).toBeGreaterThanOrEqual(1);
      expect(result.pageNumber).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('should get recipe count', async () => {
      const result = await recipeApiClient.getRecipeCount();

      expect(result).toBeDefined();
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(1);
    });

    it('should delete the recipe', async () => {
      await expect(recipeApiClient.deleteRecipe(createdRecipeId)).resolves.not.toThrow();
    });

    it('should not find deleted recipe', async () => {
      await expect(recipeApiClient.getRecipe(createdRecipeId)).rejects.toThrow(ApiError);
    });
  });

  describe('Error Handling', () => {
    it('should handle recipe not found', async () => {
      await expect(recipeApiClient.getRecipe('non-existent-id')).rejects.toThrow(ApiError);
    });

    it('should handle invalid recipe data', async () => {
      const invalidRequest = {
        title: '', // Empty title should be invalid
        ingredients: [],
        instructions: [],
        category: 'invalid-category',
        tags: [],
      };

      await expect(recipeApiClient.createRecipe(invalidRequest)).rejects.toThrow(ApiError);
    });
  });
});
