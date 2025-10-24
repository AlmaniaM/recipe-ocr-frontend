import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/di/types';
import { IRecipeBookRepository } from '../../ports/IRecipeBookRepository';
import { RecipeBook } from '../../../domain/entities/RecipeBook';
import { Result } from '../../../domain/common/Result';
import { RecipeBookId } from '../../../domain/valueObjects/RecipeBookId';

/**
 * Get Recipe Book Use Case
 * 
 * Handles retrieving a single recipe book by its ID.
 */
@injectable()
export class GetRecipeBookUseCase {
  constructor(
    @inject(TYPES.RecipeBookRepository) private recipeBookRepository: IRecipeBookRepository
  ) {}

  /**
   * Gets a recipe book by ID
   * @param id - The recipe book ID
   * @returns Promise containing the recipe book or error
   */
  async execute(id: string): Promise<Result<RecipeBook | null>> {
    try {
      const recipeBookIdResult = RecipeBookId.from(id);
      if (!recipeBookIdResult.isSuccess) {
        return Result.failure(recipeBookIdResult.error);
      }

      const recipeBookId = recipeBookIdResult.value;
      const result = await this.recipeBookRepository.findById(recipeBookId);
      
      if (!result.isSuccess) {
        return Result.failure(result.error);
      }

      return Result.success(result.value);
    } catch (error) {
      return Result.failure(`Failed to get recipe book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
