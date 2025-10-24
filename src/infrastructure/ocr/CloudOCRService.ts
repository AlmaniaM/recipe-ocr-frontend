import { injectable } from 'inversify';
import { IOCRService } from '../../application/ports/IOCRService';
import { Result } from '../../domain/common/Result';
import * as FileSystem from 'expo-file-system';

/**
 * Cloud OCR Service
 * 
 * Uses cloud-based OCR services (Google Cloud Vision API via backend)
 * as a fallback when on-device OCR is not available or fails.
 */
@injectable()
export class CloudOCRService implements IOCRService {
  private lastConfidenceScore: number = 0.0;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
  }

  async extractText(imageUri: string): Promise<Result<string>> {
    try {
      // Validate image URI
      if (!imageUri || !imageUri.startsWith('file://')) {
        return Result.failure('Invalid image URI provided');
      }

      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        return Result.failure('Image file does not exist');
      }

      // Convert image to base64 for cloud API
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64' as any,
      });

      // Call backend OCR API
      const response = await fetch(`${this.baseUrl}/ocr/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Image,
          imageFormat: 'jpeg',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();

      if (!result.success) {
        return Result.failure(result.error || 'Cloud OCR failed');
      }

      // Extract confidence score if available
      this.lastConfidenceScore = result.confidence || 0.7;

      return Result.success(result.extractedText || '');
    } catch (error) {
      return Result.failure(`Cloud OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async extractTextFromMultiple(imageUris: string[]): Promise<Result<string[]>> {
    try {
      const results: string[] = [];
      const errors: string[] = [];

      // Process images in parallel for better performance
      const promises = imageUris.map(async (imageUri) => {
        try {
          const result = await this.extractText(imageUri);
          return { success: true, result, error: null };
        } catch (error) {
          return { 
            success: false, 
            result: null, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      });

      const responses = await Promise.all(promises);

      for (const response of responses) {
        if (response.success && response.result?.isSuccess) {
          results.push(response.result.value);
        } else {
          errors.push(response.error || 'Unknown error');
        }
      }

      if (results.length === 0) {
        return Result.failure(`All cloud OCR extractions failed: ${errors.join(', ')}`);
      }

      return Result.success(results);
    } catch (error) {
      return Result.failure(`Batch cloud OCR extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async isAvailable(): Promise<Result<boolean>> {
    try {
      // Check if backend is reachable
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(`${this.baseUrl}/health`, {
          method: 'GET',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return Result.success(response.ok);
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      return Result.failure(`Cloud OCR service not available: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getLastConfidenceScore(): Promise<Result<number>> {
    try {
      return Result.success(this.lastConfidenceScore);
    } catch (error) {
      return Result.failure(`Failed to get confidence score: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sets the base URL for the cloud OCR service
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  /**
   * Gets the current base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}
