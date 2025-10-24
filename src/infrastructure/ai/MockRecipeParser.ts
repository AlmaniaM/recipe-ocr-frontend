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

/**
 * Mock Recipe Parser
 * 
 * A simple mock implementation for development and testing.
 * This will be replaced with real implementations (Claude, Local LLM) later.
 */
@injectable()
export class MockRecipeParser implements IRecipeParser {
  private lastParsingConfidence: number = 0.9;

  async parseRecipe(text: string): Promise<Result<Recipe>> {
    try {
      // Simulate AI parsing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simple text parsing logic - in real implementation, this would use AI
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      let title = 'Untitled Recipe';
      let description = null;
      const ingredients: Ingredient[] = [];
      const directions: Direction[] = [];
      const tags: Tag[] = [];

      let currentSection = 'title';
      let directionOrder = 1;

      for (const line of lines) {
        const lowerLine = line.toLowerCase();

        // Detect title (usually the first non-empty line)
        if (currentSection === 'title' && line.length > 0) {
          title = line;
          currentSection = 'description';
          continue;
        }

        // Detect ingredients section
        if (lowerLine.includes('ingredient') || lowerLine.includes('ingredients')) {
          currentSection = 'ingredients';
          continue;
        }

        // Detect instructions section
        if (lowerLine.includes('instruction') || lowerLine.includes('directions') || 
            lowerLine.includes('steps') || lowerLine.includes('method')) {
          currentSection = 'instructions';
          continue;
        }

        // Parse ingredients
        if (currentSection === 'ingredients' && line.startsWith('-')) {
          const ingredientText = line.substring(1).trim();
          const ingredient = this.parseIngredient(ingredientText);
          if (ingredient.isSuccess) {
            ingredients.push(ingredient.value);
          }
        }

        // Parse directions
        if (currentSection === 'instructions' && (line.match(/^\d+\./) || line.startsWith('-'))) {
          const directionText = line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim();
          if (directionText.length > 0) {
            const direction = Direction.create(directionText, directionOrder);
            if (direction.isSuccess) {
              directions.push(direction.value);
              directionOrder++;
            }
          }
        }
      }

      // Create recipe
      const recipeResult = Recipe.create(title, description, RecipeCategory.Other);
      if (!recipeResult.isSuccess) {
        return Result.failure(recipeResult.error);
      }

      let recipe = recipeResult.value;

      // Add ingredients
      for (const ingredient of ingredients) {
        const addResult = recipe.addIngredient(ingredient);
        if (addResult.isSuccess) {
          recipe = addResult.value;
        }
      }

      // Add directions
      for (const direction of directions) {
        const addResult = recipe.addDirection(direction);
        if (addResult.isSuccess) {
          recipe = addResult.value;
        }
      }

      // Add some default tags
      const defaultTags = this.createDefaultTags();
      for (const tag of defaultTags) {
        const addResult = recipe.addTag(tag);
        if (addResult.isSuccess) {
          recipe = addResult.value;
        }
      }

      // Set some default times and servings
      const prepTime = TimeRange.createRange(15, 20);
      if (prepTime.isSuccess) {
        const updateResult = recipe.updatePrepTime(prepTime.value);
        if (updateResult.isSuccess) {
          recipe = updateResult.value;
        }
      }

      const cookTime = TimeRange.createRange(10, 15);
      if (cookTime.isSuccess) {
        const updateResult = recipe.updateCookTime(cookTime.value);
        if (updateResult.isSuccess) {
          recipe = updateResult.value;
        }
      }

      const servings = ServingSize.create(12);
      if (servings.isSuccess) {
        const updateResult = recipe.updateServings(servings.value);
        if (updateResult.isSuccess) {
          recipe = updateResult.value;
        }
      }

      // Simulate confidence score
      this.lastParsingConfidence = Math.random() * 0.2 + 0.8; // 0.8 to 1.0

      return Result.success(recipe);
    } catch (error) {
      return Result.failure(`Recipe parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async parseRecipes(texts: string[]): Promise<Result<Recipe[]>> {
    try {
      const recipes: Recipe[] = [];
      
      for (const text of texts) {
        const result = await this.parseRecipe(text);
        if (result.isSuccess) {
          recipes.push(result.value);
        } else {
          return Result.failure(result.error);
        }
      }

      return Result.success(recipes);
    } catch (error) {
      return Result.failure(`Recipe parsing from multiple texts failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateRecipeText(text: string): Promise<Result<boolean>> {
    try {
      // Simple validation - check for common recipe keywords
      const lowerText = text.toLowerCase();
      const recipeKeywords = ['ingredient', 'instruction', 'cook', 'bake', 'mix', 'cup', 'tablespoon', 'teaspoon'];
      
      const hasKeywords = recipeKeywords.some(keyword => lowerText.includes(keyword));
      const hasMultipleLines = text.split('\n').length > 3;
      
      return Result.success(hasKeywords && hasMultipleLines);
    } catch (error) {
      return Result.failure(`Failed to validate recipe text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getParsingConfidence(): Promise<Result<number>> {
    try {
      return Result.success(this.lastParsingConfidence);
    } catch (error) {
      return Result.failure(`Failed to get parsing confidence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseIngredient(text: string): Result<Ingredient> {
    try {
      // Simple ingredient parsing - look for amount and unit
      const amountMatch = text.match(/^(\d+(?:\.\d+)?)\s*(\w+)\s+(.+)$/);
      
      let amount: IngredientAmount | null = null;
      let name = text;
      
      if (amountMatch) {
        const quantity = parseFloat(amountMatch[1]);
        const unit = amountMatch[2];
        const ingredientName = amountMatch[3];
        
        const amountResult = IngredientAmount.create(quantity, unit);
        if (amountResult.isSuccess) {
          amount = amountResult.value;
        }
        name = ingredientName;
      }

      const ingredient = Ingredient.create(name, amount);
      return ingredient;
    } catch (error) {
      return Result.failure(`Failed to parse ingredient: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createDefaultTags(): Tag[] {
    const tags: Tag[] = [];
    
    // Add some common recipe tags
    const tagNames = ['Homemade', 'Family Recipe', 'Traditional'];
    
    for (let i = 0; i < tagNames.length; i++) {
      const tag = Tag.create(tagNames[i], `#${Math.floor(Math.random() * 16777215).toString(16)}`);
      if (tag.isSuccess) {
        tags.push(tag.value);
      }
    }

    return tags;
  }
}
