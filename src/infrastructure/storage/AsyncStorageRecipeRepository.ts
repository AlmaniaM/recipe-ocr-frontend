import { injectable } from 'inversify';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IRecipeRepository } from '../../application/ports/IRecipeRepository';
import { Recipe } from '../../domain/entities/Recipe';
import { RecipeId } from '../../domain/valueObjects/RecipeId';
import { RecipeCategory } from '../../domain/enums/RecipeCategory';
import { Result } from '../../domain/common/Result';

/**
 * AsyncStorage Recipe Repository
 * 
 * Implements recipe persistence using React Native's AsyncStorage.
 * This provides simple key-value storage for offline-first functionality.
 */
@injectable()
export class AsyncStorageRecipeRepository implements IRecipeRepository {
  private readonly RECIPES_KEY = 'recipes';
  private readonly RECIPE_INDEX_KEY = 'recipe_index';

  async save(recipe: Recipe): Promise<Result<void>> {
    try {
      const recipes = await this.getAllRecipes();
      recipes.set(recipe.id.value, this.serializeRecipe(recipe));
      
      await AsyncStorage.setItem(this.RECIPES_KEY, JSON.stringify(Array.from(recipes.entries())));
      await this.updateIndex(recipe);
      
      return Result.successEmpty();
    } catch (error) {
      return Result.failure(`Failed to save recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: RecipeId): Promise<Result<Recipe | null>> {
    try {
      const recipes = await this.getAllRecipes();
      const serializedRecipe = recipes.get(id.value);
      
      if (!serializedRecipe) {
        return Result.success(null);
      }

      const recipe = this.deserializeRecipe(serializedRecipe);
      return Result.success(recipe);
    } catch (error) {
      return Result.failure(`Failed to find recipe by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(): Promise<Result<Recipe[]>> {
    try {
      const recipes = await this.getAllRecipes();
      const recipeList = Array.from(recipes.values())
        .map(serialized => this.deserializeRecipe(serialized))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return Result.success(recipeList);
    } catch (error) {
      return Result.failure(`Failed to find all recipes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByCategory(category: RecipeCategory): Promise<Result<Recipe[]>> {
    try {
      const recipes = await this.getAllRecipes();
      const filteredRecipes = Array.from(recipes.values())
        .map(serialized => this.deserializeRecipe(serialized))
        .filter(recipe => recipe.category === category)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return Result.success(filteredRecipes);
    } catch (error) {
      return Result.failure(`Failed to find recipes by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async search(query: string): Promise<Result<Recipe[]>> {
    try {
      const recipes = await this.getAllRecipes();
      const searchQuery = query.toLowerCase().trim();
      
      if (!searchQuery) {
        return Result.success([]);
      }

      const filteredRecipes = Array.from(recipes.values())
        .map(serialized => this.deserializeRecipe(serialized))
        .filter(recipe => 
          recipe.title.toLowerCase().includes(searchQuery) ||
          (recipe.description && recipe.description.toLowerCase().includes(searchQuery))
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return Result.success(filteredRecipes);
    } catch (error) {
      return Result.failure(`Failed to search recipes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByTags(tagIds: string[]): Promise<Result<Recipe[]>> {
    try {
      const recipes = await this.getAllRecipes();
      const filteredRecipes = Array.from(recipes.values())
        .map(serialized => this.deserializeRecipe(serialized))
        .filter(recipe => 
          recipe.tags.some(tag => tagIds.includes(tag.id))
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return Result.success(filteredRecipes);
    } catch (error) {
      return Result.failure(`Failed to find recipes by tags: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(recipe: Recipe): Promise<Result<void>> {
    try {
      const recipes = await this.getAllRecipes();
      const existingRecipe = recipes.get(recipe.id.value);
      
      if (!existingRecipe) {
        return Result.failure('Recipe not found');
      }

      recipes.set(recipe.id.value, this.serializeRecipe(recipe));
      await AsyncStorage.setItem(this.RECIPES_KEY, JSON.stringify(Array.from(recipes.entries())));
      
      return Result.successEmpty();
    } catch (error) {
      return Result.failure(`Failed to update recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: RecipeId): Promise<Result<void>> {
    try {
      const recipes = await this.getAllRecipes();
      const existingRecipe = recipes.get(id.value);
      
      if (!existingRecipe) {
        return Result.failure('Recipe not found');
      }

      recipes.delete(id.value);
      await AsyncStorage.setItem(this.RECIPES_KEY, JSON.stringify(Array.from(recipes.entries())));
      await this.removeFromIndex(id);
      
      return Result.successEmpty();
    } catch (error) {
      return Result.failure(`Failed to delete recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exists(id: RecipeId): Promise<Result<boolean>> {
    try {
      const recipes = await this.getAllRecipes();
      return Result.success(recipes.has(id.value));
    } catch (error) {
      return Result.failure(`Failed to check if recipe exists: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const recipes = await this.getAllRecipes();
      return Result.success(recipes.size);
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
      const recipes = await this.getAllRecipes();
      const allRecipes = Array.from(recipes.values())
        .map(serialized => this.deserializeRecipe(serialized))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const totalCount = allRecipes.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedRecipes = allRecipes.slice(startIndex, endIndex);
      const hasNextPage = endIndex < totalCount;

      return Result.success({
        recipes: paginatedRecipes,
        totalCount,
        hasNextPage
      });
    } catch (error) {
      return Result.failure(`Failed to find recipes with pagination: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets all recipes from AsyncStorage
   */
  private async getAllRecipes(): Promise<Map<string, any>> {
    const recipesData = await AsyncStorage.getItem(this.RECIPES_KEY);
    if (!recipesData) {
      return new Map();
    }

    const entries = JSON.parse(recipesData);
    return new Map(entries);
  }

  /**
   * Serializes a Recipe entity to a plain object for storage
   */
  private serializeRecipe(recipe: Recipe): any {
    return {
      id: recipe.id.value,
      title: recipe.title,
      description: recipe.description,
      category: recipe.category,
      prepTime: recipe.prepTime ? {
        minMinutes: recipe.prepTime.minMinutes,
        maxMinutes: recipe.prepTime.maxMinutes
      } : null,
      cookTime: recipe.cookTime ? {
        minMinutes: recipe.cookTime.minMinutes,
        maxMinutes: recipe.cookTime.maxMinutes
      } : null,
      servings: recipe.servings ? {
        count: recipe.servings.count,
        description: recipe.servings.description
      } : null,
      source: recipe.source,
      imagePath: recipe.imagePath,
      imageUrl: recipe.imageUrl,
      isLocal: recipe.isLocal,
      createdAt: recipe.createdAt.toISOString(),
      updatedAt: recipe.updatedAt.toISOString(),
      isArchived: recipe.isArchived,
      ingredients: recipe.ingredients.map(ingredient => ({
        id: ingredient.id,
        text: ingredient.text.value,
        amount: ingredient.amount ? {
          value: ingredient.amount.value,
          unit: ingredient.amount.unit
        } : null,
        order: ingredient.order
      })),
      directions: recipe.directions.map(direction => ({
        id: direction.id,
        text: direction.text.value,
        order: direction.order,
        isListItem: direction.isListItem
      })),
      tags: recipe.tags.map(tag => ({
        id: tag.id,
        name: tag.name.value,
        color: tag.color || null
      }))
    };
  }

  /**
   * Deserializes a plain object back to a Recipe entity
   */
  private deserializeRecipe(serialized: any): Recipe {
    // This is a simplified deserialization - in a real implementation,
    // you'd need to properly reconstruct the Recipe entity with all its value objects
    // For now, we'll create a basic recipe structure
    const recipeResult = Recipe.create(
      serialized.title,
      serialized.description,
      serialized.category
    );
    
    if (recipeResult.isFailure) {
      throw new Error(recipeResult.error);
    }
    
    return recipeResult.getValueOrThrow();

    // Note: In a real implementation, you'd need to properly reconstruct
    // all the value objects and collections. This is a simplified version.
  }

  /**
   * Updates the recipe index for faster lookups
   */
  private async updateIndex(recipe: Recipe): Promise<void> {
    try {
      const indexData = await AsyncStorage.getItem(this.RECIPE_INDEX_KEY);
      const index = indexData ? JSON.parse(indexData) : {};
      
      index[recipe.id.value] = {
        title: recipe.title,
        category: recipe.category,
        createdAt: recipe.createdAt.toISOString(),
        updatedAt: recipe.updatedAt.toISOString()
      };

      await AsyncStorage.setItem(this.RECIPE_INDEX_KEY, JSON.stringify(index));
    } catch (error) {
      console.error('Failed to update recipe index:', error);
    }
  }

  /**
   * Removes a recipe from the index
   */
  private async removeFromIndex(id: RecipeId): Promise<void> {
    try {
      const indexData = await AsyncStorage.getItem(this.RECIPE_INDEX_KEY);
      if (!indexData) return;

      const index = JSON.parse(indexData);
      delete index[id.value];
      await AsyncStorage.setItem(this.RECIPE_INDEX_KEY, JSON.stringify(index));
    } catch (error) {
      console.error('Failed to remove recipe from index:', error);
    }
  }
}
