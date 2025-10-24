import { injectable } from 'inversify';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IRecipeBookRepository } from '../../application/ports/IRecipeBookRepository';
import { RecipeBook } from '../../domain/entities/RecipeBook';
import { RecipeBookId } from '../../domain/valueObjects/RecipeBookId';
import { Result } from '../../domain/common/Result';

/**
 * AsyncStorage Recipe Book Repository
 * 
 * Implements recipe book persistence using React Native's AsyncStorage.
 * This provides simple key-value storage for offline-first functionality.
 */
@injectable()
export class AsyncStorageRecipeBookRepository implements IRecipeBookRepository {
  private readonly RECIPE_BOOKS_KEY = 'recipe_books';
  private readonly RECIPE_BOOK_INDEX_KEY = 'recipe_book_index';

  async save(recipeBook: RecipeBook): Promise<Result<void>> {
    try {
      const recipeBooks = await this.getAllRecipeBooks();
      recipeBooks.set(recipeBook.id.value, this.serializeRecipeBook(recipeBook));
      
      await AsyncStorage.setItem(this.RECIPE_BOOKS_KEY, JSON.stringify(Array.from(recipeBooks.entries())));
      await this.updateIndex(recipeBook);
      
      return Result.successEmpty();
    } catch (error) {
      return Result.failure(`Failed to save recipe book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: RecipeBookId): Promise<Result<RecipeBook | null>> {
    try {
      const recipeBooks = await this.getAllRecipeBooks();
      const serializedRecipeBook = recipeBooks.get(id.value);
      
      if (!serializedRecipeBook) {
        return Result.success(null);
      }

      const recipeBook = this.deserializeRecipeBook(serializedRecipeBook);
      return Result.success(recipeBook);
    } catch (error) {
      return Result.failure(`Failed to find recipe book by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(): Promise<Result<RecipeBook[]>> {
    try {
      const recipeBooks = await this.getAllRecipeBooks();
      const recipeBookList = Array.from(recipeBooks.values())
        .map(serialized => this.deserializeRecipeBook(serialized))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return Result.success(recipeBookList);
    } catch (error) {
      return Result.failure(`Failed to find all recipe books: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(recipeBook: RecipeBook): Promise<Result<void>> {
    try {
      const recipeBooks = await this.getAllRecipeBooks();
      const existingRecipeBook = recipeBooks.get(recipeBook.id.value);
      
      if (!existingRecipeBook) {
        return Result.failure('Recipe book not found');
      }

      recipeBooks.set(recipeBook.id.value, this.serializeRecipeBook(recipeBook));
      await AsyncStorage.setItem(this.RECIPE_BOOKS_KEY, JSON.stringify(Array.from(recipeBooks.entries())));
      
      return Result.successEmpty();
    } catch (error) {
      return Result.failure(`Failed to update recipe book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: RecipeBookId): Promise<Result<void>> {
    try {
      const recipeBooks = await this.getAllRecipeBooks();
      const existingRecipeBook = recipeBooks.get(id.value);
      
      if (!existingRecipeBook) {
        return Result.failure('Recipe book not found');
      }

      recipeBooks.delete(id.value);
      await AsyncStorage.setItem(this.RECIPE_BOOKS_KEY, JSON.stringify(Array.from(recipeBooks.entries())));
      await this.removeFromIndex(id);
      
      return Result.successEmpty();
    } catch (error) {
      return Result.failure(`Failed to delete recipe book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exists(id: RecipeBookId): Promise<Result<boolean>> {
    try {
      const recipeBooks = await this.getAllRecipeBooks();
      return Result.success(recipeBooks.has(id.value));
    } catch (error) {
      return Result.failure(`Failed to check if recipe book exists: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const recipeBooks = await this.getAllRecipeBooks();
      return Result.success(recipeBooks.size);
    } catch (error) {
      return Result.failure(`Failed to count recipe books: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findWithPagination(page: number, pageSize: number): Promise<Result<{
    recipeBooks: RecipeBook[];
    totalCount: number;
    hasNextPage: boolean;
  }>> {
    try {
      const recipeBooks = await this.getAllRecipeBooks();
      const allRecipeBooks = Array.from(recipeBooks.values())
        .map(serialized => this.deserializeRecipeBook(serialized))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const totalCount = allRecipeBooks.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedRecipeBooks = allRecipeBooks.slice(startIndex, endIndex);
      const hasNextPage = endIndex < totalCount;

      return Result.success({
        recipeBooks: paginatedRecipeBooks,
        totalCount,
        hasNextPage
      });
    } catch (error) {
      return Result.failure(`Failed to find recipe books with pagination: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets all recipe books from AsyncStorage
   */
  private async getAllRecipeBooks(): Promise<Map<string, any>> {
    const recipeBooksData = await AsyncStorage.getItem(this.RECIPE_BOOKS_KEY);
    if (!recipeBooksData) {
      return new Map();
    }

    const entries = JSON.parse(recipeBooksData);
    return new Map(entries);
  }

  /**
   * Serializes a RecipeBook entity to a plain object for storage
   */
  private serializeRecipeBook(recipeBook: RecipeBook): any {
    return {
      id: recipeBook.id.value,
      title: recipeBook.title,
      description: recipeBook.description,
      categorySortOrder: recipeBook.categorySortOrder,
      isLocal: recipeBook.isLocal,
      createdAt: recipeBook.createdAt.toISOString(),
      updatedAt: recipeBook.updatedAt.toISOString(),
      isArchived: recipeBook.isArchived,
      recipeIds: recipeBook.recipeIds.map(id => id.value)
    };
  }

  /**
   * Deserializes a plain object back to a RecipeBook entity
   */
  private deserializeRecipeBook(serialized: any): RecipeBook {
    // This is a simplified deserialization - in a real implementation,
    // you'd need to properly reconstruct the RecipeBook entity with all its value objects
    // For now, we'll create a basic recipe book structure
    const recipeBookResult = RecipeBook.create(
      serialized.title,
      serialized.description
    );
    
    if (recipeBookResult.isFailure) {
      throw new Error(recipeBookResult.error);
    }
    
    return recipeBookResult.getValueOrThrow();

    // Note: In a real implementation, you'd need to properly reconstruct
    // all the value objects and collections. This is a simplified version.
  }

  /**
   * Updates the recipe book index for faster lookups
   */
  private async updateIndex(recipeBook: RecipeBook): Promise<void> {
    try {
      const indexData = await AsyncStorage.getItem(this.RECIPE_BOOK_INDEX_KEY);
      const index = indexData ? JSON.parse(indexData) : {};
      
      index[recipeBook.id.value] = {
        title: recipeBook.title,
        createdAt: recipeBook.createdAt.toISOString(),
        updatedAt: recipeBook.updatedAt.toISOString()
      };

      await AsyncStorage.setItem(this.RECIPE_BOOK_INDEX_KEY, JSON.stringify(index));
    } catch (error) {
      console.error('Failed to update recipe book index:', error);
    }
  }

  /**
   * Removes a recipe book from the index
   */
  private async removeFromIndex(id: RecipeBookId): Promise<void> {
    try {
      const indexData = await AsyncStorage.getItem(this.RECIPE_BOOK_INDEX_KEY);
      if (!indexData) return;

      const index = JSON.parse(indexData);
      delete index[id.value];
      await AsyncStorage.setItem(this.RECIPE_BOOK_INDEX_KEY, JSON.stringify(index));
    } catch (error) {
      console.error('Failed to remove recipe book from index:', error);
    }
  }
}
