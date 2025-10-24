import { HybridOCRService } from '../../../infrastructure/ocr/HybridOCRService';
import { MLKitOCRService } from '../../../infrastructure/ocr/MLKitOCRService';
import { CloudOCRService } from '../../../infrastructure/ocr/CloudOCRService';
import { Result } from '../../../domain/common/Result';

// Mock the individual services
jest.mock('../../../infrastructure/ocr/MLKitOCRService');
jest.mock('../../../infrastructure/ocr/CloudOCRService');

describe('HybridOCRService', () => {
  let service: HybridOCRService;
  let mockMLKitService: jest.Mocked<MLKitOCRService>;
  let mockCloudService: jest.Mocked<CloudOCRService>;

  beforeEach(() => {
    // Create mock instances
    mockMLKitService = {
      extractText: jest.fn(),
      extractTextFromMultiple: jest.fn(),
      isAvailable: jest.fn(),
      getLastConfidenceScore: jest.fn(),
    } as any;

    mockCloudService = {
      extractText: jest.fn(),
      extractTextFromMultiple: jest.fn(),
      isAvailable: jest.fn(),
      getLastConfidenceScore: jest.fn(),
    } as any;

    // Mock constructors
    (MLKitOCRService as jest.MockedClass<typeof MLKitOCRService>).mockImplementation(() => mockMLKitService);
    (CloudOCRService as jest.MockedClass<typeof CloudOCRService>).mockImplementation(() => mockCloudService);

    service = new HybridOCRService();
  });

  describe('extractText', () => {
    it('should use ML Kit when available and successful', async () => {
      const mockText = 'ML Kit extracted text';
      mockMLKitService.extractText.mockResolvedValue(Result.success(mockText));
      mockMLKitService.getLastConfidenceScore.mockResolvedValue(Result.success(0.9));

      const result = await service.extractText('file://path/to/image.jpg');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(mockText);
      expect(mockMLKitService.extractText).toHaveBeenCalledWith('file://path/to/image.jpg');
      expect(mockCloudService.extractText).not.toHaveBeenCalled();
    });

    it('should fallback to cloud when ML Kit fails', async () => {
      const mockMLKitError = 'ML Kit failed';
      const mockCloudText = 'Cloud extracted text';
      
      mockMLKitService.extractText.mockResolvedValue(Result.failure(mockMLKitError));
      mockCloudService.extractText.mockResolvedValue(Result.success(mockCloudText));
      mockCloudService.getLastConfidenceScore.mockResolvedValue(Result.success(0.8));

      const result = await service.extractText('file://path/to/image.jpg');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(mockCloudText);
      expect(mockMLKitService.extractText).toHaveBeenCalledWith('file://path/to/image.jpg');
      expect(mockCloudService.extractText).toHaveBeenCalledWith('file://path/to/image.jpg');
    });

    it('should return failure when both services fail', async () => {
      const mockMLKitError = 'ML Kit failed';
      const mockCloudError = 'Cloud failed';
      
      mockMLKitService.extractText.mockResolvedValue(Result.failure(mockMLKitError));
      mockCloudService.extractText.mockResolvedValue(Result.failure(mockCloudError));

      const result = await service.extractText('file://path/to/image.jpg');

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Both ML Kit and cloud OCR failed');
      expect(result.error).toContain(mockMLKitError);
      expect(result.error).toContain(mockCloudError);
    });

    it('should handle exceptions gracefully', async () => {
      mockMLKitService.extractText.mockRejectedValue(new Error('Unexpected error'));

      const result = await service.extractText('file://path/to/image.jpg');

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Hybrid OCR extraction failed');
    });
  });

  describe('extractTextFromMultiple', () => {
    it('should process multiple images successfully', async () => {
      const imageUris = ['file://path/to/image1.jpg', 'file://path/to/image2.jpg'];
      const mockTexts = ['Text 1', 'Text 2'];
      
      mockMLKitService.extractText
        .mockResolvedValueOnce(Result.success(mockTexts[0]))
        .mockResolvedValueOnce(Result.success(mockTexts[1]));
      mockMLKitService.getLastConfidenceScore.mockResolvedValue(Result.success(0.9));

      const result = await service.extractTextFromMultiple(imageUris);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockTexts);
    });

    it('should handle partial failures in batch processing', async () => {
      const imageUris = ['file://path/to/image1.jpg', 'file://path/to/image2.jpg'];
      
      mockMLKitService.extractText
        .mockResolvedValueOnce(Result.success('Text 1'))
        .mockResolvedValueOnce(Result.failure('Failed to process image 2'));

      const result = await service.extractTextFromMultiple(imageUris);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(['Text 1']);
    });

    it('should return failure when all images fail', async () => {
      const imageUris = ['file://path/to/image1.jpg', 'file://path/to/image2.jpg'];
      
      mockMLKitService.extractText
        .mockResolvedValueOnce(Result.failure('Failed 1'))
        .mockResolvedValueOnce(Result.failure('Failed 2'));

      const result = await service.extractTextFromMultiple(imageUris);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('All OCR extractions failed');
    });
  });

  describe('isAvailable', () => {
    it('should return true when either service is available', async () => {
      mockMLKitService.isAvailable.mockResolvedValue(Result.success(true));
      mockCloudService.isAvailable.mockResolvedValue(Result.success(false));

      const result = await service.isAvailable();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(true);
    });

    it('should return true when cloud service is available but ML Kit is not', async () => {
      mockMLKitService.isAvailable.mockResolvedValue(Result.success(false));
      mockCloudService.isAvailable.mockResolvedValue(Result.success(true));

      const result = await service.isAvailable();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(true);
    });

    it('should return false when both services are unavailable', async () => {
      mockMLKitService.isAvailable.mockResolvedValue(Result.success(false));
      mockCloudService.isAvailable.mockResolvedValue(Result.success(false));

      const result = await service.isAvailable();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(false);
    });

    it('should handle service availability check failures', async () => {
      mockMLKitService.isAvailable.mockResolvedValue(Result.failure('ML Kit check failed'));
      mockCloudService.isAvailable.mockResolvedValue(Result.success(true));

      const result = await service.isAvailable();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(true);
    });
  });

  describe('getLastConfidenceScore', () => {
    it('should return the last confidence score', async () => {
      const result = await service.getLastConfidenceScore();

      expect(result.isSuccess).toBe(true);
      expect(typeof result.value).toBe('number');
    });
  });

  describe('getLastUsedService', () => {
    it('should return the last used service', () => {
      const service = new HybridOCRService();
      expect(service.getLastUsedService()).toBe('none');
    });
  });

  describe('getServiceStatus', () => {
    it('should return service status information', async () => {
      mockMLKitService.isAvailable.mockResolvedValue(Result.success(true));
      mockCloudService.isAvailable.mockResolvedValue(Result.success(false));

      const status = await service.getServiceStatus();

      expect(status).toEqual({
        mlKit: { available: true },
        cloud: { available: false },
      });
    });

    it('should handle service status check failures', async () => {
      mockMLKitService.isAvailable.mockResolvedValue(Result.failure('ML Kit error'));
      mockCloudService.isAvailable.mockResolvedValue(Result.failure('Cloud error'));

      const status = await service.getServiceStatus();

      expect(status).toEqual({
        mlKit: { available: false, error: 'ML Kit error' },
        cloud: { available: false, error: 'Cloud error' },
      });
    });
  });
});
