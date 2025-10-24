/**
 * Local LLM Recipe Parser Unit Tests
 * 
 * Tests the Local LLM recipe parsing service in isolation
 */

import { LocalLLMRecipeParser } from '../../infrastructure/ai/LocalLLMRecipeParser';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('Local LLM Recipe Parser Unit Tests', () => {
  let parser: LocalLLMRecipeParser;

  beforeEach(() => {
    parser = new LocalLLMRecipeParser();
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('parseRecipe', () => {
    it('should parse recipe text successfully', async () => {
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
      const result = await parser.parseRecipe(recipeText);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Local LLM parsing failed');
    });

    it('should handle API response errors', async () => {
      // Arrange
      const recipeText = 'Test recipe';
      const mockErrorResponse = {
        success: false,
        error: 'Local LLM service unavailable'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockErrorResponse,
      } as Response);

      // Act
      const result = await parser.parseRecipe(recipeText);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Local LLM service unavailable');
    });
  });

  describe('validateRecipeText', () => {
    it('should validate valid recipe text', async () => {
      // Arrange
      const validRecipeText = `
        Simple Pasta
        
        Ingredients:
        - 1 lb pasta
        - 2 tbsp olive oil
        
        Directions:
        1. Cook pasta
        2. Heat oil
        
        Prep time: 5 minutes
        Servings: 4
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
