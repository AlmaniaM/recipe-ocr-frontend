import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/di/types';
import { IRecipeBookRepository } from '../../ports/IRecipeBookRepository';
import { RecipeBook } from '../../../domain/entities/RecipeBook';
import { CreateRecipeBookDto } from '../../dto/RecipeBookDto';
import { Result } from '../../../domain/common/Result';
import { RecipeId } from '../../../domain/valueObjects/RecipeId';

/**
 * Create Recipe Book Use Case
 * 
 * Handles the creation of new recipe books with proper validation and mapping.
 */
@injectable()
export class CreateRecipeBookUseCase {
  constructor(
    @inject(TYPES.RecipeBookRepository) private recipeBookRepository: IRecipeBookRepository
  ) {}

  /**
   * Creates a new recipe book
   * @param createRecipeBookDto - The recipe book data
   * @returns Promise containing the created recipe book or error
   */
  async execute(createRecipeBookDto: CreateRecipeBookDto): Promise<Result<RecipeBook>> {
    try {
      const validationResult = this.validateCreateRecipeBookDto(createRecipeBookDto);
      if (!validationResult.isSuccess) {
        return Result.failure(validationResult.error);
      }

      const recipeBookResult = RecipeBook.create(
        createRecipeBookDto.title,
        createRecipeBookDto.description || null
      );

      if (!recipeBookResult.isSuccess) {
        return Result.failure(recipeBookResult.error);
      }

      let recipeBook = recipeBookResult.value;

      // Add recipes if provided
      if (createRecipeBookDto.recipeIds && createRecipeBookDto.recipeIds.length > 0) {
        for (const recipeIdString of createRecipeBookDto.recipeIds) {
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
      return Result.failure(`Failed to create recipe book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates the create recipe book DTO
   * @param dto - The DTO to validate
   * @returns Validation result
   */
  private validateCreateRecipeBookDto(dto: CreateRecipeBookDto): Result<void> {
    if (!dto.title || dto.title.trim().length === 0) {
      return Result.failure('Recipe book title is required');
    }
    if (dto.title.length > 200) {
      return Result.failure('Recipe book title cannot exceed 200 characters');
    }
    if (dto.description && dto.description.length > 1000) {
      return Result.failure('Recipe book description cannot exceed 1000 characters');
    }
    if (dto.recipeIds && dto.recipeIds.length > 100) {
      return Result.failure('Recipe book cannot contain more than 100 recipes');
    }
    return Result.successEmpty();
  }
}
