/**
 * Export API Client Tests
 * 
 * Comprehensive unit tests for the ExportApiClient class
 * including recipe export, batch export, and file management.
 */

import { ExportApiClient } from '../ExportApiClient';
import { ApiError, ApiErrorType } from '../types';

// Mock fetch for download tests
global.fetch = jest.fn();

describe('ExportApiClient', () => {
  let exportApiClient: ExportApiClient;

  beforeEach(() => {
    exportApiClient = new ExportApiClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('exportRecipe', () => {
    it('should export a single recipe', async () => {
      const request = {
        format: 'pdf' as const,
        includeImage: true,
        includeNutrition: true,
        includeNotes: true,
        template: 'detailed' as const,
      };

      const mockResponse = {
        downloadUrl: 'https://example.com/export.pdf',
        fileName: 'recipe.pdf',
        fileSize: 1024000,
        format: 'pdf',
        expiresAt: '2023-12-31T23:59:59Z',
      };

      jest.spyOn(exportApiClient, 'post').mockResolvedValue(mockResponse);
      jest.spyOn(exportApiClient, 'buildQueryString').mockReturnValue('?format=pdf&includeImage=true&includeNutrition=true&includeNotes=true&template=detailed');

      const result = await exportApiClient.exportRecipe('recipe-1', request);

      expect(exportApiClient.post).toHaveBeenCalledWith(
        '/api/export/recipe/recipe-1?format=pdf&includeImage=true&includeNutrition=true&includeNotes=true&template=detailed',
        request.customFields,
        undefined
      );
      expect(result).toEqual(mockResponse);
    });

    it('should export recipe with default options', async () => {
      const request = {
        format: 'pdf' as const,
      };

      const mockResponse = {
        downloadUrl: 'http://example.com/export/recipe-1.pdf',
        fileName: 'recipe-1.pdf',
        fileSize: 1024000,
        format: 'pdf',
        expiresAt: '2023-12-31T23:59:59Z',
      };

      jest.spyOn(exportApiClient, 'post').mockResolvedValue(mockResponse);
      jest.spyOn(exportApiClient, 'buildQueryString').mockReturnValue('?format=pdf&includeImage=false&includeNutrition=false&includeNotes=false&template=standard');

      const result = await exportApiClient.exportRecipe('recipe-1', request);

      expect(exportApiClient.post).toHaveBeenCalledWith(
        '/api/export/recipe/recipe-1?format=pdf&includeImage=false&includeNutrition=false&includeNotes=false&template=standard',
        request.customFields,
        undefined
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('exportRecipeBook', () => {
    it('should export a recipe book', async () => {
      const request = {
        format: 'docx' as const,
        includeImage: true,
        includeNutrition: false,
        includeNotes: true,
        template: 'standard' as const,
        categorySortOrder: ['appetizers', 'mains', 'desserts'],
        sortBy: 'category' as const,
      };

      const mockResponse = {
        downloadUrl: 'https://example.com/recipe-book.docx',
        fileName: 'my-recipes.docx',
        fileSize: 2048000,
        format: 'docx',
        expiresAt: '2023-12-31T23:59:59Z',
      };

      jest.spyOn(exportApiClient, 'post').mockResolvedValue(mockResponse);
      jest.spyOn(exportApiClient, 'buildQueryString').mockReturnValue('?format=docx&includeImage=true&includeNutrition=false&includeNotes=true&template=standard&sortBy=category');

      const result = await exportApiClient.exportRecipeBook('recipe-book-1', request);

      expect(exportApiClient.post).toHaveBeenCalledWith(
        '/api/export/book/recipe-book-1?format=docx&includeImage=true&includeNutrition=false&includeNotes=true&template=standard&sortBy=category',
        {
          categorySortOrder: request.categorySortOrder,
          customFields: request.customFields,
        },
        undefined
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('exportRecipesBatch', () => {
    it('should export multiple recipes as batch', async () => {
      const request = {
        recipeIds: ['recipe-1', 'recipe-2', 'recipe-3'],
        format: 'pdf' as const,
        includeImage: true,
        includeNutrition: false,
        includeNotes: true,
        template: 'standard' as const,
        zipOutput: true,
      };

      const mockResponse = {
        jobId: 'batch-job-123',
        status: 'pending' as const,
        estimatedTimeRemaining: 300,
      };

      jest.spyOn(exportApiClient, 'post').mockResolvedValue(mockResponse);

      const result = await exportApiClient.exportRecipesBatch(request);

      expect(exportApiClient.post).toHaveBeenCalledWith('/api/export/recipe/batch', request, undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getExportStatus', () => {
    it('should get export job status', async () => {
      const mockResponse = {
        status: 'completed' as const,
        progress: 100,
        downloadUrl: 'https://example.com/download.zip',
        errorMessage: undefined,
        estimatedTimeRemaining: 0,
      };

      jest.spyOn(exportApiClient, 'get').mockResolvedValue(mockResponse);

      const result = await exportApiClient.getExportStatus('batch-job-123');

      expect(exportApiClient.get).toHaveBeenCalledWith('/api/export/recipe/status/batch-job-123', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should handle failed export status', async () => {
      const mockResponse = {
        status: 'failed' as const,
        progress: 50,
        errorMessage: 'Export failed due to invalid recipe data',
        estimatedTimeRemaining: 0,
      };

      jest.spyOn(exportApiClient, 'get').mockResolvedValue(mockResponse);

      const result = await exportApiClient.getExportStatus('batch-job-123');

      expect(result.status).toBe('failed');
      expect(result.errorMessage).toBe('Export failed due to invalid recipe data');
    });
  });

  describe('downloadExport', () => {
    it('should download exported file', async () => {
      const downloadUrl = 'https://example.com/export.pdf';
      const mockBlob = new Blob(['test content'], { type: 'application/pdf' });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        blob: jest.fn().mockResolvedValue(mockBlob),
      });

      const result = await exportApiClient.downloadExport(downloadUrl);

      expect(global.fetch).toHaveBeenCalledWith(downloadUrl, {
        method: 'GET',
        headers: undefined,
        signal: undefined,
      });
      expect(result).toBe(mockBlob);
    });

    it('should handle download errors', async () => {
      const downloadUrl = 'https://example.com/export.pdf';

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(exportApiClient.downloadExport(downloadUrl))
        .rejects.toThrow('Failed to download file: Not Found');
    });
  });

  describe('getAvailableFormats', () => {
    it('should get available export formats', async () => {
      const mockResponse = {
        formats: [
          {
            id: 'pdf',
            name: 'PDF',
            description: 'Portable Document Format',
            supportedFeatures: ['images', 'tables', 'styling'],
            maxFileSize: 10485760,
          },
          {
            id: 'docx',
            name: 'Word Document',
            description: 'Microsoft Word Document',
            supportedFeatures: ['images', 'tables', 'styling', 'editing'],
            maxFileSize: 52428800,
          },
        ],
      };

      jest.spyOn(exportApiClient, 'get').mockResolvedValue(mockResponse);

      const result = await exportApiClient.getAvailableFormats();

      expect(exportApiClient.get).toHaveBeenCalledWith('/api/export/recipe/formats', undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getExportTemplates', () => {
    it('should get export templates', async () => {
      const mockResponse = {
        templates: [
          {
            id: 'standard',
            name: 'Standard Template',
            description: 'Clean, professional layout',
            preview: 'https://example.com/preview/standard.png',
            customFields: ['title', 'description', 'ingredients', 'instructions'],
          },
          {
            id: 'minimal',
            name: 'Minimal Template',
            description: 'Simple, text-focused layout',
            customFields: ['title', 'ingredients', 'instructions'],
          },
        ],
      };

      jest.spyOn(exportApiClient, 'get').mockResolvedValue(mockResponse);

      const result = await exportApiClient.getExportTemplates();

      expect(exportApiClient.get).toHaveBeenCalledWith('/api/export/recipe/templates', undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('previewExport', () => {
    it('should get export preview', async () => {
      const request = {
        format: 'pdf' as const,
        includeImage: true,
        includeNutrition: false,
        includeNotes: true,
        template: 'detailed' as const,
      };

      const mockResponse = {
        previewUrl: 'https://example.com/preview/recipe-1.pdf',
        expiresAt: '2023-12-31T23:59:59Z',
      };

      jest.spyOn(exportApiClient, 'get').mockResolvedValue(mockResponse);
      jest.spyOn(exportApiClient, 'buildQueryString').mockReturnValue('?format=pdf&includeImage=true&includeNutrition=false&includeNotes=true&template=detailed&preview=true');

      const result = await exportApiClient.previewExport('recipe-1', request);

      expect(exportApiClient.get).toHaveBeenCalledWith(
        '/api/export/recipe/recipe-1/preview?format=pdf&includeImage=true&includeNutrition=false&includeNotes=true&template=detailed&preview=true',
        undefined
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('cancelExport', () => {
    it('should cancel export job', async () => {
      jest.spyOn(exportApiClient, 'delete').mockResolvedValue(undefined);

      await exportApiClient.cancelExport('batch-job-123');

      expect(exportApiClient.delete).toHaveBeenCalledWith('/api/export/recipe/cancel/batch-job-123', undefined);
    });
  });

  describe('getExportHistory', () => {
    it('should get export history with pagination', async () => {
      const mockResponse = {
        exports: [
          {
            id: 'export-1',
            fileName: 'recipe-1.pdf',
            format: 'pdf',
            status: 'completed',
            createdAt: '2023-12-01T10:00:00Z',
            downloadUrl: 'https://example.com/export-1.pdf',
            expiresAt: '2023-12-31T23:59:59Z',
          },
          {
            id: 'export-2',
            fileName: 'recipe-book.docx',
            format: 'docx',
            status: 'completed',
            createdAt: '2023-12-02T10:00:00Z',
            downloadUrl: 'https://example.com/export-2.docx',
            expiresAt: '2023-12-31T23:59:59Z',
          },
        ],
        totalCount: 2,
        pageNumber: 1,
        pageSize: 20,
      };

      jest.spyOn(exportApiClient, 'get').mockResolvedValue(mockResponse);
      jest.spyOn(exportApiClient, 'buildQueryString').mockReturnValue('?pageNumber=1&pageSize=20');

      const result = await exportApiClient.getExportHistory(1, 20);

      expect(exportApiClient.get).toHaveBeenCalledWith(
        '/api/export/recipe/history?pageNumber=1&pageSize=20',
        undefined
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get export history with default pagination', async () => {
      const mockResponse = {
        exports: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 20,
      };

      jest.spyOn(exportApiClient, 'get').mockResolvedValue(mockResponse);
      jest.spyOn(exportApiClient, 'buildQueryString').mockReturnValue('?pageNumber=1&pageSize=20');

      const result = await exportApiClient.getExportHistory();

      expect(exportApiClient.get).toHaveBeenCalledWith(
        '/api/export/recipe/history?pageNumber=1&pageSize=20',
        undefined
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteExport', () => {
    it('should delete export file', async () => {
      jest.spyOn(exportApiClient, 'delete').mockResolvedValue(undefined);

      await exportApiClient.deleteExport('export-1');

      expect(exportApiClient.delete).toHaveBeenCalledWith('/api/export/recipe/delete/export-1', undefined);
    });
  });

  describe('Error handling', () => {
    it('should handle API errors in exportRecipe', async () => {
      const request = {
        format: 'pdf' as const,
      };

      const apiError = new ApiError('Export failed', ApiErrorType.SERVER_ERROR, 500);
      jest.spyOn(exportApiClient, 'post').mockRejectedValue(apiError);

      await expect(exportApiClient.exportRecipe('recipe-1', request)).rejects.toThrow(ApiError);
    });

    it('should handle API errors in getExportStatus', async () => {
      const apiError = new ApiError('Status check failed', ApiErrorType.NETWORK_ERROR, 0);
      jest.spyOn(exportApiClient, 'get').mockRejectedValue(apiError);

      await expect(exportApiClient.getExportStatus('invalid-job-id')).rejects.toThrow(ApiError);
    });

    it('should handle network errors in downloadExport', async () => {
      const downloadUrl = 'https://example.com/export.pdf';
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(exportApiClient.downloadExport(downloadUrl))
        .rejects.toThrow('Network error');
    });
  });
});