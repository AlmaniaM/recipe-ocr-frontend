/**
 * Recipe API Client Tests
 * 
 * Comprehensive unit tests for the RecipeApiClient class
 * including CRUD operations, search, and data transformation.
 */

import { RecipeApiClient } from '../RecipeApiClient';
import { BaseApiClient } from '../BaseApiClient';
import { ApiError, ApiErrorType } from '../types';
import { Recipe, Ingredient } from '../../../types/Recipe';

// Mock the base class
jest.mock('../BaseApiClient');

describe('RecipeApiClient', () => {
  let recipeApiClient: RecipeApiClient;

  beforeEach(() => {
    recipeApiClient = new RecipeApiClient();
    
    // Mock the inherited methods directly on the instance
    jest.spyOn(recipeApiClient, 'get').mockResolvedValue({} as any);
    jest.spyOn(recipeApiClient, 'post').mockResolvedValue({} as any);
    jest.spyOn(recipeApiClient, 'put').mockResolvedValue({} as any);
    jest.spyOn(recipeApiClient, 'delete').mockResolvedValue(undefined);
    jest.spyOn(recipeApiClient, 'buildQueryString').mockImplementation((params) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(item => searchParams.append(key, String(item)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      const queryString = searchParams.toString();
      return queryString ? `?${queryString}` : '';
    });
    jest.spyOn(recipeApiClient, 'handleApiError').mockImplementation((error) => {
      throw error;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecipes', () => {
    it('should fetch recipes with default parameters', async () => {
      const mockResponse = {
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      (recipeApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await recipeApiClient.getRecipes();

      expect(recipeApiClient.get).toHaveBeenCalledWith('/api/recipes?pageNumber=1&pageSize=10');
      expect(result).toEqual(mockResponse);
    });

    it('should fetch recipes with custom parameters', async () => {
      const mockResponse = {
        items: [],
        totalCount: 0,
        pageNumber: 2,
        pageSize: 20,
        hasNextPage: false,
        hasPreviousPage: true,
      };

      (recipeApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const request = {
        pageNumber: 2,
        pageSize: 20,
        category: 'dessert',
        search: 'chocolate',
        tags: ['sweet', 'chocolate'],
      };

      const result = await recipeApiClient.getRecipes(request);

      expect(recipeApiClient.get).toHaveBeenCalledWith(
        '/api/recipes?pageNumber=2&pageSize=20&category=dessert&search=chocolate&tags=sweet%2Cchocolate'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const apiError = new ApiError(ApiErrorType.SERVER_ERROR, 'Server error', 500);
      (recipeApiClient.get as jest.Mock).mockRejectedValue(apiError);

      await expect(recipeApiClient.getRecipes()).rejects.toThrow(ApiError);
    });
  });

  describe('getRecipe', () => {
    it('should fetch a single recipe by ID', async () => {
      const mockRecipe = {
        id: '1',
        title: 'Test Recipe',
        description: 'A test recipe',
        ingredients: [],
        instructions: ['Step 1', 'Step 2'],
        prepTimeMinutes: 30,
        cookTimeMinutes: 60,
        servings: 4,
        source: 'Test Source',
        category: 'main',
        tags: ['test'],
        imageUrl: 'http://example.com/image.jpg',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        isLocal: false,
      };

      (recipeApiClient.get as jest.Mock).mockResolvedValue(mockRecipe);

      const result = await recipeApiClient.getRecipe('1');

      expect(recipeApiClient.get).toHaveBeenCalledWith('/api/recipes/1', undefined);
      expect(result).toEqual(mockRecipe);
    });

    it('should handle recipe not found', async () => {
      const apiError = new ApiError(ApiErrorType.NOT_FOUND_ERROR, 'Recipe not found', 404);
      (recipeApiClient.get as jest.Mock).mockRejectedValue(apiError);

      await expect(recipeApiClient.getRecipe('999')).rejects.toThrow(ApiError);
    });
  });

  describe('searchRecipes', () => {
    it('should search recipes with query', async () => {
      const mockResponse = {
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      (recipeApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const request = {
        q: 'chocolate cake',
        pageNumber: 1,
        pageSize: 10,
      };

      const result = await recipeApiClient.searchRecipes(request);

      expect(recipeApiClient.get).toHaveBeenCalledWith(
        '/api/recipes/search?q=chocolate+cake&pageNumber=1&pageSize=10'
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createRecipe', () => {
    it('should create a new recipe', async () => {
      const createRequest = {
        title: 'New Recipe',
        description: 'A new recipe',
        ingredients: [
          {
            id: '1',
            text: '1 cup flour',
            amount: '1',
            unit: 'cup',
            name: 'flour',
          },
        ],
        instructions: ['Mix ingredients', 'Bake for 30 minutes'],
        prepTimeMinutes: 15,
        cookTimeMinutes: 30,
        servings: 4,
        source: 'Test Source',
        category: 'main',
        tags: ['test'],
      };

      const mockResponse = {
        id: '1',
        ...createRequest,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        isLocal: false,
      };

      (recipeApiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await recipeApiClient.createRecipe(createRequest);

      expect(recipeApiClient.post).toHaveBeenCalledWith('/api/recipes', createRequest, undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateRecipe', () => {
    it('should update an existing recipe', async () => {
      const updateRequest = {
        id: '1',
        title: 'Updated Recipe',
        description: 'An updated recipe',
        ingredients: [],
        instructions: ['Updated step'],
        prepTimeMinutes: 20,
        cookTimeMinutes: 40,
        servings: 6,
        source: 'Updated Source',
        category: 'main',
        tags: ['updated'],
      };

      const mockResponse = {
        ...updateRequest,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
        isLocal: false,
      };

      (recipeApiClient.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await recipeApiClient.updateRecipe('1', updateRequest);

      expect(recipeApiClient.put).toHaveBeenCalledWith('/api/recipes/1', updateRequest, undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteRecipe', () => {
    it('should delete a recipe', async () => {
      (recipeApiClient.delete as jest.Mock).mockResolvedValue(undefined);

      await recipeApiClient.deleteRecipe('1');

      expect(recipeApiClient.delete).toHaveBeenCalledWith('/api/recipes/1', undefined);
    });
  });

  describe('getRecipeCount', () => {
    it('should get total recipe count', async () => {
      const mockResponse = { count: 42 };
      (recipeApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await recipeApiClient.getRecipeCount();

      expect(recipeApiClient.get).toHaveBeenCalledWith('/api/recipes/count', undefined);
      expect(result).toBe(42);
    });
  });

  describe('extractTextFromImage', () => {
    it('should extract text from image', async () => {
      const request = {
        imageBase64: 'base64data',
        imageFormat: 'jpeg',
      };

      const mockResponse = {
        text: 'Extracted text',
        confidence: 0.95,
        language: 'en',
        blocks: [],
      };

      (recipeApiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await recipeApiClient.extractTextFromImage(request);

      expect(recipeApiClient.post).toHaveBeenCalledWith('/api/recipes/ocr', request, undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('parseRecipe', () => {
    it('should parse recipe text', async () => {
      const request = {
        text: 'Recipe text to parse',
        imageUrl: 'http://example.com/image.jpg',
      };

      const mockResponse = {
        title: 'Parsed Recipe',
        description: 'A parsed recipe',
        ingredients: ['1 cup flour', '2 eggs'],
        instructions: ['Mix ingredients', 'Bake'],
        prepTime: 15,
        cookTime: 30,
        servings: 4,
        confidence: 0.9,
      };

      (recipeApiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await recipeApiClient.parseRecipe(request);

      expect(recipeApiClient.post).toHaveBeenCalledWith('/api/recipes/parse', request, undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Data transformation methods', () => {
    describe('toRecipe', () => {
      it('should convert RecipeDto to Recipe', () => {
        const dto = {
          id: '1',
          title: 'Test Recipe',
          description: 'A test recipe',
          ingredients: [
            {
              id: '1',
              text: '1 cup flour',
              amount: '1',
              unit: 'cup',
              name: 'flour',
            },
          ],
          instructions: ['Step 1', 'Step 2'],
          prepTimeMinutes: 30,
          cookTimeMinutes: 60,
          servings: 4,
          source: 'Test Source',
          category: 'main',
          tags: ['test'],
          imageUrl: 'http://example.com/image.jpg',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
          isLocal: false,
        };

        const result = RecipeApiClient.toRecipe(dto);

        expect(result).toEqual({
          id: '1',
          title: 'Test Recipe',
          description: 'A test recipe',
          ingredients: [
            {
              id: '1',
              text: '1 cup flour',
              amount: '1',
              unit: 'cup',
              name: 'flour',
            },
          ],
          instructions: ['Step 1', 'Step 2'],
          prepTime: 30,
          cookTime: 60,
          servings: 4,
          source: 'Test Source',
          category: 'main',
          tags: ['test'],
          imageUrl: 'http://example.com/image.jpg',
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-01T00:00:00Z'),
          isLocal: false,
        });
      });
    });

    describe('toCreateRequest', () => {
      it('should convert Recipe to CreateRecipeRequest', () => {
        const recipe: Recipe = {
          id: '1',
          title: 'Test Recipe',
          description: 'A test recipe',
          ingredients: [
            {
              id: '1',
              text: '1 cup flour',
              amount: '1',
              unit: 'cup',
              name: 'flour',
            },
          ],
          instructions: ['Step 1', 'Step 2'],
          prepTime: 30,
          cookTime: 60,
          servings: 4,
          source: 'Test Source',
          category: 'main',
          tags: ['test'],
          imageUrl: 'http://example.com/image.jpg',
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-01T00:00:00Z'),
          isLocal: false,
        };

        const result = RecipeApiClient.toCreateRequest(recipe);

        expect(result).toEqual({
          title: 'Test Recipe',
          description: 'A test recipe',
          ingredients: [
            {
              id: '1',
              text: '1 cup flour',
              amount: '1',
              unit: 'cup',
              name: 'flour',
            },
          ],
          instructions: ['Step 1', 'Step 2'],
          prepTimeMinutes: 30,
          cookTimeMinutes: 60,
          servings: 4,
          source: 'Test Source',
          category: 'main',
          tags: ['test'],
          imageUrl: 'http://example.com/image.jpg',
        });
      });

      it('should handle string instructions', () => {
        const recipe: Recipe = {
          id: '1',
          title: 'Test Recipe',
          ingredients: [],
          instructions: 'Single instruction string',
          category: 'main',
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isLocal: false,
        };

        const result = RecipeApiClient.toCreateRequest(recipe);

        expect(result.instructions).toEqual(['Single instruction string']);
      });
    });

    describe('toUpdateRequest', () => {
      it('should convert Recipe to UpdateRecipeRequest', () => {
        const recipe: Recipe = {
          id: '1',
          title: 'Test Recipe',
          ingredients: [],
          instructions: ['Step 1'],
          category: 'main',
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isLocal: false,
        };

        const result = RecipeApiClient.toUpdateRequest(recipe);

        expect(result).toEqual({
          id: '1',
          title: 'Test Recipe',
          ingredients: [],
          instructions: ['Step 1'],
          category: 'main',
          tags: [],
        });
      });
    });
  });
});
