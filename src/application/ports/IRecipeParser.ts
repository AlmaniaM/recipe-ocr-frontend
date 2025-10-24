import { Result } from '../../domain/common/Result';
import { Recipe } from '../../domain/entities/Recipe';

/**
 * Recipe Parser Interface
 * 
 * Defines the contract for parsing recipe text into structured data.
 * This allows for different AI parsing implementations (Claude, Local LLM, etc.)
 */
export interface IRecipeParser {
  /**
   * Parses raw recipe text into a structured Recipe entity
   * @param text - The raw text to parse
   * @returns Promise containing the parsed Recipe or error
   */
  parseRecipe(text: string): Promise<Result<Recipe>>;
  
  /**
   * Parses multiple recipe texts
   * @param texts - Array of raw texts to parse
   * @returns Promise containing array of parsed Recipe results
   */
  parseRecipes(texts: string[]): Promise<Result<Recipe[]>>;
  
  /**
   * Validates if the text appears to be a recipe
   * @param text - The text to validate
   * @returns Promise containing validation result
   */
  validateRecipeText(text: string): Promise<Result<boolean>>;
  
  /**
   * Gets parsing confidence score
   * @returns Promise containing confidence score (0-1)
   */
  getParsingConfidence(): Promise<Result<number>>;
}
