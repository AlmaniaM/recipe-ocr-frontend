import { Recipe } from '../../domain/entities/Recipe';
import { RecipeId } from '../../domain/valueObjects/RecipeId';
import { RecipeCategory } from '../../domain/enums/RecipeCategory';
import { Result } from '../../domain/common/Result';

/**
 * Recipe Repository Interface
 * 
 * Defines the contract for recipe data access operations.
 * This follows the Repository pattern and Dependency Inversion Principle.
 */
export interface IRecipeRepository {
  /**
   * Saves a recipe to the repository
   */
  save(recipe: Recipe): Promise<Result<void>>;
  
  /**
   * Finds a recipe by its ID
   */
  findById(id: RecipeId): Promise<Result<Recipe | null>>;
  
  /**
   * Finds all recipes
   */
  findAll(): Promise<Result<Recipe[]>>;
  
  /**
   * Finds recipes by category
   */
  findByCategory(category: RecipeCategory): Promise<Result<Recipe[]>>;
  
  /**
   * Searches recipes by title or description
   */
  search(query: string): Promise<Result<Recipe[]>>;
  
  /**
   * Finds recipes by tags
   */
  findByTags(tagIds: string[]): Promise<Result<Recipe[]>>;
  
  /**
   * Updates an existing recipe
   */
  update(recipe: Recipe): Promise<Result<void>>;
  
  /**
   * Deletes a recipe by ID
   */
  delete(id: RecipeId): Promise<Result<void>>;
  
  /**
   * Checks if a recipe exists
   */
  exists(id: RecipeId): Promise<Result<boolean>>;
  
  /**
   * Gets the total count of recipes
   */
  count(): Promise<Result<number>>;
  
  /**
   * Finds recipes with pagination
   */
  findWithPagination(page: number, pageSize: number): Promise<Result<{
    recipes: Recipe[];
    totalCount: number;
    hasNextPage: boolean;
  }>>;
}
