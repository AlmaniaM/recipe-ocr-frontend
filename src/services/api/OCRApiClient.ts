/**
 * OCR API Client
 * 
 * Handles OCR (Optical Character Recognition) operations
 * including text extraction from images and batch processing.
 */

import { BaseApiClient } from './BaseApiClient';
import { RequestOptions } from './types';
import { API_ENDPOINTS } from './types';
import { OCRResult, TextBlock, BoundingBox } from '../../types/Recipe';

// OCR-specific DTOs
export interface ExtractTextRequest {
  imageBase64: string;
  imageFormat?: string;
  language?: string;
  enhanceImage?: boolean;
}

export interface BatchExtractTextRequest {
  images: ExtractTextRequest[];
}

export interface ExtractTextResponse {
  text: string;
  confidence: number;
  language: string;
  textBlocks: TextBlockDto[];
  isSuccess: boolean;
  errorMessage?: string;
}

export interface TextBlockDto {
  text: string;
  confidence: number;
  boundingBox: BoundingBoxDto;
}

export interface BoundingBoxDto {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BatchExtractTextResponse {
  results: ExtractTextResponse[];
  totalProcessed: number;
  successCount: number;
  failureCount: number;
}

// OCR API Client
export class OCRApiClient extends BaseApiClient {
  /**
   * Extract text from a single image
   */
  async extractText(request: ExtractTextRequest, options?: RequestOptions): Promise<OCRResult> {
    try {
      const response = await this.post<ExtractTextResponse>(
        API_ENDPOINTS.RECIPES.OCR,
        request,
        options
      );
      
      return this.mapToOCRResult(response);
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Extract text from multiple images in batch
   */
  async extractTextBatch(request: BatchExtractTextRequest, options?: RequestOptions): Promise<OCRResult[]> {
    try {
      const response = await this.post<BatchExtractTextResponse>(
        `${API_ENDPOINTS.RECIPES.OCR}/batch`,
        request,
        options
      );
      
      return response.results.map(result => this.mapToOCRResult(result));
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Extract text from image file URI (for React Native)
   */
  async extractTextFromUri(
    imageUri: string, 
    options?: RequestOptions & { 
      imageFormat?: string;
      language?: string;
      enhanceImage?: boolean;
    }
  ): Promise<OCRResult> {
    try {
      // Convert image URI to base64
      const imageBase64 = await this.convertImageUriToBase64(imageUri);
      
      const request: ExtractTextRequest = {
        imageBase64,
        imageFormat: options?.imageFormat || 'jpeg',
        language: options?.language,
        enhanceImage: options?.enhanceImage,
      };

      return this.extractText(request, options);
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Extract text from image with preprocessing
   */
  async extractTextWithPreprocessing(
    imageUri: string,
    preprocessingOptions: {
      crop?: { x: number; y: number; width: number; height: number };
      rotate?: number;
      enhance?: boolean;
      resize?: { width: number; height: number };
    },
    options?: RequestOptions
  ): Promise<OCRResult> {
    try {
      // Apply preprocessing to image
      const processedImageUri = await this.preprocessImage(imageUri, preprocessingOptions);
      
      // Extract text from processed image
      return this.extractTextFromUri(processedImageUri, options);
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get supported languages for OCR
   */
  async getSupportedLanguages(options?: RequestOptions): Promise<string[]> {
    try {
      const response = await this.get<string[]>(
        `${API_ENDPOINTS.RECIPES.OCR}/languages`,
        options
      );
      
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Check OCR service health
   */
  async checkHealth(options?: RequestOptions): Promise<boolean> {
    try {
      await this.get<void>(
        `${API_ENDPOINTS.RECIPES.OCR}/health`,
        options
      );
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Convert ExtractTextResponse to OCRResult
   */
  private mapToOCRResult(response: ExtractTextResponse): OCRResult {
    return {
      text: response.text,
      confidence: response.confidence,
      language: response.language,
      blocks: response.textBlocks.map(block => ({
        text: block.text,
        confidence: block.confidence,
        boundingBox: {
          x: block.boundingBox.x,
          y: block.boundingBox.y,
          width: block.boundingBox.width,
          height: block.boundingBox.height,
        },
      })),
    };
  }

  /**
   * Convert image URI to base64 string
   */
  private async convertImageUriToBase64(imageUri: string): Promise<string> {
    try {
      // For React Native, we need to use a different approach
      // This is a simplified version - in a real app, you'd use
      // react-native-fs or expo-file-system
      
      if (imageUri.startsWith('file://')) {
        // Handle local file URI
        const response = await fetch(imageUri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            // Remove data URL prefix
            const base64Data = base64.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else if (imageUri.startsWith('data:')) {
        // Handle data URL
        return imageUri.split(',')[1];
      } else {
        // Handle remote URL
        const response = await fetch(imageUri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            const base64Data = base64.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    } catch (error) {
      throw new Error(`Failed to convert image to base64: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Preprocess image before OCR
   */
  private async preprocessImage(
    imageUri: string, 
    options: {
      crop?: { x: number; y: number; width: number; height: number };
      rotate?: number;
      enhance?: boolean;
      resize?: { width: number; height: number };
    }
  ): Promise<string> {
    // This is a placeholder implementation
    // In a real app, you'd use image processing libraries
    // like expo-image-manipulator or react-native-image-crop-picker
    
    // For now, return the original URI
    // TODO: Implement actual image preprocessing
    console.warn('Image preprocessing not implemented yet');
    return imageUri;
  }
}
