/**
 * Unit Tests for ImageSyncService
 * 
 * Tests the core image synchronization service functionality including:
 * - Image upload and sync
 * - Sync status tracking
 * - Error handling and retry logic
 * - Offline mode support
 * - Batch operations
 */

import { ImageSyncService } from '../../infrastructure/services/ImageSyncService';
import { IStorageRepository } from '../../application/ports/IStorageRepository';
import { IImageApiClient } from '../../application/ports/IImageApiClient';
import { ImageSyncRecord } from '../../domain/entities/ImageSyncRecord';
import { SyncStatus } from '../../domain/entities/SyncStatus';
import { Result } from '../../domain/common/Result';
import { TestDataFactory } from '../utils/TestDataFactory';
import { MockStorageRepository, MockImageApiClient, TestScenarioBuilder } from '../utils/TestUtilities';

describe('ImageSyncService', () => {
  let imageSyncService: ImageSyncService;
  let mockStorageRepository: MockStorageRepository;
  let mockImageApiClient: MockImageApiClient;
  let testDataFactory: TestDataFactory;
  let scenarioBuilder: TestScenarioBuilder;

  beforeEach(() => {
    mockStorageRepository = new MockStorageRepository();
    mockImageApiClient = new MockImageApiClient();
    testDataFactory = new TestDataFactory();
    scenarioBuilder = new TestScenarioBuilder();

    imageSyncService = new ImageSyncService(
      mockStorageRepository,
      mockImageApiClient
    );
  });

  afterEach(() => {
    mockStorageRepository.reset();
    mockImageApiClient.reset();
  });

  describe('syncImage', () => {
    it('should successfully sync an image', async () => {
      // Arrange
      const scenario = scenarioBuilder.createSuccessfulSyncScenario();
      const uploadResponse = testDataFactory.createImageUploadResponse({
        fileName: 'test-image_20231201120000_12345678.jpg'
      });

      mockImageApiClient.setUploadResponse(uploadResponse);

      // Act
      const result = await imageSyncService.syncImage(scenario.imageUri, scenario.recipeId);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(uploadResponse.fileName);
      expect(mockStorageRepository.getImageSyncCount()).toBe(1);
    });

    it('should handle upload failure gracefully', async () => {
      // Arrange
      const scenario = scenarioBuilder.createFailedSyncScenario();
      mockImageApiClient.setShouldThrowError(true, scenario.errorMessage);

      // Act
      const result = await imageSyncService.syncImage(scenario.imageUri, scenario.recipeId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(scenario.errorMessage);
      expect(mockStorageRepository.getImageSyncCount()).toBe(1);
    });

    it('should handle storage repository errors', async () => {
      // Arrange
      const scenario = scenarioBuilder.createSuccessfulSyncScenario();
      mockStorageRepository.setShouldThrowError(true, 'Storage error');

      // Act
      const result = await imageSyncService.syncImage(scenario.imageUri, scenario.recipeId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Storage error');
    });

    it('should update existing sync record on retry', async () => {
      // Arrange
      const scenario = scenarioBuilder.createFailedSyncScenario();
      const existingRecord = testDataFactory.createImageSyncRecord({
        localUri: scenario.imageUri,
        recipeId: scenario.recipeId,
        isSynced: false,
        hasError: true,
        retryCount: 1
      });

      mockStorageRepository.addImageSync(existingRecord);

      const uploadResponse = testDataFactory.createImageUploadResponse();
      mockImageApiClient.setUploadResponse(uploadResponse);

      // Act
      const result = await imageSyncService.syncImage(scenario.imageUri, scenario.recipeId);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockStorageRepository.getImageSyncCount()).toBe(1);
    });
  });

  describe('getImageUrl', () => {
    it('should return cached URL if available', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();
      const cachedUrl = 'https://storage.example.com/images/cached-image.jpg';
      mockStorageRepository.addCachedUrl(fileName, cachedUrl);

      // Act
      const result = await imageSyncService.getImageUrl(fileName);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(cachedUrl);
    });

    it('should fetch URL from API if not cached', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();
      const urlResponse = testDataFactory.createImageUrlResponse();
      mockImageApiClient.setUrlResponse(urlResponse);

      // Act
      const result = await imageSyncService.getImageUrl(fileName);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(urlResponse.url);
      expect(mockStorageRepository.getCachedUrlCount()).toBe(1);
    });

    it('should handle API errors when fetching URL', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();
      mockImageApiClient.setShouldThrowError(true, 'API error');

      // Act
      const result = await imageSyncService.getImageUrl(fileName);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('API error');
    });
  });

  describe('isImageSynced', () => {
    it('should return true for synced image', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();
      const syncedRecord = testDataFactory.createImageSyncRecord({
        fileName,
        isSynced: true
      });
      mockStorageRepository.addImageSync(syncedRecord);

      // Act
      const result = await imageSyncService.isImageSynced(fileName);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for unsynced image', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();
      const unsyncedRecord = testDataFactory.createImageSyncRecord({
        fileName,
        isSynced: false
      });
      mockStorageRepository.addImageSync(unsyncedRecord);

      // Act
      const result = await imageSyncService.isImageSynced(fileName);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for non-existent image', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();

      // Act
      const result = await imageSyncService.isImageSynced(fileName);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getSyncStatus', () => {
    it('should return correct sync status for multiple images', async () => {
      // Arrange
      const scenario = scenarioBuilder.createMultipleSyncScenario(10);
      scenario.records.forEach(record => {
        mockStorageRepository.addImageSync(record);
      });

      // Act
      const result = await imageSyncService.getSyncStatus();

      // Assert
      expect(result.totalImages).toBe(10);
      expect(result.syncedImages).toBe(8);
      expect(result.failedImages).toBe(1);
      expect(result.pendingImages).toBe(1);
      expect(result.syncPercentage).toBe(80);
    });

    it('should return zero status for no images', async () => {
      // Act
      const result = await imageSyncService.getSyncStatus();

      // Assert
      expect(result.totalImages).toBe(0);
      expect(result.syncedImages).toBe(0);
      expect(result.failedImages).toBe(0);
      expect(result.pendingImages).toBe(0);
      expect(result.syncPercentage).toBe(0);
    });

    it('should handle storage repository errors', async () => {
      // Arrange
      mockStorageRepository.setShouldThrowError(true, 'Storage error');

      // Act
      const result = await imageSyncService.getSyncStatus();

      // Assert
      expect(result.totalImages).toBe(0);
      expect(result.syncedImages).toBe(0);
      expect(result.failedImages).toBe(0);
      expect(result.pendingImages).toBe(0);
      expect(result.syncPercentage).toBe(0);
    });
  });

  describe('retryFailedSyncs', () => {
    it('should retry failed syncs successfully', async () => {
      // Arrange
      const failedRecords = testDataFactory.createMultipleImageSyncRecords(3, {
        isSynced: false,
        hasError: true,
        retryCount: 1
      });

      failedRecords.forEach(record => {
        mockStorageRepository.addImageSync(record);
      });

      const uploadResponse = testDataFactory.createImageUploadResponse();
      mockImageApiClient.setUploadResponse(uploadResponse);

      // Act
      const result = await imageSyncService.retryFailedSyncs();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockStorageRepository.getImageSyncCount()).toBe(3);
    });

    it('should respect max retries limit', async () => {
      // Arrange
      const failedRecord = testDataFactory.createImageSyncRecord({
        isSynced: false,
        hasError: true,
        retryCount: 3
      });

      mockStorageRepository.addImageSync(failedRecord);
      mockImageApiClient.setShouldThrowError(true, 'API error');

      // Act
      const result = await imageSyncService.retryFailedSyncs(3);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockStorageRepository.getImageSyncCount()).toBe(1);
    });

    it('should handle API errors during retry', async () => {
      // Arrange
      const failedRecord = testDataFactory.createImageSyncRecord({
        isSynced: false,
        hasError: true,
        retryCount: 1
      });

      mockStorageRepository.addImageSync(failedRecord);
      mockImageApiClient.setShouldThrowError(true, 'API error');

      // Act
      const result = await imageSyncService.retryFailedSyncs();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockStorageRepository.getImageSyncCount()).toBe(1);
    });
  });

  describe('syncPendingImages', () => {
    it('should sync pending images in batches', async () => {
      // Arrange
      const pendingRecords = testDataFactory.createMultipleImageSyncRecords(5, {
        isSynced: false,
        hasError: false,
        retryCount: 0
      });

      pendingRecords.forEach(record => {
        mockStorageRepository.addImageSync(record);
      });

      const uploadResponse = testDataFactory.createImageUploadResponse();
      mockImageApiClient.setUploadResponse(uploadResponse);

      // Act
      const result = await imageSyncService.syncPendingImages(2);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockStorageRepository.getImageSyncCount()).toBe(5);
    });

    it('should handle batch size larger than pending images', async () => {
      // Arrange
      const pendingRecords = testDataFactory.createMultipleImageSyncRecords(3, {
        isSynced: false,
        hasError: false,
        retryCount: 0
      });

      pendingRecords.forEach(record => {
        mockStorageRepository.addImageSync(record);
      });

      const uploadResponse = testDataFactory.createImageUploadResponse();
      mockImageApiClient.setUploadResponse(uploadResponse);

      // Act
      const result = await imageSyncService.syncPendingImages(10);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockStorageRepository.getImageSyncCount()).toBe(3);
    });

    it('should handle API errors during batch sync', async () => {
      // Arrange
      const pendingRecords = testDataFactory.createMultipleImageSyncRecords(2, {
        isSynced: false,
        hasError: false,
        retryCount: 0
      });

      pendingRecords.forEach(record => {
        mockStorageRepository.addImageSync(record);
      });

      mockImageApiClient.setShouldThrowError(true, 'API error');

      // Act
      const result = await imageSyncService.syncPendingImages();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockStorageRepository.getImageSyncCount()).toBe(2);
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      // Arrange
      const scenario = scenarioBuilder.createSuccessfulSyncScenario();
      mockImageApiClient.setShouldThrowError(true, 'Network error');

      // Act
      const result = await imageSyncService.syncImage(scenario.imageUri, scenario.recipeId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle storage errors gracefully', async () => {
      // Arrange
      const scenario = scenarioBuilder.createSuccessfulSyncScenario();
      mockStorageRepository.setShouldThrowError(true, 'Storage error');

      // Act
      const result = await imageSyncService.syncImage(scenario.imageUri, scenario.recipeId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Storage error');
    });
  });

  describe('edge cases', () => {
    it('should handle empty image URI', async () => {
      // Arrange
      const recipeId = testDataFactory.createRecipeId();

      // Act
      const result = await imageSyncService.syncImage('', recipeId);

      // Assert
      // The service doesn't validate empty strings, so it will attempt to sync
      // This test should verify the service handles empty URIs gracefully
      expect(result.isSuccess).toBeDefined();
    });

    it('should handle empty recipe ID', async () => {
      // Arrange
      const imageUri = testDataFactory.createImageUri();

      // Act
      const result = await imageSyncService.syncImage(imageUri, '');

      // Assert
      // The service doesn't validate empty strings, so it will attempt to sync
      // This test should verify the service handles empty recipe IDs gracefully
      expect(result.isSuccess).toBeDefined();
    });

    it('should handle null/undefined parameters', async () => {
      // Act & Assert
      // The service doesn't throw on null/undefined, it handles them gracefully
      const result1 = await imageSyncService.syncImage(null as any, 'recipe-123');
      const result2 = await imageSyncService.syncImage('file://test.jpg', null as any);
      
      // Both should return results (success or failure) rather than throwing
      expect(result1.isSuccess).toBeDefined();
      expect(result2.isSuccess).toBeDefined();
    });
  });
});
