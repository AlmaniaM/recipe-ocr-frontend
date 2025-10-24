import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/di/types';
import { IRecipeRepository } from '../../ports/IRecipeRepository';
import { Recipe } from '../../../domain/entities/Recipe';
import { Result } from '../../../domain/common/Result';
import { RecipeId } from '../../../domain/valueObjects/RecipeId';

/**
 * Delete Recipe Use Case
 * 
 * Handles the deletion of recipes following Clean Architecture principles.
 * This use case encapsulates the business logic for recipe deletion.
 */
@injectable()
export class DeleteRecipeUseCase {
  constructor(
    @inject(TYPES.RecipeRepository) private recipeRepository: IRecipeRepository
  ) {}

  /**
   * Deletes a recipe by ID
   * @param id - The recipe ID
   * @param permanent - Whether to permanently delete or just archive
   * @returns Promise containing success status or error
   */
  async execute(id: string, permanent: boolean = false): Promise<Result<void>> {
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
        return Result.failure('Recipe not found');
      }

      if (permanent) {
        // Permanently delete the recipe
        const deleteResult = await this.recipeRepository.delete(recipeId);
        if (!deleteResult.isSuccess) {
          return Result.failure(deleteResult.error);
        }
      } else {
        // Archive the recipe instead of permanent deletion
        const recipeResult = await this.recipeRepository.findById(recipeId);
        if (!recipeResult.isSuccess) {
          return Result.failure(recipeResult.error);
        }

        if (!recipeResult.value) {
          return Result.failure('Recipe not found');
        }

        const recipe = recipeResult.value;
        
        // Check if already archived
        if (recipe.isArchived) {
          return Result.failure('Recipe is already archived');
        }

        // Archive the recipe
        const archiveResult = recipe.archive();
        if (!archiveResult.isSuccess) {
          return Result.failure(archiveResult.error);
        }

        // Save the archived recipe
        const saveResult = await this.recipeRepository.save(archiveResult.value);
        if (!saveResult.isSuccess) {
          return Result.failure(saveResult.error);
        }
      }

      return Result.successEmpty();
    } catch (error) {
      return Result.failure(`Failed to delete recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deletes multiple recipes by IDs
   * @param ids - Array of recipe IDs
   * @param permanent - Whether to permanently delete or just archive
   * @returns Promise containing success status and any errors
   */
  async executeMultiple(ids: string[], permanent: boolean = false): Promise<Result<{
    successCount: number;
    errors: string[];
  }>> {
    try {
      if (!ids || ids.length === 0) {
        return Result.failure('Recipe IDs are required');
      }

      let successCount = 0;
      const errors: string[] = [];

      for (const id of ids) {
        const result = await this.execute(id, permanent);
        if (result.isSuccess) {
          successCount++;
        } else {
          errors.push(`Failed to delete recipe ${id}: ${result.error}`);
        }
      }

      if (successCount === 0) {
        return Result.failure(`All deletions failed: ${errors.join(', ')}`);
      }

      return Result.success({
        successCount,
        errors
      });
    } catch (error) {
      return Result.failure(`Failed to delete multiple recipes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Restores an archived recipe
   * @param id - The recipe ID
   * @returns Promise containing success status or error
   */
  async restore(id: string): Promise<Result<Recipe>> {
    try {
      // Validate ID format
      const recipeIdResult = RecipeId.from(id);
      if (!recipeIdResult.isSuccess) {
        return Result.failure(recipeIdResult.error);
      }

      const recipeId = recipeIdResult.value;

      // Get the recipe
      const recipeResult = await this.recipeRepository.findById(recipeId);
      if (!recipeResult.isSuccess) {
        return Result.failure(recipeResult.error);
      }

      if (!recipeResult.value) {
        return Result.failure('Recipe not found');
      }

      const recipe = recipeResult.value;

      // Check if already unarchived
      if (!recipe.isArchived) {
        return Result.failure('Recipe is not archived');
      }

      // Unarchive the recipe
      const unarchiveResult = recipe.unarchive();
      if (!unarchiveResult.isSuccess) {
        return Result.failure(unarchiveResult.error);
      }

      // Save the unarchived recipe
      const saveResult = await this.recipeRepository.save(unarchiveResult.value);
      if (!saveResult.isSuccess) {
        return Result.failure(saveResult.error);
      }

      return Result.success(unarchiveResult.value);
    } catch (error) {
      return Result.failure(`Failed to restore recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
