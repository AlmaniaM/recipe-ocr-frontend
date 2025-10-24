/**
 * Claude Recipe Parser Unit Tests
 * 
 * Tests the Claude AI recipe parsing service in isolation
 */

import { ClaudeRecipeParser } from '../../infrastructure/ai/ClaudeRecipeParser';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('Claude Recipe Parser Unit Tests', () => {
  let parser: ClaudeRecipeParser;

  beforeEach(() => {
    parser = new ClaudeRecipeParser();
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('parseRecipe', () => {
    it('should parse recipe text successfully', async () => {
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
      const result = await parser.parseRecipe(recipeText);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Claude AI parsing failed');
    });

    it('should handle API response errors', async () => {
      // Arrange
      const recipeText = 'Test recipe';
      const mockErrorResponse = {
        success: false,
        error: 'Invalid recipe format'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockErrorResponse,
      } as Response);

      // Act
      const result = await parser.parseRecipe(recipeText);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Invalid recipe format');
    });
  });

  describe('validateRecipeText', () => {
    it('should validate valid recipe text', async () => {
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

      const mockValidationResponse = {
        success: true,
        isValid: true
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidationResponse,
      } as Response);

      // Act
      const result = await parser.validateRecipeText(validRecipeText);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBe(true);
      }
    });

    it('should reject invalid recipe text', async () => {
      // Arrange
      const invalidText = 'This is just random text without recipe structure';
      const mockValidationResponse = {
        success: true,
        isValid: false
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidationResponse,
      } as Response);

      // Act
      const result = await parser.validateRecipeText(invalidText);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBe(false);
      }
    });
  });

  describe('parseRecipes', () => {
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
      const result = await parser.parseRecipes(recipeTexts);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toHaveLength(2);
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
