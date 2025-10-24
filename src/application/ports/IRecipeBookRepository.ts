import { RecipeBook } from '../../domain/entities/RecipeBook';
import { RecipeBookId } from '../../domain/valueObjects/RecipeBookId';
import { Result } from '../../domain/common/Result';

/**
 * Recipe Book Repository Interface
 * 
 * Defines the contract for recipe book data access operations.
 */
export interface IRecipeBookRepository {
  /**
   * Saves a recipe book to the repository
   */
  save(recipeBook: RecipeBook): Promise<Result<void>>;
  
  /**
   * Finds a recipe book by its ID
   */
  findById(id: RecipeBookId): Promise<Result<RecipeBook | null>>;
  
  /**
   * Finds all recipe books
   */
  findAll(): Promise<Result<RecipeBook[]>>;
  
  /**
   * Updates an existing recipe book
   */
  update(recipeBook: RecipeBook): Promise<Result<void>>;
  
  /**
   * Deletes a recipe book by ID
   */
  delete(id: RecipeBookId): Promise<Result<void>>;
  
  /**
   * Checks if a recipe book exists
   */
  exists(id: RecipeBookId): Promise<Result<boolean>>;
  
  /**
   * Gets the total count of recipe books
   */
  count(): Promise<Result<number>>;
  
  /**
   * Finds recipe books with pagination
   */
  findWithPagination(page: number, pageSize: number): Promise<Result<{
    recipeBooks: RecipeBook[];
    totalCount: number;
    hasNextPage: boolean;
  }>>;
}
