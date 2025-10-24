import { Result } from '../../domain/common/Result';

/**
 * OCR Service Interface
 * 
 * Defines the contract for Optical Character Recognition operations.
 * This allows for different OCR implementations (ML Kit, Google Vision, etc.)
 */
export interface IOCRService {
  /**
   * Extracts text from an image
   * @param imageUri - The URI of the image to process
   * @returns Promise containing the extracted text or error
   */
  extractText(imageUri: string): Promise<Result<string>>;
  
  /**
   * Extracts text from multiple images
   * @param imageUris - Array of image URIs to process
   * @returns Promise containing array of extracted text results
   */
  extractTextFromMultiple(imageUris: string[]): Promise<Result<string[]>>;
  
  /**
   * Checks if OCR service is available
   * @returns Promise containing availability status
   */
  isAvailable(): Promise<Result<boolean>>;
  
  /**
   * Gets the confidence score for the last extraction
   * @returns Promise containing confidence score (0-1)
   */
  getLastConfidenceScore(): Promise<Result<number>>;
}
