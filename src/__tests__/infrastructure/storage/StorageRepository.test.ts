import { StorageRepository, IStorageRepository, ImageSyncRecord } from '../../../infrastructure/storage/StorageRepository';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TestDataFactory } from '../../utils/TestDataFactory';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  getAllKeys: jest.fn(),
  removeItem: jest.fn()
}));

describe('StorageRepository', () => {
  let storageRepository: IStorageRepository;
  let testDataFactory: TestDataFactory;

  beforeEach(() => {
    storageRepository = new StorageRepository(AsyncStorage);
    testDataFactory = new TestDataFactory();
    jest.clearAllMocks();
  });

  describe('getImageSync', () => {
    it('should return sync record if exists', async () => {
      // Arrange
      const localUri = 'file://test-image.jpg';
      const syncRecord = testDataFactory.createImageSyncRecord();
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(syncRecord));
      
      // Act
      const result = await storageRepository.getImageSync(localUri);
      
      // Assert
      expect(result).toEqual(syncRecord);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(`image_sync_${localUri}`);
    });

    it('should return null if record does not exist', async () => {
      // Arrange
      const localUri = 'file://test-image.jpg';
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      // Act
      const result = await storageRepository.getImageSync(localUri);
      
      // Assert
      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      // Arrange
      const localUri = 'file://test-image.jpg';
      
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
      
      // Act
      const result = await storageRepository.getImageSync(localUri);
      
      // Assert
      expect(result).toBeNull();
    });
  });

  describe('saveImageSync', () => {
    it('should save sync record successfully', async () => {
      // Arrange
      const syncRecord = testDataFactory.createImageSyncRecord();
      
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      // Act
      await storageRepository.saveImageSync(syncRecord);
      
      // Assert
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        `image_sync_${syncRecord.localUri}`,
        JSON.stringify(syncRecord)
      );
    });

    it('should throw error on storage failure', async () => {
      // Arrange
      const syncRecord = testDataFactory.createImageSyncRecord();
      const error = new Error('Storage error');
      
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);
      
      // Act & Assert
      await expect(storageRepository.saveImageSync(syncRecord)).rejects.toThrow(error);
    });
  });

  describe('getAllImageSyncs', () => {
    it('should return all sync records', async () => {
      // Arrange
      const syncRecords = [
        testDataFactory.createImageSyncRecord(),
        testDataFactory.createImageSyncRecord()
      ];
      
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(['image_sync_1', 'image_sync_2']);
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(syncRecords[0]))
        .mockResolvedValueOnce(JSON.stringify(syncRecords[1]));
      
      // Act
      const result = await storageRepository.getAllImageSyncs();
      
      // Assert
      expect(result).toEqual(syncRecords);
    });

    it('should return empty array on error', async () => {
      // Arrange
      (AsyncStorage.getAllKeys as jest.Mock).mockRejectedValue(new Error('Storage error'));
      
      // Act
      const result = await storageRepository.getAllImageSyncs();
      
      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getCachedImageUrl', () => {
    it('should return cached URL if exists', async () => {
      // Arrange
      const fileName = 'test.jpg';
      const cachedUrl = 'https://storage.example.com/images/test.jpg';
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(cachedUrl);
      
      // Act
      const result = await storageRepository.getCachedImageUrl(fileName);
      
      // Assert
      expect(result).toBe(cachedUrl);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(`image_url_${fileName}`);
    });

    it('should return null if URL not cached', async () => {
      // Arrange
      const fileName = 'test.jpg';
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      // Act
      const result = await storageRepository.getCachedImageUrl(fileName);
      
      // Assert
      expect(result).toBeNull();
    });
  });

  describe('cacheImageUrl', () => {
    it('should cache URL successfully', async () => {
      // Arrange
      const fileName = 'test.jpg';
      const url = 'https://storage.example.com/images/test.jpg';
      
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      // Act
      await storageRepository.cacheImageUrl(fileName, url);
      
      // Assert
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(`image_url_${fileName}`, url);
    });
  });
});
