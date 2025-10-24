/**
 * Recipe Parsing API Client Tests
 * 
 * Comprehensive unit tests for the RecipeParsingApiClient class
 * including AI-powered recipe parsing and text extraction.
 */

import { RecipeParsingApiClient } from '../RecipeParsingApiClient';
import { ApiError, ApiErrorType } from '../types';
import { ParsedRecipe } from '../../../types/Recipe';

describe('RecipeParsingApiClient', () => {
  let parsingApiClient: RecipeParsingApiClient;

  beforeEach(() => {
    parsingApiClient = new RecipeParsingApiClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('parseRecipe', () => {
    it('should parse recipe text', async () => {
      const request = {
        text: 'Chocolate Cake\n\nIngredients:\n- 2 cups flour\n- 1 cup sugar\n- 3 eggs\n\nInstructions:\n1. Mix ingredients\n2. Bake at 350°F for 30 minutes',
        language: 'en',
        parseMode: 'standard' as const,
      };

      const mockResponse = {
        title: 'Chocolate Cake',
        description: 'A delicious chocolate cake recipe',
        ingredients: [
          { text: '2 cups flour', amount: '2', unit: 'cups', name: 'flour', order: 1 },
          { text: '1 cup sugar', amount: '1', unit: 'cup', name: 'sugar', order: 2 },
          { text: '3 eggs', amount: '3', unit: '', name: 'eggs', order: 3 },
        ],
        instructions: [
          { text: 'Mix ingredients', isListItem: true, order: 1 },
          { text: 'Bake at 350°F for 30 minutes', isListItem: true, order: 2 },
        ],
        prepTimeMinutes: 15,
        cookTimeMinutes: 30,
        servings: 8,
        category: 'Dessert',
        tags: ['chocolate', 'cake', 'dessert'],
        source: 'User Input',
        notes: 'Great for special occasions',
        confidence: 0.95,
        isSuccess: true,
      };

      jest.spyOn(parsingApiClient, 'post').mockResolvedValue(mockResponse);

      const result = await parsingApiClient.parseRecipe(request);

      expect(parsingApiClient.post).toHaveBeenCalledWith('/api/recipes/parse', request, undefined);
      expect(result).toEqual({
        title: 'Chocolate Cake',
        description: 'A delicious chocolate cake recipe',
        ingredients: ['2 cups flour', '1 cup sugar', '3 eggs'],
        instructions: ['Mix ingredients', 'Bake at 350°F for 30 minutes'],
        prepTime: 15,
        cookTime: 30,
        servings: 8,
        confidence: 0.95,
      });
    });

    it('should handle parsing errors', async () => {
      const request = {
        text: 'Invalid recipe text',
        language: 'en',
      };

      const apiError = new ApiError('Parsing failed', ApiErrorType.SERVER_ERROR, 500);
      jest.spyOn(parsingApiClient, 'post').mockRejectedValue(apiError);

      await expect(parsingApiClient.parseRecipe(request)).rejects.toThrow(ApiError);
    });
  });

  describe('parseRecipeWithImage', () => {
    it('should parse recipe with image context', async () => {
      const request = {
        text: 'Recipe from image',
        imageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
        imageFormat: 'jpeg',
        language: 'en',
        parseMode: 'detailed' as const,
      };

      const mockResponse = {
        title: 'Recipe from Image',
        description: 'Parsed from image',
        ingredients: [
          { text: '2 cups flour', amount: '2', unit: 'cups', name: 'flour', order: 1 },
        ],
        instructions: [
          { text: 'Mix ingredients', isListItem: true, order: 1 },
        ],
        confidence: 0.88,
        isSuccess: true,
      };

      jest.spyOn(parsingApiClient, 'post').mockResolvedValue(mockResponse);

      const result = await parsingApiClient.parseRecipeWithImage(request);

      expect(parsingApiClient.post).toHaveBeenCalledWith('/api/recipes/parse/with-image', request, undefined);
      expect(result.title).toBe('Recipe from Image');
    });
  });

  describe('parseRecipesBatch', () => {
    it('should parse multiple recipes in batch', async () => {
      const request = {
        texts: [
          'Chocolate Cake\nIngredients: 2 cups flour, 1 cup sugar\nInstructions: Mix and bake',
          'Apple Pie\nIngredients: 6 apples, 2 cups flour\nInstructions: Make crust and fill',
        ],
        language: 'en',
        parseMode: 'standard' as const,
      };

      const mockResponse = {
        results: [
          {
            title: 'Chocolate Cake',
            ingredients: [{ text: '2 cups flour', amount: '2', unit: 'cups', name: 'flour', order: 1 }],
            instructions: [{ text: 'Mix and bake', isListItem: true, order: 1 }],
            confidence: 0.9,
            isSuccess: true,
          },
          {
            title: 'Apple Pie',
            ingredients: [{ text: '6 apples', amount: '6', unit: '', name: 'apples', order: 1 }],
            instructions: [{ text: 'Make crust and fill', isListItem: true, order: 1 }],
            confidence: 0.85,
            isSuccess: true,
          },
        ],
        totalProcessed: 2,
        successCount: 2,
        failureCount: 0,
      };

      jest.spyOn(parsingApiClient, 'post').mockResolvedValue(mockResponse);

      const result = await parsingApiClient.parseRecipesBatch(request);

      expect(parsingApiClient.post).toHaveBeenCalledWith('/api/recipes/parse/batch', request, undefined);
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Chocolate Cake');
      expect(result[1].title).toBe('Apple Pie');
    });
  });

  describe('parseRecipeFromOCR', () => {
    it('should parse recipe from OCR text', async () => {
      const ocrText = 'Chocolate Cake\nIngredients: 2 cups flour, 1 cup sugar';
      const imageUri = 'file:///path/to/image.jpg';

      // Mock the processImageForParsing method
      const processImageSpy = jest.spyOn(parsingApiClient as any, 'processImageForParsing')
        .mockResolvedValue('processed-image-url');

      const mockResponse = {
        title: 'Chocolate Cake',
        ingredients: [{ text: '2 cups flour', amount: '2', unit: 'cups', name: 'flour', order: 1 }],
        instructions: [{ text: 'Mix ingredients', isListItem: true, order: 1 }],
        confidence: 0.9,
        isSuccess: true,
      };

      jest.spyOn(parsingApiClient, 'post').mockResolvedValue(mockResponse);

      const result = await parsingApiClient.parseRecipeFromOCR(ocrText, imageUri);

      expect(processImageSpy).toHaveBeenCalledWith(imageUri);
      expect(result.title).toBe('Chocolate Cake');
    });

    it('should parse recipe without image', async () => {
      const ocrText = 'Chocolate Cake\nIngredients: 2 cups flour, 1 cup sugar';

      const mockResponse = {
        title: 'Chocolate Cake',
        ingredients: [{ text: '2 cups flour', amount: '2', unit: 'cups', name: 'flour', order: 1 }],
        instructions: [{ text: 'Mix ingredients', isListItem: true, order: 1 }],
        confidence: 0.9,
        isSuccess: true,
      };

      jest.spyOn(parsingApiClient, 'post').mockResolvedValue(mockResponse);

      const result = await parsingApiClient.parseRecipeFromOCR(ocrText);

      expect(result.title).toBe('Chocolate Cake');
    });
  });

  describe('parseRecipeWithContext', () => {
    it('should parse recipe with additional context', async () => {
      const text = 'Pasta recipe with tomatoes and basil';
      const context = {
        cuisine: 'Italian',
        dietary: ['vegetarian', 'gluten-free'],
        difficulty: 'easy' as const,
        cookingMethod: 'stovetop',
        occasion: 'dinner',
      };

      const mockResponse = {
        title: 'Italian Pasta',
        ingredients: [{ text: 'pasta', amount: '1', unit: 'lb', name: 'pasta', order: 1 }],
        instructions: [{ text: 'Cook pasta', isListItem: true, order: 1 }],
        confidence: 0.92,
        isSuccess: true,
      };

      jest.spyOn(parsingApiClient, 'post').mockResolvedValue(mockResponse);

      const result = await parsingApiClient.parseRecipeWithContext(text, context);

      expect(parsingApiClient.post).toHaveBeenCalledWith('/api/recipes/parse', expect.objectContaining({
        text: expect.stringContaining('Cuisine: Italian'),
        language: 'en',
        parseMode: 'detailed',
        includeNutrition: true,
        includeTiming: true,
      }), undefined);
      expect(result.title).toBe('Italian Pasta');
    });
  });

  describe('getParsingSuggestions', () => {
    it('should get parsing suggestions for incomplete recipe', async () => {
      const partialText = 'Chocolate Cake\nIngredients: 2 cups flour';

      const mockResponse = {
        suggestions: [
          'Add sugar to ingredients',
          'Include cooking instructions',
          'Specify baking temperature',
        ],
        confidence: 0.7,
        missingElements: ['sugar', 'instructions', 'temperature'],
      };

      jest.spyOn(parsingApiClient, 'post').mockResolvedValue(mockResponse);

      const result = await parsingApiClient.getParsingSuggestions(partialText);

      expect(parsingApiClient.post).toHaveBeenCalledWith('/api/recipes/parse/suggestions', {
        text: partialText,
      }, undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('validateParsedRecipe', () => {
    it('should validate parsed recipe structure', async () => {
      const parsedRecipe: ParsedRecipe = {
        title: 'Test Recipe',
        ingredients: ['2 cups flour', '1 cup sugar'],
        instructions: ['Mix ingredients', 'Bake for 30 minutes'],
        prepTime: 15,
        cookTime: 30,
        servings: 8,
        confidence: 0.9,
      };

      const mockResponse = {
        isValid: true,
        errors: [],
        warnings: ['Consider adding more detailed instructions'],
        suggestions: ['Add cooking temperature'],
      };

      jest.spyOn(parsingApiClient, 'post').mockResolvedValue(mockResponse);

      const result = await parsingApiClient.validateParsedRecipe(parsedRecipe);

      expect(parsingApiClient.post).toHaveBeenCalledWith('/api/recipes/parse/validate', parsedRecipe, undefined);
      expect(result.isValid).toBe(true);
    });
  });

  describe('getSupportedLanguages', () => {
    it('should get supported languages', async () => {
      const mockLanguages = ['en', 'es', 'fr', 'de', 'it'];

      jest.spyOn(parsingApiClient, 'get').mockResolvedValue(mockLanguages);

      const result = await parsingApiClient.getSupportedLanguages();

      expect(parsingApiClient.get).toHaveBeenCalledWith('/api/recipes/parse/languages', undefined);
      expect(result).toEqual(mockLanguages);
    });
  });

  describe('checkHealth', () => {
    it('should return true when service is healthy', async () => {
      jest.spyOn(parsingApiClient, 'get').mockResolvedValue(undefined);

      const result = await parsingApiClient.checkHealth();

      expect(parsingApiClient.get).toHaveBeenCalledWith('/api/recipes/parse/health', undefined);
      expect(result).toBe(true);
    });

    it('should return false when service is unhealthy', async () => {
      const apiError = new ApiError('Service unavailable', ApiErrorType.SERVER_ERROR, 503);
      jest.spyOn(parsingApiClient, 'get').mockRejectedValue(apiError);

      const result = await parsingApiClient.checkHealth();

      expect(result).toBe(false);
    });
  });

  describe('mapToParsedRecipe', () => {
    it('should map ParseRecipeResponse to ParsedRecipe', () => {
      const response = {
        title: 'Test Recipe',
        description: 'A test recipe',
        ingredients: [
          { text: '2 cups flour', amount: '2', unit: 'cups', name: 'flour', order: 1 },
          { text: '1 cup sugar', amount: '1', unit: 'cup', name: 'sugar', order: 2 },
        ],
        instructions: [
          { text: 'Mix ingredients', isListItem: true, order: 1 },
          { text: 'Bake for 30 minutes', isListItem: true, order: 2 },
        ],
        prepTimeMinutes: 15,
        cookTimeMinutes: 30,
        servings: 8,
        confidence: 0.9,
        isSuccess: true,
      };

      const result = (parsingApiClient as any).mapToParsedRecipe(response);

      expect(result).toEqual({
        title: 'Test Recipe',
        description: 'A test recipe',
        ingredients: ['2 cups flour', '1 cup sugar'],
        instructions: ['Mix ingredients', 'Bake for 30 minutes'],
        prepTime: 15,
        cookTime: 30,
        servings: 8,
        confidence: 0.9,
      });
    });
  });

  describe('processImageForParsing', () => {
    it('should return HTTP URLs as-is', async () => {
      const imageUri = 'http://example.com/image.jpg';
      const result = await (parsingApiClient as any).processImageForParsing(imageUri);
      expect(result).toBe(imageUri);
    });

    it('should handle local file URIs', async () => {
      const imageUri = 'file:///path/to/image.jpg';
      const result = await (parsingApiClient as any).processImageForParsing(imageUri);
      expect(result).toBe(imageUri);
    });
  });

  describe('buildContextualText', () => {
    it('should build contextual text with all context options', () => {
      const text = 'Original recipe text';
      const context = {
        cuisine: 'Italian',
        dietary: ['vegetarian', 'gluten-free'],
        difficulty: 'easy' as const,
        cookingMethod: 'stovetop',
        occasion: 'dinner',
      };

      const result = (parsingApiClient as any).buildContextualText(text, context);

      expect(result).toContain('Cuisine: Italian');
      expect(result).toContain('Dietary: vegetarian, gluten-free');
      expect(result).toContain('Difficulty: easy');
      expect(result).toContain('Cooking Method: stovetop');
      expect(result).toContain('Occasion: dinner');
      expect(result).toContain('Original recipe text');
    });

    it('should handle partial context', () => {
      const text = 'Original recipe text';
      const context = {
        cuisine: 'Italian',
        difficulty: 'easy' as const,
      };

      const result = (parsingApiClient as any).buildContextualText(text, context);

      expect(result).toContain('Cuisine: Italian');
      expect(result).toContain('Difficulty: easy');
      expect(result).toContain('Original recipe text');
    });
  });
});