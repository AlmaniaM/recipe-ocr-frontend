/**
 * Export API Client
 * 
 * Handles recipe and recipe book export operations
 * including PDF, DOCX, and other format generation.
 */

import { BaseApiClient } from './BaseApiClient';
import { RequestOptions } from './types';
import { API_ENDPOINTS } from './types';

// Export DTOs
export interface ExportRecipeRequest {
  format: 'pdf' | 'docx' | 'txt' | 'json';
  includeImage?: boolean;
  includeNutrition?: boolean;
  includeNotes?: boolean;
  template?: 'standard' | 'minimal' | 'detailed';
  customFields?: Record<string, any>;
}

export interface ExportRecipeBookRequest {
  format: 'pdf' | 'docx' | 'txt' | 'json';
  includeImage?: boolean;
  includeNutrition?: boolean;
  includeNotes?: boolean;
  template?: 'standard' | 'minimal' | 'detailed';
  categorySortOrder?: string[];
  sortBy?: 'category' | 'title' | 'createdAt';
  customFields?: Record<string, any>;
}

export interface ExportResponse {
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  format: string;
  expiresAt: string;
}

export interface ExportStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  downloadUrl?: string;
  errorMessage?: string;
  estimatedTimeRemaining?: number;
}

export interface BatchExportRequest {
  recipeIds: string[];
  format: 'pdf' | 'docx' | 'txt' | 'json';
  includeImage?: boolean;
  includeNutrition?: boolean;
  includeNotes?: boolean;
  template?: 'standard' | 'minimal' | 'detailed';
  zipOutput?: boolean;
}

export interface BatchExportResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  estimatedTimeRemaining?: number;
  downloadUrl?: string;
  errorMessage?: string;
}

// Export API Client
export class ExportApiClient extends BaseApiClient {
  /**
   * Export a single recipe
   */
  async exportRecipe(
    recipeId: string, 
    request: ExportRecipeRequest, 
    options?: RequestOptions
  ): Promise<ExportResponse> {
    try {
      const queryParams = {
        format: request.format,
        includeImage: request.includeImage ? 'true' : 'false',
        includeNutrition: request.includeNutrition ? 'true' : 'false',
        includeNotes: request.includeNotes ? 'true' : 'false',
        template: request.template || 'standard',
      };

      const queryString = this.buildQueryString(queryParams);
      const response = await this.post<ExportResponse>(
        `${API_ENDPOINTS.EXPORT.RECIPE(recipeId)}${queryString}`,
        request.customFields,
        options
      );
      
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Export a recipe book
   */
  async exportRecipeBook(
    recipeBookId: string, 
    request: ExportRecipeBookRequest, 
    options?: RequestOptions
  ): Promise<ExportResponse> {
    try {
      const queryParams = {
        format: request.format,
        includeImage: request.includeImage ? 'true' : 'false',
        includeNutrition: request.includeNutrition ? 'true' : 'false',
        includeNotes: request.includeNotes ? 'true' : 'false',
        template: request.template || 'standard',
        sortBy: request.sortBy || 'category',
      };

      const queryString = this.buildQueryString(queryParams);
      const response = await this.post<ExportResponse>(
        `${API_ENDPOINTS.EXPORT.RECIPE_BOOK(recipeBookId)}${queryString}`,
        {
          categorySortOrder: request.categorySortOrder,
          customFields: request.customFields,
        },
        options
      );
      
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Export multiple recipes as a batch
   */
  async exportRecipesBatch(
    request: BatchExportRequest, 
    options?: RequestOptions
  ): Promise<BatchExportResponse> {
    try {
      const response = await this.post<BatchExportResponse>(
        `${API_ENDPOINTS.EXPORT.RECIPE('batch')}`,
        request,
        options
      );
      
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Check export job status
   */
  async getExportStatus(jobId: string, options?: RequestOptions): Promise<ExportStatusResponse> {
    try {
      const response = await this.get<ExportStatusResponse>(
        `${API_ENDPOINTS.EXPORT.RECIPE('status')}/${jobId}`,
        options
      );
      
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Download exported file
   */
  async downloadExport(downloadUrl: string, options?: RequestOptions): Promise<Blob> {
    try {
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: options?.headers,
        signal: options?.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get available export formats
   */
  async getAvailableFormats(options?: RequestOptions): Promise<{
    formats: Array<{
      id: string;
      name: string;
      description: string;
      supportedFeatures: string[];
      maxFileSize?: number;
    }>;
  }> {
    try {
      const response = await this.get<{
        formats: Array<{
          id: string;
          name: string;
          description: string;
          supportedFeatures: string[];
          maxFileSize?: number;
        }>;
      }>(
        `${API_ENDPOINTS.EXPORT.RECIPE('formats')}`,
        options
      );
      
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get export templates
   */
  async getExportTemplates(options?: RequestOptions): Promise<{
    templates: Array<{
      id: string;
      name: string;
      description: string;
      preview?: string;
      customFields: string[];
    }>;
  }> {
    try {
      const response = await this.get<{
        templates: Array<{
          id: string;
          name: string;
          description: string;
          preview?: string;
          customFields: string[];
        }>;
      }>(
        `${API_ENDPOINTS.EXPORT.RECIPE('templates')}`,
        options
      );
      
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Preview export (get a preview of what the export will look like)
   */
  async previewExport(
    recipeId: string,
    request: ExportRecipeRequest,
    options?: RequestOptions
  ): Promise<{
    previewUrl: string;
    expiresAt: string;
  }> {
    try {
      const queryParams = {
        format: request.format,
        includeImage: request.includeImage ? 'true' : 'false',
        includeNutrition: request.includeNutrition ? 'true' : 'false',
        includeNotes: request.includeNotes ? 'true' : 'false',
        template: request.template || 'standard',
        preview: 'true',
      };

      const queryString = this.buildQueryString(queryParams);
      const response = await this.get<{
        previewUrl: string;
        expiresAt: string;
      }>(
        `${API_ENDPOINTS.EXPORT.RECIPE(recipeId)}/preview${queryString}`,
        options
      );
      
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Cancel export job
   */
  async cancelExport(jobId: string, options?: RequestOptions): Promise<void> {
    try {
      await this.delete<void>(
        `${API_ENDPOINTS.EXPORT.RECIPE('cancel')}/${jobId}`,
        options
      );
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get export history for user
   */
  async getExportHistory(
    pageNumber: number = 1,
    pageSize: number = 20,
    options?: RequestOptions
  ): Promise<{
    exports: Array<{
      id: string;
      fileName: string;
      format: string;
      status: string;
      createdAt: string;
      downloadUrl?: string;
      expiresAt?: string;
    }>;
    totalCount: number;
    pageNumber: number;
    pageSize: number;
  }> {
    try {
      const queryParams = {
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
      };

      const queryString = this.buildQueryString(queryParams);
      const response = await this.get<{
        exports: Array<{
          id: string;
          fileName: string;
          format: string;
          status: string;
          createdAt: string;
          downloadUrl?: string;
          expiresAt?: string;
        }>;
        totalCount: number;
        pageNumber: number;
        pageSize: number;
      }>(
        `${API_ENDPOINTS.EXPORT.RECIPE('history')}${queryString}`,
        options
      );
      
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Delete export file
   */
  async deleteExport(exportId: string, options?: RequestOptions): Promise<void> {
    try {
      await this.delete<void>(
        `${API_ENDPOINTS.EXPORT.RECIPE('delete')}/${exportId}`,
        options
      );
    } catch (error) {
      this.handleApiError(error);
    }
  }
}
