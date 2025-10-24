/**
 * Test Data Factory for Image Sync Tests
 * 
 * Provides factory methods for creating test data and mock objects
 * for image sync service testing.
 */

import { ImageSyncRecord, createImageSyncRecord } from '../../domain/entities/ImageSyncRecord';
import { SyncStatus, createSyncStatus } from '../../domain/entities/SyncStatus';
import { ImageUploadResponse, ImageUrlResponse, ImageMetadataResponse } from '../../application/ports/IImageApiClient';

export class TestDataFactory {
  /**
   * Creates a test ImageSyncRecord with default or custom values
   */
  createImageSyncRecord(overrides: Partial<ImageSyncRecord> = {}): ImageSyncRecord {
    return createImageSyncRecord(
      'file://test-image.jpg',
      'test-image_20231201120000_12345678.jpg',
      'recipe-123',
      {
        isSynced: true,
        syncedAt: new Date('2023-12-01T12:00:00Z'),
        lastChecked: new Date('2023-12-01T12:00:00Z'),
        hasError: false,
        retryCount: 0,
        fileSize: 1024,
        contentType: 'image/jpeg',
        ...overrides
      }
    );
  }

  /**
   * Creates a test SyncStatus with default or custom values
   */
  createSyncStatus(overrides: Partial<SyncStatus> = {}): SyncStatus {
    return createSyncStatus({
      totalImages: 10,
      syncedImages: 8,
      pendingImages: 1,
      failedImages: 1,
      syncingImages: 0,
      syncPercentage: 80,
      lastSyncAt: new Date('2023-12-01T12:00:00Z'),
      isSyncing: false,
      ...overrides
    });
  }

  /**
   * Creates a test ImageUploadResponse
   */
  createImageUploadResponse(overrides: Partial<ImageUploadResponse> = {}): ImageUploadResponse {
    return {
      fileName: 'test-image_20231201120000_12345678.jpg',
      fileSize: 1024,
      contentType: 'image/jpeg',
      uploadUrl: 'https://storage.example.com/images/test-image_20231201120000_12345678.jpg',
      ...overrides
    };
  }

  /**
   * Creates a test ImageUrlResponse
   */
  createImageUrlResponse(overrides: Partial<ImageUrlResponse> = {}): ImageUrlResponse {
    return {
      url: 'https://storage.example.com/images/test-image.jpg',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      ...overrides
    };
  }

  /**
   * Creates a test ImageMetadataResponse
   */
  createImageMetadataResponse(overrides: Partial<ImageMetadataResponse> = {}): ImageMetadataResponse {
    return {
      fileName: 'test-image.jpg',
      fileSize: 1024,
      contentType: 'image/jpeg',
      createdAt: new Date('2023-12-01T12:00:00Z'),
      lastModified: new Date('2023-12-01T12:00:00Z'),
      ...overrides
    };
  }

  /**
   * Creates multiple test ImageSyncRecords
   */
  createMultipleImageSyncRecords(count: number, baseOverrides: Partial<ImageSyncRecord> = {}): ImageSyncRecord[] {
    return Array.from({ length: count }, (_, index) => 
      this.createImageSyncRecord({
        localUri: `file://test-image-${index}.jpg`,
        fileName: `test-image-${index}_20231201120000_12345678.jpg`,
        recipeId: `recipe-${index}`,
        ...baseOverrides
      })
    );
  }

  /**
   * Creates a test image URI
   */
  createImageUri(): string {
    return 'file://test-image.jpg';
  }

  /**
   * Creates a test recipe ID
   */
  createRecipeId(): string {
    return 'recipe-123';
  }

  /**
   * Creates a test filename
   */
  createFileName(): string {
    return 'test-image_20231201120000_12345678.jpg';
  }

  /**
   * Creates a test error message
   */
  createErrorMessage(): string {
    return 'Test error message';
  }
}
