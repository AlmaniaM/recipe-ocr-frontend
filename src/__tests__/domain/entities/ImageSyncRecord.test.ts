/**
 * Unit Tests for ImageSyncRecord Domain Entity
 * 
 * Tests the ImageSyncRecord entity functionality including:
 * - Entity creation and validation
 * - Helper functions
 * - State transitions
 * - Error handling
 */

import { 
  ImageSyncRecord, 
  createImageSyncRecord, 
  markSyncSuccess, 
  markSyncFailure, 
  markRetryAttempt 
} from '../../domain/entities/ImageSyncRecord';

describe('ImageSyncRecord', () => {
  describe('createImageSyncRecord', () => {
    it('should create image sync record with required fields', () => {
      // Arrange
      const localUri = 'file://test-image.jpg';
      const fileName = 'test-image_20231201120000_12345678.jpg';
      const recipeId = 'recipe-123';

      // Act
      const record = createImageSyncRecord(localUri, fileName, recipeId);

      // Assert
      expect(record.localUri).toBe(localUri);
      expect(record.fileName).toBe(fileName);
      expect(record.recipeId).toBe(recipeId);
      expect(record.isSynced).toBe(false);
      expect(record.lastChecked).toBeInstanceOf(Date);
      expect(record.hasError).toBe(false);
      expect(record.retryCount).toBe(0);
    });

    it('should create image sync record with optional fields', () => {
      // Arrange
      const localUri = 'file://test-image.jpg';
      const fileName = 'test-image_20231201120000_12345678.jpg';
      const recipeId = 'recipe-123';
      const options = {
        isSynced: true,
        syncedAt: new Date('2023-12-01T12:00:00Z'),
        lastChecked: new Date('2023-12-01T12:00:00Z'),
        hasError: false,
        errorMessage: 'Test error',
        retryCount: 1,
        fileSize: 1024,
        contentType: 'image/jpeg'
      };

      // Act
      const record = createImageSyncRecord(localUri, fileName, recipeId, options);

      // Assert
      expect(record.localUri).toBe(localUri);
      expect(record.fileName).toBe(fileName);
      expect(record.recipeId).toBe(recipeId);
      expect(record.isSynced).toBe(true);
      expect(record.syncedAt).toEqual(options.syncedAt);
      expect(record.lastChecked).toEqual(options.lastChecked);
      expect(record.hasError).toBe(false);
      expect(record.errorMessage).toBe('Test error');
      expect(record.retryCount).toBe(1);
      expect(record.fileSize).toBe(1024);
      expect(record.contentType).toBe('image/jpeg');
    });

    it('should handle invalid parameters', () => {
      // Act & Assert
      expect(() => createImageSyncRecord('', 'fileName', 'recipeId')).toThrow();
      expect(() => createImageSyncRecord('localUri', '', 'recipeId')).toThrow();
      expect(() => createImageSyncRecord('localUri', 'fileName', '')).toThrow();
    });

    it('should handle null/undefined parameters', () => {
      // Act & Assert
      expect(() => createImageSyncRecord(null as any, 'fileName', 'recipeId')).toThrow();
      expect(() => createImageSyncRecord('localUri', null as any, 'recipeId')).toThrow();
      expect(() => createImageSyncRecord('localUri', 'fileName', null as any)).toThrow();
    });
  });

  describe('markSyncSuccess', () => {
    it('should mark sync as successful', () => {
      // Arrange
      const record = createImageSyncRecord('file://test.jpg', 'test.jpg', 'recipe-123');
      const syncTime = new Date('2023-12-01T12:00:00Z');

      // Act
      const updatedRecord = markSyncSuccess(record, syncTime);

      // Assert
      expect(updatedRecord.isSynced).toBe(true);
      expect(updatedRecord.syncedAt).toEqual(syncTime);
      expect(updatedRecord.hasError).toBe(false);
      expect(updatedRecord.errorMessage).toBeUndefined();
      expect(updatedRecord.lastChecked).toEqual(syncTime);
    });

    it('should handle null sync time', () => {
      // Arrange
      const record = createImageSyncRecord('file://test.jpg', 'test.jpg', 'recipe-123');

      // Act
      const updatedRecord = markSyncSuccess(record, null);

      // Assert
      expect(updatedRecord.isSynced).toBe(true);
      expect(updatedRecord.syncedAt).toBeUndefined();
      expect(updatedRecord.hasError).toBe(false);
      expect(updatedRecord.errorMessage).toBeUndefined();
    });

    it('should handle invalid record', () => {
      // Act & Assert
      expect(() => markSyncSuccess(null as any, new Date())).toThrow();
      expect(() => markSyncSuccess(undefined as any, new Date())).toThrow();
    });
  });

  describe('markSyncFailure', () => {
    it('should mark sync as failed', () => {
      // Arrange
      const record = createImageSyncRecord('file://test.jpg', 'test.jpg', 'recipe-123');
      const errorMessage = 'Upload failed';
      const retryCount = 1;

      // Act
      const updatedRecord = markSyncFailure(record, errorMessage, retryCount);

      // Assert
      expect(updatedRecord.isSynced).toBe(false);
      expect(updatedRecord.hasError).toBe(true);
      expect(updatedRecord.errorMessage).toBe(errorMessage);
      expect(updatedRecord.retryCount).toBe(retryCount);
      expect(updatedRecord.lastChecked).toBeInstanceOf(Date);
    });

    it('should handle empty error message', () => {
      // Arrange
      const record = createImageSyncRecord('file://test.jpg', 'test.jpg', 'recipe-123');

      // Act
      const updatedRecord = markSyncFailure(record, '', 1);

      // Assert
      expect(updatedRecord.isSynced).toBe(false);
      expect(updatedRecord.hasError).toBe(true);
      expect(updatedRecord.errorMessage).toBe('');
      expect(updatedRecord.retryCount).toBe(1);
    });

    it('should handle invalid record', () => {
      // Act & Assert
      expect(() => markSyncFailure(null as any, 'error', 1)).toThrow();
      expect(() => markSyncFailure(undefined as any, 'error', 1)).toThrow();
    });

    it('should handle invalid retry count', () => {
      // Arrange
      const record = createImageSyncRecord('file://test.jpg', 'test.jpg', 'recipe-123');

      // Act & Assert
      expect(() => markSyncFailure(record, 'error', -1)).toThrow();
      expect(() => markSyncFailure(record, 'error', null as any)).toThrow();
    });
  });

  describe('markRetryAttempt', () => {
    it('should mark retry attempt', () => {
      // Arrange
      const record = createImageSyncRecord('file://test.jpg', 'test.jpg', 'recipe-123');
      const retryCount = 1;

      // Act
      const updatedRecord = markRetryAttempt(record, retryCount);

      // Assert
      expect(updatedRecord.retryCount).toBe(retryCount);
      expect(updatedRecord.lastChecked).toBeInstanceOf(Date);
    });

    it('should handle zero retry count', () => {
      // Arrange
      const record = createImageSyncRecord('file://test.jpg', 'test.jpg', 'recipe-123');

      // Act
      const updatedRecord = markRetryAttempt(record, 0);

      // Assert
      expect(updatedRecord.retryCount).toBe(0);
      expect(updatedRecord.lastChecked).toBeInstanceOf(Date);
    });

    it('should handle invalid record', () => {
      // Act & Assert
      expect(() => markRetryAttempt(null as any, 1)).toThrow();
      expect(() => markRetryAttempt(undefined as any, 1)).toThrow();
    });

    it('should handle invalid retry count', () => {
      // Arrange
      const record = createImageSyncRecord('file://test.jpg', 'test.jpg', 'recipe-123');

      // Act & Assert
      expect(() => markRetryAttempt(record, -1)).toThrow();
      expect(() => markRetryAttempt(record, null as any)).toThrow();
    });
  });

  describe('entity validation', () => {
    it('should validate required fields', () => {
      // Arrange
      const record = createImageSyncRecord('file://test.jpg', 'test.jpg', 'recipe-123');

      // Assert
      expect(record.localUri).toBeTruthy();
      expect(record.fileName).toBeTruthy();
      expect(record.recipeId).toBeTruthy();
      expect(record.lastChecked).toBeInstanceOf(Date);
    });

    it('should validate optional fields', () => {
      // Arrange
      const record = createImageSyncRecord('file://test.jpg', 'test.jpg', 'recipe-123', {
        fileSize: 1024,
        contentType: 'image/jpeg'
      });

      // Assert
      expect(record.fileSize).toBe(1024);
      expect(record.contentType).toBe('image/jpeg');
    });

    it('should handle edge cases', () => {
      // Arrange
      const longUri = 'file://' + 'a'.repeat(1000) + '.jpg';
      const longFileName = 'a'.repeat(1000) + '.jpg';
      const longRecipeId = 'a'.repeat(1000);

      // Act
      const record = createImageSyncRecord(longUri, longFileName, longRecipeId);

      // Assert
      expect(record.localUri).toBe(longUri);
      expect(record.fileName).toBe(longFileName);
      expect(record.recipeId).toBe(longRecipeId);
    });
  });

  describe('state transitions', () => {
    it('should transition from pending to synced', () => {
      // Arrange
      const record = createImageSyncRecord('file://test.jpg', 'test.jpg', 'recipe-123');
      expect(record.isSynced).toBe(false);

      // Act
      const syncedRecord = markSyncSuccess(record, new Date());

      // Assert
      expect(syncedRecord.isSynced).toBe(true);
      expect(syncedRecord.hasError).toBe(false);
    });

    it('should transition from pending to failed', () => {
      // Arrange
      const record = createImageSyncRecord('file://test.jpg', 'test.jpg', 'recipe-123');
      expect(record.isSynced).toBe(false);

      // Act
      const failedRecord = markSyncFailure(record, 'Upload failed', 1);

      // Assert
      expect(failedRecord.isSynced).toBe(false);
      expect(failedRecord.hasError).toBe(true);
      expect(failedRecord.retryCount).toBe(1);
    });

    it('should transition from failed to synced on retry', () => {
      // Arrange
      const record = createImageSyncRecord('file://test.jpg', 'test.jpg', 'recipe-123');
      const failedRecord = markSyncFailure(record, 'Upload failed', 1);

      // Act
      const retryRecord = markRetryAttempt(failedRecord, 2);
      const syncedRecord = markSyncSuccess(retryRecord, new Date());

      // Assert
      expect(syncedRecord.isSynced).toBe(true);
      expect(syncedRecord.hasError).toBe(false);
      expect(syncedRecord.retryCount).toBe(2);
    });
  });
});
