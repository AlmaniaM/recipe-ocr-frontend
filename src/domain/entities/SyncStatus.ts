/**
 * Sync Status Entity
 * 
 * Represents the overall synchronization status of all images
 * in the application. Provides aggregated statistics for monitoring
 * and user feedback.
 */

import { ImageSyncRecord } from './ImageSyncRecord';

export interface SyncStatus {
  /** Total number of images tracked for sync */
  totalImages: number;
  
  /** Number of images successfully synced to cloud storage */
  syncedImages: number;
  
  /** Number of images pending sync (not yet attempted or retrying) */
  pendingImages: number;
  
  /** Number of images with sync errors */
  failedImages: number;
  
  /** Number of images currently being synced */
  syncingImages: number;
  
  /** Percentage of images successfully synced (0-100) */
  syncPercentage: number;
  
  /** Timestamp of the last sync operation */
  lastSyncAt?: Date;
  
  /** Whether a sync operation is currently in progress */
  isSyncing: boolean;
}

/**
 * Creates a SyncStatus with default values
 */
export function createSyncStatus(overrides: Partial<SyncStatus> = {}): SyncStatus {
  return {
    totalImages: 0,
    syncedImages: 0,
    pendingImages: 0,
    failedImages: 0,
    syncingImages: 0,
    syncPercentage: 0,
    lastSyncAt: undefined,
    isSyncing: false,
    ...overrides
  };
}

/**
 * Calculates sync status from an array of ImageSyncRecords
 */
export function calculateSyncStatus(records: ImageSyncRecord[]): SyncStatus {
  const totalImages = records.length;
  const syncedImages = records.filter(r => r.isSynced).length;
  const failedImages = records.filter(r => r.hasError).length;
  const syncingImages = records.filter(r => 
    !r.isSynced && !r.hasError && r.retryCount && r.retryCount > 0
  ).length;
  const pendingImages = totalImages - syncedImages - failedImages - syncingImages;
  
  const syncPercentage = totalImages > 0 ? Math.round((syncedImages / totalImages) * 100) : 0;
  
  const lastSyncAt = records
    .filter(r => r.isSynced)
    .sort((a, b) => b.syncedAt.getTime() - a.syncedAt.getTime())[0]?.syncedAt;
  
  return {
    totalImages,
    syncedImages,
    pendingImages,
    failedImages,
    syncingImages,
    syncPercentage,
    lastSyncAt,
    isSyncing: false // This would be set by the service based on current operations
  };
}

/**
 * Updates sync status with current operation state
 */
export function updateSyncStatus(
  status: SyncStatus, 
  isSyncing: boolean
): SyncStatus {
  return {
    ...status,
    isSyncing
  };
}
