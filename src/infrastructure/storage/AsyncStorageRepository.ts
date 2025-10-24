/**
 * AsyncStorage Storage Repository Implementation
 * 
 * Implements local storage operations for image synchronization using
 * React Native's AsyncStorage. Handles sync records, URL caching,
 * and offline data management.
 */

import { injectable } from 'inversify';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IStorageRepository } from '../../application/ports/IStorageRepository';
import { ImageSyncRecord } from '../../domain/entities/ImageSyncRecord';
import { Result } from '../../domain/common/Result';
import { storageConfigManager } from './StorageConfiguration';

@injectable()
export class AsyncStorageRepository implements IStorageRepository {
  private readonly SYNC_RECORDS_KEY = 'image_sync_records';
  private readonly CACHED_URLS_KEY = 'cached_image_urls';
  private readonly CACHE_METADATA_KEY = 'cache_metadata';
  
  async getImageSync(localUri: string): Promise<ImageSyncRecord | null> {
    try {
      const records = await this.getAllSyncRecords();
      return records.find(record => record.localUri === localUri) || null;
    } catch (error) {
      console.error('Failed to get image sync record:', error);
      return null;
    }
  }
  
  async getImageSyncByFileName(fileName: string): Promise<ImageSyncRecord | null> {
    try {
      const records = await this.getAllSyncRecords();
      return records.find(record => record.fileName === fileName) || null;
    } catch (error) {
      console.error('Failed to get image sync record by filename:', error);
      return null;
    }
  }
  
  async saveImageSync(syncRecord: ImageSyncRecord): Promise<Result<void>> {
    try {
      const records = await this.getAllSyncRecords();
      const existingIndex = records.findIndex(r => r.localUri === syncRecord.localUri);
      
      if (existingIndex >= 0) {
        records[existingIndex] = syncRecord;
      } else {
        records.push(syncRecord);
      }
      
      await AsyncStorage.setItem(this.SYNC_RECORDS_KEY, JSON.stringify(records));
      return Result.successEmpty();
    } catch (error) {
      const errorMessage = `Failed to save image sync record: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return Result.failure(errorMessage);
    }
  }
  
  async getAllImageSyncs(): Promise<ImageSyncRecord[]> {
    try {
      const recordsJson = await AsyncStorage.getItem(this.SYNC_RECORDS_KEY);
      if (!recordsJson) {
        return [];
      }
      
      const records = JSON.parse(recordsJson) as ImageSyncRecord[];
      // Convert date strings back to Date objects
      return records.map(record => ({
        ...record,
        syncedAt: new Date(record.syncedAt),
        lastChecked: new Date(record.lastChecked)
      }));
    } catch (error) {
      console.error('Failed to get all image sync records:', error);
      return [];
    }
  }
  
  async getImageSyncsForRecipe(recipeId: string): Promise<ImageSyncRecord[]> {
    try {
      const records = await this.getAllSyncRecords();
      return records.filter(record => record.recipeId === recipeId);
    } catch (error) {
      console.error('Failed to get image sync records for recipe:', error);
      return [];
    }
  }
  
  async deleteImageSync(localUri: string): Promise<Result<void>> {
    try {
      const records = await this.getAllSyncRecords();
      const filteredRecords = records.filter(record => record.localUri !== localUri);
      
      await AsyncStorage.setItem(this.SYNC_RECORDS_KEY, JSON.stringify(filteredRecords));
      return Result.successEmpty();
    } catch (error) {
      const errorMessage = `Failed to delete image sync record: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return Result.failure(errorMessage);
    }
  }
  
  async deleteImageSyncsForRecipe(recipeId: string): Promise<Result<void>> {
    try {
      const records = await this.getAllSyncRecords();
      const filteredRecords = records.filter(record => record.recipeId !== recipeId);
      
      await AsyncStorage.setItem(this.SYNC_RECORDS_KEY, JSON.stringify(filteredRecords));
      return Result.successEmpty();
    } catch (error) {
      const errorMessage = `Failed to delete image sync records for recipe: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return Result.failure(errorMessage);
    }
  }
  
  async getCachedImageUrl(fileName: string): Promise<string | null> {
    try {
      const cachedUrls = await this.getCachedUrls();
      const cachedUrl = cachedUrls[fileName];
      
      if (!cachedUrl) {
        return null;
      }
      
      // Check if cache entry has expired
      const config = storageConfigManager.getConfig();
      const now = Date.now();
      const cacheAge = now - cachedUrl.cachedAt;
      
      if (cacheAge > config.cacheExpiryMs) {
        // Cache expired, remove it
        await this.clearCachedImageUrl(fileName);
        return null;
      }
      
      return cachedUrl.url;
    } catch (error) {
      console.error('Failed to get cached image URL:', error);
      return null;
    }
  }
  
  async cacheImageUrl(fileName: string, url: string): Promise<Result<void>> {
    try {
      const cachedUrls = await this.getCachedUrls();
      cachedUrls[fileName] = {
        url,
        cachedAt: Date.now()
      };
      
      await AsyncStorage.setItem(this.CACHED_URLS_KEY, JSON.stringify(cachedUrls));
      return Result.successEmpty();
    } catch (error) {
      const errorMessage = `Failed to cache image URL: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return Result.failure(errorMessage);
    }
  }
  
  async clearCachedImageUrl(fileName: string): Promise<Result<void>> {
    try {
      const cachedUrls = await this.getCachedUrls();
      delete cachedUrls[fileName];
      
      await AsyncStorage.setItem(this.CACHED_URLS_KEY, JSON.stringify(cachedUrls));
      return Result.successEmpty();
    } catch (error) {
      const errorMessage = `Failed to clear cached image URL: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return Result.failure(errorMessage);
    }
  }
  
  async clearAllCachedUrls(): Promise<Result<void>> {
    try {
      await AsyncStorage.removeItem(this.CACHED_URLS_KEY);
      return Result.successEmpty();
    } catch (error) {
      const errorMessage = `Failed to clear all cached URLs: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return Result.failure(errorMessage);
    }
  }
  
  async getCacheSize(): Promise<number> {
    try {
      const cachedUrls = await this.getCachedUrls();
      const cacheJson = JSON.stringify(cachedUrls);
      return new Blob([cacheJson]).size;
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  }
  
  async cleanupExpiredCache(maxAge?: number): Promise<Result<void>> {
    try {
      const config = storageConfigManager.getConfig();
      const expiryTime = maxAge || config.cacheExpiryMs;
      const now = Date.now();
      
      const cachedUrls = await this.getCachedUrls();
      const validUrls: Record<string, { url: string; cachedAt: number }> = {};
      
      for (const [fileName, cachedUrl] of Object.entries(cachedUrls)) {
        const cacheAge = now - cachedUrl.cachedAt;
        if (cacheAge <= expiryTime) {
          validUrls[fileName] = cachedUrl;
        }
      }
      
      await AsyncStorage.setItem(this.CACHED_URLS_KEY, JSON.stringify(validUrls));
      return Result.successEmpty();
    } catch (error) {
      const errorMessage = `Failed to cleanup expired cache: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return Result.failure(errorMessage);
    }
  }
  
  private async getAllSyncRecords(): Promise<ImageSyncRecord[]> {
    try {
      const recordsJson = await AsyncStorage.getItem(this.SYNC_RECORDS_KEY);
      if (!recordsJson) {
        return [];
      }
      
      const records = JSON.parse(recordsJson) as ImageSyncRecord[];
      // Convert date strings back to Date objects
      return records.map(record => ({
        ...record,
        syncedAt: new Date(record.syncedAt),
        lastChecked: new Date(record.lastChecked)
      }));
    } catch (error) {
      console.error('Failed to get all sync records:', error);
      return [];
    }
  }
  
  private async getCachedUrls(): Promise<Record<string, { url: string; cachedAt: number }>> {
    try {
      const cachedUrlsJson = await AsyncStorage.getItem(this.CACHED_URLS_KEY);
      if (!cachedUrlsJson) {
        return {};
      }
      
      return JSON.parse(cachedUrlsJson);
    } catch (error) {
      console.error('Failed to get cached URLs:', error);
      return {};
    }
  }
}
