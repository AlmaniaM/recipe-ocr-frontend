import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/di/types';
import { IRecipeBookRepository } from '../../ports/IRecipeBookRepository';
import { Result } from '../../../domain/common/Result';
import { RecipeBookId } from '../../../domain/valueObjects/RecipeBookId';

/**
 * Delete Recipe Book Use Case
 * 
 * Handles the deletion of recipe books with soft delete (archive) and permanent delete options.
 */
@injectable()
export class DeleteRecipeBookUseCase {
  constructor(
    @inject(TYPES.RecipeBookRepository) private recipeBookRepository: IRecipeBookRepository
  ) {}

  /**
   * Archives a recipe book (soft delete)
   * @param id - The recipe book ID to archive
   * @returns Promise containing success or error
   */
  async archive(id: string): Promise<Result<void>> {
    try {
      const recipeBookIdResult = RecipeBookId.from(id);
      if (!recipeBookIdResult.isSuccess) {
        return Result.failure(recipeBookIdResult.error);
      }

      const recipeBookId = recipeBookIdResult.value;

      // Check if recipe book exists
      const existsResult = await this.recipeBookRepository.exists(recipeBookId);
      if (!existsResult.isSuccess) {
        return Result.failure(existsResult.error);
      }

      if (!existsResult.value) {
        return Result.failure(`Recipe book with ID ${id} not found`);
      }

      // Get the recipe book
      const getResult = await this.recipeBookRepository.findById(recipeBookId);
      if (!getResult.isSuccess) {
        return Result.failure(getResult.error);
      }

      if (!getResult.value) {
        return Result.failure(`Recipe book with ID ${id} not found`);
      }

      const recipeBook = getResult.value;

      // Archive the recipe book
      const archiveResult = recipeBook.archive();
      if (!archiveResult.isSuccess) {
        return Result.failure(archiveResult.error);
      }

      // Save the archived recipe book
      const saveResult = await this.recipeBookRepository.save(archiveResult.value);
      if (!saveResult.isSuccess) {
        return Result.failure(saveResult.error);
      }

      return Result.successEmpty();
    } catch (error) {
      return Result.failure(`Failed to archive recipe book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Unarchives a recipe book
   * @param id - The recipe book ID to unarchive
   * @returns Promise containing success or error
   */
  async unarchive(id: string): Promise<Result<void>> {
    try {
      const recipeBookIdResult = RecipeBookId.from(id);
      if (!recipeBookIdResult.isSuccess) {
        return Result.failure(recipeBookIdResult.error);
      }

      const recipeBookId = recipeBookIdResult.value;

      // Check if recipe book exists
      const existsResult = await this.recipeBookRepository.exists(recipeBookId);
      if (!existsResult.isSuccess) {
        return Result.failure(existsResult.error);
      }

      if (!existsResult.value) {
        return Result.failure(`Recipe book with ID ${id} not found`);
      }

      // Get the recipe book
      const getResult = await this.recipeBookRepository.findById(recipeBookId);
      if (!getResult.isSuccess) {
        return Result.failure(getResult.error);
      }

      if (!getResult.value) {
        return Result.failure(`Recipe book with ID ${id} not found`);
      }

      const recipeBook = getResult.value;

      // Unarchive the recipe book
      const unarchiveResult = recipeBook.unarchive();
      if (!unarchiveResult.isSuccess) {
        return Result.failure(unarchiveResult.error);
      }

      // Save the unarchived recipe book
      const saveResult = await this.recipeBookRepository.save(unarchiveResult.value);
      if (!saveResult.isSuccess) {
        return Result.failure(saveResult.error);
      }

      return Result.successEmpty();
    } catch (error) {
      return Result.failure(`Failed to unarchive recipe book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Permanently deletes a recipe book
   * @param id - The recipe book ID to delete
   * @returns Promise containing success or error
   */
  async deletePermanently(id: string): Promise<Result<void>> {
    try {
      const recipeBookIdResult = RecipeBookId.from(id);
      if (!recipeBookIdResult.isSuccess) {
        return Result.failure(recipeBookIdResult.error);
      }

      const recipeBookId = recipeBookIdResult.value;

      // Check if recipe book exists
      const existsResult = await this.recipeBookRepository.exists(recipeBookId);
      if (!existsResult.isSuccess) {
        return Result.failure(existsResult.error);
      }

      if (!existsResult.value) {
        return Result.failure(`Recipe book with ID ${id} not found`);
      }

      // Delete the recipe book
      const deleteResult = await this.recipeBookRepository.delete(recipeBookId);
      if (!deleteResult.isSuccess) {
        return Result.failure(deleteResult.error);
      }

      return Result.successEmpty();
    } catch (error) {
      return Result.failure(`Failed to delete recipe book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deletes multiple recipe books permanently
   * @param ids - Array of recipe book IDs to delete
   * @returns Promise containing success or error
   */
  async deleteMultiple(ids: string[]): Promise<Result<void>> {
    try {
      if (!ids || ids.length === 0) {
        return Result.failure('No recipe book IDs provided');
      }

      if (ids.length > 50) {
        return Result.failure('Cannot delete more than 50 recipe books at once');
      }

      const errors: string[] = [];

      for (const id of ids) {
        const deleteResult = await this.deletePermanently(id);
        if (!deleteResult.isSuccess) {
          errors.push(`Failed to delete recipe book ${id}: ${deleteResult.error}`);
        }
      }

      if (errors.length > 0) {
        return Result.failure(`Some deletions failed: ${errors.join('; ')}`);
      }

      return Result.successEmpty();
    } catch (error) {
      return Result.failure(`Failed to delete multiple recipe books: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
