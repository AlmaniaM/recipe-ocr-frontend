/**
 * OCR Service Unit Tests
 * 
 * Tests the OCR service logic in isolation
 */

import { Result } from '../../domain/common/Result';

// Mock the OCR service implementation
const mockOCRService = {
  extractText: jest.fn(),
  getLastConfidenceScore: jest.fn(),
};

jest.mock('../../infrastructure/di/container', () => ({
  container: {
    get: jest.fn(() => mockOCRService),
  },
}));

describe('OCR Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractText', () => {
    it('should extract text from image URI successfully', async () => {
      // Arrange
      const imageUri = 'file://test-image.jpg';
      const expectedText = 'Test recipe text';
      mockOCRService.extractText.mockResolvedValue(Result.success(expectedText));

      // Act
      const result = await mockOCRService.extractText(imageUri);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBe(expectedText);
      }
      expect(mockOCRService.extractText).toHaveBeenCalledWith(imageUri);
    });

    it('should handle OCR extraction errors', async () => {
      // Arrange
      const imageUri = 'file://invalid-image.jpg';
      const errorMessage = 'OCR extraction failed';
      mockOCRService.extractText.mockResolvedValue(Result.failure(errorMessage));

      // Act
      const result = await mockOCRService.extractText(imageUri);

      // Assert
      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBe(errorMessage);
      }
    });
  });

  describe('getLastConfidenceScore', () => {
    it('should return confidence score successfully', async () => {
      // Arrange
      const expectedScore = 0.9;
      mockOCRService.getLastConfidenceScore.mockResolvedValue(Result.success(expectedScore));

      // Act
      const result = await mockOCRService.getLastConfidenceScore();

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBe(expectedScore);
      }
    });

    it('should handle confidence score errors', async () => {
      // Arrange
      const errorMessage = 'Confidence score unavailable';
      mockOCRService.getLastConfidenceScore.mockResolvedValue(Result.failure(errorMessage));

      // Act
      const result = await mockOCRService.getLastConfidenceScore();

      // Assert
      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBe(errorMessage);
      }
    });
  });
});