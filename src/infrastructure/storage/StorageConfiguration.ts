/**
 * Storage Configuration
 * 
 * Configuration settings for image sync operations including
 * retry policies, batch sizes, cache settings, and offline mode.
 */

export interface StorageConfig {
  /** Maximum number of retry attempts for failed syncs */
  maxRetries: number;
  
  /** Delay between retry attempts in milliseconds */
  retryDelayMs: number;
  
  /** Number of images to sync in parallel batches */
  syncBatchSize: number;
  
  /** Cache expiry time in milliseconds */
  cacheExpiryMs: number;
  
  /** Whether offline sync is enabled */
  offlineSyncEnabled: boolean;
  
  /** Maximum file size for upload in bytes */
  maxFileSizeBytes: number;
  
  /** Allowed image content types */
  allowedContentTypes: string[];
  
  /** Whether to compress images before upload */
  compressImages: boolean;
  
  /** Compression quality (0.1 to 1.0) */
  compressionQuality: number;
  
  /** Whether to automatically retry failed syncs */
  autoRetryEnabled: boolean;
  
  /** Interval for automatic retry attempts in milliseconds */
  autoRetryIntervalMs: number;
  
  /** Whether to sync images in background */
  backgroundSyncEnabled: boolean;
  
  /** Maximum number of background sync operations */
  maxBackgroundSyncOperations: number;
}

/**
 * Default storage configuration
 */
export const defaultStorageConfig: StorageConfig = {
  maxRetries: 3,
  retryDelayMs: 1000,
  syncBatchSize: 10,
  cacheExpiryMs: 24 * 60 * 60 * 1000, // 24 hours
  offlineSyncEnabled: true,
  maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedContentTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ],
  compressImages: true,
  compressionQuality: 0.8,
  autoRetryEnabled: true,
  autoRetryIntervalMs: 5 * 60 * 1000, // 5 minutes
  backgroundSyncEnabled: true,
  maxBackgroundSyncOperations: 5
};

/**
 * Creates a storage configuration with overrides
 */
export function createStorageConfig(overrides: Partial<StorageConfig> = {}): StorageConfig {
  return {
    ...defaultStorageConfig,
    ...overrides
  };
}

/**
 * Validates storage configuration
 */
export function validateStorageConfig(config: StorageConfig): string[] {
  const errors: string[] = [];
  
  if (config.maxRetries < 0 || config.maxRetries > 10) {
    errors.push('maxRetries must be between 0 and 10');
  }
  
  if (config.retryDelayMs < 100 || config.retryDelayMs > 60000) {
    errors.push('retryDelayMs must be between 100 and 60000 milliseconds');
  }
  
  if (config.syncBatchSize < 1 || config.syncBatchSize > 50) {
    errors.push('syncBatchSize must be between 1 and 50');
  }
  
  if (config.cacheExpiryMs < 60000 || config.cacheExpiryMs > 7 * 24 * 60 * 60 * 1000) {
    errors.push('cacheExpiryMs must be between 1 minute and 7 days');
  }
  
  if (config.maxFileSizeBytes < 1024 || config.maxFileSizeBytes > 100 * 1024 * 1024) {
    errors.push('maxFileSizeBytes must be between 1KB and 100MB');
  }
  
  if (config.allowedContentTypes.length === 0) {
    errors.push('allowedContentTypes must contain at least one content type');
  }
  
  if (config.compressionQuality < 0.1 || config.compressionQuality > 1.0) {
    errors.push('compressionQuality must be between 0.1 and 1.0');
  }
  
  if (config.autoRetryIntervalMs < 60000 || config.autoRetryIntervalMs > 60 * 60 * 1000) {
    errors.push('autoRetryIntervalMs must be between 1 minute and 1 hour');
  }
  
  if (config.maxBackgroundSyncOperations < 1 || config.maxBackgroundSyncOperations > 20) {
    errors.push('maxBackgroundSyncOperations must be between 1 and 20');
  }
  
  return errors;
}

/**
 * Storage configuration manager
 */
export class StorageConfigManager {
  private static instance: StorageConfigManager;
  private config: StorageConfig;
  
  private constructor() {
    this.config = defaultStorageConfig;
  }
  
  static getInstance(): StorageConfigManager {
    if (!StorageConfigManager.instance) {
      StorageConfigManager.instance = new StorageConfigManager();
    }
    return StorageConfigManager.instance;
  }
  
  getConfig(): StorageConfig {
    return { ...this.config };
  }
  
  updateConfig(updates: Partial<StorageConfig>): void {
    const newConfig = { ...this.config, ...updates };
    const errors = validateStorageConfig(newConfig);
    
    if (errors.length > 0) {
      throw new Error(`Invalid configuration: ${errors.join(', ')}`);
    }
    
    this.config = newConfig;
  }
  
  resetConfig(): void {
    this.config = defaultStorageConfig;
  }
  
  isValid(): boolean {
    return validateStorageConfig(this.config).length === 0;
  }
}

/**
 * Global storage configuration manager instance
 */
export const storageConfigManager = StorageConfigManager.getInstance();