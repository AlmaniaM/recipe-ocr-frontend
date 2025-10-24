import { OCRResultProcessor } from '../../../infrastructure/ocr/OCRResultProcessor';
import { Result } from '../../../domain/common/Result';

describe('OCRResultProcessor', () => {
  describe('processText', () => {
    it('should return failure for empty text', () => {
      const result = OCRResultProcessor.processText('');
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('No text to process');
    });

    it('should return failure for whitespace-only text', () => {
      const result = OCRResultProcessor.processText('   \n\t  ');
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('No text to process');
    });

    it('should normalize whitespace', () => {
      const input = 'Line 1\r\nLine 2\rLine 3\n\n\nLine 4   \t   \n   Line 5';
      const result = OCRResultProcessor.processText(input);
      
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe('Line 1\nLine 2\nLine 3\nLine 4\nLine 5');
    });

    it('should fix common OCR errors', () => {
      const input = 'Ch0c0late Ch1p C00k1es\n1ngred1ents:\n- 2 1/4 cups f10ur';
      const result = OCRResultProcessor.processText(input);
      
      expect(result.isSuccess).toBe(true);
      expect(result.value).toContain('Chocolate');
      expect(result.value).toContain('Chip');
      expect(result.value).toContain('Cookies');
      expect(result.value).toContain('INGREDIENTS');
      expect(result.value).toContain('flour');
    });

    it('should improve text structure', () => {
      const input = 'ingredients:\n- 2 cups flour\ndirections:\n1. mix ingredients';
      const result = OCRResultProcessor.processText(input);
      
      expect(result.isSuccess).toBe(true);
      expect(result.value).toContain('INGREDIENTS');
      expect(result.value).toContain('DIRECTIONS');
    });

    it('should normalize list formatting', () => {
      const input = '• item 1\n* item 2\n- item 3\n1) item 4\n2. item 5';
      const result = OCRResultProcessor.processText(input);
      
      expect(result.isSuccess).toBe(true);
      expect(result.value).toContain('item 1');
      expect(result.value).toContain('item 2');
      expect(result.value).toContain('item 3');
      expect(result.value).toContain('item 4');
      expect(result.value).toContain('item 5');
    });

    it('should remove noise and special characters', () => {
      const input = 'Recipe@#$%^&*()_+{}|:"<>?[]\\;\'.,/`~';
      const result = OCRResultProcessor.processText(input);
      
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe('Recipe');
    });

    it('should handle complex recipe text', () => {
      const input = `
        Grandma's Chocolate Chip Cookies
        
        INGREDIENTS:
        - 2 1/4 cups all-purpose flour
        - 1 tsp baking soda
        - 1 tsp salt
        - 1 cup butter, softened
        - 3/4 cup granulated sugar
        - 3/4 cup packed brown sugar
        - 2 large eggs
        - 2 tsp vanilla extract
        - 2 cups chocolate chips
        
        DIRECTIONS:
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

      const result = OCRResultProcessor.processText(input);
      
      expect(result.isSuccess).toBe(true);
      expect(result.value).toContain("Grandmas Chocolate Chip Cookies");
      expect(result.value).toContain('INGREDIENTS');
      expect(result.value).toContain('DIRECTIONS');
      expect(result.value).toContain('preheat oven to 375F');
    });
  });

  describe('extractConfidenceScore', () => {
    it('should return base confidence for short text', () => {
      const text = 'short';
      const confidence = OCRResultProcessor.extractConfidenceScore(text);
      expect(confidence).toBe(0.5);
    });

    it('should increase confidence for longer text', () => {
      const text = 'This is a much longer text that should increase the confidence score because it has more content and structure';
      const confidence = OCRResultProcessor.extractConfidenceScore(text);
      expect(confidence).toBeGreaterThan(0.5);
    });

    it('should increase confidence for structured text', () => {
      const text = 'Ingredients:\n- 2 cups flour\nDirections:\n1. Mix ingredients';
      const confidence = OCRResultProcessor.extractConfidenceScore(text);
      expect(confidence).toBeGreaterThan(0.5);
    });

    it('should increase confidence for recipe-like text', () => {
      const text = 'Recipe with ingredients and directions and cooking instructions';
      const confidence = OCRResultProcessor.extractConfidenceScore(text);
      expect(confidence).toBeGreaterThan(0.5);
    });

    it('should increase confidence for text with measurements', () => {
      const text = '2 cups flour, 1 tablespoon sugar, 3 teaspoons salt';
      const confidence = OCRResultProcessor.extractConfidenceScore(text);
      expect(confidence).toBeGreaterThan(0.5);
    });

    it('should cap confidence at 1.0', () => {
      const text = 'A'.repeat(1000) + ' ingredients directions cup tablespoon teaspoon preheat oven cook bake mix';
      const confidence = OCRResultProcessor.extractConfidenceScore(text);
      expect(confidence).toBeLessThanOrEqual(1.0);
    });
  });

  describe('validateRecipeText', () => {
    it('should return success for valid recipe text', () => {
      const text = 'Chocolate Chip Cookies\nIngredients:\n- 2 cups flour\nDirections:\n1. Mix ingredients\nPreheat oven to 375°F';
      const result = OCRResultProcessor.validateRecipeText(text);
      
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(true);
    });

    it('should return failure for text without recipe indicators', () => {
      const text = 'This is just some random text without any recipe content';
      const result = OCRResultProcessor.validateRecipeText(text);
      
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Text does not appear to be a recipe');
    });

    it('should return failure for text that is too short', () => {
      const text = 'Recipe ingredients';
      const result = OCRResultProcessor.validateRecipeText(text);
      
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Text is too short to be a recipe');
    });

    it('should return success for text with minimal recipe indicators', () => {
      const text = 'This is a recipe with ingredients and directions for cooking and baking in the oven with cups and tablespoons';
      const result = OCRResultProcessor.validateRecipeText(text);
      
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(true);
    });

    it('should handle case-insensitive validation', () => {
      const text = 'INGREDIENTS AND DIRECTIONS FOR COOKING AND BAKING';
      const result = OCRResultProcessor.validateRecipeText(text);
      
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(true);
    });
  });
});
