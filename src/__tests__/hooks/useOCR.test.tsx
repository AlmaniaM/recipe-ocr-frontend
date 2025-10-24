import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useOCR } from '../../hooks/useOCR';
import { container, TYPES } from '../../infrastructure/di/container';
import { IOCRService } from '../../application/ports/IOCRService';
import { Result } from '../../domain/common/Result';

// Mock the container
jest.mock('../../infrastructure/di/container', () => ({
  container: {
    get: jest.fn(),
  },
  TYPES: {
    OCRService: Symbol('OCRService'),
  },
}));

// Mock the theme context
jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: '#FF6B35',
        secondary: '#F7931E',
        background: '#FFF8F5',
        surface: '#FFFFFF',
        textPrimary: '#2D1B1B',
        textSecondary: '#8B7355',
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        border: '#E8D5C4',
      },
    },
  }),
}));

describe('useOCR', () => {
  let mockOCRService: jest.Mocked<IOCRService>;

  beforeEach(() => {
    mockOCRService = {
      extractText: jest.fn(),
      extractTextFromMultiple: jest.fn(),
      isAvailable: jest.fn(),
      getLastConfidenceScore: jest.fn(),
    } as any;

    (container.get as jest.Mock).mockReturnValue(mockOCRService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useOCR());

      expect(result.current.isProcessing).toBe(false);
      expect(result.current.extractedText).toBe(null);
      expect(result.current.confidence).toBe(0);
      expect(result.current.error).toBe(null);
      expect(result.current.lastUsedService).toBe('none');
      expect(result.current.serviceStatus).toBe(null);
    });
  });

  describe('extractText', () => {
    it('should process text successfully', async () => {
      const mockText = 'Chocolate Chip Cookies\nIngredients:\n- 2 cups flour\nDirections:\n1. Mix ingredients';
      mockOCRService.extractText.mockResolvedValue(Result.success(mockText));

      const { result } = renderHook(() => useOCR());

      await act(async () => {
        const extractResult = await result.current.extractText('file://path/to/image.jpg');
        expect(extractResult.isSuccess).toBe(true);
        expect(extractResult.value).toBe(mockText);
      });

      expect(result.current.isProcessing).toBe(false);
      expect(result.current.extractedText).toBe(mockText);
      expect(result.current.error).toBe(null);
    });

    it('should handle OCR service failure', async () => {
      const mockError = 'OCR service failed';
      mockOCRService.extractText.mockResolvedValue(Result.failure(mockError));

      const { result } = renderHook(() => useOCR());

      await act(async () => {
        const extractResult = await result.current.extractText('file://path/to/image.jpg');
        expect(extractResult.isSuccess).toBe(false);
        expect(extractResult.error).toBe(mockError);
      });

      expect(result.current.isProcessing).toBe(false);
      expect(result.current.extractedText).toBe(null);
      expect(result.current.error).toBe(mockError);
    });

    it('should handle text processing failure', async () => {
      const mockText = ''; // Empty text should fail processing
      mockOCRService.extractText.mockResolvedValue(Result.success(mockText));

      const { result } = renderHook(() => useOCR());

      await act(async () => {
        const extractResult = await result.current.extractText('file://path/to/image.jpg');
        expect(extractResult.isSuccess).toBe(false);
      });

      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toContain('Text processing failed');
    });

    it('should handle text validation failure', async () => {
      const mockText = 'This is not a recipe text'; // Should fail validation
      mockOCRService.extractText.mockResolvedValue(Result.success(mockText));

      const { result } = renderHook(() => useOCR());

      await act(async () => {
        const extractResult = await result.current.extractText('file://path/to/image.jpg');
        expect(extractResult.isSuccess).toBe(false);
      });

      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toContain('Text validation failed');
    });

    it('should handle exceptions', async () => {
      mockOCRService.extractText.mockRejectedValue(new Error('Unexpected error'));

      const { result } = renderHook(() => useOCR());

      await act(async () => {
        const extractResult = await result.current.extractText('file://path/to/image.jpg');
        expect(extractResult.isSuccess).toBe(false);
        expect(extractResult.error).toBe('Unexpected error');
      });

      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toBe('Unexpected error');
    });
  });

  describe('extractMultipleTexts', () => {
    it('should process multiple texts successfully', async () => {
      const mockTexts = ['Text 1', 'Text 2'];
      mockOCRService.extractTextFromMultiple.mockResolvedValue(Result.success(mockTexts));

      const { result } = renderHook(() => useOCR());

      await act(async () => {
        const extractResult = await result.current.extractMultipleTexts(['file1.jpg', 'file2.jpg']);
        expect(extractResult.isSuccess).toBe(true);
        expect(extractResult.value).toEqual(mockTexts);
      });

      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle partial processing failures', async () => {
      const mockTexts = ['Text 1']; // Only one text processed successfully
      mockOCRService.extractTextFromMultiple.mockResolvedValue(Result.success(mockTexts));

      const { result } = renderHook(() => useOCR());

      await act(async () => {
        const extractResult = await result.current.extractMultipleTexts(['file1.jpg', 'file2.jpg']);
        expect(extractResult.isSuccess).toBe(true);
        expect(extractResult.value).toEqual(mockTexts);
      });

      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toContain('Some texts failed to process');
    });

    it('should handle complete processing failure', async () => {
      mockOCRService.extractTextFromMultiple.mockResolvedValue(Result.failure('All failed'));

      const { result } = renderHook(() => useOCR());

      await act(async () => {
        const extractResult = await result.current.extractMultipleTexts(['file1.jpg', 'file2.jpg']);
        expect(extractResult.isSuccess).toBe(false);
        expect(extractResult.error).toBe('All failed');
      });

      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toBe('All failed');
    });
  });

  describe('checkAvailability', () => {
    it('should check OCR service availability', async () => {
      mockOCRService.isAvailable.mockResolvedValue(Result.success(true));

      const { result } = renderHook(() => useOCR());

      await act(async () => {
        const availabilityResult = await result.current.checkAvailability();
        expect(availabilityResult.isSuccess).toBe(true);
        expect(availabilityResult.value).toBe(true);
      });
    });

    it('should handle availability check failure', async () => {
      mockOCRService.isAvailable.mockResolvedValue(Result.failure('Service unavailable'));

      const { result } = renderHook(() => useOCR());

      await act(async () => {
        const availabilityResult = await result.current.checkAvailability();
        expect(availabilityResult.isSuccess).toBe(false);
        expect(availabilityResult.error).toBe('Service unavailable');
      });
    });
  });

  describe('getServiceStatus', () => {
    it('should get service status for HybridOCRService', async () => {
      const mockStatus = {
        mlKit: { available: true },
        cloud: { available: false },
      };
      
      (mockOCRService as any).getServiceStatus = jest.fn().mockResolvedValue(mockStatus);

      const { result } = renderHook(() => useOCR());

      await act(async () => {
        await result.current.getServiceStatus();
      });

      expect(result.current.serviceStatus).toEqual(mockStatus);
    });

    it('should handle service status check failure', async () => {
      (mockOCRService as any).getServiceStatus = jest.fn().mockRejectedValue(new Error('Status check failed'));

      const { result } = renderHook(() => useOCR());

      await act(async () => {
        await result.current.getServiceStatus();
      });

      // Should not crash and serviceStatus should remain null
      expect(result.current.serviceStatus).toBe(null);
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      mockOCRService.extractText.mockResolvedValue(Result.failure('Test error'));

      const { result } = renderHook(() => useOCR());

      // First, create an error
      await act(async () => {
        await result.current.extractText('file://path/to/image.jpg');
      });

      expect(result.current.error).toBe('Test error');

      // Then clear it
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('reset', () => {
    it('should reset all state', async () => {
      const mockText = 'Test text';
      mockOCRService.extractText.mockResolvedValue(Result.success(mockText));

      const { result } = renderHook(() => useOCR());

      // First, set some state
      await act(async () => {
        await result.current.extractText('file://path/to/image.jpg');
      });

      expect(result.current.extractedText).toBe(mockText);

      // Then reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.isProcessing).toBe(false);
      expect(result.current.extractedText).toBe(null);
      expect(result.current.confidence).toBe(0);
      expect(result.current.error).toBe(null);
      expect(result.current.lastUsedService).toBe('none');
      expect(result.current.serviceStatus).toBe(null);
    });
  });
});
