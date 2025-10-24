import { injectable } from 'inversify';
import { IOCRService } from '../../application/ports/IOCRService';
import { Result } from '../../domain/common/Result';

/**
 * Mock OCR Service
 * 
 * A simple mock implementation for development and testing.
 * This will be replaced with real implementations (ML Kit, Google Vision) later.
 */
@injectable()
export class MockOCRService implements IOCRService {
  private lastConfidenceScore: number = 0.95;

  async extractText(imageUri: string): Promise<Result<string>> {
    try {
      // Simulate OCR processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock extracted text - in real implementation, this would process the image
      const mockText = `
        Grandma's Chocolate Chip Cookies
        
        Ingredients:
        - 2 1/4 cups all-purpose flour
        - 1 tsp baking soda
        - 1 tsp salt
        - 1 cup butter, softened
        - 3/4 cup granulated sugar
        - 3/4 cup packed brown sugar
        - 2 large eggs
        - 2 tsp vanilla extract
        - 2 cups chocolate chips
        
        Instructions:
        1. Preheat oven to 375°F
        2. Mix flour, baking soda, and salt in a bowl
        3. Beat butter and sugars until creamy
        4. Add eggs and vanilla, beat well
        5. Gradually beat in flour mixture
        6. Stir in chocolate chips
        7. Drop rounded tablespoons onto ungreased cookie sheets
        8. Bake 9-11 minutes until golden brown
        9. Cool on baking sheet for 2 minutes
        10. Remove to wire rack to cool completely
      `;

      // Simulate confidence score
      this.lastConfidenceScore = Math.random() * 0.3 + 0.7; // 0.7 to 1.0

      return Result.success(mockText.trim());
    } catch (error) {
      return Result.failure(`OCR extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async extractTextFromMultiple(imageUris: string[]): Promise<Result<string[]>> {
    try {
      const results: string[] = [];
      
      for (const imageUri of imageUris) {
        const result = await this.extractText(imageUri);
        if (result.isSuccess) {
          results.push(result.value);
        } else {
          return Result.failure(result.error);
        }
      }

      return Result.success(results);
    } catch (error) {
      return Result.failure(`OCR extraction from multiple images failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async isAvailable(): Promise<Result<boolean>> {
    try {
      // Mock availability check
      return Result.success(true);
    } catch (error) {
      return Result.failure(`Failed to check OCR availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getLastConfidenceScore(): Promise<Result<number>> {
    try {
      return Result.success(this.lastConfidenceScore);
    } catch (error) {
      return Result.failure(`Failed to get confidence score: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
