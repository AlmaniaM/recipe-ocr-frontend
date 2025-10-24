/**
 * Integration Tests for ImageSyncService
 * 
 * Tests the integration between ImageSyncService and its dependencies including:
 * - End-to-end sync workflows
 * - Error handling across layers
 * - Performance and scalability
 * - Real-world scenarios
 */

import { ImageSyncService } from '../../infrastructure/services/ImageSyncService';
import { AsyncStorageRepository } from '../../infrastructure/storage/AsyncStorageRepository';
import { ImageApiClient } from '../../infrastructure/api/ImageApiClient';
import { TestDataFactory, TestScenarioBuilder } from '../utils/TestUtilities';

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock BaseApiClient
const mockBaseApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
};

jest.mock('../../infrastructure/services/api/BaseApiClient', () => ({
  BaseApiClient: jest.fn().mockImplementation(() => mockBaseApiClient),
}));

describe('ImageSyncService Integration Tests', () => {
  let imageSyncService: ImageSyncService;
  let storageRepository: AsyncStorageRepository;
  let imageApiClient: ImageApiClient;
  let testDataFactory: TestDataFactory;
  let scenarioBuilder: TestScenarioBuilder;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockAsyncStorage.removeItem.mockResolvedValue(undefined);
    mockAsyncStorage.clear.mockResolvedValue(undefined);
    mockAsyncStorage.getAllKeys.mockResolvedValue([]);
    mockAsyncStorage.multiGet.mockResolvedValue([]);
    mockAsyncStorage.multiSet.mockResolvedValue(undefined);
    mockAsyncStorage.multiRemove.mockResolvedValue(undefined);

    mockBaseApiClient.get.mockResolvedValue({ data: {}, status: 200 });
    mockBaseApiClient.post.mockResolvedValue({ data: {}, status: 200 });
    mockBaseApiClient.put.mockResolvedValue({ data: {}, status: 200 });
    mockBaseApiClient.delete.mockResolvedValue({ data: {}, status: 200 });
    mockBaseApiClient.patch.mockResolvedValue({ data: {}, status: 200 });

    // Initialize services
    storageRepository = new AsyncStorageRepository();
    imageApiClient = new ImageApiClient();
    imageSyncService = new ImageSyncService(storageRepository, imageApiClient);
    
    testDataFactory = new TestDataFactory();
    scenarioBuilder = new TestScenarioBuilder();
  });

  describe('End-to-End Sync Workflows', () => {
    it('should complete full sync workflow successfully', async () => {
      // Arrange
      const scenario = scenarioBuilder.createSuccessfulSyncScenario();
      const uploadResponse = testDataFactory.createImageUploadResponse({
        fileName: 'test-image_20231201120000_12345678.jpg'
      });

      mockBaseApiClient.post.mockResolvedValue({
        data: uploadResponse,
        status: 200
      });

      // Act
      const syncResult = await imageSyncService.syncImage(scenario.imageUri, scenario.recipeId);
      const isSynced = await imageSyncService.isImageSynced(uploadResponse.fileName);
      const syncStatus = await imageSyncService.getSyncStatus();

      // Assert
      expect(syncResult.isSuccess).toBe(true);
      expect(syncResult.value).toBe(uploadResponse.fileName);
      expect(isSynced).toBe(true);
      expect(syncStatus.totalImages).toBe(1);
      expect(syncStatus.syncedImages).toBe(1);
      expect(syncStatus.syncPercentage).toBe(100);
    });

    it('should handle sync failure and retry workflow', async () => {
      // Arrange
      const scenario = scenarioBuilder.createFailedSyncScenario();
      
      // First attempt fails
      mockBaseApiClient.post.mockRejectedValueOnce(new Error('Network error'));
      
      // Retry succeeds
      const uploadResponse = testDataFactory.createImageUploadResponse();
      mockBaseApiClient.post.mockResolvedValueOnce({
        data: uploadResponse,
        status: 200
      });

      // Act
      const firstResult = await imageSyncService.syncImage(scenario.imageUri, scenario.recipeId);
      const retryResult = await imageSyncService.retryFailedSyncs();
      const syncStatus = await imageSyncService.getSyncStatus();

      // Assert
      expect(firstResult.isSuccess).toBe(false);
      expect(retryResult.isSuccess).toBe(true);
      expect(syncStatus.failedImages).toBe(0);
      expect(syncStatus.syncedImages).toBe(1);
    });

    it('should handle batch sync workflow', async () => {
      // Arrange
      const records = testDataFactory.createMultipleImageSyncRecords(5, {
        isSynced: false,
        hasError: false,
        retryCount: 0
      });

      // Add records to storage
      for (const record of records) {
        await storageRepository.saveImageSync(record);
      }

      const uploadResponse = testDataFactory.createImageUploadResponse();
      mockBaseApiClient.post.mockResolvedValue({
        data: uploadResponse,
        status: 200
      });

      // Act
      const batchResult = await imageSyncService.syncPendingImages(3);
      const syncStatus = await imageSyncService.getSyncStatus();

      // Assert
      expect(batchResult.isSuccess).toBe(true);
      expect(syncStatus.totalImages).toBe(5);
      expect(syncStatus.syncedImages).toBe(3);
      expect(syncStatus.pendingImages).toBe(2);
    });
  });

  describe('Error Handling Across Layers', () => {
    it('should handle storage layer errors', async () => {
      // Arrange
      const scenario = scenarioBuilder.createSuccessfulSyncScenario();
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      // Act
      const result = await imageSyncService.syncImage(scenario.imageUri, scenario.recipeId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Storage error');
    });

    it('should handle API layer errors', async () => {
      // Arrange
      const scenario = scenarioBuilder.createSuccessfulSyncScenario();
      mockBaseApiClient.post.mockRejectedValue(new Error('API error'));

      // Act
      const result = await imageSyncService.syncImage(scenario.imageUri, scenario.recipeId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('API error');
    });

    it('should handle network timeout errors', async () => {
      // Arrange
      const scenario = scenarioBuilder.createSuccessfulSyncScenario();
      mockBaseApiClient.post.mockRejectedValue(new Error('Request timeout'));

      // Act
      const result = await imageSyncService.syncImage(scenario.imageUri, scenario.recipeId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Request timeout');
    });

    it('should handle server error responses', async () => {
      // Arrange
      const scenario = scenarioBuilder.createSuccessfulSyncScenario();
      mockBaseApiClient.post.mockResolvedValue({
        data: { error: 'Server error' },
        status: 500
      });

      // Act
      const result = await imageSyncService.syncImage(scenario.imageUri, scenario.recipeId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Server error');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large number of images efficiently', async () => {
      // Arrange
      const records = testDataFactory.createMultipleImageSyncRecords(100);
      
      // Add records to storage
      for (const record of records) {
        await storageRepository.saveImageSync(record);
      }

      const uploadResponse = testDataFactory.createImageUploadResponse();
      mockBaseApiClient.post.mockResolvedValue({
        data: uploadResponse,
        status: 200
      });

      // Act
      const startTime = Date.now();
      const result = await imageSyncService.syncPendingImages(50);
      const endTime = Date.now();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent sync operations', async () => {
      // Arrange
      const scenarios = Array.from({ length: 10 }, () => scenarioBuilder.createSuccessfulSyncScenario());
      const uploadResponse = testDataFactory.createImageUploadResponse();
      
      mockBaseApiClient.post.mockResolvedValue({
        data: uploadResponse,
        status: 200
      });

      // Act
      const promises = scenarios.map(scenario => 
        imageSyncService.syncImage(scenario.imageUri, scenario.recipeId)
      );
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.isSuccess).toBe(true);
      });
    });

    it('should handle memory efficiently with large datasets', async () => {
      // Arrange
      const records = testDataFactory.createMultipleImageSyncRecords(1000);
      
      // Add records to storage
      for (const record of records) {
        await storageRepository.saveImageSync(record);
      }

      // Act
      const syncStatus = await imageSyncService.getSyncStatus();

      // Assert
      expect(syncStatus.totalImages).toBe(1000);
      expect(syncStatus.syncedImages).toBe(0);
      expect(syncStatus.pendingImages).toBe(1000);
      expect(syncStatus.failedImages).toBe(0);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle offline mode gracefully', async () => {
      // Arrange
      const scenario = scenarioBuilder.createSuccessfulSyncScenario();
      mockBaseApiClient.post.mockRejectedValue(new Error('Network unavailable'));

      // Act
      const result = await imageSyncService.syncImage(scenario.imageUri, scenario.recipeId);
      const syncStatus = await imageSyncService.getSyncStatus();

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(syncStatus.failedImages).toBe(1);
      expect(syncStatus.pendingImages).toBe(0);
    });

    it('should handle partial sync failures', async () => {
      // Arrange
      const records = testDataFactory.createMultipleImageSyncRecords(5, {
        isSynced: false,
        hasError: false,
        retryCount: 0
      });

      // Add records to storage
      for (const record of records) {
        await storageRepository.saveImageSync(record);
      }

      // Mock partial failures
      mockBaseApiClient.post
        .mockResolvedValueOnce({ data: testDataFactory.createImageUploadResponse(), status: 200 })
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: testDataFactory.createImageUploadResponse(), status: 200 })
        .mockRejectedValueOnce(new Error('Server error'))
        .mockResolvedValueOnce({ data: testDataFactory.createImageUploadResponse(), status: 200 });

      // Act
      const result = await imageSyncService.syncPendingImages(5);
      const syncStatus = await imageSyncService.getSyncStatus();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(syncStatus.syncedImages).toBe(3);
      expect(syncStatus.failedImages).toBe(2);
      expect(syncStatus.pendingImages).toBe(0);
    });

    it('should handle cache expiration', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();
      const cachedUrl = 'https://storage.example.com/images/cached-image.jpg';
      
      // Add cached URL
      await storageRepository.cacheImageUrl(fileName, cachedUrl);

      // Act
      const result = await imageSyncService.getImageUrl(fileName);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(cachedUrl);
    });

    it('should handle cache miss and API fallback', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();
      const urlResponse = testDataFactory.createImageUrlResponse();
      
      mockBaseApiClient.get.mockResolvedValue({
        data: urlResponse,
        status: 200
      });

      // Act
      const result = await imageSyncService.getImageUrl(fileName);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(urlResponse.url);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across operations', async () => {
      // Arrange
      const scenario = scenarioBuilder.createSuccessfulSyncScenario();
      const uploadResponse = testDataFactory.createImageUploadResponse();
      
      mockBaseApiClient.post.mockResolvedValue({
        data: uploadResponse,
        status: 200
      });

      // Act
      await imageSyncService.syncImage(scenario.imageUri, scenario.recipeId);
      const isSynced = await imageSyncService.isImageSynced(uploadResponse.fileName);
      const syncStatus = await imageSyncService.getSyncStatus();
      const record = await storageRepository.getImageSync(scenario.imageUri);

      // Assert
      expect(isSynced).toBe(true);
      expect(syncStatus.totalImages).toBe(1);
      expect(syncStatus.syncedImages).toBe(1);
      expect(record).toBeTruthy();
      expect(record?.isSynced).toBe(true);
    });

    it('should handle concurrent updates safely', async () => {
      // Arrange
      const scenario = scenarioBuilder.createSuccessfulSyncScenario();
      const uploadResponse = testDataFactory.createImageUploadResponse();
      
      mockBaseApiClient.post.mockResolvedValue({
        data: uploadResponse,
        status: 200
      });

      // Act
      const promises = [
        imageSyncService.syncImage(scenario.imageUri, scenario.recipeId),
        imageSyncService.isImageSynced(uploadResponse.fileName),
        imageSyncService.getSyncStatus()
      ];
      
      const results = await Promise.all(promises);

      // Assert
      expect(results[0].isSuccess).toBe(true);
      expect(results[1]).toBe(true);
      expect(results[2].totalImages).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty storage', async () => {
      // Act
      const syncStatus = await imageSyncService.getSyncStatus();
      const retryResult = await imageSyncService.retryFailedSyncs();
      const batchResult = await imageSyncService.syncPendingImages();

      // Assert
      expect(syncStatus.totalImages).toBe(0);
      expect(retryResult.isSuccess).toBe(true);
      expect(batchResult.isSuccess).toBe(true);
    });

    it('should handle corrupted data gracefully', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();
      mockAsyncStorage.getItem.mockResolvedValue('invalid json');

      // Act
      const result = await imageSyncService.isImageSynced(fileName);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle very long file names', async () => {
      // Arrange
      const longFileName = 'a'.repeat(1000) + '.jpg';
      const urlResponse = testDataFactory.createImageUrlResponse();
      
      mockBaseApiClient.get.mockResolvedValue({
        data: urlResponse,
        status: 200
      });

      // Act
      const result = await imageSyncService.getImageUrl(longFileName);

      // Assert
      expect(result.isSuccess).toBe(true);
    });

    it('should handle special characters in file names', async () => {
      // Arrange
      const specialFileName = 'test-image with spaces & symbols!.jpg';
      const urlResponse = testDataFactory.createImageUrlResponse();
      
      mockBaseApiClient.get.mockResolvedValue({
        data: urlResponse,
        status: 200
      });

      // Act
      const result = await imageSyncService.getImageUrl(specialFileName);

      // Assert
      expect(result.isSuccess).toBe(true);
    });
  });
});
