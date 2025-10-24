import { injectable } from 'inversify';
// import * as SQLite from 'expo-sqlite';
import { IRecipeBookRepository } from '../../application/ports/IRecipeBookRepository';
import { RecipeBook } from '../../domain/entities/RecipeBook';
import { RecipeBookId } from '../../domain/valueObjects/RecipeBookId';
import { Result } from '../../domain/common/Result';

/**
 * SQLite Recipe Book Repository
 * 
 * Implements recipe book persistence using SQLite for complex queries and relationships.
 * This provides relational database functionality for advanced search and filtering.
 */
@injectable()
export class SQLiteRecipeBookRepository implements IRecipeBookRepository {
  private db: SQLite.SQLiteDatabase | null = null;
  private readonly DB_NAME = 'recipe_app.db';
  private readonly RECIPE_BOOKS_TABLE = 'recipe_books';
  private readonly RECIPE_BOOK_RECIPES_TABLE = 'recipe_book_recipes';

  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(this.DB_NAME);
      await this.createTables();
    } catch (error) {
      console.error('Failed to initialize SQLite database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Create recipe books table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${this.RECIPE_BOOKS_TABLE} (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category_sort_order TEXT,
        is_local BOOLEAN NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        is_archived BOOLEAN NOT NULL DEFAULT 0
      )
    `);

    // Create recipe book recipes junction table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${this.RECIPE_BOOK_RECIPES_TABLE} (
        id TEXT PRIMARY KEY,
        recipe_book_id TEXT NOT NULL,
        recipe_id TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (recipe_book_id) REFERENCES ${this.RECIPE_BOOKS_TABLE}(id) ON DELETE CASCADE,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
        UNIQUE(recipe_book_id, recipe_id)
      )
    `);

    // Create indexes for better performance
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_recipe_books_created_at ON ${this.RECIPE_BOOKS_TABLE}(created_at)
    `);
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_recipe_books_title ON ${this.RECIPE_BOOKS_TABLE}(title)
    `);
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_recipe_book_recipes_book_id ON ${this.RECIPE_BOOK_RECIPES_TABLE}(recipe_book_id)
    `);
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_recipe_book_recipes_recipe_id ON ${this.RECIPE_BOOK_RECIPES_TABLE}(recipe_id)
    `);
  }

  async save(recipeBook: RecipeBook): Promise<Result<void>> {
    try {
      if (!this.db) {
        return Result.failure('Database not initialized');
      }

      await this.db.runAsync(
        `INSERT OR REPLACE INTO ${this.RECIPE_BOOKS_TABLE} 
         (id, title, description, category_sort_order, is_local, created_at, updated_at, is_archived)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recipeBook.id.value,
          recipeBook.title,
          recipeBook.description,
          JSON.stringify(recipeBook.categorySortOrder),
          recipeBook.isLocal ? 1 : 0,
          recipeBook.createdAt.toISOString(),
          recipeBook.updatedAt.toISOString(),
          recipeBook.isArchived ? 1 : 0
        ]
      );

      // Save recipe relationships
      await this.saveRecipeRelationships(recipeBook);

      return Result.successEmpty();
    } catch (error) {
      return Result.failure(`Failed to save recipe book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: RecipeBookId): Promise<Result<RecipeBook | null>> {
    try {
      if (!this.db) {
        return Result.failure('Database not initialized');
      }

      const result = await this.db.getFirstAsync(
        `SELECT * FROM ${this.RECIPE_BOOKS_TABLE} WHERE id = ?`,
        [id.value]
      );

      if (!result) {
        return Result.success(null);
      }

      const recipeBook = await this.buildRecipeBookFromRow(result);
      return Result.success(recipeBook);
    } catch (error) {
      return Result.failure(`Failed to find recipe book by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(): Promise<Result<RecipeBook[]>> {
    try {
      if (!this.db) {
        return Result.failure('Database not initialized');
      }

      const results = await this.db.getAllAsync(
        `SELECT * FROM ${this.RECIPE_BOOKS_TABLE} WHERE is_archived = 0 ORDER BY created_at DESC`
      );

      const recipeBooks = await Promise.all(
        results.map(row => this.buildRecipeBookFromRow(row))
      );

      return Result.success(recipeBooks);
    } catch (error) {
      return Result.failure(`Failed to find all recipe books: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(recipeBook: RecipeBook): Promise<Result<void>> {
    try {
      if (!this.db) {
        return Result.failure('Database not initialized');
      }

      // Check if recipe book exists
      const existing = await this.db.getFirstAsync(
        `SELECT id FROM ${this.RECIPE_BOOKS_TABLE} WHERE id = ?`,
        [recipeBook.id.value]
      );

      if (!existing) {
        return Result.failure('Recipe book not found');
      }

      // Update recipe book
      await this.db.runAsync(
        `UPDATE ${this.RECIPE_BOOKS_TABLE} 
         SET title = ?, description = ?, category_sort_order = ?, 
             is_local = ?, updated_at = ?, is_archived = ?
         WHERE id = ?`,
        [
          recipeBook.title,
          recipeBook.description,
          JSON.stringify(recipeBook.categorySortOrder),
          recipeBook.isLocal ? 1 : 0,
          recipeBook.updatedAt.toISOString(),
          recipeBook.isArchived ? 1 : 0,
          recipeBook.id.value
        ]
      );

      // Update recipe relationships
      await this.deleteRecipeRelationships(recipeBook.id.value);
      await this.saveRecipeRelationships(recipeBook);

      return Result.successEmpty();
    } catch (error) {
      return Result.failure(`Failed to update recipe book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: RecipeBookId): Promise<Result<void>> {
    try {
      if (!this.db) {
        return Result.failure('Database not initialized');
      }

      // Check if recipe book exists
      const existing = await this.db.getFirstAsync(
        `SELECT id FROM ${this.RECIPE_BOOKS_TABLE} WHERE id = ?`,
        [id.value]
      );

      if (!existing) {
        return Result.failure('Recipe book not found');
      }

      // Delete recipe book (cascade will handle related data)
      await this.db.runAsync(
        `DELETE FROM ${this.RECIPE_BOOKS_TABLE} WHERE id = ?`,
        [id.value]
      );

      return Result.successEmpty();
    } catch (error) {
      return Result.failure(`Failed to delete recipe book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exists(id: RecipeBookId): Promise<Result<boolean>> {
    try {
      if (!this.db) {
        return Result.failure('Database not initialized');
      }

      const result = await this.db.getFirstAsync(
        `SELECT 1 FROM ${this.RECIPE_BOOKS_TABLE} WHERE id = ?`,
        [id.value]
      );

      return Result.success(!!result);
    } catch (error) {
      return Result.failure(`Failed to check if recipe book exists: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      if (!this.db) {
        return Result.failure('Database not initialized');
      }

      const result = await this.db.getFirstAsync(
        `SELECT COUNT(*) as count FROM ${this.RECIPE_BOOKS_TABLE} WHERE is_archived = 0`
      );

      return Result.success((result as any)?.count || 0);
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
      if (!this.db) {
        return Result.failure('Database not initialized');
      }

      // Get total count
      const countResult = await this.db.getFirstAsync(
        `SELECT COUNT(*) as count FROM ${this.RECIPE_BOOKS_TABLE} WHERE is_archived = 0`
      );
      const totalCount = (countResult as any)?.count || 0;

      // Get paginated results
      const offset = (page - 1) * pageSize;
      const results = await this.db.getAllAsync(
        `SELECT * FROM ${this.RECIPE_BOOKS_TABLE} 
         WHERE is_archived = 0 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [pageSize, offset]
      );

      const recipeBooks = await Promise.all(
        results.map(row => this.buildRecipeBookFromRow(row))
      );

      const hasNextPage = offset + pageSize < totalCount;

      return Result.success({
        recipeBooks,
        totalCount,
        hasNextPage
      });
    } catch (error) {
      return Result.failure(`Failed to find recipe books with pagination: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async saveRecipeRelationships(recipeBook: RecipeBook): Promise<void> {
    if (!this.db) return;

    for (let i = 0; i < recipeBook.recipeIds.length; i++) {
      const recipeId = recipeBook.recipeIds[i];
      const relationshipId = `${recipeBook.id.value}_${recipeId.value}`;
      
      await this.db.runAsync(
        `INSERT OR REPLACE INTO ${this.RECIPE_BOOK_RECIPES_TABLE} 
         (id, recipe_book_id, recipe_id, sort_order)
         VALUES (?, ?, ?, ?)`,
        [
          relationshipId,
          recipeBook.id.value,
          recipeId.value,
          i
        ]
      );
    }
  }

  private async deleteRecipeRelationships(recipeBookId: string): Promise<void> {
    if (!this.db) return;

    await this.db.runAsync(
      `DELETE FROM ${this.RECIPE_BOOK_RECIPES_TABLE} WHERE recipe_book_id = ?`,
      [recipeBookId]
    );
  }

  private async buildRecipeBookFromRow(row: any): Promise<RecipeBook> {
    // This is a simplified implementation - in a real scenario,
    // you'd need to properly reconstruct the RecipeBook entity with all its value objects
    // and load related data (recipe IDs)
    
    const recipeBookResult = RecipeBook.create(
      row.title,
      row.description
    );
    
    if (recipeBookResult.isFailure) {
      throw new Error(recipeBookResult.error);
    }
    
    return recipeBookResult.getValueOrThrow();

    // Note: In a real implementation, you'd need to:
    // 1. Load recipe IDs from the junction table
    // 2. Properly reconstruct all value objects
    // 3. Set all the properties correctly
  }
}
