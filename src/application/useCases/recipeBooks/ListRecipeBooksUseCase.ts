import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/di/types';
import { IRecipeBookRepository } from '../../ports/IRecipeBookRepository';
import { RecipeBook } from '../../../domain/entities/RecipeBook';
import { Result } from '../../../domain/common/Result';

/**
 * List Recipe Books Use Case
 * 
 * Handles retrieving recipe books with various filtering and pagination options.
 */
@injectable()
export class ListRecipeBooksUseCase {
  constructor(
    @inject(TYPES.RecipeBookRepository) private recipeBookRepository: IRecipeBookRepository
  ) {}

  /**
   * Gets all recipe books
   * @returns Promise containing all recipe books or error
   */
  async getAll(): Promise<Result<RecipeBook[]>> {
    try {
      return await this.recipeBookRepository.findAll();
    } catch (error) {
      return Result.failure(`Failed to get recipe books: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets recipe books with pagination
   * @param page - Page number (1-based)
   * @param pageSize - Number of items per page
   * @returns Promise containing paginated recipe books or error
   */
  async getWithPagination(page: number, pageSize: number): Promise<Result<{
    recipeBooks: RecipeBook[];
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

      return await this.recipeBookRepository.findWithPagination(page, pageSize);
    } catch (error) {
      return Result.failure(`Failed to get paginated recipe books: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets the total count of recipe books
   * @returns Promise containing the count or error
   */
  async getCount(): Promise<Result<number>> {
    try {
      return await this.recipeBookRepository.count();
    } catch (error) {
      return Result.failure(`Failed to get recipe book count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets only non-archived recipe books
   * @returns Promise containing active recipe books or error
   */
  async getActive(): Promise<Result<RecipeBook[]>> {
    try {
      const result = await this.recipeBookRepository.findAll();
      if (!result.isSuccess) {
        return Result.failure(result.error);
      }

      const activeRecipeBooks = result.value.filter(book => !book.isArchived);
      return Result.success(activeRecipeBooks);
    } catch (error) {
      return Result.failure(`Failed to get active recipe books: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets only archived recipe books
   * @returns Promise containing archived recipe books or error
   */
  async getArchived(): Promise<Result<RecipeBook[]>> {
    try {
      const result = await this.recipeBookRepository.findAll();
      if (!result.isSuccess) {
        return Result.failure(result.error);
      }

      const archivedRecipeBooks = result.value.filter(book => book.isArchived);
      return Result.success(archivedRecipeBooks);
    } catch (error) {
      return Result.failure(`Failed to get archived recipe books: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
