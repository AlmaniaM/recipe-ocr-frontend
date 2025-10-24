import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '../../context/ThemeContext';
import { ClaudeRecipeParser } from '../../infrastructure/ai/ClaudeRecipeParser';
import { LocalLLMRecipeParser } from '../../infrastructure/ai/LocalLLMRecipeParser';

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Recipe Parsing Flow E2E', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch.mockClear();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Claude AI Recipe Parser Integration', () => {
    it('should complete full recipe parsing workflow with Claude AI', async () => {
      // Arrange
      const recipeText = `
        Chocolate Chip Cookies
        
        Ingredients:
        - 2 cups all-purpose flour
        - 1 cup butter, softened
        - 3/4 cup brown sugar
        - 1/2 cup white sugar
        - 2 large eggs
        - 2 tsp vanilla extract
        - 1 tsp baking soda
        - 1 tsp salt
        - 2 cups chocolate chips
        
        Directions:
        1. Preheat oven to 375°F (190°C)
        2. Mix butter and sugars until creamy
        3. Beat in eggs and vanilla
        4. Combine flour, baking soda, and salt
        5. Gradually add flour mixture to butter mixture
        6. Stir in chocolate chips
        7. Drop rounded tablespoons onto ungreased cookie sheets
        8. Bake 9-11 minutes until golden brown
        
        Prep time: 15 minutes
        Cook time: 11 minutes
        Servings: 48 cookies
      `;

      const mockApiResponse = {
        success: true,
        recipe: {
          title: 'Chocolate Chip Cookies',
          description: 'Classic homemade chocolate chip cookies',
          ingredients: [
            { id: '1', text: '2 cups all-purpose flour' },
            { id: '2', text: '1 cup butter, softened' },
            { id: '3', text: '3/4 cup brown sugar' },
            { id: '4', text: '1/2 cup white sugar' },
            { id: '5', text: '2 large eggs' },
            { id: '6', text: '2 tsp vanilla extract' },
            { id: '7', text: '1 tsp baking soda' },
            { id: '8', text: '1 tsp salt' },
            { id: '9', text: '2 cups chocolate chips' }
          ],
          directions: [
            { id: '1', text: 'Preheat oven to 375°F (190°C)', isListItem: true },
            { id: '2', text: 'Mix butter and sugars until creamy', isListItem: true },
            { id: '3', text: 'Beat in eggs and vanilla', isListItem: true },
            { id: '4', text: 'Combine flour, baking soda, and salt', isListItem: true },
            { id: '5', text: 'Gradually add flour mixture to butter mixture', isListItem: true },
            { id: '6', text: 'Stir in chocolate chips', isListItem: true },
            { id: '7', text: 'Drop rounded tablespoons onto ungreased cookie sheets', isListItem: true },
            { id: '8', text: 'Bake 9-11 minutes until golden brown', isListItem: true }
          ],
          category: { id: '1', name: 'Dessert' },
          tags: [
            { id: '1', name: 'cookies' },
            { id: '2', name: 'dessert' },
            { id: '3', name: 'baking' }
          ],
          prepTime: '15 minutes',
          cookTime: '11 minutes',
          servings: '48',
          source: 'Classic Recipe'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      // Act
      const parser = new ClaudeRecipeParser();
      const result = await parser.parseRecipe(recipeText);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        const recipe = result.value;
        expect(recipe.title).toBe('Chocolate Chip Cookies');
        expect(recipe.description).toBe('Classic homemade chocolate chip cookies');
        expect(recipe.ingredients).toHaveLength(9);
        expect(recipe.directions).toHaveLength(8);
        expect(recipe.tags).toHaveLength(3);
        expect(recipe.source).toBe('Classic Recipe');
      }
    });

    it('should handle Claude AI parsing errors gracefully', async () => {
      // Arrange
      const recipeText = 'Test recipe';
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Act
      const parser = new ClaudeRecipeParser();
      const result = await parser.parseRecipe(recipeText);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Claude AI parsing failed');
    });
  });

  describe('Local LLM Recipe Parser Integration', () => {
    it('should complete full recipe parsing workflow with Local LLM', async () => {
      // Arrange
      const recipeText = `
        Simple Pasta
        
        Ingredients:
        - 1 lb pasta
        - 2 tbsp olive oil
        - 3 cloves garlic, minced
        - 1 can diced tomatoes
        - Salt and pepper to taste
        
        Directions:
        1. Cook pasta according to package directions
        2. Heat olive oil in a large pan
        3. Add garlic and cook until fragrant
        4. Add tomatoes and simmer
        5. Toss with cooked pasta
        6. Season with salt and pepper
        
        Prep time: 5 minutes
        Cook time: 15 minutes
        Servings: 4
      `;

      const mockApiResponse = {
        success: true,
        recipe: {
          title: 'Simple Pasta',
          description: 'Quick and easy pasta dish',
          ingredients: [
            { id: '1', text: '1 lb pasta' },
            { id: '2', text: '2 tbsp olive oil' },
            { id: '3', text: '3 cloves garlic, minced' },
            { id: '4', text: '1 can diced tomatoes' },
            { id: '5', text: 'Salt and pepper to taste' }
          ],
          directions: [
            { id: '1', text: 'Cook pasta according to package directions', isListItem: true },
            { id: '2', text: 'Heat olive oil in a large pan', isListItem: true },
            { id: '3', text: 'Add garlic and cook until fragrant', isListItem: true },
            { id: '4', text: 'Add tomatoes and simmer', isListItem: true },
            { id: '5', text: 'Toss with cooked pasta', isListItem: true },
            { id: '6', text: 'Season with salt and pepper', isListItem: true }
          ],
          category: { id: '1', name: 'MainCourse' },
          tags: [
            { id: '1', name: 'pasta' },
            { id: '2', name: 'quick' },
            { id: '3', name: 'easy' }
          ],
          prepTime: '5 minutes',
          cookTime: '15 minutes',
          servings: '4',
          source: 'Home Recipe'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      // Act
      const parser = new LocalLLMRecipeParser();
      const result = await parser.parseRecipe(recipeText);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        const recipe = result.value;
        expect(recipe.title).toBe('Simple Pasta');
        expect(recipe.description).toBe('Quick and easy pasta dish');
        expect(recipe.ingredients).toHaveLength(5);
        expect(recipe.directions).toHaveLength(6);
        expect(recipe.tags).toHaveLength(3);
        expect(recipe.source).toBe('Home Recipe');
      }
    });

    it('should handle Local LLM parsing errors gracefully', async () => {
      // Arrange
      const recipeText = 'Test recipe';
      mockFetch.mockRejectedValueOnce(new Error('Local LLM unavailable'));

      // Act
      const parser = new LocalLLMRecipeParser();
      const result = await parser.parseRecipe(recipeText);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Local LLM parsing failed');
    });
  });

  describe('Recipe Validation Flow', () => {
    it('should validate recipe text before parsing', async () => {
      // Arrange
      const validRecipeText = `
        Chocolate Chip Cookies
        
        Ingredients:
        - 2 cups flour
        - 1 cup butter
        
        Directions:
        1. Mix ingredients
        2. Bake for 12 minutes
        
        Prep time: 15 minutes
        Servings: 24
      `;

      const invalidText = 'This is just random text without recipe structure';

      // Act
      const claudeParser = new ClaudeRecipeParser();
      const localParser = new LocalLLMRecipeParser();

      const validResult = await claudeParser.validateRecipeText(validRecipeText);
      const invalidResult = await claudeParser.validateRecipeText(invalidText);

      const localValidResult = await localParser.validateRecipeText(validRecipeText);
      const localInvalidResult = await localParser.validateRecipeText(invalidText);

      // Assert
      expect(validResult.isSuccess).toBe(true);
      if (validResult.isSuccess) {
        expect(validResult.value).toBe(true);
      }

      expect(invalidResult.isSuccess).toBe(true);
      if (invalidResult.isSuccess) {
        expect(invalidResult.value).toBe(false);
      }

      expect(localValidResult.isSuccess).toBe(true);
      if (localValidResult.isSuccess) {
        expect(localValidResult.value).toBe(true);
      }

      expect(localInvalidResult.isSuccess).toBe(true);
      if (localInvalidResult.isSuccess) {
        expect(localInvalidResult.value).toBe(false);
      }
    });
  });

  describe('Batch Recipe Parsing', () => {
    it('should parse multiple recipes successfully', async () => {
      // Arrange
      const recipeTexts = [
        'Simple Pasta\nIngredients:\n- 1 lb pasta\nDirections:\n1. Cook pasta',
        'Chocolate Cake\nIngredients:\n- 2 cups flour\nDirections:\n1. Mix ingredients'
      ];

      const mockApiResponse = {
        success: true,
        recipe: {
          title: 'Test Recipe',
          description: '',
          ingredients: [],
          directions: [],
          category: { id: '1', name: 'Other' },
          tags: [],
          prepTime: null,
          cookTime: null,
          servings: null,
          source: null
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      // Act
      const claudeParser = new ClaudeRecipeParser();
      const localParser = new LocalLLMRecipeParser();

      const claudeResult = await claudeParser.parseRecipes(recipeTexts);
      const localResult = await localParser.parseRecipes(recipeTexts);

      // Assert
      expect(claudeResult.isSuccess).toBe(true);
      if (claudeResult.isSuccess) {
        expect(claudeResult.value).toHaveLength(2);
      }

      expect(localResult.isSuccess).toBe(true);
      if (localResult.isSuccess) {
        expect(localResult.value).toHaveLength(2);
      }
    });

    it('should handle partial failures in batch parsing', async () => {
      // Arrange
      const recipeTexts = ['Valid recipe', 'Invalid recipe'];
      const validResponse = {
        success: true,
        recipe: {
          title: 'Valid Recipe',
          description: '',
          ingredients: [],
          directions: [],
          category: { id: '1', name: 'Other' },
          tags: [],
          prepTime: null,
          cookTime: null,
          servings: null,
          source: null
        }
      };
      const invalidResponse = {
        success: false,
        error: 'Invalid recipe'
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => validResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => invalidResponse,
        } as Response);

      // Act
      const parser = new ClaudeRecipeParser();
      const result = await parser.parseRecipes(recipeTexts);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0].title).toBe('Valid Recipe');
      }
    });
  });
});
