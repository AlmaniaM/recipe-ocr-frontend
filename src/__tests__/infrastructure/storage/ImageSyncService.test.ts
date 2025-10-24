import { ImageSyncService, IImageSyncService, SyncStatus } from '../../../infrastructure/services/ImageSyncService';
import { IStorageRepository, ImageSyncRecord } from '../../../infrastructure/storage/StorageRepository';
import { IApiClient } from '../../../infrastructure/api/ApiClient';
import { ILogger } from '../../../infrastructure/logging/Logger';
import { Result } from '../../../domain/common/Result';
import { TestDataFactory } from '../../utils/TestDataFactory';
import { MockFactory } from '../../utils/MockFactory';

describe('ImageSyncService', () => {
  let mockApiClient: jest.Mocked<IApiClient>;
  let mockStorageRepository: jest.Mocked<IStorageRepository>;
  let mockLogger: jest.Mocked<ILogger>;
  let imageSyncService: IImageSyncService;
  let testDataFactory: TestDataFactory;

  beforeEach(() => {
    mockApiClient = MockFactory.createMockApiClient();
    mockStorageRepository = MockFactory.createMockStorageRepository();
    mockLogger = MockFactory.createMockLogger();
    testDataFactory = new TestDataFactory();
    
    imageSyncService = new ImageSyncService(
      mockApiClient,
      mockStorageRepository,
      mockLogger
    );
  });

  describe('syncImage', () => {
    it('should sync image successfully', async () => {
      // Arrange
      const imageUri = 'file://test-image.jpg';
      const recipeId = 'recipe-123';
      const fileName = 'unique-filename.jpg';
      const uploadResponse = { fileName };
      
      mockStorageRepository.getImageSync.mockResolvedValue(null);
      mockApiClient.uploadImage.mockResolvedValue(Result.success(uploadResponse));
      mockStorageRepository.saveImageSync.mockResolvedValue();
      
      // Act
      const result = await imageSyncService.syncImage(imageUri, recipeId);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(fileName);
      expect(mockStorageRepository.saveImageSync).toHaveBeenCalledWith(
        expect.objectContaining({
          localUri: imageUri,
          fileName: fileName,
          recipeId: recipeId,
          isSynced: true
        })
      );
    });

    it('should return existing sync record if already synced', async () => {
      // Arrange
      const imageUri = 'file://test-image.jpg';
      const recipeId = 'recipe-123';
      const existingSync: ImageSyncRecord = {
        localUri: imageUri,
        fileName: 'existing-filename.jpg',
        recipeId: recipeId,
        isSynced: true,
        syncedAt: new Date(),
        lastChecked: new Date()
      };
      
      mockStorageRepository.getImageSync.mockResolvedValue(existingSync);
      
      // Act
      const result = await imageSyncService.syncImage(imageUri, recipeId);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe('existing-filename.jpg');
      expect(mockApiClient.uploadImage).not.toHaveBeenCalled();
    });

    it('should handle upload failure', async () => {
      // Arrange
      const imageUri = 'file://test-image.jpg';
      const recipeId = 'recipe-123';
      const errorMessage = 'Upload failed';
      
      mockStorageRepository.getImageSync.mockResolvedValue(null);
      mockApiClient.uploadImage.mockResolvedValue(Result.failure(errorMessage));
      
      // Act
      const result = await imageSyncService.syncImage(imageUri, recipeId);
      
      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(errorMessage);
      expect(mockStorageRepository.saveImageSync).not.toHaveBeenCalled();
    });

    it('should handle storage repository error', async () => {
      // Arrange
      const imageUri = 'file://test-image.jpg';
      const recipeId = 'recipe-123';
      const errorMessage = 'Storage error';
      
      mockStorageRepository.getImageSync.mockRejectedValue(new Error(errorMessage));
      
      // Act
      const result = await imageSyncService.syncImage(imageUri, recipeId);
      
      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Image sync failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Image sync failed',
        expect.objectContaining({
          error: expect.any(Error),
          imageUri,
          recipeId
        })
      );
    });
  });

  describe('getImageUrl', () => {
    it('should return cached URL if available', async () => {
      // Arrange
      const fileName = 'test.jpg';
      const cachedUrl = 'https://storage.example.com/images/test.jpg';
      
      mockStorageRepository.getCachedImageUrl.mockResolvedValue(cachedUrl);
      
      // Act
      const result = await imageSyncService.getImageUrl(fileName);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(cachedUrl);
      expect(mockApiClient.getImageUrl).not.toHaveBeenCalled();
    });

    it('should fetch URL from API if not cached', async () => {
      // Arrange
      const fileName = 'test.jpg';
      const apiUrl = 'https://storage.example.com/images/test.jpg';
      
      mockStorageRepository.getCachedImageUrl.mockResolvedValue(null);
      mockApiClient.getImageUrl.mockResolvedValue(Result.success(apiUrl));
      mockStorageRepository.cacheImageUrl.mockResolvedValue();
      
      // Act
      const result = await imageSyncService.getImageUrl(fileName);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(apiUrl);
      expect(mockStorageRepository.cacheImageUrl).toHaveBeenCalledWith(fileName, apiUrl);
    });

    it('should handle API error when fetching URL', async () => {
      // Arrange
      const fileName = 'test.jpg';
      const errorMessage = 'API error';
      
      mockStorageRepository.getCachedImageUrl.mockResolvedValue(null);
      mockApiClient.getImageUrl.mockResolvedValue(Result.failure(errorMessage));
      
      // Act
      const result = await imageSyncService.getImageUrl(fileName);
      
      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(errorMessage);
    });
  });

  describe('isImageSynced', () => {
    it('should return true if image is synced', async () => {
      // Arrange
      const fileName = 'test.jpg';
      const syncRecord: ImageSyncRecord = {
        localUri: 'file://test-image.jpg',
        fileName: fileName,
        recipeId: 'recipe-123',
        isSynced: true,
        syncedAt: new Date(),
        lastChecked: new Date()
      };
      
      mockStorageRepository.getImageSyncByFileName.mockResolvedValue(syncRecord);
      
      // Act
      const result = await imageSyncService.isImageSynced(fileName);
      
      // Assert
      expect(result).toBe(true);
    });

    it('should return false if image is not synced', async () => {
      // Arrange
      const fileName = 'test.jpg';
      
      mockStorageRepository.getImageSyncByFileName.mockResolvedValue(null);
      
      // Act
      const result = await imageSyncService.isImageSynced(fileName);
      
      // Assert
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      // Arrange
      const fileName = 'test.jpg';
      
      mockStorageRepository.getImageSyncByFileName.mockRejectedValue(new Error('Storage error'));
      
      // Act
      const result = await imageSyncService.isImageSynced(fileName);
      
      // Assert
      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to check sync status',
        expect.objectContaining({
          error: expect.any(Error),
          fileName
        })
      );
    });
  });

  describe('getSyncStatus', () => {
    it('should return correct sync status', async () => {
      // Arrange
      const syncRecords: ImageSyncRecord[] = [
        {
          localUri: 'file://image1.jpg',
          fileName: 'image1.jpg',
          recipeId: 'recipe-1',
          isSynced: true,
          syncedAt: new Date(),
          lastChecked: new Date()
        },
        {
          localUri: 'file://image2.jpg',
          fileName: 'image2.jpg',
          recipeId: 'recipe-2',
          isSynced: false,
          syncedAt: new Date(),
          lastChecked: new Date()
        },
        {
          localUri: 'file://image3.jpg',
          fileName: 'image3.jpg',
          recipeId: 'recipe-3',
          isSynced: false,
          syncedAt: new Date(),
          lastChecked: new Date(),
          hasError: true,
          errorMessage: 'Sync failed'
        }
      ];
      
      mockStorageRepository.getAllImageSyncs.mockResolvedValue(syncRecords);
      
      // Act
      const result = await imageSyncService.getSyncStatus();
      
      // Assert
      expect(result).toEqual({
        totalImages: 3,
        syncedImages: 1,
        pendingImages: 1,
        failedImages: 1
      });
    });

    it('should handle error when getting sync status', async () => {
      // Arrange
      mockStorageRepository.getAllImageSyncs.mockRejectedValue(new Error('Storage error'));
      
      // Act
      const result = await imageSyncService.getSyncStatus();
      
      // Assert
      expect(result).toEqual({
        totalImages: 0,
        syncedImages: 0,
        pendingImages: 0,
        failedImages: 0
      });
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to get sync status',
        expect.objectContaining({
          error: expect.any(Error)
        })
      );
    });
  });
});
