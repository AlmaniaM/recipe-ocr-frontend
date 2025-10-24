import { injectable } from 'inversify';
// import * as SQLite from 'expo-sqlite';
import { IRecipeRepository } from '../../application/ports/IRecipeRepository';
import { Recipe } from '../../domain/entities/Recipe';
import { RecipeId } from '../../domain/valueObjects/RecipeId';
import { RecipeCategory } from '../../domain/enums/RecipeCategory';
import { Result } from '../../domain/common/Result';

/**
 * SQLite Recipe Repository
 * 
 * Implements recipe persistence using SQLite for complex queries and relationships.
 * This provides relational database functionality for advanced search and filtering.
 */
@injectable()
export class SQLiteRecipeRepository implements IRecipeRepository {
  private db: SQLite.SQLiteDatabase | null = null;
  private readonly DB_NAME = 'recipe_app.db';
  private readonly RECIPES_TABLE = 'recipes';
  private readonly INGREDIENTS_TABLE = 'recipe_ingredients';
  private readonly DIRECTIONS_TABLE = 'recipe_directions';
  private readonly TAGS_TABLE = 'recipe_tags';

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

    // Create recipes table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${this.RECIPES_TABLE} (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        prep_time_minutes INTEGER,
        prep_time_hours INTEGER,
        cook_time_minutes INTEGER,
        cook_time_hours INTEGER,
        servings_min INTEGER,
        servings_max INTEGER,
        source TEXT,
        image_path TEXT,
        image_url TEXT,
        is_local BOOLEAN NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        is_archived BOOLEAN NOT NULL DEFAULT 0
      )
    `);

    // Create ingredients table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${this.INGREDIENTS_TABLE} (
        id TEXT PRIMARY KEY,
        recipe_id TEXT NOT NULL,
        text TEXT NOT NULL,
        amount TEXT,
        unit TEXT,
        name TEXT,
        FOREIGN KEY (recipe_id) REFERENCES ${this.RECIPES_TABLE}(id) ON DELETE CASCADE
      )
    `);

    // Create directions table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${this.DIRECTIONS_TABLE} (
        id TEXT PRIMARY KEY,
        recipe_id TEXT NOT NULL,
        step INTEGER NOT NULL,
        instruction TEXT NOT NULL,
        FOREIGN KEY (recipe_id) REFERENCES ${this.RECIPES_TABLE}(id) ON DELETE CASCADE
      )
    `);

    // Create tags table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${this.TAGS_TABLE} (
        id TEXT PRIMARY KEY,
        recipe_id TEXT NOT NULL,
        name TEXT NOT NULL,
        color TEXT,
        FOREIGN KEY (recipe_id) REFERENCES ${this.RECIPES_TABLE}(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_recipes_category ON ${this.RECIPES_TABLE}(category)
    `);
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON ${this.RECIPES_TABLE}(created_at)
    `);
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_recipes_title ON ${this.RECIPES_TABLE}(title)
    `);
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_ingredients_recipe_id ON ${this.INGREDIENTS_TABLE}(recipe_id)
    `);
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_directions_recipe_id ON ${this.DIRECTIONS_TABLE}(recipe_id)
    `);
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_tags_recipe_id ON ${this.TAGS_TABLE}(recipe_id)
    `);
  }

  async save(recipe: Recipe): Promise<Result<void>> {
    try {
      if (!this.db) {
        return Result.failure('Database not initialized');
      }

      await this.db.runAsync(
        `INSERT OR REPLACE INTO ${this.RECIPES_TABLE} 
         (id, title, description, category, prep_time_minutes, prep_time_hours, 
          cook_time_minutes, cook_time_hours, servings_min, servings_max, 
          source, image_path, image_url, is_local, created_at, updated_at, is_archived)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recipe.id.value,
          recipe.title,
          recipe.description,
          recipe.category,
          recipe.prepTime?.minMinutes || null,
          recipe.prepTime?.maxMinutes || null,
          recipe.cookTime?.minMinutes || null,
          recipe.cookTime?.maxMinutes || null,
          recipe.servings?.count || null,
          recipe.servings?.description || null,
          recipe.source,
          recipe.imagePath,
          recipe.imageUrl,
          recipe.isLocal ? 1 : 0,
          recipe.createdAt.toISOString(),
          recipe.updatedAt.toISOString(),
          recipe.isArchived ? 1 : 0
        ]
      );

      // Save ingredients
      await this.saveIngredients(recipe);
      
      // Save directions
      await this.saveDirections(recipe);
      
      // Save tags
      await this.saveTags(recipe);

      return Result.successEmpty();
    } catch (error) {
      return Result.failure(`Failed to save recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: RecipeId): Promise<Result<Recipe | null>> {
    try {
      if (!this.db) {
        return Result.failure('Database not initialized');
      }

      const result = await this.db.getFirstAsync(
        `SELECT * FROM ${this.RECIPES_TABLE} WHERE id = ?`,
        [id.value]
      );

      if (!result) {
        return Result.success(null);
      }

      const recipe = await this.buildRecipeFromRow(result);
      return Result.success(recipe);
    } catch (error) {
      return Result.failure(`Failed to find recipe by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(): Promise<Result<Recipe[]>> {
    try {
      if (!this.db) {
        return Result.failure('Database not initialized');
      }

      const results = await this.db.getAllAsync(
        `SELECT * FROM ${this.RECIPES_TABLE} WHERE is_archived = 0 ORDER BY created_at DESC`
      );

      const recipes = await Promise.all(
        results.map(row => this.buildRecipeFromRow(row))
      );

      return Result.success(recipes);
    } catch (error) {
      return Result.failure(`Failed to find all recipes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByCategory(category: RecipeCategory): Promise<Result<Recipe[]>> {
    try {
      if (!this.db) {
        return Result.failure('Database not initialized');
      }

      const results = await this.db.getAllAsync(
        `SELECT * FROM ${this.RECIPES_TABLE} 
         WHERE category = ? AND is_archived = 0 
         ORDER BY created_at DESC`,
        [category]
      );

      const recipes = await Promise.all(
        results.map(row => this.buildRecipeFromRow(row))
      );

      return Result.success(recipes);
    } catch (error) {
      return Result.failure(`Failed to find recipes by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async search(query: string): Promise<Result<Recipe[]>> {
    try {
      if (!this.db) {
        return Result.failure('Database not initialized');
      }

      // Return empty array for empty search queries
      if (!query || query.trim() === '') {
        return Result.success([]);
      }

      const searchQuery = `%${query.toLowerCase()}%`;
      const results = await this.db.getAllAsync(
        `SELECT * FROM ${this.RECIPES_TABLE} 
         WHERE (LOWER(title) LIKE ? OR LOWER(description) LIKE ?) 
         AND is_archived = 0 
         ORDER BY created_at DESC`,
        [searchQuery, searchQuery]
      );

      const recipes = await Promise.all(
        results.map(row => this.buildRecipeFromRow(row))
      );

      return Result.success(recipes);
    } catch (error) {
      return Result.failure(`Failed to search recipes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByTags(tagIds: string[]): Promise<Result<Recipe[]>> {
    try {
      if (!this.db) {
        return Result.failure('Database not initialized');
      }

      if (tagIds.length === 0) {
        return Result.success([]);
      }

      const placeholders = tagIds.map(() => '?').join(',');
      const results = await this.db.getAllAsync(
        `SELECT DISTINCT r.* FROM ${this.RECIPES_TABLE} r
         INNER JOIN ${this.TAGS_TABLE} t ON r.id = t.recipe_id
         WHERE t.id IN (${placeholders}) AND r.is_archived = 0
         ORDER BY r.created_at DESC`,
        tagIds
      );

      const recipes = await Promise.all(
        results.map(row => this.buildRecipeFromRow(row))
      );

      return Result.success(recipes);
    } catch (error) {
      return Result.failure(`Failed to find recipes by tags: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(recipe: Recipe): Promise<Result<void>> {
    try {
      if (!this.db) {
        return Result.failure('Database not initialized');
      }

      // Check if recipe exists
      const existing = await this.db.getFirstAsync(
        `SELECT id FROM ${this.RECIPES_TABLE} WHERE id = ?`,
        [recipe.id.value]
      );

      if (!existing) {
        return Result.failure('Recipe not found');
      }

      // Update recipe
      await this.db.runAsync(
        `UPDATE ${this.RECIPES_TABLE} 
         SET title = ?, description = ?, category = ?, prep_time_minutes = ?, 
             prep_time_hours = ?, cook_time_minutes = ?, cook_time_hours = ?, 
             servings_min = ?, servings_max = ?, source = ?, image_path = ?, 
             image_url = ?, is_local = ?, updated_at = ?, is_archived = ?
         WHERE id = ?`,
        [
          recipe.title,
          recipe.description,
          recipe.category,
          recipe.prepTime?.minMinutes || null,
          recipe.prepTime?.maxMinutes || null,
          recipe.cookTime?.minMinutes || null,
          recipe.cookTime?.maxMinutes || null,
          recipe.servings?.count || null,
          recipe.servings?.description || null,
          recipe.source,
          recipe.imagePath,
          recipe.imageUrl,
          recipe.isLocal ? 1 : 0,
          recipe.updatedAt.toISOString(),
          recipe.isArchived ? 1 : 0,
          recipe.id.value
        ]
      );

      // Update related data
      await this.deleteRelatedData(recipe.id.value);
      await this.saveIngredients(recipe);
      await this.saveDirections(recipe);
      await this.saveTags(recipe);

      return Result.successEmpty();
    } catch (error) {
      return Result.failure(`Failed to update recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: RecipeId): Promise<Result<void>> {
    try {
      if (!this.db) {
        return Result.failure('Database not initialized');
      }

      // Check if recipe exists
      const existing = await this.db.getFirstAsync(
        `SELECT id FROM ${this.RECIPES_TABLE} WHERE id = ?`,
        [id.value]
      );

      if (!existing) {
        return Result.failure('Recipe not found');
      }

      // Delete recipe (cascade will handle related data)
      await this.db.runAsync(
        `DELETE FROM ${this.RECIPES_TABLE} WHERE id = ?`,
        [id.value]
      );

      return Result.successEmpty();
    } catch (error) {
      return Result.failure(`Failed to delete recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exists(id: RecipeId): Promise<Result<boolean>> {
    try {
      if (!this.db) {
        return Result.failure('Database not initialized');
      }

      const result = await this.db.getFirstAsync(
        `SELECT 1 FROM ${this.RECIPES_TABLE} WHERE id = ?`,
        [id.value]
      );

      return Result.success(!!result);
    } catch (error) {
      return Result.failure(`Failed to check if recipe exists: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      if (!this.db) {
        return Result.failure('Database not initialized');
      }

      const result = await this.db.getFirstAsync(
        `SELECT COUNT(*) as count FROM ${this.RECIPES_TABLE} WHERE is_archived = 0`
      );

      return Result.success((result as any)?.count || 0);
    } catch (error) {
      return Result.failure(`Failed to count recipes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findWithPagination(page: number, pageSize: number): Promise<Result<{
    recipes: Recipe[];
    totalCount: number;
    hasNextPage: boolean;
  }>> {
    try {
      if (!this.db) {
        return Result.failure('Database not initialized');
      }

      // Get total count
      const countResult = await this.db.getFirstAsync(
        `SELECT COUNT(*) as count FROM ${this.RECIPES_TABLE} WHERE is_archived = 0`
      );
      const totalCount = (countResult as any)?.count || 0;

      // Get paginated results
      const offset = (page - 1) * pageSize;
      const results = await this.db.getAllAsync(
        `SELECT * FROM ${this.RECIPES_TABLE} 
         WHERE is_archived = 0 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [pageSize, offset]
      );

      const recipes = await Promise.all(
        results.map(row => this.buildRecipeFromRow(row))
      );

      const hasNextPage = offset + pageSize < totalCount;

      return Result.success({
        recipes,
        totalCount,
        hasNextPage
      });
    } catch (error) {
      return Result.failure(`Failed to find recipes with pagination: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async saveIngredients(recipe: Recipe): Promise<void> {
    if (!this.db) return;

    for (const ingredient of recipe.ingredients) {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO ${this.INGREDIENTS_TABLE} 
         (id, recipe_id, text, amount, order)
         VALUES (?, ?, ?, ?, ?)`,
        [
          ingredient.id,
          recipe.id.value,
          ingredient.text.value,
          ingredient.amount ? JSON.stringify({
            value: ingredient.amount.value,
            unit: ingredient.amount.unit
          }) : null,
          ingredient.order
        ]
      );
    }
  }

  private async saveDirections(recipe: Recipe): Promise<void> {
    if (!this.db) return;

    for (const direction of recipe.directions) {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO ${this.DIRECTIONS_TABLE} 
         (id, recipe_id, step, instruction)
         VALUES (?, ?, ?, ?)`,
        [
          direction.id,
          recipe.id.value,
          direction.order,
          direction.text.value
        ]
      );
    }
  }

  private async saveTags(recipe: Recipe): Promise<void> {
    if (!this.db) return;

    for (const tag of recipe.tags) {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO ${this.TAGS_TABLE} 
         (id, recipe_id, name, color)
         VALUES (?, ?, ?, ?)`,
        [
          tag.id,
          recipe.id.value,
          tag.name.value,
          tag.color || null
        ]
      );
    }
  }

  private async deleteRelatedData(recipeId: string): Promise<void> {
    if (!this.db) return;

    await this.db.runAsync(
      `DELETE FROM ${this.INGREDIENTS_TABLE} WHERE recipe_id = ?`,
      [recipeId]
    );
    await this.db.runAsync(
      `DELETE FROM ${this.DIRECTIONS_TABLE} WHERE recipe_id = ?`,
      [recipeId]
    );
    await this.db.runAsync(
      `DELETE FROM ${this.TAGS_TABLE} WHERE recipe_id = ?`,
      [recipeId]
    );
  }

  private async buildRecipeFromRow(row: any): Promise<Recipe> {
    // This is a simplified implementation - in a real scenario,
    // you'd need to properly reconstruct the Recipe entity with all its value objects
    // and load related data (ingredients, directions, tags)
    
    const recipeResult = Recipe.create(
      row.title,
      row.description,
      row.category as RecipeCategory
    );
    
    if (recipeResult.isFailure) {
      throw new Error(recipeResult.error);
    }
    
    return recipeResult.getValueOrThrow();

    // Note: In a real implementation, you'd need to:
    // 1. Load ingredients from the ingredients table
    // 2. Load directions from the directions table  
    // 3. Load tags from the tags table
    // 4. Properly reconstruct all value objects
    // 5. Set all the properties correctly
  }
}
