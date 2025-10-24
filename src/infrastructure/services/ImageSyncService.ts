/**
 * Image Sync Service Implementation
 * 
 * Implements image synchronization between local device and cloud storage.
 * Handles sync operations, status tracking, retry logic, and offline mode support.
 */

import { injectable } from 'inversify';
import { IImageSyncService } from '../../application/ports/IImageSyncService';
import { IStorageRepository } from '../../application/ports/IStorageRepository';
import { IImageApiClient } from '../../application/ports/IImageApiClient';
import { ImageSyncRecord, createImageSyncRecord, markSyncSuccess, markSyncFailure, markRetryAttempt } from '../../domain/entities/ImageSyncRecord';
import { SyncStatus, calculateSyncStatus, updateSyncStatus } from '../../domain/entities/SyncStatus';
import { Result } from '../../domain/common/Result';
import { storageConfigManager } from '../storage/StorageConfiguration';

@injectable()
export class ImageSyncService implements IImageSyncService {
  private isCurrentlySyncing = false;
  
  constructor(
    private readonly storageRepository: IStorageRepository,
    private readonly imageApiClient: IImageApiClient
  ) {}
  
  async syncImage(imageUri: string, recipeId: string): Promise<Result<string>> {
    try {
      // Check if image is already synced
      const existingRecord = await this.storageRepository.getImageSync(imageUri);
      if (existingRecord?.isSynced) {
        return Result.success(existingRecord.fileName);
      }
      
      // Create or update sync record
      const syncRecord = existingRecord || createImageSyncRecord(imageUri, '', recipeId);
      const updatedRecord = markRetryAttempt(syncRecord);
      await this.storageRepository.saveImageSync(updatedRecord);
      
      // Attempt to upload image
      const uploadResult = await this.imageApiClient.uploadImage(imageUri, recipeId);
      
      if (!uploadResult.isSuccess) {
        // Mark as failed and save
        const failedRecord = markSyncFailure(updatedRecord, uploadResult.error!);
        await this.storageRepository.saveImageSync(failedRecord);
        return Result.failure(uploadResult.error!);
      }
      
      // Mark as successful and save
      const successRecord = markSyncSuccess({
        ...updatedRecord,
        fileName: uploadResult.value!.fileName,
        fileSize: uploadResult.value!.fileSize,
        contentType: uploadResult.value!.contentType
      });
      await this.storageRepository.saveImageSync(successRecord);
      
      // Cache the image URL
      const urlResult = await this.imageApiClient.getImageUrl(uploadResult.value!.fileName);
      if (urlResult.isSuccess) {
        await this.storageRepository.cacheImageUrl(uploadResult.value!.fileName, urlResult.value!.url);
      }
      
      return Result.success(uploadResult.value!.fileName);
    } catch (error) {
      const errorMessage = `Image sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMessage, error);
      return Result.failure(errorMessage);
    }
  }
  
  async getImageUrl(fileName: string): Promise<Result<string>> {
    try {
      // Check cache first
      const cachedUrl = await this.storageRepository.getCachedImageUrl(fileName);
      if (cachedUrl) {
        return Result.success(cachedUrl);
      }
      
      // Fetch from API
      const urlResult = await this.imageApiClient.getImageUrl(fileName);
      if (!urlResult.isSuccess) {
        return Result.failure(urlResult.error!);
      }
      
      // Cache the URL
      await this.storageRepository.cacheImageUrl(fileName, urlResult.value!.url);
      
      return Result.success(urlResult.value!.url);
    } catch (error) {
      const errorMessage = `Failed to get image URL: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMessage, error);
      return Result.failure(errorMessage);
    }
  }
  
  async isImageSynced(fileName: string): Promise<boolean> {
    try {
      const syncRecord = await this.storageRepository.getImageSyncByFileName(fileName);
      return syncRecord?.isSynced || false;
    } catch (error) {
      console.error('Failed to check sync status:', error);
      return false;
    }
  }
  
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const records = await this.storageRepository.getAllImageSyncs();
      const status = calculateSyncStatus(records);
      return updateSyncStatus(status, this.isCurrentlySyncing);
    } catch (error) {
      console.error('Failed to get sync status:', error);
      return updateSyncStatus(calculateSyncStatus([]), this.isCurrentlySyncing);
    }
  }
  
  async retryFailedSyncs(maxRetries?: number): Promise<Result<void>> {
    try {
      const config = storageConfigManager.getConfig();
      const retryLimit = maxRetries || config.maxRetries;
      
      const records = await this.storageRepository.getAllImageSyncs();
      const failedRecords = records.filter((record: ImageSyncRecord) => 
        record.hasError && (record.retryCount || 0) < retryLimit
      );
      
      if (failedRecords.length === 0) {
        return Result.successEmpty();
      }
      
      this.isCurrentlySyncing = true;
      
      try {
        // Retry failed syncs in batches
        const batchSize = config.syncBatchSize;
        for (let i = 0; i < failedRecords.length; i += batchSize) {
          const batch = failedRecords.slice(i, i + batchSize);
          await Promise.all(
            batch.map((record: ImageSyncRecord) => this.syncImage(record.localUri, record.recipeId))
          );
          
          // Add delay between batches
          if (i + batchSize < failedRecords.length) {
            await this.delay(config.retryDelayMs);
          }
        }
        
        return Result.successEmpty();
      } finally {
        this.isCurrentlySyncing = false;
      }
    } catch (error) {
      this.isCurrentlySyncing = false;
      const errorMessage = `Failed to retry syncs: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMessage, error);
      return Result.failure(errorMessage);
    }
  }
  
  async syncPendingImages(batchSize?: number): Promise<Result<void>> {
    try {
      const config = storageConfigManager.getConfig();
      const syncBatchSize = batchSize || config.syncBatchSize;
      
      const records = await this.storageRepository.getAllImageSyncs();
      const pendingRecords = records.filter((record: ImageSyncRecord) => 
        !record.isSynced && !record.hasError
      );
      
      if (pendingRecords.length === 0) {
        return Result.successEmpty();
      }
      
      this.isCurrentlySyncing = true;
      
      try {
        // Sync pending images in batches
        for (let i = 0; i < pendingRecords.length; i += syncBatchSize) {
          const batch = pendingRecords.slice(i, i + syncBatchSize);
          await Promise.all(
            batch.map((record: ImageSyncRecord) => this.syncImage(record.localUri, record.recipeId))
          );
          
          // Add delay between batches
          if (i + syncBatchSize < pendingRecords.length) {
            await this.delay(config.retryDelayMs);
          }
        }
        
        return Result.successEmpty();
      } finally {
        this.isCurrentlySyncing = false;
      }
    } catch (error) {
      this.isCurrentlySyncing = false;
      const errorMessage = `Failed to sync pending images: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMessage, error);
      return Result.failure(errorMessage);
    }
  }
  
  async clearSyncRecords(recipeId: string): Promise<Result<void>> {
    try {
      const result = await this.storageRepository.deleteImageSyncsForRecipe(recipeId);
      if (!result.isSuccess) {
        return Result.failure(result.error!);
      }
      
      return Result.successEmpty();
    } catch (error) {
      const errorMessage = `Failed to clear sync records: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMessage, error);
      return Result.failure(errorMessage);
    }
  }
  
  async getSyncRecord(imageUri: string): Promise<ImageSyncRecord | null> {
    try {
      return await this.storageRepository.getImageSync(imageUri);
    } catch (error) {
      console.error('Failed to get sync record:', error);
      return null;
    }
  }
  
  async getAllSyncRecords(): Promise<ImageSyncRecord[]> {
    try {
      return await this.storageRepository.getAllImageSyncs();
    } catch (error) {
      console.error('Failed to get all sync records:', error);
      return [];
    }
  }
  
  async getSyncRecordsForRecipe(recipeId: string): Promise<ImageSyncRecord[]> {
    try {
      return await this.storageRepository.getImageSyncsForRecipe(recipeId);
    } catch (error) {
      console.error('Failed to get sync records for recipe:', error);
      return [];
    }
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
