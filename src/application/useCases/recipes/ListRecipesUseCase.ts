import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/di/types';
import { IRecipeRepository } from '../../ports/IRecipeRepository';
import { Recipe } from '../../../domain/entities/Recipe';
import { RecipeCategory } from '../../../domain/enums/RecipeCategory';
import { Result } from '../../../domain/common/Result';

/**
 * List Recipes Use Case
 * 
 * Handles retrieving lists of recipes with various filtering options.
 */
@injectable()
export class ListRecipesUseCase {
  constructor(
    @inject(TYPES.RecipeRepository) private recipeRepository: IRecipeRepository
  ) {}

  /**
   * Gets all recipes
   * @returns Promise containing array of recipes or error
   */
  async execute(): Promise<Result<Recipe[]>> {
    try {
      return await this.recipeRepository.findAll();
    } catch (error) {
      return Result.failure(`Failed to list recipes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets recipes by category
   * @param category - The recipe category
   * @returns Promise containing array of recipes or error
   */
  async executeByCategory(category: RecipeCategory): Promise<Result<Recipe[]>> {
    try {
      return await this.recipeRepository.findByCategory(category);
    } catch (error) {
      return Result.failure(`Failed to list recipes by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Searches recipes by query
   * @param query - The search query
   * @returns Promise containing array of recipes or error
   */
  async executeSearch(query: string): Promise<Result<Recipe[]>> {
    try {
      if (!query || query.trim().length === 0) {
        return Result.failure('Search query cannot be empty');
      }

      return await this.recipeRepository.search(query.trim());
    } catch (error) {
      return Result.failure(`Failed to search recipes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets recipes with pagination
   * @param page - The page number (1-based)
   * @param pageSize - The number of items per page
   * @returns Promise containing paginated results or error
   */
  async executeWithPagination(page: number, pageSize: number): Promise<Result<{
    recipes: Recipe[];
    totalCount: number;
    hasNextPage: boolean;
  }>> {
    try {
      if (page < 1) {
        return Result.failure('Page number must be greater than 0');
      }

      if (pageSize < 1 || pageSize > 100) {
        return Result.failure('Page size must be between 1 and 100');
      }

      return await this.recipeRepository.findWithPagination(page, pageSize);
    } catch (error) {
      return Result.failure(`Failed to list recipes with pagination: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets recipes by tags
   * @param tagIds - Array of tag IDs
   * @returns Promise containing array of recipes or error
   */
  async executeByTags(tagIds: string[]): Promise<Result<Recipe[]>> {
    try {
      if (!tagIds || tagIds.length === 0) {
        return Result.failure('Tag IDs cannot be empty');
      }

      return await this.recipeRepository.findByTags(tagIds);
    } catch (error) {
      return Result.failure(`Failed to list recipes by tags: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
