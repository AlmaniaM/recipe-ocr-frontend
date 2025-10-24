/**
 * Recipe Parsing API Client
 * 
 * Handles AI-powered recipe parsing operations including
 * text-to-recipe conversion and recipe structure extraction.
 */

import { BaseApiClient } from './BaseApiClient';
import { RequestOptions } from './types';
import { API_ENDPOINTS } from './types';
import { ParsedRecipe } from '../../types/Recipe';

// Recipe Parsing DTOs
export interface ParseRecipeRequest {
  text: string;
  imageUrl?: string;
  language?: string;
  parseMode?: 'standard' | 'detailed' | 'minimal';
  includeNutrition?: boolean;
  includeTiming?: boolean;
}

export interface ParseRecipeResponse {
  title: string;
  description?: string;
  ingredients: ParsedIngredientDto[];
  instructions: ParsedInstructionDto[];
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  category?: string;
  tags: string[];
  source?: string;
  notes?: string;
  confidence: number;
  isSuccess: boolean;
  errorMessage?: string;
}

export interface ParsedIngredientDto {
  text: string;
  amount?: string;
  unit?: string;
  name?: string;
  order: number;
}

export interface ParsedInstructionDto {
  text: string;
  isListItem: boolean;
  order: number;
}

export interface BatchParseRecipeRequest {
  texts: string[];
  imageUrls?: string[];
  language?: string;
  parseMode?: 'standard' | 'detailed' | 'minimal';
}

export interface BatchParseRecipeResponse {
  results: ParseRecipeResponse[];
  totalProcessed: number;
  successCount: number;
  failureCount: number;
}

export interface ParseRecipeWithImageRequest {
  text: string;
  imageBase64: string;
  imageFormat?: string;
  language?: string;
  parseMode?: 'standard' | 'detailed' | 'minimal';
}

// Recipe Parsing API Client
export class RecipeParsingApiClient extends BaseApiClient {
  /**
   * Parse recipe text using AI
   */
  async parseRecipe(request: ParseRecipeRequest, options?: RequestOptions): Promise<ParsedRecipe> {
    try {
      const response = await this.post<ParseRecipeResponse>(
        API_ENDPOINTS.RECIPES.PARSE,
        request,
        options
      );
      
      return this.mapToParsedRecipe(response);
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Parse recipe with image context
   */
  async parseRecipeWithImage(request: ParseRecipeWithImageRequest, options?: RequestOptions): Promise<ParsedRecipe> {
    try {
      const response = await this.post<ParseRecipeResponse>(
        `${API_ENDPOINTS.RECIPES.PARSE}/with-image`,
        request,
        options
      );
      
      return this.mapToParsedRecipe(response);
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Parse multiple recipes in batch
   */
  async parseRecipesBatch(request: BatchParseRecipeRequest, options?: RequestOptions): Promise<ParsedRecipe[]> {
    try {
      const response = await this.post<BatchParseRecipeResponse>(
        `${API_ENDPOINTS.RECIPES.PARSE}/batch`,
        request,
        options
      );
      
      return response.results.map(result => this.mapToParsedRecipe(result));
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Parse recipe from OCR text with image URI
   */
  async parseRecipeFromOCR(
    ocrText: string,
    imageUri?: string,
    options?: RequestOptions & {
      language?: string;
      parseMode?: 'standard' | 'detailed' | 'minimal';
    }
  ): Promise<ParsedRecipe> {
    try {
      let imageUrl: string | undefined;
      
      if (imageUri) {
        // Convert image URI to base64 and upload to server
        // or use the image URI directly if it's already accessible
        imageUrl = await this.processImageForParsing(imageUri);
      }

      const request: ParseRecipeRequest = {
        text: ocrText,
        imageUrl,
        language: options?.language,
        parseMode: options?.parseMode || 'standard',
      };

      return this.parseRecipe(request, options);
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Parse recipe with enhanced context
   */
  async parseRecipeWithContext(
    text: string,
    context: {
      cuisine?: string;
      dietary?: string[];
      difficulty?: 'easy' | 'medium' | 'hard';
      cookingMethod?: string;
      occasion?: string;
    },
    options?: RequestOptions
  ): Promise<ParsedRecipe> {
    try {
      const request: ParseRecipeRequest = {
        text,
        language: 'en',
        parseMode: 'detailed',
        includeNutrition: true,
        includeTiming: true,
      };

      // Add context to the text for better parsing
      const contextualText = this.buildContextualText(text, context);
      request.text = contextualText;

      return this.parseRecipe(request, options);
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get parsing suggestions for incomplete recipe
   */
  async getParsingSuggestions(
    partialText: string,
    options?: RequestOptions
  ): Promise<{
    suggestions: string[];
    confidence: number;
    missingElements: string[];
  }> {
    try {
      const response = await this.post<{
        suggestions: string[];
        confidence: number;
        missingElements: string[];
      }>(
        `${API_ENDPOINTS.RECIPES.PARSE}/suggestions`,
        { text: partialText },
        options
      );
      
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Validate parsed recipe structure
   */
  async validateParsedRecipe(
    parsedRecipe: ParsedRecipe,
    options?: RequestOptions
  ): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }> {
    try {
      const response = await this.post<{
        isValid: boolean;
        errors: string[];
        warnings: string[];
        suggestions: string[];
      }>(
        `${API_ENDPOINTS.RECIPES.PARSE}/validate`,
        parsedRecipe,
        options
      );
      
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get supported languages for parsing
   */
  async getSupportedLanguages(options?: RequestOptions): Promise<string[]> {
    try {
      const response = await this.get<string[]>(
        `${API_ENDPOINTS.RECIPES.PARSE}/languages`,
        options
      );
      
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Check parsing service health
   */
  async checkHealth(options?: RequestOptions): Promise<boolean> {
    try {
      await this.get<void>(
        `${API_ENDPOINTS.RECIPES.PARSE}/health`,
        options
      );
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Convert ParseRecipeResponse to ParsedRecipe
   */
  private mapToParsedRecipe(response: ParseRecipeResponse): ParsedRecipe {
    return {
      title: response.title,
      description: response.description,
      ingredients: response.ingredients.map(ing => ing.text),
      instructions: response.instructions.map(inst => inst.text),
      prepTime: response.prepTimeMinutes,
      cookTime: response.cookTimeMinutes,
      servings: response.servings,
      confidence: response.confidence,
    };
  }

  /**
   * Process image for parsing (convert to base64 or upload)
   */
  private async processImageForParsing(imageUri: string): Promise<string> {
    try {
      // For now, return the image URI as-is
      // In a real implementation, you might want to:
      // 1. Convert to base64
      // 2. Upload to a cloud storage service
      // 3. Return the accessible URL
      
      if (imageUri.startsWith('http')) {
        return imageUri;
      }
      
      // For local files, you'd need to upload them first
      // This is a placeholder implementation
      console.warn('Image processing for parsing not fully implemented');
      return imageUri;
    } catch (error) {
      throw new Error(`Failed to process image for parsing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build contextual text for better parsing
   */
  private buildContextualText(text: string, context: {
    cuisine?: string;
    dietary?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    cookingMethod?: string;
    occasion?: string;
  }): string {
    let contextualText = text;
    
    if (context.cuisine) {
      contextualText = `Cuisine: ${context.cuisine}\n${contextualText}`;
    }
    
    if (context.dietary && context.dietary.length > 0) {
      contextualText = `Dietary: ${context.dietary.join(', ')}\n${contextualText}`;
    }
    
    if (context.difficulty) {
      contextualText = `Difficulty: ${context.difficulty}\n${contextualText}`;
    }
    
    if (context.cookingMethod) {
      contextualText = `Cooking Method: ${context.cookingMethod}\n${contextualText}`;
    }
    
    if (context.occasion) {
      contextualText = `Occasion: ${context.occasion}\n${contextualText}`;
    }
    
    return contextualText;
  }
}
