import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/di/types';
import { IOCRService } from '../../ports/IOCRService';
import { IRecipeParser } from '../../ports/IRecipeParser';
import { IRecipeRepository } from '../../ports/IRecipeRepository';
import { Recipe } from '../../../domain/entities/Recipe';
import { Result } from '../../../domain/common/Result';

/**
 * Capture and Process Recipe Use Case
 * 
 * Handles the complete workflow of capturing an image and processing it into a recipe.
 * This is the main use case for the OCR functionality.
 */
@injectable()
export class CaptureAndProcessRecipeUseCase {
  constructor(
    @inject(TYPES.OCRService) private ocrService: IOCRService,
    @inject(TYPES.RecipeParser) private recipeParser: IRecipeParser,
    @inject(TYPES.RecipeRepository) private recipeRepository: IRecipeRepository
  ) {}

  /**
   * Captures and processes a recipe from an image
   * @param imageUri - The URI of the captured image
   * @param saveToRepository - Whether to save the recipe to the repository
   * @returns Promise containing the processed recipe or error
   */
  async execute(
    imageUri: string, 
    saveToRepository: boolean = true
  ): Promise<Result<Recipe>> {
    try {
      // Validate input
      if (!imageUri || imageUri.trim().length === 0) {
        return Result.failure('Image URI is required');
      }

      // Check if OCR service is available
      const availabilityResult = await this.ocrService.isAvailable();
      if (!availabilityResult.isSuccess) {
        return Result.failure(availabilityResult.error);
      }

      if (!availabilityResult.value) {
        return Result.failure('OCR service is not available');
      }

      // Extract text from image
      const ocrResult = await this.ocrService.extractText(imageUri);
      if (!ocrResult.isSuccess) {
        return Result.failure(`OCR failed: ${ocrResult.error}`);
      }

      const extractedText = ocrResult.value;

      // Validate that we got meaningful text
      if (!extractedText || extractedText.trim().length === 0) {
        return Result.failure('No text could be extracted from the image');
      }

      // Validate if the text appears to be a recipe
      const validationResult = await this.recipeParser.validateRecipeText(extractedText);
      if (!validationResult.isSuccess) {
        return Result.failure(validationResult.error);
      }

      if (!validationResult.value) {
        return Result.failure('The extracted text does not appear to be a recipe');
      }

      // Parse the text into a recipe
      const parseResult = await this.recipeParser.parseRecipe(extractedText);
      if (!parseResult.isSuccess) {
        return Result.failure(`Recipe parsing failed: ${parseResult.error}`);
      }

      const recipe = parseResult.value;

      // Update recipe with image information
      const imageUpdateResult = recipe.updateImagePath(imageUri);
      if (!imageUpdateResult.isSuccess) {
        return Result.failure(imageUpdateResult.error);
      }

      // Save to repository if requested
      if (saveToRepository) {
        const saveResult = await this.recipeRepository.save(recipe);
        if (!saveResult.isSuccess) {
          return Result.failure(`Failed to save recipe: ${saveResult.error}`);
        }
      }

      return Result.success(recipe);
    } catch (error) {
      return Result.failure(`Failed to capture and process recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Processes multiple images into recipes
   * @param imageUris - Array of image URIs
   * @param saveToRepository - Whether to save recipes to the repository
   * @returns Promise containing array of processed recipes or error
   */
  async executeMultiple(
    imageUris: string[], 
    saveToRepository: boolean = true
  ): Promise<Result<Recipe[]>> {
    try {
      if (!imageUris || imageUris.length === 0) {
        return Result.failure('Image URIs are required');
      }

      const recipes: Recipe[] = [];
      const errors: string[] = [];

      // Process each image
      for (const imageUri of imageUris) {
        const result = await this.execute(imageUri, saveToRepository);
      if (result.isSuccess) {
        recipes.push(result.value);
      } else {
        errors.push(`Failed to process ${imageUri}: ${result.error}`);
      }
      }

      if (errors.length > 0 && recipes.length === 0) {
        return Result.failure(`All images failed to process: ${errors.join(', ')}`);
      }

      if (errors.length > 0) {
        // Some succeeded, some failed - return partial success
        console.warn(`Some images failed to process: ${errors.join(', ')}`);
      }

      return Result.success(recipes);
    } catch (error) {
      return Result.failure(`Failed to process multiple images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets the confidence score for the last OCR operation
   * @returns Promise containing confidence score or error
   */
  async getLastOCRConfidence(): Promise<Result<number>> {
    try {
      return await this.ocrService.getLastConfidenceScore();
    } catch (error) {
      return Result.failure(`Failed to get OCR confidence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets the confidence score for the last parsing operation
   * @returns Promise containing confidence score or error
   */
  async getLastParsingConfidence(): Promise<Result<number>> {
    try {
      return await this.recipeParser.getParsingConfidence();
    } catch (error) {
      return Result.failure(`Failed to get parsing confidence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
