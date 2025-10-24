import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/di/types';
import { IRecipeBookRepository } from '../../ports/IRecipeBookRepository';
import { RecipeBook } from '../../../domain/entities/RecipeBook';
import { UpdateRecipeBookDto } from '../../dto/RecipeBookDto';
import { Result } from '../../../domain/common/Result';
import { RecipeBookId } from '../../../domain/valueObjects/RecipeBookId';
import { RecipeId } from '../../../domain/valueObjects/RecipeId';

/**
 * Update Recipe Book Use Case
 * 
 * Handles updating existing recipe books with proper validation and mapping.
 */
@injectable()
export class UpdateRecipeBookUseCase {
  constructor(
    @inject(TYPES.RecipeBookRepository) private recipeBookRepository: IRecipeBookRepository
  ) {}

  /**
   * Updates a recipe book
   * @param updateRecipeBookDto - The recipe book update data
   * @returns Promise containing the updated recipe book or error
   */
  async execute(updateRecipeBookDto: UpdateRecipeBookDto): Promise<Result<RecipeBook>> {
    try {
      const validationResult = this.validateUpdateRecipeBookDto(updateRecipeBookDto);
      if (!validationResult.isSuccess) {
        return Result.failure(validationResult.error);
      }

      const recipeBookIdResult = RecipeBookId.from(updateRecipeBookDto.id);
      if (!recipeBookIdResult.isSuccess) {
        return Result.failure(recipeBookIdResult.error);
      }
      const recipeBookId = recipeBookIdResult.value;

      const existingRecipeBookResult = await this.recipeBookRepository.findById(recipeBookId);
      if (!existingRecipeBookResult.isSuccess) {
        return Result.failure(existingRecipeBookResult.error);
      }
      if (!existingRecipeBookResult.value) {
        return Result.failure(`Recipe book with ID ${updateRecipeBookDto.id} not found`);
      }

      let recipeBook = existingRecipeBookResult.value;

      // Update title if provided
      if (updateRecipeBookDto.title !== undefined) {
        const updateResult = recipeBook.updateTitle(updateRecipeBookDto.title);
        if (!updateResult.isSuccess) return Result.failure(updateResult.error);
        recipeBook = updateResult.value;
      }

      // Update description if provided
      if (updateRecipeBookDto.description !== undefined) {
        const updateResult = recipeBook.updateDescription(updateRecipeBookDto.description);
        if (!updateResult.isSuccess) return Result.failure(updateResult.error);
        recipeBook = updateResult.value;
      }

      // Update recipes if provided
      if (updateRecipeBookDto.recipeIds !== undefined) {
        // Clear existing recipes
        const clearResult = recipeBook.clearRecipes();
        if (!clearResult.isSuccess) return Result.failure(clearResult.error);
        recipeBook = clearResult.value;

        // Add new recipes
        for (const recipeIdString of updateRecipeBookDto.recipeIds) {
          const recipeIdResult = RecipeId.from(recipeIdString);
          if (!recipeIdResult.isSuccess) {
            return Result.failure(`Invalid recipe ID: ${recipeIdString}`);
          }

          const addResult = recipeBook.addRecipe(recipeIdResult.value);
          if (!addResult.isSuccess) {
            return Result.failure(addResult.error);
          }
          recipeBook = addResult.value;
        }
      }

      const saveResult = await this.recipeBookRepository.save(recipeBook);
      if (!saveResult.isSuccess) {
        return Result.failure(saveResult.error);
      }

      return Result.success(recipeBook);
    } catch (error) {
      return Result.failure(`Failed to update recipe book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates the update recipe book DTO
   * @param dto - The DTO to validate
   * @returns Validation result
   */
  private validateUpdateRecipeBookDto(dto: UpdateRecipeBookDto): Result<void> {
    if (!dto.id || dto.id.trim().length === 0) {
      return Result.failure('Recipe book ID is required for update');
    }
    if (dto.title !== undefined && (dto.title.trim().length === 0 || dto.title.length > 200)) {
      return Result.failure('Recipe book title cannot be empty or exceed 200 characters');
    }
    if (dto.description !== undefined && dto.description !== null && dto.description.length > 1000) {
      return Result.failure('Recipe book description cannot exceed 1000 characters');
    }
    if (dto.recipeIds && dto.recipeIds.length > 100) {
      return Result.failure('Recipe book cannot contain more than 100 recipes');
    }
    return Result.successEmpty();
  }
}
