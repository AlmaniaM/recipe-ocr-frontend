import { injectable } from 'inversify';
import { IRecipeRepository } from '../../application/ports/IRecipeRepository';
import { Recipe } from '../../domain/entities/Recipe';
import { RecipeId } from '../../domain/valueObjects/RecipeId';
import { RecipeCategory } from '../../domain/enums/RecipeCategory';
import { Result } from '../../domain/common/Result';

/**
 * Mock Recipe Repository
 * 
 * A simple in-memory implementation for development and testing.
 * This will be replaced with real implementations (AsyncStorage, SQLite) later.
 */
@injectable()
export class MockRecipeRepository implements IRecipeRepository {
  private recipes: Map<string, Recipe> = new Map();

  async save(recipe: Recipe): Promise<Result<void>> {
    try {
      this.recipes.set(recipe.id.value, recipe);
      return Result.successEmpty();
    } catch (error) {
      return Result.failure(`Failed to save recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: RecipeId): Promise<Result<Recipe | null>> {
    try {
      const recipe = this.recipes.get(id.value) || null;
      return Result.success(recipe);
    } catch (error) {
      return Result.failure(`Failed to find recipe by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(): Promise<Result<Recipe[]>> {
    try {
      const recipes = Array.from(this.recipes.values());
      return Result.success(recipes);
    } catch (error) {
      return Result.failure(`Failed to find all recipes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByCategory(category: RecipeCategory): Promise<Result<Recipe[]>> {
    try {
      const recipes = Array.from(this.recipes.values()).filter(recipe => recipe.category === category);
      return Result.success(recipes);
    } catch (error) {
      return Result.failure(`Failed to find recipes by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async search(query: string): Promise<Result<Recipe[]>> {
    try {
      const lowerQuery = query.toLowerCase();
      const recipes = Array.from(this.recipes.values()).filter(recipe => 
        recipe.title.toLowerCase().includes(lowerQuery) ||
        (recipe.description && recipe.description.toLowerCase().includes(lowerQuery)) ||
        recipe.ingredients.some(ingredient => ingredient.text.value.toLowerCase().includes(lowerQuery))
      );
      return Result.success(recipes);
    } catch (error) {
      return Result.failure(`Failed to search recipes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByTags(tagIds: string[]): Promise<Result<Recipe[]>> {
    try {
      const recipes = Array.from(this.recipes.values()).filter(recipe =>
        tagIds.every(tagId => recipe.tags.some(tag => tag.id === tagId))
      );
      return Result.success(recipes);
    } catch (error) {
      return Result.failure(`Failed to find recipes by tags: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(recipe: Recipe): Promise<Result<void>> {
    try {
      if (!this.recipes.has(recipe.id.value)) {
        return Result.failure('Recipe not found');
      }
      
      this.recipes.set(recipe.id.value, recipe);
      return Result.successEmpty();
    } catch (error) {
      return Result.failure(`Failed to update recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: RecipeId): Promise<Result<void>> {
    try {
      if (!this.recipes.has(id.value)) {
        return Result.failure('Recipe not found');
      }
      
      this.recipes.delete(id.value);
      return Result.successEmpty();
    } catch (error) {
      return Result.failure(`Failed to delete recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exists(id: RecipeId): Promise<Result<boolean>> {
    try {
      const exists = this.recipes.has(id.value);
      return Result.success(exists);
    } catch (error) {
      return Result.failure(`Failed to check if recipe exists: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const count = this.recipes.size;
      return Result.success(count);
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
      const allRecipes = Array.from(this.recipes.values());
      const totalCount = allRecipes.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const recipes = allRecipes.slice(startIndex, endIndex);
      const hasNextPage = endIndex < totalCount;

      return Result.success({
        recipes,
        totalCount,
        hasNextPage,
      });
    } catch (error) {
      return Result.failure(`Failed to find recipes with pagination: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
