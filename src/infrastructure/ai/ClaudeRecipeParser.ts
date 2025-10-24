import { injectable } from 'inversify';
import { IRecipeParser } from '../../application/ports/IRecipeParser';
import { Recipe } from '../../domain/entities/Recipe';
import { RecipeCategory } from '../../domain/enums/RecipeCategory';
import { Ingredient } from '../../domain/entities/Ingredient';
import { Direction } from '../../domain/entities/Direction';
import { Tag } from '../../domain/entities/Tag';
import { IngredientAmount } from '../../domain/valueObjects/IngredientAmount';
import { TimeRange } from '../../domain/valueObjects/TimeRange';
import { ServingSize } from '../../domain/valueObjects/ServingSize';
import { Result } from '../../domain/common/Result';
import { RecipeId } from '../../domain/valueObjects/RecipeId';

/**
 * Claude AI Recipe Parser
 * 
 * Real implementation using Claude API for recipe parsing.
 * This replaces the mock implementation with actual AI integration.
 */
@injectable()
export class ClaudeRecipeParser implements IRecipeParser {
  private readonly apiBaseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
    this.apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';
  }

  async parseRecipe(text: string): Promise<Result<Recipe>> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/recipes/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          extractedText: text,
          useLocalLLM: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        return Result.failure(data.error || 'Failed to parse recipe');
      }

      const recipe = this.mapApiResponseToRecipe(data.recipe);
      return Result.success(recipe);
    } catch (error) {
      console.error('Claude recipe parsing failed:', error);
      return Result.failure(`Claude AI parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async parseRecipes(texts: string[]): Promise<Result<Recipe[]>> {
    const results: Recipe[] = [];
    const errors: string[] = [];

    for (const text of texts) {
      const result = await this.parseRecipe(text);
      if (result.isSuccess) {
        results.push(result.value);
      } else {
        errors.push(result.error);
      }
    }

    if (errors.length > 0 && results.length === 0) {
      return Result.failure(`All parsing attempts failed: ${errors.join(', ')}`);
    }

    return Result.success(results);
  }

  async validateRecipeText(text: string): Promise<Result<boolean>> {
    try {
      // Simple validation - check if text contains common recipe keywords
      const recipeKeywords = [
        'ingredients', 'directions', 'instructions', 'prep', 'cook', 'bake',
        'fry', 'boil', 'mix', 'stir', 'add', 'cup', 'tablespoon', 'teaspoon',
        'minutes', 'hours', 'servings', 'recipe'
      ];

      const lowerText = text.toLowerCase();
      const keywordCount = recipeKeywords.filter(keyword => 
        lowerText.includes(keyword)
      ).length;

      const isValid = keywordCount >= 3; // At least 3 recipe keywords
      return Result.success(isValid);
    } catch (error) {
      return Result.failure(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getParsingConfidence(): Promise<Result<number>> {
    // Claude AI typically has high confidence for recipe parsing
    return Result.success(0.95);
  }

  private mapApiResponseToRecipe(apiRecipe: any): Recipe {
    // Map API response to domain Recipe entity
    const recipeResult = Recipe.create(
      apiRecipe.title || 'Untitled Recipe',
      apiRecipe.description || null,
      this.mapCategory(apiRecipe.category?.name)
    );

    if (recipeResult.isFailure) {
      throw new Error(recipeResult.error);
    }

    let recipe = recipeResult.value;

    // Add ingredients
    if (apiRecipe.ingredients && Array.isArray(apiRecipe.ingredients)) {
      for (const ingredientData of apiRecipe.ingredients) {
        const ingredientResult = this.createIngredient(ingredientData);
        if (ingredientResult.isSuccess) {
          const addResult = recipe.addIngredient(ingredientResult.value);
          if (addResult.isSuccess) {
            recipe = addResult.value;
          }
        }
      }
    }

    // Add directions
    if (apiRecipe.directions && Array.isArray(apiRecipe.directions)) {
      for (const directionData of apiRecipe.directions) {
        const directionResult = this.createDirection(directionData);
        if (directionResult.isSuccess) {
          const addResult = recipe.addDirection(directionResult.value);
          if (addResult.isSuccess) {
            recipe = addResult.value;
          }
        }
      }
    }

    // Add tags
    if (apiRecipe.tags && Array.isArray(apiRecipe.tags)) {
      for (const tagData of apiRecipe.tags) {
        const tagResult = this.createTag(tagData);
        if (tagResult.isSuccess) {
          const addResult = recipe.addTag(tagResult.value);
          if (addResult.isSuccess) {
            recipe = addResult.value;
          }
        }
      }
    }

    // Update timing information
    if (apiRecipe.prepTime) {
      const prepTimeResult = this.parseTimeRange(apiRecipe.prepTime);
      if (prepTimeResult.isSuccess) {
        const updateResult = recipe.updatePrepTime(prepTimeResult.value);
        if (updateResult.isSuccess) {
          recipe = updateResult.value;
        }
      }
    }

    if (apiRecipe.cookTime) {
      const cookTimeResult = this.parseTimeRange(apiRecipe.cookTime);
      if (cookTimeResult.isSuccess) {
        const updateResult = recipe.updateCookTime(cookTimeResult.value);
        if (updateResult.isSuccess) {
          recipe = updateResult.value;
        }
      }
    }

    // Update servings
    if (apiRecipe.servings) {
      const servingsResult = this.parseServingSize(apiRecipe.servings);
      if (servingsResult.isSuccess) {
        const updateResult = recipe.updateServings(servingsResult.value);
        if (updateResult.isSuccess) {
          recipe = updateResult.value;
        }
      }
    }

    // Update source
    if (apiRecipe.source) {
      const updateResult = recipe.updateSource(apiRecipe.source);
      if (updateResult.isSuccess) {
        recipe = updateResult.value;
      }
    }

    return recipe;
  }

  private mapCategory(categoryName?: string): RecipeCategory {
    if (!categoryName) return RecipeCategory.Other;

    const categoryMap: Record<string, RecipeCategory> = {
      'Appetizer': RecipeCategory.Appetizer,
      'MainCourse': RecipeCategory.MainCourse,
      'Dessert': RecipeCategory.Dessert,
      'SideDish': RecipeCategory.SideDish,
      'Beverage': RecipeCategory.Beverage,
      'Other': RecipeCategory.Other,
    };

    return categoryMap[categoryName] || RecipeCategory.Other;
  }

  private createIngredient(ingredientData: any): Result<Ingredient> {
    try {
      const text = ingredientData.text || '';
      const amount = ingredientData.amount ? IngredientAmount.create(
        ingredientData.amount.quantity || 1,
        ingredientData.amount.unit || ''
      ).value : null;

      return Ingredient.create(text, amount);
    } catch (error) {
      return Result.failure(`Failed to create ingredient: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createDirection(directionData: any): Result<Direction> {
    try {
      const text = directionData.text || '';
      const isListItem = directionData.isListItem !== false; // Default to true

      return Direction.create(text);
    } catch (error) {
      return Result.failure(`Failed to create direction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createTag(tagData: any): Result<Tag> {
    try {
      const name = tagData.name || tagData;
      return Tag.create(name);
    } catch (error) {
      return Result.failure(`Failed to create tag: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseTimeRange(timeString: string): Result<TimeRange> {
    try {
      // Simple time parsing - extract minutes from strings like "15 minutes", "1 hour", etc.
      const match = timeString.match(/(\d+)\s*(minute|hour|hr|min)/i);
      if (!match) {
        return Result.failure('Invalid time format');
      }

      const value = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();

      let minutes: number;
      if (unit === 'hour' || unit === 'hr') {
        minutes = value * 60;
      } else {
        minutes = value;
      }

      return TimeRange.create(minutes);
    } catch (error) {
      return Result.failure(`Failed to parse time: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseServingSize(servingString: string): Result<ServingSize> {
    try {
      // Simple serving parsing - extract number from strings like "4 servings", "serves 6", etc.
      const match = servingString.match(/(\d+)/);
      if (!match) {
        return Result.failure('Invalid serving format');
      }

      const count = parseInt(match[1], 10);
      return ServingSize.create(count);
    } catch (error) {
      return Result.failure(`Failed to parse servings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
