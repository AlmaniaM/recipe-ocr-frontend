/**
 * Recipe API Client
 * 
 * Handles all API communication related to recipe operations
 * including CRUD operations, search, OCR, and parsing.
 */

import { BaseApiClient } from './BaseApiClient';
import { RequestOptions, PaginatedResponse, AdvancedSearchRequest, AdvancedSearchResponse, TagDto, CreateTagRequest, CreateTagResponse, GetTagsRequest, GetTagsResponse } from './types';
import { API_ENDPOINTS } from './types';
import { Recipe, Ingredient, OCRResult, ParsedRecipe } from '../../types/Recipe';

// API-specific DTOs that match the backend
export interface RecipeDto {
  id: string;
  title: string;
  description?: string;
  ingredients: IngredientDto[];
  instructions: string[];
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  source?: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  isLocal: boolean;
}

export interface IngredientDto {
  id: string;
  text: string;
  amount?: string;
  unit?: string;
  name?: string;
}

export interface CreateRecipeRequest {
  title: string;
  description?: string;
  ingredients: IngredientDto[];
  instructions: string[];
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  source?: string;
  category: string;
  tags: string[];
  imageUrl?: string;
}

export interface UpdateRecipeRequest extends CreateRecipeRequest {
  id: string;
}

export interface GetRecipesRequest {
  pageNumber?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  tags?: string[];
}

export interface SearchRecipesRequest {
  q: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ExtractTextRequest {
  imageBase64: string;
  imageFormat?: string;
}

export interface ParseRecipeRequest {
  text: string;
  imageUrl?: string;
}

export interface GetRecipesResponse {
  items: RecipeDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SearchRecipesResponse {
  items: RecipeDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface RecipeCountResponse {
  count: number;
}

// Recipe API Client
export class RecipeApiClient extends BaseApiClient {
  /**
   * Get all recipes with pagination and filtering
   */
  async getRecipes(request: GetRecipesRequest = {}): Promise<GetRecipesResponse> {
    try {
      const queryParams = {
        pageNumber: request.pageNumber || 1,
        pageSize: request.pageSize || 10,
        ...(request.category && { category: request.category }),
        ...(request.search && { search: request.search }),
        ...(request.tags && { tags: request.tags.join(',') }),
      };

      const queryString = this.buildQueryString(queryParams);
      const response = await this.get<GetRecipesResponse>(
        `${API_ENDPOINTS.RECIPES.BASE}${queryString}`
      );
      
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get a single recipe by ID
   */
  async getRecipe(id: string, options?: RequestOptions): Promise<RecipeDto> {
    try {
      const response = await this.get<RecipeDto>(
        API_ENDPOINTS.RECIPES.BY_ID(id),
        options
      );
      
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Search recipes by query
   */
  async searchRecipes(request: SearchRecipesRequest): Promise<SearchRecipesResponse> {
    try {
      const queryParams = {
        q: request.q,
        pageNumber: request.pageNumber || 1,
        pageSize: request.pageSize || 10,
      };

      const queryString = this.buildQueryString(queryParams);
      const response = await this.get<SearchRecipesResponse>(
        `${API_ENDPOINTS.RECIPES.SEARCH}${queryString}`
      );
      
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Advanced search recipes with multiple filters
   */
  async advancedSearchRecipes(request: AdvancedSearchRequest): Promise<AdvancedSearchResponse> {
    try {
      const response = await this.post<AdvancedSearchResponse>(
        API_ENDPOINTS.RECIPES.ADVANCED_SEARCH,
        request
      );
      
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Create a new recipe
   */
  async createRecipe(request: CreateRecipeRequest, options?: RequestOptions): Promise<RecipeDto> {
    try {
      const response = await this.post<RecipeDto>(
        API_ENDPOINTS.RECIPES.BASE,
        request,
        options
      );
      
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Update an existing recipe
   */
  async updateRecipe(id: string, request: UpdateRecipeRequest, options?: RequestOptions): Promise<RecipeDto> {
    try {
      const response = await this.put<RecipeDto>(
        API_ENDPOINTS.RECIPES.BY_ID(id),
        request,
        options
      );
      
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Delete a recipe
   */
  async deleteRecipe(id: string, options?: RequestOptions): Promise<void> {
    try {
      await this.delete<void>(
        API_ENDPOINTS.RECIPES.BY_ID(id),
        options
      );
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get total recipe count
   */
  async getRecipeCount(options?: RequestOptions): Promise<number> {
    try {
      const response = await this.get<RecipeCountResponse>(
        API_ENDPOINTS.RECIPES.COUNT,
        options
      );
      
      return response.count;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Extract text from image using OCR
   */
  async extractTextFromImage(request: ExtractTextRequest, options?: RequestOptions): Promise<OCRResult> {
    try {
      const response = await this.post<OCRResult>(
        API_ENDPOINTS.RECIPES.OCR,
        request,
        options
      );
      
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Parse recipe text using AI
   */
  async parseRecipe(request: ParseRecipeRequest, options?: RequestOptions): Promise<ParsedRecipe> {
    try {
      const response = await this.post<ParsedRecipe>(
        API_ENDPOINTS.RECIPES.PARSE,
        request,
        options
      );
      
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Convert RecipeDto to Recipe (frontend model)
   */
  static toRecipe(dto: RecipeDto): Recipe {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      ingredients: dto.ingredients.map(ing => ({
        id: ing.id,
        text: ing.text,
        amount: ing.amount,
        unit: ing.unit,
        name: ing.name,
      })),
      instructions: dto.instructions,
      prepTime: dto.prepTimeMinutes,
      cookTime: dto.cookTimeMinutes,
      servings: dto.servings,
      source: dto.source,
      category: dto.category,
      tags: dto.tags,
      imageUrl: dto.imageUrl,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
      isLocal: dto.isLocal,
    };
  }

  /**
   * Convert Recipe (frontend model) to CreateRecipeRequest
   */
  static toCreateRequest(recipe: Recipe): CreateRecipeRequest {
    return {
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients.map(ing => ({
        id: ing.id,
        text: ing.text,
        amount: ing.amount,
        unit: ing.unit,
        name: ing.name,
      })),
      instructions: Array.isArray(recipe.instructions) 
        ? recipe.instructions 
        : [recipe.instructions],
      prepTimeMinutes: recipe.prepTime,
      cookTimeMinutes: recipe.cookTime,
      servings: recipe.servings,
      source: recipe.source,
      category: recipe.category,
      tags: recipe.tags,
      imageUrl: recipe.imageUrl,
    };
  }

  /**
   * Convert Recipe (frontend model) to UpdateRecipeRequest
   */
  static toUpdateRequest(recipe: Recipe): UpdateRecipeRequest {
    return {
      id: recipe.id,
      ...RecipeApiClient.toCreateRequest(recipe),
    };
  }

  /**
   * Get all tags with optional search
   */
  async getTags(request: GetTagsRequest = {}): Promise<TagDto[]> {
    try {
      const queryParams = {
        ...(request.search && { search: request.search }),
      };

      const queryString = this.buildQueryString(queryParams);
      const response = await this.get<TagDto[]>(
        `${API_ENDPOINTS.RECIPES.TAGS}${queryString}`
      );
      
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Create a new tag
   */
  async createTag(request: CreateTagRequest, options?: RequestOptions): Promise<CreateTagResponse> {
    try {
      const response = await this.post<CreateTagResponse>(
        API_ENDPOINTS.RECIPES.TAGS,
        request,
        options
      );
      
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }
}
