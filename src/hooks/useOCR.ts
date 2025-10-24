import { useState, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { container } from '../infrastructure/di/container';
import { TYPES } from '../infrastructure/di/types';
import { IOCRService } from '../application/ports/IOCRService';
import { Result } from '../domain/common/Result';
import { OCRResultProcessor } from '../infrastructure/ocr/OCRResultProcessor';

export interface OCRState {
  isProcessing: boolean;
  extractedText: string | null;
  confidence: number;
  error: string | null;
  lastUsedService: 'mlkit' | 'cloud' | 'none';
  serviceStatus: {
    mlKit: { available: boolean; error?: string };
    cloud: { available: boolean; error?: string };
  } | null;
}

export interface OCRActions {
  extractText: (imageUri: string) => Promise<Result<string>>;
  extractMultipleTexts: (imageUris: string[]) => Promise<Result<string[]>>;
  checkAvailability: () => Promise<Result<boolean>>;
  getServiceStatus: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

/**
 * Custom hook for OCR operations with theme integration
 * 
 * Provides a clean interface for OCR operations with loading states,
 * error handling, and service status monitoring.
 */
export function useOCR(): OCRState & OCRActions {
  const { theme } = useTheme();
  const [state, setState] = useState<OCRState>({
    isProcessing: false,
    extractedText: null,
    confidence: 0,
    error: null,
    lastUsedService: 'none',
    serviceStatus: null,
  });

  const ocrService = container.get<IOCRService>(TYPES.OCRService);

  const extractText = useCallback(async (imageUri: string): Promise<Result<string>> => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      // Extract text using the OCR service
      const result = await ocrService.extractText(imageUri);

      if (result.isSuccess) {
        // Process the extracted text
        const processedResult = OCRResultProcessor.processText(result.value);
        
        if (processedResult.isSuccess) {
          // Validate that it looks like a recipe
          const validationResult = OCRResultProcessor.validateRecipeText(processedResult.value);
          
          if (validationResult.isSuccess) {
            const confidence = OCRResultProcessor.extractConfidenceScore(processedResult.value);
            
            setState(prev => ({
              ...prev,
              isProcessing: false,
              extractedText: processedResult.value,
              confidence,
              error: null,
            }));

            return Result.success(processedResult.value);
          } else {
            setState(prev => ({
              ...prev,
              isProcessing: false,
              error: `Text validation failed: ${validationResult.error}`,
            }));
            return Result.failure(validationResult.error);
          }
        } else {
          setState(prev => ({
            ...prev,
            isProcessing: false,
            error: `Text processing failed: ${processedResult.error}`,
          }));
          return Result.failure(processedResult.error);
        }
      } else {
        setState(prev => ({
          ...prev,
          isProcessing: false,
          error: result.error,
        }));
        return result;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
      }));
      return Result.failure(errorMessage);
    }
  }, [ocrService]);

  const extractMultipleTexts = useCallback(async (imageUris: string[]): Promise<Result<string[]>> => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const result = await ocrService.extractTextFromMultiple(imageUris);

      if (result.isSuccess) {
        // Process each extracted text
        const processedTexts: string[] = [];
        const errors: string[] = [];

        for (const text of result.value) {
          const processedResult = OCRResultProcessor.processText(text);
          if (processedResult.isSuccess) {
            processedTexts.push(processedResult.value);
          } else {
            errors.push(processedResult.error);
          }
        }

        if (processedTexts.length > 0) {
          setState(prev => ({
            ...prev,
            isProcessing: false,
            error: errors.length > 0 ? `Some texts failed to process: ${errors.join(', ')}` : null,
          }));
          return Result.success(processedTexts);
        } else {
          setState(prev => ({
            ...prev,
            isProcessing: false,
            error: `All texts failed to process: ${errors.join(', ')}`,
          }));
          return Result.failure(`All texts failed to process: ${errors.join(', ')}`);
        }
      } else {
        setState(prev => ({
          ...prev,
          isProcessing: false,
          error: result.error,
        }));
        return result;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
      }));
      return Result.failure(errorMessage);
    }
  }, [ocrService]);

  const checkAvailability = useCallback(async (): Promise<Result<boolean>> => {
    try {
      const result = await ocrService.isAvailable();
      return result;
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [ocrService]);

  const getServiceStatus = useCallback(async (): Promise<void> => {
    try {
      // Check if the service supports status checking (HybridOCRService)
      if ('getServiceStatus' in ocrService && typeof ocrService.getServiceStatus === 'function') {
        const status = await (ocrService as any).getServiceStatus();
        setState(prev => ({ ...prev, serviceStatus: status }));
      } else {
        // Fallback for services that don't support status checking
        const availability = await ocrService.isAvailable();
        setState(prev => ({
          ...prev,
          serviceStatus: {
            mlKit: { available: availability.isSuccess && availability.value },
            cloud: { available: availability.isSuccess && availability.value },
          },
        }));
      }
    } catch (error) {
      console.warn('Failed to get service status:', error);
    }
  }, [ocrService]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      extractedText: null,
      confidence: 0,
      error: null,
      lastUsedService: 'none',
      serviceStatus: null,
    });
  }, []);

  return {
    ...state,
    extractText,
    extractMultipleTexts,
    checkAvailability,
    getServiceStatus,
    clearError,
    reset,
  };
}
