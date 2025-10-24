import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/di/types';
import { IRecipeRepository } from '../../ports/IRecipeRepository';
import { Recipe } from '../../../domain/entities/Recipe';
import { RecipeId } from '../../../domain/valueObjects/RecipeId';
import { Result } from '../../../domain/common/Result';

/**
 * Get Recipe Use Case
 * 
 * Handles retrieving a single recipe by ID.
 */
@injectable()
export class GetRecipeUseCase {
  constructor(
    @inject(TYPES.RecipeRepository) private recipeRepository: IRecipeRepository
  ) {}

  /**
   * Gets a recipe by ID
   * @param id - The recipe ID
   * @returns Promise containing the recipe or error
   */
  async execute(id: string): Promise<Result<Recipe | null>> {
    try {
      // Validate ID format
      const recipeIdResult = RecipeId.from(id);
      if (!recipeIdResult.isSuccess) {
        return Result.failure(recipeIdResult.error);
      }

      const recipeId = recipeIdResult.value;

      // Check if recipe exists
      const existsResult = await this.recipeRepository.exists(recipeId);
      if (!existsResult.isSuccess) {
        return Result.failure(existsResult.error);
      }

      if (!existsResult.value) {
        return Result.success(null);
      }

      // Get recipe from repository
      const recipeResult = await this.recipeRepository.findById(recipeId);
      if (!recipeResult.isSuccess) {
        return Result.failure(recipeResult.error);
      }

      return Result.success(recipeResult.value);
    } catch (error) {
      return Result.failure(`Failed to get recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
