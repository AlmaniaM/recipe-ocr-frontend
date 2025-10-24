import { MLKitOCRService } from '../../../infrastructure/ocr/MLKitOCRService';
import { Result } from '../../../domain/common/Result';

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  getInfoAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  EncodingType: {
    Base64: 'base64',
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('MLKitOCRService', () => {
  let service: MLKitOCRService;
  let mockFileSystem: any;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    service = new MLKitOCRService();
    mockFileSystem = require('expo-file-system');
    mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Set up environment variable
    process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:5000/api';
  });

  describe('extractText', () => {
    it('should return failure for invalid image URI', async () => {
      const result = await service.extractText('invalid-uri');
      
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Invalid image URI provided');
    });

    it('should return failure for non-file URI', async () => {
      const result = await service.extractText('https://example.com/image.jpg');
      
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Invalid image URI provided');
    });

    it('should return failure for non-existent file', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: false });
      
      const result = await service.extractText('file://path/to/image.jpg');
      
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Image file does not exist');
    });

    it('should extract text using ML Kit when available', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true });
      
      const result = await service.extractText('file://path/to/image.jpg');
      
      expect(result.isSuccess).toBe(true);
      expect(result.value).toContain('Chocolate Chip Cookies');
      expect(result.value).toContain('Ingredients:');
    });

    it('should fallback to cloud OCR when ML Kit fails', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true });
      mockFileSystem.readAsStringAsync.mockResolvedValue('base64-image-data');
      
      // Mock successful cloud OCR response
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          extractedText: 'Cloud OCR extracted text',
          confidence: 0.85,
        }),
      } as Response);

      // Mock ML Kit failure by making the service unavailable
      (service as any).isMLKitAvailable = false;

      const result = await service.extractText('file://path/to/image.jpg');
      
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe('Cloud OCR extracted text');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/ocr/extract',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: 'base64-image-data',
            imageFormat: 'jpeg',
          }),
        })
      );
    });

    it('should handle cloud OCR failure', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true });
      mockFileSystem.readAsStringAsync.mockResolvedValue('base64-image-data');
      
      // Mock failed cloud OCR response
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      } as Response);

      (service as any).isMLKitAvailable = false;

      const result = await service.extractText('file://path/to/image.jpg');
      
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('HTTP error! status: 500');
    });
  });

  describe('extractTextFromMultiple', () => {
    it('should process multiple images successfully', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true });
      
      const imageUris = [
        'file://path/to/image1.jpg',
        'file://path/to/image2.jpg',
        'file://path/to/image3.jpg',
      ];

      const result = await service.extractTextFromMultiple(imageUris);
      
      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(3);
      expect(result.value[0]).toContain('Chocolate Chip Cookies');
    });

    it('should handle partial failures in batch processing', async () => {
      mockFileSystem.getInfoAsync
        .mockResolvedValueOnce({ exists: true })
        .mockResolvedValueOnce({ exists: false })
        .mockResolvedValueOnce({ exists: true });
      
      const imageUris = [
        'file://path/to/image1.jpg',
        'file://path/to/invalid.jpg',
        'file://path/to/image3.jpg',
      ];

      const result = await service.extractTextFromMultiple(imageUris);
      
      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(2);
    });

    it('should return failure when all images fail', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: false });
      
      const imageUris = [
        'file://path/to/invalid1.jpg',
        'file://path/to/invalid2.jpg',
      ];

      const result = await service.extractTextFromMultiple(imageUris);
      
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('All OCR extractions failed');
    });
  });

  describe('isAvailable', () => {
    it('should return availability status', async () => {
      const result = await service.isAvailable();
      
      expect(result.isSuccess).toBe(true);
      expect(typeof result.value).toBe('boolean');
    });
  });

  describe('getLastConfidenceScore', () => {
    it('should return confidence score', async () => {
      const result = await service.getLastConfidenceScore();
      
      expect(result.isSuccess).toBe(true);
      expect(typeof result.value).toBe('number');
      expect(result.value).toBeGreaterThanOrEqual(0);
      expect(result.value).toBeLessThanOrEqual(1);
    });
  });
});
