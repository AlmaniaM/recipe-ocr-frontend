import { IApiClient } from '../../../infrastructure/api/ApiClient';
import { IStorageRepository } from '../../../infrastructure/storage/StorageRepository';
import { ILogger } from '../../../infrastructure/logging/Logger';
import { Result } from '../../../domain/common/Result';
import { TestDataFactory } from './TestDataFactory';

export class MockFactory {
  private static testDataFactory: TestDataFactory = new TestDataFactory();

  static createMockApiClient(): jest.Mocked<IApiClient> {
    return {
      uploadImage: jest.fn(),
      getImageUrl: jest.fn()
    } as jest.Mocked<IApiClient>;
  }

  static createMockStorageRepository(): jest.Mocked<IStorageRepository> {
    return {
      getImageSync: jest.fn(),
      getImageSyncByFileName: jest.fn(),
      saveImageSync: jest.fn(),
      getAllImageSyncs: jest.fn(),
      getCachedImageUrl: jest.fn(),
      cacheImageUrl: jest.fn()
    } as jest.Mocked<IStorageRepository>;
  }

  static createMockLogger(): jest.Mocked<ILogger> {
    return {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    } as jest.Mocked<ILogger>;
  }

  // Helper methods to set up common mock scenarios

  static setupSuccessfulUploadMock(mockApiClient: jest.Mocked<IApiClient>): void {
    mockApiClient.uploadImage.mockResolvedValue(
      Result.success(this.testDataFactory.createImageUploadResponse())
    );
  }

  static setupFailedUploadMock(mockApiClient: jest.Mocked<IApiClient>, errorMessage: string = 'Upload failed'): void {
    mockApiClient.uploadImage.mockResolvedValue(Result.failure(errorMessage));
  }

  static setupExistingSyncRecordMock(mockStorageRepository: jest.Mocked<IStorageRepository>): void {
    const existingSync = this.testDataFactory.createImageSyncRecord({
      isSynced: true
    });
    mockStorageRepository.getImageSync.mockResolvedValue(existingSync);
  }

  static setupNoExistingSyncMock(mockStorageRepository: jest.Mocked<IStorageRepository>): void {
    mockStorageRepository.getImageSync.mockResolvedValue(null);
  }

  static setupCachedUrlMock(mockStorageRepository: jest.Mocked<IStorageRepository>): void {
    const cachedUrl = 'https://storage.example.com/images/test.jpg';
    mockStorageRepository.getCachedImageUrl.mockResolvedValue(cachedUrl);
  }

  static setupNoCachedUrlMock(mockStorageRepository: jest.Mocked<IStorageRepository>): void {
    mockStorageRepository.getCachedImageUrl.mockResolvedValue(null);
  }

  static setupSuccessfulUrlFetchMock(mockApiClient: jest.Mocked<IApiClient>): void {
    mockApiClient.getImageUrl.mockResolvedValue(
      Result.success(this.testDataFactory.createImageUrlResponse())
    );
  }

  static setupFailedUrlFetchMock(mockApiClient: jest.Mocked<IApiClient>, errorMessage: string = 'URL fetch failed'): void {
    mockApiClient.getImageUrl.mockResolvedValue(Result.failure(errorMessage));
  }

  static setupSyncRecordsMock(mockStorageRepository: jest.Mocked<IStorageRepository>, records: ImageSyncRecord[]): void {
    mockStorageRepository.getAllImageSyncs.mockResolvedValue(records);
  }

  static setupStorageErrorMock(mockStorageRepository: jest.Mocked<IStorageRepository>, method: keyof IStorageRepository): void {
    (mockStorageRepository[method as keyof IStorageRepository] as jest.Mock).mockRejectedValue(new Error('Storage error'));
  }

  static setupSuccessfulSaveMock(mockStorageRepository: jest.Mocked<IStorageRepository>): void {
    mockStorageRepository.saveImageSync.mockResolvedValue();
  }

  static setupFailedSaveMock(mockStorageRepository: jest.Mocked<IStorageRepository>): void {
    mockStorageRepository.saveImageSync.mockRejectedValue(new Error('Save failed'));
  }
}
