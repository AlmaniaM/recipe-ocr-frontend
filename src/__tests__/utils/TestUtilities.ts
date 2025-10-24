/**
 * Test Utilities for Image Sync Tests
 * 
 * Provides utilities for mocking dependencies and creating test scenarios
 * for image sync service testing.
 */

import { IStorageRepository } from '../../application/ports/IStorageRepository';
import { IImageApiClient } from '../../application/ports/IImageApiClient';
import { ImageSyncRecord } from '../../domain/entities/ImageSyncRecord';
import { Result } from '../../domain/common/Result';
import { TestDataFactory } from './TestDataFactory';

export class MockStorageRepository implements IStorageRepository {
  private imageSyncs: Map<string, ImageSyncRecord> = new Map();
  private cachedUrls: Map<string, string> = new Map();
  private shouldThrowError = false;
  private errorMessage = 'Storage error';

  constructor() {
    this.reset();
  }

  reset(): void {
    this.imageSyncs.clear();
    this.cachedUrls.clear();
    this.shouldThrowError = false;
    this.errorMessage = 'Storage error';
  }

  setShouldThrowError(shouldThrow: boolean, message = 'Storage error'): void {
    this.shouldThrowError = shouldThrow;
    this.errorMessage = message;
  }

  async getImageSync(localUri: string): Promise<ImageSyncRecord | null> {
    if (this.shouldThrowError) {
      throw new Error(this.errorMessage);
    }
    return this.imageSyncs.get(localUri) || null;
  }

  async getImageSyncByFileName(fileName: string): Promise<ImageSyncRecord | null> {
    if (this.shouldThrowError) {
      throw new Error(this.errorMessage);
    }
    for (const record of this.imageSyncs.values()) {
      if (record.fileName === fileName) {
        return record;
      }
    }
    return null;
  }

  async saveImageSync(syncRecord: ImageSyncRecord): Promise<Result<void>> {
    if (this.shouldThrowError) {
      return Result.failure(this.errorMessage);
    }
    this.imageSyncs.set(syncRecord.localUri, syncRecord);
    return Result.success(undefined);
  }

  async getAllImageSyncs(): Promise<ImageSyncRecord[]> {
    if (this.shouldThrowError) {
      throw new Error(this.errorMessage);
    }
    return Array.from(this.imageSyncs.values());
  }

  async getCachedImageUrl(fileName: string): Promise<string | null> {
    if (this.shouldThrowError) {
      throw new Error(this.errorMessage);
    }
    return this.cachedUrls.get(fileName) || null;
  }

  async cacheImageUrl(fileName: string, url: string): Promise<Result<void>> {
    if (this.shouldThrowError) {
      return Result.failure(this.errorMessage);
    }
    this.cachedUrls.set(fileName, url);
    return Result.success(undefined);
  }

  // Test helper methods
  addImageSync(record: ImageSyncRecord): void {
    this.imageSyncs.set(record.localUri, record);
  }

  addCachedUrl(fileName: string, url: string): void {
    this.cachedUrls.set(fileName, url);
  }

  getImageSyncCount(): number {
    return this.imageSyncs.size;
  }

  getCachedUrlCount(): number {
    return this.cachedUrls.size;
  }

  async getImageSyncsForRecipe(recipeId: string): Promise<ImageSyncRecord[]> {
    if (this.shouldThrowError) {
      throw new Error(this.errorMessage);
    }
    return Array.from(this.imageSyncs.values()).filter(record => record.recipeId === recipeId);
  }

  async deleteImageSync(localUri: string): Promise<Result<void>> {
    if (this.shouldThrowError) {
      return Result.failure(this.errorMessage);
    }
    this.imageSyncs.delete(localUri);
    return Result.success(undefined);
  }

  async deleteImageSyncsForRecipe(recipeId: string): Promise<Result<void>> {
    if (this.shouldThrowError) {
      return Result.failure(this.errorMessage);
    }
    for (const [key, record] of this.imageSyncs.entries()) {
      if (record.recipeId === recipeId) {
        this.imageSyncs.delete(key);
      }
    }
    return Result.success(undefined);
  }

  async clearCachedImageUrl(fileName: string): Promise<Result<void>> {
    if (this.shouldThrowError) {
      return Result.failure(this.errorMessage);
    }
    this.cachedUrls.delete(fileName);
    return Result.success(undefined);
  }

  async clearAllCachedUrls(): Promise<Result<void>> {
    if (this.shouldThrowError) {
      return Result.failure(this.errorMessage);
    }
    this.cachedUrls.clear();
    return Result.success(undefined);
  }

  async getCacheSize(): Promise<number> {
    if (this.shouldThrowError) {
      throw new Error(this.errorMessage);
    }
    return this.cachedUrls.size * 100; // Approximate size
  }

  async cleanupExpiredCache(maxAge?: number): Promise<Result<void>> {
    if (this.shouldThrowError) {
      return Result.failure(this.errorMessage);
    }
    // Mock implementation - in real scenario would check timestamps
    return Result.success(undefined);
  }
}

export class MockImageApiClient implements IImageApiClient {
  private shouldThrowError = false;
  private errorMessage = 'API error';
  private uploadResponse: any = null;
  private urlResponse: any = null;
  private metadataResponse: any = null;
  private deleteResponse = true;
  private existsResponse = true;

  constructor() {
    this.reset();
  }

  reset(): void {
    this.shouldThrowError = false;
    this.errorMessage = 'API error';
    this.uploadResponse = null;
    this.urlResponse = null;
    this.metadataResponse = null;
    this.deleteResponse = true;
    this.existsResponse = true;
  }

  setShouldThrowError(shouldThrow: boolean, message = 'API error'): void {
    this.shouldThrowError = shouldThrow;
    this.errorMessage = message;
  }

  setUploadResponse(response: any): void {
    this.uploadResponse = response;
  }

  setUrlResponse(response: any): void {
    this.urlResponse = response;
  }

  setMetadataResponse(response: any): void {
    this.metadataResponse = response;
  }

  setDeleteResponse(response: boolean): void {
    this.deleteResponse = response;
  }

  setExistsResponse(response: boolean): void {
    this.existsResponse = response;
  }

  async uploadImage(imageUri: string, recipeId: string): Promise<Result<any>> {
    if (this.shouldThrowError) {
      return Result.failure(this.errorMessage);
    }

    if (this.uploadResponse) {
      return Result.success(this.uploadResponse);
    }

    const factory = new TestDataFactory();
    return Result.success(factory.createImageUploadResponse({
      fileName: 'test-image.jpg',
      contentType: 'image/jpeg'
    }));
  }

  async getImageUrl(fileName: string): Promise<Result<any>> {
    if (this.shouldThrowError) {
      return Result.failure(this.errorMessage);
    }

    if (this.urlResponse) {
      return Result.success(this.urlResponse);
    }

    const factory = new TestDataFactory();
    return Result.success(factory.createImageUrlResponse());
  }

  async deleteImage(fileName: string): Promise<Result<void>> {
    if (this.shouldThrowError) {
      return Result.failure(this.errorMessage);
    }

    return Result.success(undefined);
  }

  async imageExists(fileName: string): Promise<Result<boolean>> {
    if (this.shouldThrowError) {
      return Result.failure(this.errorMessage);
    }

    return Result.success(this.existsResponse);
  }

  async getImageUrls(fileNames: string[]): Promise<Result<any[]>> {
    if (this.shouldThrowError) {
      return Result.failure(this.errorMessage);
    }

    const factory = new TestDataFactory();
    const responses = fileNames.map(fileName => 
      factory.createImageUrlResponse({ url: `https://storage.example.com/images/${fileName}` })
    );

    return Result.success(responses);
  }

  async getImageMetadata(fileName: string): Promise<Result<any>> {
    if (this.shouldThrowError) {
      return Result.failure(this.errorMessage);
    }

    if (this.metadataResponse) {
      return Result.success(this.metadataResponse);
    }

    const factory = new TestDataFactory();
    return Result.success(factory.createImageMetadataResponse({ fileName }));
  }
}

export class TestScenarioBuilder {
  private factory: TestDataFactory;

  constructor() {
    this.factory = new TestDataFactory();
  }

  /**
   * Creates a scenario with successful image sync
   */
  createSuccessfulSyncScenario(): {
    imageUri: string;
    recipeId: string;
    expectedRecord: ImageSyncRecord;
  } {
    const imageUri = this.factory.createImageUri();
    const recipeId = this.factory.createRecipeId();
    const expectedRecord = this.factory.createImageSyncRecord({
      localUri: imageUri,
      recipeId,
      isSynced: true,
      syncedAt: new Date(),
      lastChecked: new Date(),
      hasError: false,
      retryCount: 0
    });

    return { imageUri, recipeId, expectedRecord };
  }

  /**
   * Creates a scenario with failed image sync
   */
  createFailedSyncScenario(): {
    imageUri: string;
    recipeId: string;
    errorMessage: string;
    expectedRecord: ImageSyncRecord;
  } {
    const imageUri = this.factory.createImageUri();
    const recipeId = this.factory.createRecipeId();
    const errorMessage = this.factory.createErrorMessage();
    const expectedRecord = this.factory.createImageSyncRecord({
      localUri: imageUri,
      recipeId,
      isSynced: false,
      hasError: true,
      errorMessage,
      retryCount: 1
    });

    return { imageUri, recipeId, errorMessage, expectedRecord };
  }

  /**
   * Creates a scenario with multiple image sync records
   */
  createMultipleSyncScenario(count: number): {
    records: ImageSyncRecord[];
    expectedStatus: any;
  } {
    const records = this.factory.createMultipleImageSyncRecords(count);
    const syncedCount = Math.floor(count * 0.8);
    const failedCount = Math.floor(count * 0.1);
    const pendingCount = count - syncedCount - failedCount;

    // Update records to have different sync statuses
    records.forEach((record, index) => {
      if (index < syncedCount) {
        record.isSynced = true;
        record.syncedAt = new Date();
        record.hasError = false;
      } else if (index < syncedCount + failedCount) {
        record.isSynced = false;
        record.hasError = true;
        record.errorMessage = 'Sync failed';
        record.retryCount = 1;
      } else {
        record.isSynced = false;
        record.hasError = false;
        record.retryCount = 0;
      }
    });

    const expectedStatus = this.factory.createSyncStatus({
      totalImages: count,
      syncedImages: syncedCount,
      failedImages: failedCount,
      pendingImages: pendingCount,
      syncingImages: 0,
      syncPercentage: Math.round((syncedCount / count) * 100)
    });

    return { records, expectedStatus };
  }
}
