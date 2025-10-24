import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/di/types';
import { IRecipeRepository } from '../../ports/IRecipeRepository';
import { Recipe } from '../../../domain/entities/Recipe';
import { UpdateRecipeDto, TimeRangeDto, ServingSizeDto, IngredientDto, DirectionDto, TagDto } from '../../dto/RecipeDto';
import { Result } from '../../../domain/common/Result';
import { RecipeId } from '../../../domain/valueObjects/RecipeId';
import { TimeRange } from '../../../domain/valueObjects/TimeRange';
import { ServingSize } from '../../../domain/valueObjects/ServingSize';
import { Ingredient } from '../../../domain/entities/Ingredient';
import { Direction } from '../../../domain/entities/Direction';
import { Tag } from '../../../domain/entities/Tag';

/**
 * Update Recipe Use Case
 * 
 * Handles the updating of existing recipes following Clean Architecture principles.
 * This use case encapsulates the business logic for recipe updates.
 */
@injectable()
export class UpdateRecipeUseCase {
  constructor(
    @inject(TYPES.RecipeRepository) private recipeRepository: IRecipeRepository
  ) {}

  /**
   * Updates an existing recipe
   * @param updateRecipeDto - The recipe update data
   * @returns Promise containing the updated recipe or error
   */
  async execute(updateRecipeDto: UpdateRecipeDto): Promise<Result<Recipe>> {
    try {
      // Validate input
      const validationResult = this.validateUpdateRecipeDto(updateRecipeDto);
      if (!validationResult.isSuccess) {
        return Result.failure(validationResult.error);
      }

      // Get existing recipe
      const recipeIdResult = RecipeId.from(updateRecipeDto.id);
      if (!recipeIdResult.isSuccess) {
        return Result.failure(recipeIdResult.error);
      }

      const recipeId = recipeIdResult.value;
      const existingRecipeResult = await this.recipeRepository.findById(recipeId);
      if (!existingRecipeResult.isSuccess) {
        return Result.failure(existingRecipeResult.error);
      }

      if (!existingRecipeResult.value) {
        return Result.failure('Recipe not found');
      }

      let recipe = existingRecipeResult.value;

      // Update basic properties
      if (updateRecipeDto.title !== undefined) {
        const updateResult = recipe.updateTitle(updateRecipeDto.title);
        if (!updateResult.isSuccess) {
          return Result.failure(updateResult.error);
        }
        recipe = updateResult.value;
      }

      if (updateRecipeDto.description !== undefined) {
        const updateResult = recipe.updateDescription(updateRecipeDto.description);
        if (!updateResult.isSuccess) {
          return Result.failure(updateResult.error);
        }
        recipe = updateResult.value;
      }

      if (updateRecipeDto.category !== undefined) {
        const updateResult = recipe.updateCategory(updateRecipeDto.category);
        if (!updateResult.isSuccess) {
          return Result.failure(updateResult.error);
        }
        recipe = updateResult.value;
      }

      if (updateRecipeDto.prepTime !== undefined) {
        if (updateRecipeDto.prepTime === null) {
          const updateResult = recipe.updatePrepTime(null);
          if (!updateResult.isSuccess) {
            return Result.failure(updateResult.error);
          }
          recipe = updateResult.value;
        } else {
          const prepTimeResult = this.mapTimeRangeDto(updateRecipeDto.prepTime);
          if (!prepTimeResult.isSuccess) {
            return Result.failure(prepTimeResult.error);
          }
          const updateResult = recipe.updatePrepTime(prepTimeResult.value);
          if (!updateResult.isSuccess) {
            return Result.failure(updateResult.error);
          }
          recipe = updateResult.value;
        }
      }

      if (updateRecipeDto.cookTime !== undefined) {
        if (updateRecipeDto.cookTime === null) {
          const updateResult = recipe.updateCookTime(null);
          if (!updateResult.isSuccess) {
            return Result.failure(updateResult.error);
          }
          recipe = updateResult.value;
        } else {
          const cookTimeResult = this.mapTimeRangeDto(updateRecipeDto.cookTime);
          if (!cookTimeResult.isSuccess) {
            return Result.failure(cookTimeResult.error);
          }
          const updateResult = recipe.updateCookTime(cookTimeResult.value);
          if (!updateResult.isSuccess) {
            return Result.failure(updateResult.error);
          }
          recipe = updateResult.value;
        }
      }

      if (updateRecipeDto.servings !== undefined) {
        if (updateRecipeDto.servings === null) {
          const updateResult = recipe.updateServings(null);
          if (!updateResult.isSuccess) {
            return Result.failure(updateResult.error);
          }
          recipe = updateResult.value;
        } else {
          const servingsResult = this.mapServingSizeDto(updateRecipeDto.servings);
          if (!servingsResult.isSuccess) {
            return Result.failure(servingsResult.error);
          }
          const updateResult = recipe.updateServings(servingsResult.value);
          if (!updateResult.isSuccess) {
            return Result.failure(updateResult.error);
          }
          recipe = updateResult.value;
        }
      }

      if (updateRecipeDto.source !== undefined) {
        const updateResult = recipe.updateSource(updateRecipeDto.source);
        if (!updateResult.isSuccess) {
          return Result.failure(updateResult.error);
        }
        recipe = updateResult.value;
      }

      if (updateRecipeDto.imagePath !== undefined) {
        const updateResult = recipe.updateImagePath(updateRecipeDto.imagePath);
        if (!updateResult.isSuccess) {
          return Result.failure(updateResult.error);
        }
        recipe = updateResult.value;
      }

      if (updateRecipeDto.imageUrl !== undefined) {
        const updateResult = recipe.updateImageUrl(updateRecipeDto.imageUrl);
        if (!updateResult.isSuccess) {
          return Result.failure(updateResult.error);
        }
        recipe = updateResult.value;
      }

      // Update ingredients if provided
      if (updateRecipeDto.ingredients !== undefined) {
        // Clear existing ingredients
        for (const existingIngredient of recipe.ingredients) {
          const removeResult = recipe.removeIngredient(existingIngredient.id);
          if (!removeResult.isSuccess) {
            return Result.failure(removeResult.error);
          }
          recipe = removeResult.value;
        }

        // Add new ingredients
        if (updateRecipeDto.ingredients.length > 0) {
          for (const ingredientDto of updateRecipeDto.ingredients) {
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
      }

      // Update directions if provided
      if (updateRecipeDto.directions !== undefined) {
        // Clear existing directions
        for (const existingDirection of recipe.directions) {
          const removeResult = recipe.removeDirection(existingDirection.id);
          if (!removeResult.isSuccess) {
            return Result.failure(removeResult.error);
          }
          recipe = removeResult.value;
        }

        // Add new directions
        if (updateRecipeDto.directions.length > 0) {
          for (const directionDto of updateRecipeDto.directions) {
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
      }

      // Update tags if provided
      if (updateRecipeDto.tags !== undefined) {
        // Clear existing tags
        for (const existingTag of recipe.tags) {
          const removeResult = recipe.removeTag(existingTag.id);
          if (!removeResult.isSuccess) {
            return Result.failure(removeResult.error);
          }
          recipe = removeResult.value;
        }

        // Add new tags
        if (updateRecipeDto.tags.length > 0) {
          for (const tagDto of updateRecipeDto.tags) {
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
      }

      // Save updated recipe to repository
      const saveResult = await this.recipeRepository.save(recipe);
      if (!saveResult.isSuccess) {
        return Result.failure(saveResult.error);
      }

      return Result.success(recipe);
    } catch (error) {
      return Result.failure(`Failed to update recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates the update recipe DTO
   */
  private validateUpdateRecipeDto(dto: UpdateRecipeDto): Result<void> {
    if (!dto.id || dto.id.trim().length === 0) {
      return Result.failure('Recipe ID is required');
    }

    if (dto.title !== undefined) {
      if (!dto.title || dto.title.trim().length === 0) {
        return Result.failure('Recipe title cannot be empty');
      }
      if (dto.title.length > 200) {
        return Result.failure('Recipe title cannot exceed 200 characters');
      }
    }

    if (dto.description !== undefined && dto.description && dto.description.length > 1000) {
      return Result.failure('Recipe description cannot exceed 1000 characters');
    }

    if (dto.source !== undefined && dto.source && dto.source.length > 200) {
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
