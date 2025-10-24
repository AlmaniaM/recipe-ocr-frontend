import { RecipeCategory } from '../../domain/enums/RecipeCategory';
import { TimeRange } from '../../domain/valueObjects/TimeRange';
import { ServingSize } from '../../domain/valueObjects/ServingSize';

/**
 * Recipe Data Transfer Object
 * 
 * Used for transferring recipe data between layers without exposing domain entities.
 * This follows the Data Transfer Object pattern.
 */
export interface RecipeDto {
  id: string;
  title: string;
  description: string | null;
  category: RecipeCategory;
  prepTime: TimeRangeDto | null;
  cookTime: TimeRangeDto | null;
  servings: ServingSizeDto | null;
  source: string | null;
  imagePath: string | null;
  imageUrl: string | null;
  isLocal: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isArchived: boolean;
  ingredients: IngredientDto[];
  directions: DirectionDto[];
  tags: TagDto[];
  totalTime: TimeRangeDto | null;
  ingredientCount: number;
  directionCount: number;
  tagCount: number;
  hasIngredients: boolean;
  hasDirections: boolean;
  hasTags: boolean;
}

export interface TimeRangeDto {
  minMinutes: number;
  maxMinutes: number | null;
  displayText: string;
}

export interface ServingSizeDto {
  minServings: number;
  maxServings: number | null;
  displayText: string;
}

export interface IngredientDto {
  id: string;
  name: string;
  amount: IngredientAmountDto | null;
  notes: string | null;
  order: number;
}

export interface IngredientAmountDto {
  quantity: number;
  unit: string;
  displayText: string;
}

export interface DirectionDto {
  id: string;
  instruction: string;
  order: number;
  notes: string | null;
}

export interface TagDto {
  id: string;
  name: string;
  color: string | null;
}

/**
 * Create Recipe Data Transfer Object
 * Used when creating new recipes
 */
export interface CreateRecipeDto {
  title: string;
  description?: string | null;
  category?: RecipeCategory;
  prepTime?: TimeRangeDto | null;
  cookTime?: TimeRangeDto | null;
  servings?: ServingSizeDto | null;
  source?: string | null;
  imagePath?: string | null;
  imageUrl?: string | null;
  ingredients?: IngredientDto[];
  directions?: DirectionDto[];
  tags?: TagDto[];
}

/**
 * Update Recipe Data Transfer Object
 * Used when updating existing recipes
 */
export interface UpdateRecipeDto {
  id: string;
  title?: string;
  description?: string | null;
  category?: RecipeCategory;
  prepTime?: TimeRangeDto | null;
  cookTime?: TimeRangeDto | null;
  servings?: ServingSizeDto | null;
  source?: string | null;
  imagePath?: string | null;
  imageUrl?: string | null;
  ingredients?: IngredientDto[];
  directions?: DirectionDto[];
  tags?: TagDto[];
}
