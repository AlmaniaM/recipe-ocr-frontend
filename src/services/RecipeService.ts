/**
 * Recipe Service
 * 
 * High-level service for recipe operations including advanced search and tag management.
 * Provides a clean interface between the presentation layer and API client.
 */

import { RecipeApiClient } from '../services/api/RecipeApiClient';
import { AdvancedSearchRequest, AdvancedSearchResponse, TagDto, CreateTagRequest, CreateTagResponse } from '../services/api/types';
import { Recipe } from '../types/Recipe';
import { RecipeCategory } from '../domain/enums/RecipeCategory';

export interface SearchFilters {
  searchText: string;
  category: RecipeCategory | null;
  tags: string[];
  minPrepTime: number | null;
  maxPrepTime: number | null;
  minCookTime: number | null;
  maxCookTime: number | null;
}

export interface AdvancedSearchResult {
  recipes: Recipe[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class RecipeService {
  private apiClient: RecipeApiClient;

  constructor(apiClient: RecipeApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Perform advanced search with filters
   */
  async advancedSearch(filters: SearchFilters, page: number = 0, pageSize: number = 50): Promise<AdvancedSearchResult> {
    try {
      const request: AdvancedSearchRequest = {
        searchText: filters.searchText || undefined,
        category: filters.category || undefined,
        tags: filters.tags.length > 0 ? filters.tags : undefined,
        minPrepTime: filters.minPrepTime || undefined,
        maxPrepTime: filters.maxPrepTime || undefined,
        minCookTime: filters.minCookTime || undefined,
        maxCookTime: filters.maxCookTime || undefined,
        page,
        pageSize,
        sortBy: 'CreatedAt',
        sortDirection: 'Descending',
      };

      const response = await this.apiClient.advancedSearchRecipes(request);
      
      // Convert API response to frontend models
      const recipes = this.convertApiRecipesToRecipes(response.items);
      
      return {
        recipes,
        totalCount: response.totalCount,
        page: response.page,
        pageSize: response.pageSize,
        hasNextPage: response.hasNextPage,
        hasPreviousPage: response.hasPreviousPage,
      };
    } catch (error) {
      console.error('Advanced search failed:', error);
      throw error;
    }
  }

  /**
   * Get all tags with optional search
   */
  async getTags(search?: string): Promise<TagDto[]> {
    try {
      return await this.apiClient.getTags({ search });
    } catch (error) {
      console.error('Get tags failed:', error);
      throw error;
    }
  }

  /**
   * Create a new tag
   */
  async createTag(name: string, color?: string): Promise<CreateTagResponse> {
    try {
      const request: CreateTagRequest = { name, color };
      return await this.apiClient.createTag(request);
    } catch (error) {
      console.error('Create tag failed:', error);
      throw error;
    }
  }

  /**
   * Convert API recipe DTOs to frontend Recipe models
   */
  private convertApiRecipesToRecipes(apiRecipes: any[]): Recipe[] {
    return apiRecipes.map(apiRecipe => ({
      id: apiRecipe.id,
      title: apiRecipe.title,
      description: apiRecipe.description,
      ingredients: apiRecipe.ingredients?.map((ing: any) => ({
        id: ing.id,
        text: ing.text,
        amount: ing.amount,
        unit: ing.unit,
        name: ing.name,
      })) || [],
      instructions: apiRecipe.directions?.map((dir: any) => dir.text) || [],
      prepTime: this.convertTimeRangeToMinutes(apiRecipe.prepTime),
      cookTime: this.convertTimeRangeToMinutes(apiRecipe.cookTime),
      servings: apiRecipe.servings?.value,
      source: apiRecipe.source,
      category: apiRecipe.category,
      tags: apiRecipe.tags?.map((tag: any) => tag.name) || [],
      imageUrl: apiRecipe.imageUrl,
      createdAt: new Date(apiRecipe.createdAt),
      updatedAt: new Date(apiRecipe.updatedAt),
      isLocal: false,
    }));
  }

  /**
   * Convert time range DTO to minutes
   */
  private convertTimeRangeToMinutes(timeRange: any): number | undefined {
    if (!timeRange) return undefined;
    
    const hours = timeRange.hours || 0;
    const minutes = timeRange.minutes || 0;
    return hours * 60 + minutes;
  }
}
