/**
 * Image API Client Implementation
 * 
 * Implements API communication with the backend image storage service.
 * Handles image upload, URL retrieval, metadata operations, and batch operations.
 */

import { injectable } from 'inversify';
import { IImageApiClient, ImageUploadResponse, ImageUrlResponse, ImageMetadataResponse } from '../../application/ports/IImageApiClient';
import { Result } from '../../domain/common/Result';
import { BaseApiClient } from '../../services/api/BaseApiClient';
import { ApiError, ApiErrorType } from '../../services/api/types';

@injectable()
export class ImageApiClient extends BaseApiClient implements IImageApiClient {
  private readonly BASE_PATH = '/images';
  
  async uploadImage(imageUri: string, recipeId: string): Promise<Result<ImageUploadResponse>> {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add the image file
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg', // Default type, will be detected by backend
        name: 'image.jpg'
      } as any);
      
      // Add recipe ID
      formData.append('recipeId', recipeId);
      
      const response = await this.request<ImageUploadResponse>(
        'POST',
        `${this.BASE_PATH}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return Result.success(response);
    } catch (error) {
      if (error instanceof ApiError) {
        return Result.failure(`Image upload failed: ${error.message}`);
      }
      return Result.failure(`Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getImageUrl(fileName: string): Promise<Result<ImageUrlResponse>> {
    try {
      const response = await this.request<ImageUrlResponse>(
        'GET',
        `${this.BASE_PATH}/${encodeURIComponent(fileName)}/url`
      );
      
      return Result.success(response);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.type === ApiErrorType.NOT_FOUND_ERROR) {
          return Result.failure('Image not found');
        }
        return Result.failure(`Failed to get image URL: ${error.message}`);
      }
      return Result.failure(`Failed to get image URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getImageMetadata(fileName: string): Promise<Result<ImageMetadataResponse>> {
    try {
      const response = await this.request<ImageMetadataResponse>(
        'GET',
        `${this.BASE_PATH}/${encodeURIComponent(fileName)}/metadata`
      );
      
      return Result.success(response);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.type === ApiErrorType.NOT_FOUND_ERROR) {
          return Result.failure('Image not found');
        }
        return Result.failure(`Failed to get image metadata: ${error.message}`);
      }
      return Result.failure(`Failed to get image metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async deleteImage(fileName: string): Promise<Result<void>> {
    try {
      await this.request<void>(
        'DELETE',
        `${this.BASE_PATH}/${encodeURIComponent(fileName)}`
      );
      
      return Result.successEmpty();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.type === ApiErrorType.NOT_FOUND_ERROR) {
          return Result.failure('Image not found');
        }
        return Result.failure(`Failed to delete image: ${error.message}`);
      }
      return Result.failure(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async imageExists(fileName: string): Promise<Result<boolean>> {
    try {
      await this.request<void>(
        'GET',
        `${this.BASE_PATH}/${encodeURIComponent(fileName)}/exists`
      );
      
      return Result.success(true);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.type === ApiErrorType.NOT_FOUND_ERROR) {
          return Result.success(false);
        }
        return Result.failure(`Failed to check image existence: ${error.message}`);
      }
      return Result.failure(`Failed to check image existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getImageUrls(fileNames: string[]): Promise<Result<ImageUrlResponse[]>> {
    try {
      const response = await this.request<ImageUrlResponse[]>(
        'POST',
        `${this.BASE_PATH}/urls/batch`,
        { fileNames }
      );
      
      return Result.success(response);
    } catch (error) {
      if (error instanceof ApiError) {
        return Result.failure(`Failed to get image URLs: ${error.message}`);
      }
      return Result.failure(`Failed to get image URLs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
