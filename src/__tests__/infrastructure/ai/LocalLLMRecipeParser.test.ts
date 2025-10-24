import { LocalLLMRecipeParser } from '../../../infrastructure/ai/LocalLLMRecipeParser';
import { RecipeCategory } from '../../../domain/enums/RecipeCategory';

// Mock fetch
global.fetch = jest.fn();

describe('LocalLLMRecipeParser', () => {
  let parser: LocalLLMRecipeParser;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    parser = new LocalLLMRecipeParser();
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('parseRecipe', () => {
    it('should successfully parse a recipe from API response', async () => {
      // Arrange
      const recipeText = 'Chocolate Chip Cookies\n\nIngredients:\n- 2 cups flour\n- 1 cup butter';
      const mockApiResponse = {
        success: true,
        recipe: {
          title: 'Chocolate Chip Cookies',
          description: 'Delicious homemade cookies',
          ingredients: [
            { id: '1', text: '2 cups flour' },
            { id: '2', text: '1 cup butter' }
          ],
          directions: [
            { id: '1', text: 'Mix ingredients', isListItem: true },
            { id: '2', text: 'Bake for 12 minutes', isListItem: true }
          ],
          category: { id: '1', name: 'Dessert' },
          tags: [
            { id: '1', name: 'cookies' },
            { id: '2', name: 'dessert' }
          ],
          prepTime: '15 minutes',
          cookTime: '12 minutes',
          servings: '24',
          source: 'Test Recipe'
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
        expect(result.value.title).toBe('Chocolate Chip Cookies');
        expect(result.value.description).toBe('Delicious homemade cookies');
        expect(result.value.ingredients).toHaveLength(2);
        expect(result.value.directions).toHaveLength(2);
        expect(result.value.tags).toHaveLength(2);
        expect(result.value.category).toBe(RecipeCategory.Dessert);
      }
    });

    it('should handle API error response', async () => {
      // Arrange
      const recipeText = 'Test recipe';
      const mockApiResponse = {
        success: false,
        error: 'API error occurred'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      // Act
      const result = await parser.parseRecipe(recipeText);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('API error occurred');
    });

    it('should handle network error', async () => {
      // Arrange
      const recipeText = 'Test recipe';
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Act
      const result = await parser.parseRecipe(recipeText);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Local LLM parsing failed');
    });

    it('should handle HTTP error status', async () => {
      // Arrange
      const recipeText = 'Test recipe';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      // Act
      const result = await parser.parseRecipe(recipeText);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('API request failed');
    });
  });

  describe('parseRecipes', () => {
    it('should parse multiple recipes successfully', async () => {
      // Arrange
      const recipeTexts = ['Recipe 1', 'Recipe 2'];
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

    it('should handle partial failures', async () => {
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

  describe('validateRecipeText', () => {
    it('should validate recipe text with sufficient keywords', async () => {
      // Arrange
      const recipeText = 'Chocolate Chip Cookies\n\nIngredients:\n- 2 cups flour\n\nDirections:\n1. Mix ingredients\n2. Bake for 12 minutes\n\nPrep time: 15 minutes\nServings: 24';

      // Act
      const result = await parser.validateRecipeText(recipeText);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBe(true);
      }
    });

    it('should reject text with insufficient keywords', async () => {
      // Arrange
      const nonRecipeText = 'This is just some random text without recipe keywords';

      // Act
      const result = await parser.validateRecipeText(nonRecipeText);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBe(false);
      }
    });
  });

  describe('getParsingConfidence', () => {
    it('should return good confidence for Local LLM', async () => {
      // Act
      const result = await parser.getParsingConfidence();

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBe(0.85);
      }
    });
  });

  describe('mapApiResponseToRecipe', () => {
    it('should map API response to Recipe entity correctly', async () => {
      // Arrange
      const recipeText = 'Test recipe';
      const mockApiResponse = {
        success: true,
        recipe: {
          title: 'Mapped Recipe',
          description: 'A test recipe',
          ingredients: [
            { id: '1', text: '1 cup flour' }
          ],
          directions: [
            { id: '1', text: 'Mix ingredients', isListItem: true }
          ],
          category: { id: '1', name: 'MainCourse' },
          tags: [
            { id: '1', name: 'test' }
          ],
          prepTime: '10 minutes',
          cookTime: '20 minutes',
          servings: '4',
          source: 'Test Source'
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
        expect(recipe.title).toBe('Mapped Recipe');
        expect(recipe.description).toBe('A test recipe');
        expect(recipe.ingredients).toHaveLength(1);
        expect(recipe.directions).toHaveLength(1);
        expect(recipe.tags).toHaveLength(1);
        expect(recipe.category).toBe(RecipeCategory.MainCourse);
        expect(recipe.source).toBe('Test Source');
      }
    });
  });
});
