/**
 * Unit Tests for AsyncStorageRepository
 * 
 * Tests the local storage repository functionality including:
 * - Image sync record persistence
 * - URL caching
 * - Data retrieval and updates
 * - Error handling
 */

import { AsyncStorageRepository } from '../../infrastructure/storage/AsyncStorageRepository';
import { ImageSyncRecord } from '../../domain/entities/ImageSyncRecord';
import { TestDataFactory } from '../utils/TestDataFactory';

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

describe('AsyncStorageRepository', () => {
  let repository: AsyncStorageRepository;
  let testDataFactory: TestDataFactory;

  beforeEach(() => {
    repository = new AsyncStorageRepository();
    testDataFactory = new TestDataFactory();
    
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
  });

  describe('getImageSync', () => {
    it('should return null for non-existent image sync', async () => {
      // Arrange
      const localUri = testDataFactory.createImageUri();
      mockAsyncStorage.getItem.mockResolvedValue(null);

      // Act
      const result = await repository.getImageSync(localUri);

      // Assert
      expect(result).toBeNull();
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(`image_sync_${localUri}`);
    });

    it('should return image sync record when it exists', async () => {
      // Arrange
      const localUri = testDataFactory.createImageUri();
      const expectedRecord = testDataFactory.createImageSyncRecord({ localUri });
      const serializedRecord = JSON.stringify(expectedRecord);
      
      mockAsyncStorage.getItem.mockResolvedValue(serializedRecord);

      // Act
      const result = await repository.getImageSync(localUri);

      // Assert
      expect(result).toEqual(expectedRecord);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(`image_sync_${localUri}`);
    });

    it('should handle corrupted data gracefully', async () => {
      // Arrange
      const localUri = testDataFactory.createImageUri();
      mockAsyncStorage.getItem.mockResolvedValue('invalid json');

      // Act
      const result = await repository.getImageSync(localUri);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle storage errors gracefully', async () => {
      // Arrange
      const localUri = testDataFactory.createImageUri();
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      // Act & Assert
      await expect(repository.getImageSync(localUri)).rejects.toThrow('Storage error');
    });
  });

  describe('getImageSyncByFileName', () => {
    it('should return null when no image syncs exist', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();
      mockAsyncStorage.getAllKeys.mockResolvedValue([]);

      // Act
      const result = await repository.getImageSyncByFileName(fileName);

      // Assert
      expect(result).toBeNull();
    });

    it('should return image sync record by fileName', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();
      const expectedRecord = testDataFactory.createImageSyncRecord({ fileName });
      const serializedRecord = JSON.stringify(expectedRecord);
      
      mockAsyncStorage.getAllKeys.mockResolvedValue([`image_sync_${expectedRecord.localUri}`]);
      mockAsyncStorage.multiGet.mockResolvedValue([[`image_sync_${expectedRecord.localUri}`, serializedRecord]]);

      // Act
      const result = await repository.getImageSyncByFileName(fileName);

      // Assert
      expect(result).toEqual(expectedRecord);
    });

    it('should return null when fileName not found', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();
      const otherRecord = testDataFactory.createImageSyncRecord({ fileName: 'other-file.jpg' });
      const serializedRecord = JSON.stringify(otherRecord);
      
      mockAsyncStorage.getAllKeys.mockResolvedValue([`image_sync_${otherRecord.localUri}`]);
      mockAsyncStorage.multiGet.mockResolvedValue([[`image_sync_${otherRecord.localUri}`, serializedRecord]]);

      // Act
      const result = await repository.getImageSyncByFileName(fileName);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle storage errors gracefully', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();
      mockAsyncStorage.getAllKeys.mockRejectedValue(new Error('Storage error'));

      // Act & Assert
      await expect(repository.getImageSyncByFileName(fileName)).rejects.toThrow('Storage error');
    });
  });

  describe('saveImageSync', () => {
    it('should save image sync record successfully', async () => {
      // Arrange
      const record = testDataFactory.createImageSyncRecord();
      const expectedKey = `image_sync_${record.localUri}`;
      const expectedValue = JSON.stringify(record);

      // Act
      await repository.saveImageSync(record);

      // Assert
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(expectedKey, expectedValue);
    });

    it('should handle storage errors gracefully', async () => {
      // Arrange
      const record = testDataFactory.createImageSyncRecord();
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      // Act & Assert
      await expect(repository.saveImageSync(record)).rejects.toThrow('Storage error');
    });

    it('should handle invalid record data', async () => {
      // Arrange
      const invalidRecord = null as any;

      // Act & Assert
      await expect(repository.saveImageSync(invalidRecord)).rejects.toThrow();
    });
  });

  describe('getAllImageSyncs', () => {
    it('should return empty array when no image syncs exist', async () => {
      // Arrange
      mockAsyncStorage.getAllKeys.mockResolvedValue([]);

      // Act
      const result = await repository.getAllImageSyncs();

      // Assert
      expect(result).toEqual([]);
    });

    it('should return all image sync records', async () => {
      // Arrange
      const records = testDataFactory.createMultipleImageSyncRecords(3);
      const keys = records.map(record => `image_sync_${record.localUri}`);
      const values = records.map(record => JSON.stringify(record));
      const multiGetResult = keys.map((key, index) => [key, values[index]]);
      
      mockAsyncStorage.getAllKeys.mockResolvedValue(keys);
      mockAsyncStorage.multiGet.mockResolvedValue(multiGetResult);

      // Act
      const result = await repository.getAllImageSyncs();

      // Assert
      expect(result).toEqual(records);
      expect(mockAsyncStorage.getAllKeys).toHaveBeenCalled();
      expect(mockAsyncStorage.multiGet).toHaveBeenCalledWith(keys);
    });

    it('should filter out corrupted records', async () => {
      // Arrange
      const validRecord = testDataFactory.createImageSyncRecord();
      const keys = [`image_sync_${validRecord.localUri}`, 'image_sync_corrupted'];
      const multiGetResult = [
        [`image_sync_${validRecord.localUri}`, JSON.stringify(validRecord)],
        ['image_sync_corrupted', 'invalid json']
      ];
      
      mockAsyncStorage.getAllKeys.mockResolvedValue(keys);
      mockAsyncStorage.multiGet.mockResolvedValue(multiGetResult);

      // Act
      const result = await repository.getAllImageSyncs();

      // Assert
      expect(result).toEqual([validRecord]);
    });

    it('should handle storage errors gracefully', async () => {
      // Arrange
      mockAsyncStorage.getAllKeys.mockRejectedValue(new Error('Storage error'));

      // Act & Assert
      await expect(repository.getAllImageSyncs()).rejects.toThrow('Storage error');
    });
  });

  describe('getCachedImageUrl', () => {
    it('should return null for non-existent cached URL', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();
      mockAsyncStorage.getItem.mockResolvedValue(null);

      // Act
      const result = await repository.getCachedImageUrl(fileName);

      // Assert
      expect(result).toBeNull();
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(`cached_url_${fileName}`);
    });

    it('should return cached URL when it exists', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();
      const cachedUrl = 'https://storage.example.com/images/cached-image.jpg';
      mockAsyncStorage.getItem.mockResolvedValue(cachedUrl);

      // Act
      const result = await repository.getCachedImageUrl(fileName);

      // Assert
      expect(result).toBe(cachedUrl);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(`cached_url_${fileName}`);
    });

    it('should handle storage errors gracefully', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      // Act & Assert
      await expect(repository.getCachedImageUrl(fileName)).rejects.toThrow('Storage error');
    });
  });

  describe('cacheImageUrl', () => {
    it('should cache image URL successfully', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();
      const url = 'https://storage.example.com/images/test-image.jpg';
      const expectedKey = `cached_url_${fileName}`;

      // Act
      await repository.cacheImageUrl(fileName, url);

      // Assert
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(expectedKey, url);
    });

    it('should handle storage errors gracefully', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();
      const url = 'https://storage.example.com/images/test-image.jpg';
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      // Act & Assert
      await expect(repository.cacheImageUrl(fileName, url)).rejects.toThrow('Storage error');
    });

    it('should handle invalid parameters', async () => {
      // Act & Assert
      await expect(repository.cacheImageUrl('', 'url')).rejects.toThrow();
      await expect(repository.cacheImageUrl('fileName', '')).rejects.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings gracefully', async () => {
      // Act & Assert
      await expect(repository.getImageSync('')).rejects.toThrow();
      await expect(repository.getImageSyncByFileName('')).rejects.toThrow();
      await expect(repository.getCachedImageUrl('')).rejects.toThrow();
    });

    it('should handle null/undefined parameters', async () => {
      // Act & Assert
      await expect(repository.getImageSync(null as any)).rejects.toThrow();
      await expect(repository.getImageSyncByFileName(null as any)).rejects.toThrow();
      await expect(repository.getCachedImageUrl(null as any)).rejects.toThrow();
    });

    it('should handle very long keys gracefully', async () => {
      // Arrange
      const longUri = 'file://' + 'a'.repeat(1000) + '.jpg';
      const record = testDataFactory.createImageSyncRecord({ localUri: longUri });

      // Act
      await repository.saveImageSync(record);

      // Assert
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should handle special characters in keys', async () => {
      // Arrange
      const specialUri = 'file://test-image with spaces & symbols!.jpg';
      const record = testDataFactory.createImageSyncRecord({ localUri: specialUri });

      // Act
      await repository.saveImageSync(record);

      // Assert
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('performance', () => {
    it('should handle large number of records efficiently', async () => {
      // Arrange
      const records = testDataFactory.createMultipleImageSyncRecords(100);
      const keys = records.map(record => `image_sync_${record.localUri}`);
      const values = records.map(record => JSON.stringify(record));
      const multiGetResult = keys.map((key, index) => [key, values[index]]);
      
      mockAsyncStorage.getAllKeys.mockResolvedValue(keys);
      mockAsyncStorage.multiGet.mockResolvedValue(multiGetResult);

      // Act
      const startTime = Date.now();
      const result = await repository.getAllImageSyncs();
      const endTime = Date.now();

      // Assert
      expect(result).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
