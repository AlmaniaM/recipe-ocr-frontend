/**
 * Unit Tests for SyncStatus Domain Entity
 * 
 * Tests the SyncStatus entity functionality including:
 * - Status calculation
 * - Helper functions
 * - State updates
 * - Error handling
 */

import { 
  SyncStatus, 
  createSyncStatus, 
  calculateSyncStatus, 
  updateSyncStatus 
} from '../../domain/entities/SyncStatus';
import { ImageSyncRecord, createImageSyncRecord } from '../../domain/entities/ImageSyncRecord';

describe('SyncStatus', () => {
  describe('createSyncStatus', () => {
    it('should create sync status with default values', () => {
      // Act
      const status = createSyncStatus();

      // Assert
      expect(status.totalImages).toBe(0);
      expect(status.syncedImages).toBe(0);
      expect(status.pendingImages).toBe(0);
      expect(status.failedImages).toBe(0);
      expect(status.syncingImages).toBe(0);
      expect(status.syncPercentage).toBe(0);
      expect(status.isSyncing).toBe(false);
    });

    it('should create sync status with custom values', () => {
      // Arrange
      const customStatus = {
        totalImages: 10,
        syncedImages: 8,
        pendingImages: 1,
        failedImages: 1,
        syncingImages: 0,
        syncPercentage: 80,
        lastSyncAt: new Date('2023-12-01T12:00:00Z'),
        isSyncing: false
      };

      // Act
      const status = createSyncStatus(customStatus);

      // Assert
      expect(status.totalImages).toBe(10);
      expect(status.syncedImages).toBe(8);
      expect(status.pendingImages).toBe(1);
      expect(status.failedImages).toBe(1);
      expect(status.syncingImages).toBe(0);
      expect(status.syncPercentage).toBe(80);
      expect(status.lastSyncAt).toEqual(customStatus.lastSyncAt);
      expect(status.isSyncing).toBe(false);
    });

    it('should handle invalid values', () => {
      // Act & Assert
      expect(() => createSyncStatus({ totalImages: -1 })).toThrow();
      expect(() => createSyncStatus({ syncedImages: -1 })).toThrow();
      expect(() => createSyncStatus({ pendingImages: -1 })).toThrow();
      expect(() => createSyncStatus({ failedImages: -1 })).toThrow();
      expect(() => createSyncStatus({ syncingImages: -1 })).toThrow();
      expect(() => createSyncStatus({ syncPercentage: -1 })).toThrow();
      expect(() => createSyncStatus({ syncPercentage: 101 })).toThrow();
    });
  });

  describe('calculateSyncStatus', () => {
    it('should calculate status for empty records array', () => {
      // Arrange
      const records: ImageSyncRecord[] = [];

      // Act
      const status = calculateSyncStatus(records);

      // Assert
      expect(status.totalImages).toBe(0);
      expect(status.syncedImages).toBe(0);
      expect(status.pendingImages).toBe(0);
      expect(status.failedImages).toBe(0);
      expect(status.syncingImages).toBe(0);
      expect(status.syncPercentage).toBe(0);
      expect(status.isSyncing).toBe(false);
    });

    it('should calculate status for mixed records', () => {
      // Arrange
      const records: ImageSyncRecord[] = [
        createImageSyncRecord('file://test1.jpg', 'test1.jpg', 'recipe-1', { isSynced: true }),
        createImageSyncRecord('file://test2.jpg', 'test2.jpg', 'recipe-2', { isSynced: true }),
        createImageSyncRecord('file://test3.jpg', 'test3.jpg', 'recipe-3', { isSynced: false, hasError: false }),
        createImageSyncRecord('file://test4.jpg', 'test4.jpg', 'recipe-4', { isSynced: false, hasError: true }),
        createImageSyncRecord('file://test5.jpg', 'test5.jpg', 'recipe-5', { isSynced: false, hasError: false })
      ];

      // Act
      const status = calculateSyncStatus(records);

      // Assert
      expect(status.totalImages).toBe(5);
      expect(status.syncedImages).toBe(2);
      expect(status.pendingImages).toBe(2);
      expect(status.failedImages).toBe(1);
      expect(status.syncingImages).toBe(0);
      expect(status.syncPercentage).toBe(40);
      expect(status.isSyncing).toBe(false);
    });

    it('should calculate status for all synced records', () => {
      // Arrange
      const records: ImageSyncRecord[] = [
        createImageSyncRecord('file://test1.jpg', 'test1.jpg', 'recipe-1', { isSynced: true }),
        createImageSyncRecord('file://test2.jpg', 'test2.jpg', 'recipe-2', { isSynced: true }),
        createImageSyncRecord('file://test3.jpg', 'test3.jpg', 'recipe-3', { isSynced: true })
      ];

      // Act
      const status = calculateSyncStatus(records);

      // Assert
      expect(status.totalImages).toBe(3);
      expect(status.syncedImages).toBe(3);
      expect(status.pendingImages).toBe(0);
      expect(status.failedImages).toBe(0);
      expect(status.syncingImages).toBe(0);
      expect(status.syncPercentage).toBe(100);
      expect(status.isSyncing).toBe(false);
    });

    it('should calculate status for all failed records', () => {
      // Arrange
      const records: ImageSyncRecord[] = [
        createImageSyncRecord('file://test1.jpg', 'test1.jpg', 'recipe-1', { isSynced: false, hasError: true }),
        createImageSyncRecord('file://test2.jpg', 'test2.jpg', 'recipe-2', { isSynced: false, hasError: true }),
        createImageSyncRecord('file://test3.jpg', 'test3.jpg', 'recipe-3', { isSynced: false, hasError: true })
      ];

      // Act
      const status = calculateSyncStatus(records);

      // Assert
      expect(status.totalImages).toBe(3);
      expect(status.syncedImages).toBe(0);
      expect(status.pendingImages).toBe(0);
      expect(status.failedImages).toBe(3);
      expect(status.syncingImages).toBe(0);
      expect(status.syncPercentage).toBe(0);
      expect(status.isSyncing).toBe(false);
    });

    it('should handle null/undefined records', () => {
      // Act & Assert
      expect(() => calculateSyncStatus(null as any)).toThrow();
      expect(() => calculateSyncStatus(undefined as any)).toThrow();
    });

    it('should handle records with invalid data', () => {
      // Arrange
      const records: any[] = [
        { isSynced: true },
        { isSynced: false, hasError: true },
        null,
        undefined
      ];

      // Act
      const status = calculateSyncStatus(records);

      // Assert
      expect(status.totalImages).toBe(4);
      expect(status.syncedImages).toBe(1);
      expect(status.failedImages).toBe(1);
      expect(status.pendingImages).toBe(2);
    });
  });

  describe('updateSyncStatus', () => {
    it('should update sync status with new records', () => {
      // Arrange
      const currentStatus = createSyncStatus({
        totalImages: 5,
        syncedImages: 3,
        pendingImages: 1,
        failedImages: 1,
        syncPercentage: 60
      });

      const newRecords: ImageSyncRecord[] = [
        createImageSyncRecord('file://test1.jpg', 'test1.jpg', 'recipe-1', { isSynced: true }),
        createImageSyncRecord('file://test2.jpg', 'test2.jpg', 'recipe-2', { isSynced: true }),
        createImageSyncRecord('file://test3.jpg', 'test3.jpg', 'recipe-3', { isSynced: false, hasError: false }),
        createImageSyncRecord('file://test4.jpg', 'test4.jpg', 'recipe-4', { isSynced: false, hasError: true }),
        createImageSyncRecord('file://test5.jpg', 'test5.jpg', 'recipe-5', { isSynced: false, hasError: false }),
        createImageSyncRecord('file://test6.jpg', 'test6.jpg', 'recipe-6', { isSynced: true })
      ];

      // Act
      const updatedStatus = updateSyncStatus(currentStatus, newRecords);

      // Assert
      expect(updatedStatus.totalImages).toBe(6);
      expect(updatedStatus.syncedImages).toBe(3);
      expect(updatedStatus.pendingImages).toBe(2);
      expect(updatedStatus.failedImages).toBe(1);
      expect(updatedStatus.syncPercentage).toBe(50);
    });

    it('should handle empty new records', () => {
      // Arrange
      const currentStatus = createSyncStatus({
        totalImages: 5,
        syncedImages: 3,
        pendingImages: 1,
        failedImages: 1,
        syncPercentage: 60
      });

      const newRecords: ImageSyncRecord[] = [];

      // Act
      const updatedStatus = updateSyncStatus(currentStatus, newRecords);

      // Assert
      expect(updatedStatus.totalImages).toBe(0);
      expect(updatedStatus.syncedImages).toBe(0);
      expect(updatedStatus.pendingImages).toBe(0);
      expect(updatedStatus.failedImages).toBe(0);
      expect(updatedStatus.syncPercentage).toBe(0);
    });

    it('should handle null/undefined parameters', () => {
      // Arrange
      const currentStatus = createSyncStatus();

      // Act & Assert
      expect(() => updateSyncStatus(null as any, [])).toThrow();
      expect(() => updateSyncStatus(undefined as any, [])).toThrow();
      expect(() => updateSyncStatus(currentStatus, null as any)).toThrow();
      expect(() => updateSyncStatus(currentStatus, undefined as any)).toThrow();
    });

    it('should preserve lastSyncAt when updating', () => {
      // Arrange
      const lastSyncAt = new Date('2023-12-01T12:00:00Z');
      const currentStatus = createSyncStatus({
        lastSyncAt,
        isSyncing: true
      });

      const newRecords: ImageSyncRecord[] = [
        createImageSyncRecord('file://test1.jpg', 'test1.jpg', 'recipe-1', { isSynced: true })
      ];

      // Act
      const updatedStatus = updateSyncStatus(currentStatus, newRecords);

      // Assert
      expect(updatedStatus.lastSyncAt).toEqual(lastSyncAt);
      expect(updatedStatus.isSyncing).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle very large numbers', () => {
      // Arrange
      const records: ImageSyncRecord[] = Array.from({ length: 1000 }, (_, index) => 
        createImageSyncRecord(`file://test${index}.jpg`, `test${index}.jpg`, `recipe-${index}`, { 
          isSynced: index % 2 === 0 
        })
      );

      // Act
      const status = calculateSyncStatus(records);

      // Assert
      expect(status.totalImages).toBe(1000);
      expect(status.syncedImages).toBe(500);
      expect(status.pendingImages).toBe(500);
      expect(status.failedImages).toBe(0);
      expect(status.syncPercentage).toBe(50);
    });

    it('should handle zero division', () => {
      // Arrange
      const records: ImageSyncRecord[] = [];

      // Act
      const status = calculateSyncStatus(records);

      // Assert
      expect(status.syncPercentage).toBe(0);
    });

    it('should handle single record', () => {
      // Arrange
      const records: ImageSyncRecord[] = [
        createImageSyncRecord('file://test1.jpg', 'test1.jpg', 'recipe-1', { isSynced: true })
      ];

      // Act
      const status = calculateSyncStatus(records);

      // Assert
      expect(status.totalImages).toBe(1);
      expect(status.syncedImages).toBe(1);
      expect(status.pendingImages).toBe(0);
      expect(status.failedImages).toBe(0);
      expect(status.syncPercentage).toBe(100);
    });
  });

  describe('status validation', () => {
    it('should validate status consistency', () => {
      // Arrange
      const records: ImageSyncRecord[] = [
        createImageSyncRecord('file://test1.jpg', 'test1.jpg', 'recipe-1', { isSynced: true }),
        createImageSyncRecord('file://test2.jpg', 'test2.jpg', 'recipe-2', { isSynced: false, hasError: false }),
        createImageSyncRecord('file://test3.jpg', 'test3.jpg', 'recipe-3', { isSynced: false, hasError: true })
      ];

      // Act
      const status = calculateSyncStatus(records);

      // Assert
      expect(status.totalImages).toBe(status.syncedImages + status.pendingImages + status.failedImages + status.syncingImages);
      expect(status.syncPercentage).toBe(Math.round((status.syncedImages / status.totalImages) * 100));
    });

    it('should handle rounding in percentage calculation', () => {
      // Arrange
      const records: ImageSyncRecord[] = [
        createImageSyncRecord('file://test1.jpg', 'test1.jpg', 'recipe-1', { isSynced: true }),
        createImageSyncRecord('file://test2.jpg', 'test2.jpg', 'recipe-2', { isSynced: false, hasError: false }),
        createImageSyncRecord('file://test3.jpg', 'test3.jpg', 'recipe-3', { isSynced: false, hasError: false })
      ];

      // Act
      const status = calculateSyncStatus(records);

      // Assert
      expect(status.syncPercentage).toBe(33); // 1/3 = 33.33... rounded to 33
    });
  });
});
