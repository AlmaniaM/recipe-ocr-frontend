/**
 * OCR API Client Tests
 * 
 * Comprehensive unit tests for the OCRApiClient class
 * including text extraction, batch processing, and image handling.
 */

import { OCRApiClient } from '../OCRApiClient';
import { BaseApiClient } from '../BaseApiClient';
import { ApiError, ApiErrorType } from '../types';
import { OCRResult } from '../../../types/Recipe';

// Mock the base class
jest.mock('../BaseApiClient');

// Mock FileReader for base64 conversion tests
const mockFileReader = {
  readAsDataURL: jest.fn(),
  result: 'data:image/jpeg;base64,testdata',
  onloadend: null,
  onerror: null,
  EMPTY: 0,
  LOADING: 1,
  DONE: 2,
};

global.FileReader = jest.fn().mockImplementation(() => mockFileReader) as any;

describe('OCRApiClient', () => {
  let ocrApiClient: OCRApiClient;

  beforeEach(() => {
    ocrApiClient = new OCRApiClient();
    
    // Mock the inherited methods directly on the instance
    jest.spyOn(ocrApiClient, 'get').mockResolvedValue({} as any);
    jest.spyOn(ocrApiClient, 'post').mockResolvedValue({} as any);
    jest.spyOn(ocrApiClient, 'put').mockResolvedValue({} as any);
    jest.spyOn(ocrApiClient, 'delete').mockResolvedValue(undefined);
    jest.spyOn(ocrApiClient, 'buildQueryString').mockImplementation((params) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(item => searchParams.append(key, String(item)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      const queryString = searchParams.toString();
      return queryString ? `?${queryString}` : '';
    });
    jest.spyOn(ocrApiClient, 'handleApiError').mockImplementation((error) => {
      throw error;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('extractText', () => {
    it('should extract text from image', async () => {
      const request = {
        imageBase64: 'base64data',
        imageFormat: 'jpeg',
        language: 'en',
        enhanceImage: true,
      };

      const mockResponse = {
        text: 'Extracted text from image',
        confidence: 0.95,
        language: 'en',
        textBlocks: [
          {
            text: 'Extracted text',
            confidence: 0.95,
            boundingBox: { x: 10, y: 20, width: 100, height: 30 },
          },
        ],
        isSuccess: true,
      };

      jest.spyOn(ocrApiClient, 'post').mockResolvedValue(mockResponse);

      const result = await ocrApiClient.extractText(request);

      expect(ocrApiClient.post).toHaveBeenCalledWith('/api/recipes/ocr', request, undefined);
      expect(result).toEqual({
        text: 'Extracted text from image',
        confidence: 0.95,
        language: 'en',
        blocks: [
          {
            text: 'Extracted text',
            confidence: 0.95,
            boundingBox: { x: 10, y: 20, width: 100, height: 30 },
          },
        ],
      });
    });

    it('should handle OCR errors', async () => {
      const request = {
        imageBase64: 'invalidbase64',
        imageFormat: 'jpeg',
      };

      const apiError = new ApiError(ApiErrorType.SERVER_ERROR, 'OCR processing failed', 500);
      jest.spyOn(ocrApiClient, 'post').mockRejectedValue(apiError);

      await expect(ocrApiClient.extractText(request)).rejects.toThrow(ApiError);
    });
  });

  describe('extractTextBatch', () => {
    it('should extract text from multiple images', async () => {
      const request = {
        images: [
          { imageBase64: 'base64data1', imageFormat: 'jpeg' },
          { imageBase64: 'base64data2', imageFormat: 'png' },
        ],
      };

      const mockResponse = {
        results: [
          {
            text: 'Text from image 1',
            confidence: 0.9,
            language: 'en',
            textBlocks: [],
            isSuccess: true,
          },
          {
            text: 'Text from image 2',
            confidence: 0.85,
            language: 'en',
            textBlocks: [],
            isSuccess: true,
          },
        ],
        totalProcessed: 2,
        successCount: 2,
        failureCount: 0,
      };

      jest.spyOn(ocrApiClient, 'post').mockResolvedValue(mockResponse);

      const result = await ocrApiClient.extractTextBatch(request);

      expect(ocrApiClient.post).toHaveBeenCalledWith('/api/recipes/ocr/batch', request, undefined);
      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('Text from image 1');
      expect(result[1].text).toBe('Text from image 2');
    });
  });

  describe('extractTextFromUri', () => {
    it('should extract text from image URI', async () => {
      const imageUri = 'data:image/jpeg;base64,testdata';
      const mockResponse = {
        text: 'Extracted text',
        confidence: 0.9,
        language: 'en',
        textBlocks: [],
        isSuccess: true,
      };

      jest.spyOn(ocrApiClient, 'post').mockResolvedValue(mockResponse);

      const result = await ocrApiClient.extractTextFromUri(imageUri);

      expect(result.text).toBe('Extracted text');
    });

    it('should handle HTTP image URI', async () => {
      const imageUri = 'http://example.com/image.jpg';
      const mockResponse = {
        text: 'Extracted text',
        confidence: 0.9,
        language: 'en',
        textBlocks: [],
        isSuccess: true,
      };

      // Mock the convertImageUriToBase64 method
      jest.spyOn(ocrApiClient as any, 'convertImageUriToBase64').mockResolvedValue('base64data');
      jest.spyOn(ocrApiClient, 'post').mockResolvedValue(mockResponse);

      const result = await ocrApiClient.extractTextFromUri(imageUri);

      expect(result.text).toBe('Extracted text');
    });

    it('should handle file URI', async () => {
      const imageUri = 'file:///path/to/image.jpg';
      const mockResponse = {
        text: 'Extracted text',
        confidence: 0.9,
        language: 'en',
        textBlocks: [],
        isSuccess: true,
      };

      // Mock the convertImageUriToBase64 method
      jest.spyOn(ocrApiClient as any, 'convertImageUriToBase64').mockResolvedValue('base64data');
      jest.spyOn(ocrApiClient, 'post').mockResolvedValue(mockResponse);

      const result = await ocrApiClient.extractTextFromUri(imageUri);

      expect(result.text).toBe('Extracted text');
    });
  });

  describe('extractTextWithPreprocessing', () => {
    it('should preprocess image before OCR', async () => {
      const imageUri = 'file:///path/to/image.jpg';
      const preprocessingOptions = {
        crop: { x: 10, y: 10, width: 100, height: 100 },
        rotate: 90,
        enhance: true,
        resize: { width: 800, height: 600 },
      };

      const mockResponse = {
        text: 'Preprocessed text',
        confidence: 0.95,
        language: 'en',
        textBlocks: [],
        isSuccess: true,
      };

      // Mock the preprocessImage and convertImageUriToBase64 methods
      const preprocessImageSpy = jest.spyOn(ocrApiClient as any, 'preprocessImage')
        .mockResolvedValue('processed-image-uri');
      jest.spyOn(ocrApiClient as any, 'convertImageUriToBase64').mockResolvedValue('base64data');

      jest.spyOn(ocrApiClient, 'post').mockResolvedValue(mockResponse);

      const result = await ocrApiClient.extractTextWithPreprocessing(
        imageUri,
        preprocessingOptions
      );

      expect(preprocessImageSpy).toHaveBeenCalledWith(imageUri, preprocessingOptions);
      expect(result.text).toBe('Preprocessed text');
    });
  });

  describe('getSupportedLanguages', () => {
    it('should get supported languages', async () => {
      const mockLanguages = ['en', 'es', 'fr', 'de'];
      jest.spyOn(ocrApiClient, 'get').mockResolvedValue(mockLanguages);

      const result = await ocrApiClient.getSupportedLanguages();

      expect(ocrApiClient.get).toHaveBeenCalledWith('/api/recipes/ocr/languages', undefined);
      expect(result).toEqual(mockLanguages);
    });
  });

  describe('checkHealth', () => {
    it('should return true when service is healthy', async () => {
      jest.spyOn(ocrApiClient, 'get').mockResolvedValue(undefined);

      const result = await ocrApiClient.checkHealth();

      expect(ocrApiClient.get).toHaveBeenCalledWith('/api/recipes/ocr/health', undefined);
      expect(result).toBe(true);
    });

    it('should return false when service is unhealthy', async () => {
      const apiError = new ApiError(ApiErrorType.SERVER_ERROR, 'Service unavailable', 503);
      jest.spyOn(ocrApiClient, 'get').mockRejectedValue(apiError);

      const result = await ocrApiClient.checkHealth();

      expect(result).toBe(false);
    });
  });

  describe('mapToOCRResult', () => {
    it('should map ExtractTextResponse to OCRResult', () => {
      const response = {
        text: 'Test text',
        confidence: 0.9,
        language: 'en',
        textBlocks: [
          {
            text: 'Test',
            confidence: 0.9,
            boundingBox: { x: 0, y: 0, width: 50, height: 20 },
          },
          {
            text: 'text',
            confidence: 0.85,
            boundingBox: { x: 50, y: 0, width: 30, height: 20 },
          },
        ],
        isSuccess: true,
      };

      const result = (ocrApiClient as any).mapToOCRResult(response);

      expect(result).toEqual({
        text: 'Test text',
        confidence: 0.9,
        language: 'en',
        blocks: [
          {
            text: 'Test',
            confidence: 0.9,
            boundingBox: { x: 0, y: 0, width: 50, height: 20 },
          },
          {
            text: 'text',
            confidence: 0.85,
            boundingBox: { x: 50, y: 0, width: 30, height: 20 },
          },
        ],
      });
    });
  });

  describe('convertImageUriToBase64', () => {
    it('should convert data URL to base64', async () => {
      const imageUri = 'data:image/jpeg;base64,testdata';
      const result = await (ocrApiClient as any).convertImageUriToBase64(imageUri);
      expect(result).toBe('testdata');
    });

    it('should convert file URI to base64', async () => {
      const imageUri = 'file:///path/to/image.jpg';
      
      // Mock fetch and FileReader
      global.fetch = jest.fn().mockResolvedValue({
        blob: () => Promise.resolve(new Blob(['test'], { type: 'image/jpeg' })),
      });

      const mockFileReaderInstance = {
        readAsDataURL: jest.fn(),
        result: 'data:image/jpeg;base64,testdata',
        onloadend: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };
      (global.FileReader as any).mockImplementation(() => mockFileReaderInstance);

      // Mock the onloadend callback
      const resultPromise = (ocrApiClient as any).convertImageUriToBase64(imageUri);
      
      // Simulate successful read
      setTimeout(() => {
        if (mockFileReaderInstance.onloadend) {
          mockFileReaderInstance.onloadend();
        }
      }, 0);

      const result = await resultPromise;
      expect(result).toBe('testdata');
    });

    it('should handle conversion errors', async () => {
      const imageUri = 'file:///path/to/image.jpg';
      
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect((ocrApiClient as any).convertImageUriToBase64(imageUri))
        .rejects.toThrow('Failed to convert image to base64');
    });
  });

  describe('preprocessImage', () => {
    it('should return original URI for now (placeholder implementation)', async () => {
      const imageUri = 'file:///path/to/image.jpg';
      const options = {
        crop: { x: 10, y: 10, width: 100, height: 100 },
        rotate: 90,
        enhance: true,
      };

      const result = await (ocrApiClient as any).preprocessImage(imageUri, options);
      expect(result).toBe(imageUri);
    });
  });
});
