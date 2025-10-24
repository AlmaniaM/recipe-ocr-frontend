import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/di/types';
import { IRecipeRepository } from '../../ports/IRecipeRepository';
import { Recipe } from '../../../domain/entities/Recipe';
import { CreateRecipeDto, TimeRangeDto, ServingSizeDto, IngredientDto, DirectionDto, TagDto } from '../../dto/RecipeDto';
import { Result } from '../../../domain/common/Result';
import { TimeRange } from '../../../domain/valueObjects/TimeRange';
import { ServingSize } from '../../../domain/valueObjects/ServingSize';
import { Ingredient } from '../../../domain/entities/Ingredient';
import { Direction } from '../../../domain/entities/Direction';
import { Tag } from '../../../domain/entities/Tag';

/**
 * Create Recipe Use Case
 * 
 * Handles the creation of new recipes following Clean Architecture principles.
 * This use case encapsulates the business logic for recipe creation.
 */
@injectable()
export class CreateRecipeUseCase {
  constructor(
    @inject(TYPES.RecipeRepository) private recipeRepository: IRecipeRepository
  ) {}

  /**
   * Creates a new recipe
   * @param createRecipeDto - The recipe data
   * @returns Promise containing the created recipe or error
   */
  async execute(createRecipeDto: CreateRecipeDto): Promise<Result<Recipe>> {
    try {
      // Validate input
      const validationResult = this.validateCreateRecipeDto(createRecipeDto);
      if (!validationResult.isSuccess) {
        return Result.failure(validationResult.error);
      }

      // Create recipe entity
      const recipeResult = Recipe.create(
        createRecipeDto.title,
        createRecipeDto.description || null,
        createRecipeDto.category
      );

      if (!recipeResult.isSuccess) {
        return Result.failure(recipeResult.error);
      }

      let recipe = recipeResult.value;

      // Add additional properties if provided
      if (createRecipeDto.prepTime) {
        const prepTimeResult = this.mapTimeRangeDto(createRecipeDto.prepTime);
        if (!prepTimeResult.isSuccess) {
          return Result.failure(prepTimeResult.error);
        }
        const updateResult = recipe.updatePrepTime(prepTimeResult.value);
        if (!updateResult.isSuccess) {
          return Result.failure(updateResult.error);
        }
        recipe = updateResult.value;
      }

      if (createRecipeDto.cookTime) {
        const cookTimeResult = this.mapTimeRangeDto(createRecipeDto.cookTime);
        if (!cookTimeResult.isSuccess) {
          return Result.failure(cookTimeResult.error);
        }
        const updateResult = recipe.updateCookTime(cookTimeResult.value);
        if (!updateResult.isSuccess) {
          return Result.failure(updateResult.error);
        }
        recipe = updateResult.value;
      }

      if (createRecipeDto.servings) {
        const servingsResult = this.mapServingSizeDto(createRecipeDto.servings);
        if (!servingsResult.isSuccess) {
          return Result.failure(servingsResult.error);
        }
        const updateResult = recipe.updateServings(servingsResult.value);
        if (!updateResult.isSuccess) {
          return Result.failure(updateResult.error);
        }
        recipe = updateResult.value;
      }

      if (createRecipeDto.source) {
        const updateResult = recipe.updateSource(createRecipeDto.source);
        if (!updateResult.isSuccess) {
          return Result.failure(updateResult.error);
        }
        recipe = updateResult.value;
      }

      if (createRecipeDto.imagePath) {
        const updateResult = recipe.updateImagePath(createRecipeDto.imagePath);
        if (!updateResult.isSuccess) {
          return Result.failure(updateResult.error);
        }
        recipe = updateResult.value;
      }

      if (createRecipeDto.imageUrl) {
        const updateResult = recipe.updateImageUrl(createRecipeDto.imageUrl);
        if (!updateResult.isSuccess) {
          return Result.failure(updateResult.error);
        }
        recipe = updateResult.value;
      }

      // Add ingredients if provided
      if (createRecipeDto.ingredients && createRecipeDto.ingredients.length > 0) {
        for (const ingredientDto of createRecipeDto.ingredients) {
          const ingredientResult = this.mapIngredientDto(ingredientDto);
          if (!ingredientResult.isSuccess) {
            return Result.failure(ingredientResult.error);
          }
          const addResult = recipe.addIngredient(ingredientResult.value);
          if (!addResult.isSuccess) {
            return Result.failure(addResult.error);
          }
          recipe = addResult.value;
        }
      }

      // Add directions if provided
      if (createRecipeDto.directions && createRecipeDto.directions.length > 0) {
        for (const directionDto of createRecipeDto.directions) {
          const directionResult = this.mapDirectionDto(directionDto);
          if (!directionResult.isSuccess) {
            return Result.failure(directionResult.error);
          }
          const addResult = recipe.addDirection(directionResult.value);
          if (!addResult.isSuccess) {
            return Result.failure(addResult.error);
          }
          recipe = addResult.value;
        }
      }

      // Add tags if provided
      if (createRecipeDto.tags && createRecipeDto.tags.length > 0) {
        for (const tagDto of createRecipeDto.tags) {
          const tagResult = this.mapTagDto(tagDto);
          if (!tagResult.isSuccess) {
            return Result.failure(tagResult.error);
          }
          const addResult = recipe.addTag(tagResult.value);
          if (!addResult.isSuccess) {
            return Result.failure(addResult.error);
          }
          recipe = addResult.value;
        }
      }

      // Save to repository
      const saveResult = await this.recipeRepository.save(recipe);
      if (!saveResult.isSuccess) {
        return Result.failure(saveResult.error);
      }

      return Result.success(recipe);
    } catch (error) {
      return Result.failure(`Failed to create recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates the create recipe DTO
   */
  private validateCreateRecipeDto(dto: CreateRecipeDto): Result<void> {
    if (!dto.title || dto.title.trim().length === 0) {
      return Result.failure('Recipe title is required');
    }

    if (dto.title.length > 200) {
      return Result.failure('Recipe title cannot exceed 200 characters');
    }

    if (dto.description && dto.description.length > 1000) {
      return Result.failure('Recipe description cannot exceed 1000 characters');
    }

    if (dto.source && dto.source.length > 200) {
      return Result.failure('Recipe source cannot exceed 200 characters');
    }

    return Result.successEmpty();
  }

  /**
   * Maps TimeRangeDto to TimeRange domain object
   */
  private mapTimeRangeDto(dto: TimeRangeDto): Result<TimeRange> {
    try {
      if (dto.maxMinutes !== null) {
        return TimeRange.createRange(dto.minMinutes, dto.maxMinutes);
      } else {
        return TimeRange.create(dto.minMinutes);
      }
    } catch (error) {
      return Result.failure(`Invalid time range: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Maps ServingSizeDto to ServingSize domain object
   */
  private mapServingSizeDto(dto: ServingSizeDto): Result<ServingSize> {
    try {
      if (dto.maxServings !== null) {
        // For now, use the average of min and max servings
        const averageServings = Math.round((dto.minServings + dto.maxServings) / 2);
        return ServingSize.create(averageServings);
      } else {
        return ServingSize.create(dto.minServings);
      }
    } catch (error) {
      return Result.failure(`Invalid serving size: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Maps IngredientDto to Ingredient domain object
   */
  private mapIngredientDto(dto: IngredientDto): Result<Ingredient> {
    try {
      let ingredientResult: Result<Ingredient>;
      
      if (dto.amount) {
        ingredientResult = Ingredient.createWithAmount(
          dto.name,
          dto.amount.quantity,
          dto.amount.unit,
          dto.order
        );
      } else {
        ingredientResult = Ingredient.createWithText(dto.name, dto.order);
      }

      if (!ingredientResult.isSuccess) {
        return Result.failure(ingredientResult.error);
      }

      return Result.success(ingredientResult.value);
    } catch (error) {
      return Result.failure(`Invalid ingredient: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Maps DirectionDto to Direction domain object
   */
  private mapDirectionDto(dto: DirectionDto): Result<Direction> {
    try {
      const directionResult = Direction.create(
        dto.instruction,
        dto.order,
        false // isListItem
      );

      if (!directionResult.isSuccess) {
        return Result.failure(directionResult.error);
      }

      return Result.success(directionResult.value);
    } catch (error) {
      return Result.failure(`Invalid direction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Maps TagDto to Tag domain object
   */
  private mapTagDto(dto: TagDto): Result<Tag> {
    try {
      const tagResult = Tag.create(dto.name, dto.color);

      if (!tagResult.isSuccess) {
        return Result.failure(tagResult.error);
      }

      return Result.success(tagResult.value);
    } catch (error) {
      return Result.failure(`Invalid tag: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
