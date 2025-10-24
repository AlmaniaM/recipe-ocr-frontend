import { RecipeBookId } from '../../domain/valueObjects/RecipeBookId';

/**
 * Recipe Book Data Transfer Object
 * 
 * Used for transferring recipe book data between layers.
 */
export interface RecipeBookDto {
  id: string;
  title: string;
  description: string | null;
  coverImagePath: string | null;
  coverImageUrl: string | null;
  isLocal: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isArchived: boolean;
  recipeIds: string[];
  recipeCount: number;
  hasRecipes: boolean;
}

/**
 * Create Recipe Book Data Transfer Object
 */
export interface CreateRecipeBookDto {
  title: string;
  description?: string | null;
  coverImagePath?: string | null;
  coverImageUrl?: string | null;
  recipeIds?: string[];
}

/**
 * Update Recipe Book Data Transfer Object
 */
export interface UpdateRecipeBookDto {
  id: string;
  title?: string;
  description?: string | null;
  coverImagePath?: string | null;
  coverImageUrl?: string | null;
  recipeIds?: string[];
}
