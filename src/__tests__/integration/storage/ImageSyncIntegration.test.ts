import { ImageSyncService } from '../../../infrastructure/storage/ImageSyncService';
import { StorageRepository } from '../../../infrastructure/storage/StorageRepository';
import { MockFactory } from '../../utils/MockFactory';
import { TestDataFactory } from '../../utils/TestDataFactory';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('ImageSyncService Integration Tests', () => {
  let imageSyncService: ImageSyncService;
  let mockApiClient: jest.Mocked<any>;
  let mockLogger: jest.Mocked<any>;
  let testDataFactory: TestDataFactory;
  let mockFactory: MockFactory;

  beforeEach(() => {
    mockApiClient = MockFactory.createMockApiClient();
    mockLogger = MockFactory.createMockLogger();
    testDataFactory = new TestDataFactory();
    mockFactory = new MockFactory();
    
    jest.clearAllMocks();
  });

  describe('Full Sync Workflow', () => {
    it('should complete full sync workflow successfully', async () => {
      // Arrange
      const storageRepository = new StorageRepository(AsyncStorage);
      imageSyncService = new ImageSyncService(mockApiClient, storageRepository, mockLogger);
      
      const imageUri = 'file://test-image.jpg';
      const recipeId = 'recipe-123';
      const fileName = 'unique-filename.jpg';
      const uploadResponse = testDataFactory.createImageUploadResponse({ fileName });
      
      // Setup mocks
      mockFactory.setupSuccessfulUploadMock(mockApiClient);
      
      // Act
      const result = await imageSyncService.syncImage(imageUri, recipeId);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(fileName);
      
      // Verify storage record was created
      const savedRecord = await storageRepository.getImageSync(imageUri);
      expect(savedRecord).toBeTruthy();
      expect(savedRecord?.isSynced).toBe(true);
      expect(savedRecord?.fileName).toBe(fileName);
      expect(savedRecord?.recipeId).toBe(recipeId);
    });

    it('should maintain data consistency after successful sync', async () => {
      // Arrange
      const storageRepository = new StorageRepository(AsyncStorage);
      imageSyncService = new ImageSyncService(mockApiClient, storageRepository, mockLogger);
      
      const imageUri = 'file://test-image.jpg';
      const recipeId = 'recipe-123';
      const fileName = 'unique-filename.jpg';
      const uploadResponse = testDataFactory.createImageUploadResponse({ fileName });
      
      // Setup mocks
      mockFactory.setupSuccessfulUploadMock(mockApiClient);
      
      // Act - First sync
      const firstResult = await imageSyncService.syncImage(imageUri, recipeId);
      
      // Act - Second sync (should return existing record)
      const secondResult = await imageSyncService.syncImage(imageUri, recipeId);
      
      // Assert
      expect(firstResult.isSuccess).toBe(true);
      expect(secondResult.isSuccess).toBe(true);
      expect(firstResult.value).toBe(fileName);
      expect(secondResult.value).toBe(fileName);
      
      // Verify storage record exists and is consistent
      const savedRecord = await storageRepository.getImageSync(imageUri);
      expect(savedRecord).toBeTruthy();
      expect(savedRecord?.isSynced).toBe(true);
      expect(savedRecord?.fileName).toBe(fileName);
    });

    it('should handle sync failure and maintain error state', async () => {
      // Arrange
      const storageRepository = new StorageRepository(AsyncStorage);
      imageSyncService = new ImageSyncService(mockApiClient, storageRepository, mockLogger);
      
      const imageUri = 'file://test-image.jpg';
      const recipeId = 'recipe-123';
      const errorMessage = 'Upload failed';
      
      // Setup mocks
      mockApiClient.uploadImage.mockResolvedValue(Result.failure(errorMessage));
      
      // Act
      const result = await imageSyncService.syncImage(imageUri, recipeId);
      
      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(errorMessage);
      
      // Verify storage record was created with error state
      const savedRecord = await storageRepository.getImageSync(imageUri);
      expect(savedRecord).toBeTruthy();
      expect(savedRecord?.isSynced).toBe(false);
      expect(savedRecord?.hasError).toBe(true);
      expect(savedRecord?.errorMessage).toBe(errorMessage);
    });
  });

  describe('URL Caching Integration', () => {
    it('should cache URL after successful API fetch', async () => {
      // Arrange
      const storageRepository = new StorageRepository(AsyncStorage);
      imageSyncService = new ImageSyncService(mockApiClient, storageRepository, mockLogger);
      
      const fileName = 'test.jpg';
      const apiUrl = 'https://storage.example.com/images/test.jpg';
      
      // Setup mocks
      mockStorageRepository.getCachedImageUrl = jest.fn().mockResolvedValue(null);
      mockApiClient.getImageUrl.mockResolvedValue(Result.success(apiUrl));
      storageRepository.cacheImageUrl = jest.fn().mockResolvedValue();
      
      // Act
      const result = await imageSyncService.getImageUrl(fileName);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(apiUrl);
      expect(storageRepository.cacheImageUrl).toHaveBeenCalledWith(fileName, apiUrl);
    });

    it('should return cached URL without API call', async () => {
      // Arrange
      const storageRepository = new StorageRepository(AsyncStorage);
      imageSyncService = new ImageSyncService(mockApiClient, storageRepository, mockLogger);
      
      const fileName = 'test.jpg';
      const cachedUrl = 'https://storage.example.com/images/cached-test.jpg';
      
      // Setup mocks
      storageRepository.getCachedImageUrl.mockResolvedValue(cachedUrl);
      
      // Act
      const result = await imageSyncService.getImageUrl(fileName);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(cachedUrl);
      expect(mockApiClient.getImageUrl).not.toHaveBeenCalled();
    });
  });

  describe('Sync Status Integration', () => {
    it('should correctly calculate sync status from multiple records', async () => {
      // Arrange
      const storageRepository = new StorageRepository(AsyncStorage);
      imageSyncService = new ImageSyncService(mockApiClient, storageRepository, mockLogger);
      
      const syncedRecord = testDataFactory.createImageSyncRecord({ isSynced: true });
      const pendingRecord = testDataFactory.createImageSyncRecord({ isSynced: false });
      const failedRecord = testDataFactory.createImageSyncRecord({ isSynced: false, hasError: true });
      
      // Setup storage with multiple records
      await storageRepository.saveImageSync(syncedRecord);
      await storageRepository.saveImageSync(pendingRecord);
      await storageRepository.saveImageSync(failedRecord);
      
      // Act
      const result = await imageSyncService.getSyncStatus();
      
      // Assert
      expect(result.totalImages).toBe(3);
      expect(result.syncedImages).toBe(1);
      expect(result.pendingImages).toBe(1);
      expect(result.failedImages).toBe(1);
    });

    it('should handle storage error when calculating sync status', async () => {
      // Arrange
      const storageRepository = new StorageRepository(AsyncStorage);
      imageSyncService = new ImageSyncService(mockApiClient, storageRepository, mockLogger);
      
      // Mock storage error
      jest.spyOn(storageRepository, 'getAllImageSyncs').mockRejectedValue(new Error('Storage error'));
      
      // Act
      const result = await imageSyncService.getSyncStatus();
      
      // Assert
      expect(result.totalImages).toBe(0);
      expect(result.syncedImages).toBe(0);
      expect(result.pendingImages).toBe(0);
      expect(result.failedImages).toBe(0);
    });
  });

  afterEach(async () => {
    // Cleanup AsyncStorage
    await AsyncStorage.clear();
  });
});
