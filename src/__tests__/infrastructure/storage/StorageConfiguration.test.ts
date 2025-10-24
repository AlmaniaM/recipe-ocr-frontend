/**
 * Unit Tests for StorageConfiguration
 * 
 * Tests the storage configuration functionality including:
 * - Configuration loading and validation
 * - Default values
 * - Error handling
 * - Configuration updates
 */

import { StorageConfig, storageConfigManager } from '../../infrastructure/storage/StorageConfiguration';

describe('StorageConfiguration', () => {
  describe('StorageConfig interface', () => {
    it('should have all required properties', () => {
      // Arrange
      const config: StorageConfig = {
        maxRetries: 3,
        retryDelay: 1000,
        batchSize: 10,
        cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
        offlineSync: true,
        compressionQuality: 0.8,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        supportedFormats: ['image/jpeg', 'image/png', 'image/webp']
      };

      // Assert
      expect(config.maxRetries).toBe(3);
      expect(config.retryDelay).toBe(1000);
      expect(config.batchSize).toBe(10);
      expect(config.cacheExpiry).toBe(24 * 60 * 60 * 1000);
      expect(config.offlineSync).toBe(true);
      expect(config.compressionQuality).toBe(0.8);
      expect(config.maxFileSize).toBe(10 * 1024 * 1024);
      expect(config.supportedFormats).toEqual(['image/jpeg', 'image/png', 'image/webp']);
    });
  });

  describe('storageConfigManager', () => {
    beforeEach(() => {
      // Reset configuration to defaults
      storageConfigManager.reset();
    });

    describe('getConfig', () => {
      it('should return default configuration', () => {
        // Act
        const config = storageConfigManager.getConfig();

        // Assert
        expect(config.maxRetries).toBe(3);
        expect(config.retryDelay).toBe(1000);
        expect(config.batchSize).toBe(10);
        expect(config.cacheExpiry).toBe(24 * 60 * 60 * 1000);
        expect(config.offlineSync).toBe(true);
        expect(config.compressionQuality).toBe(0.8);
        expect(config.maxFileSize).toBe(10 * 1024 * 1024);
        expect(config.supportedFormats).toEqual(['image/jpeg', 'image/png', 'image/webp']);
      });

      it('should return updated configuration', () => {
        // Arrange
        const newConfig: Partial<StorageConfig> = {
          maxRetries: 5,
          retryDelay: 2000,
          batchSize: 20
        };

        storageConfigManager.updateConfig(newConfig);

        // Act
        const config = storageConfigManager.getConfig();

        // Assert
        expect(config.maxRetries).toBe(5);
        expect(config.retryDelay).toBe(2000);
        expect(config.batchSize).toBe(20);
        expect(config.cacheExpiry).toBe(24 * 60 * 60 * 1000); // Should remain default
        expect(config.offlineSync).toBe(true); // Should remain default
      });
    });

    describe('updateConfig', () => {
      it('should update configuration with valid values', () => {
        // Arrange
        const newConfig: Partial<StorageConfig> = {
          maxRetries: 5,
          retryDelay: 2000,
          batchSize: 20,
          cacheExpiry: 12 * 60 * 60 * 1000, // 12 hours
          offlineSync: false,
          compressionQuality: 0.9,
          maxFileSize: 5 * 1024 * 1024, // 5MB
          supportedFormats: ['image/jpeg', 'image/png']
        };

        // Act
        storageConfigManager.updateConfig(newConfig);

        // Assert
        const config = storageConfigManager.getConfig();
        expect(config.maxRetries).toBe(5);
        expect(config.retryDelay).toBe(2000);
        expect(config.batchSize).toBe(20);
        expect(config.cacheExpiry).toBe(12 * 60 * 60 * 1000);
        expect(config.offlineSync).toBe(false);
        expect(config.compressionQuality).toBe(0.9);
        expect(config.maxFileSize).toBe(5 * 1024 * 1024);
        expect(config.supportedFormats).toEqual(['image/jpeg', 'image/png']);
      });

      it('should validate maxRetries', () => {
        // Act & Assert
        expect(() => storageConfigManager.updateConfig({ maxRetries: -1 })).toThrow();
        expect(() => storageConfigManager.updateConfig({ maxRetries: 0 })).toThrow();
        expect(() => storageConfigManager.updateConfig({ maxRetries: 101 })).toThrow();
      });

      it('should validate retryDelay', () => {
        // Act & Assert
        expect(() => storageConfigManager.updateConfig({ retryDelay: -1 })).toThrow();
        expect(() => storageConfigManager.updateConfig({ retryDelay: 0 })).toThrow();
        expect(() => storageConfigManager.updateConfig({ retryDelay: 300000 })).toThrow(); // 5 minutes
      });

      it('should validate batchSize', () => {
        // Act & Assert
        expect(() => storageConfigManager.updateConfig({ batchSize: -1 })).toThrow();
        expect(() => storageConfigManager.updateConfig({ batchSize: 0 })).toThrow();
        expect(() => storageConfigManager.updateConfig({ batchSize: 101 })).toThrow();
      });

      it('should validate cacheExpiry', () => {
        // Act & Assert
        expect(() => storageConfigManager.updateConfig({ cacheExpiry: -1 })).toThrow();
        expect(() => storageConfigManager.updateConfig({ cacheExpiry: 0 })).toThrow();
        expect(() => storageConfigManager.updateConfig({ cacheExpiry: 7 * 24 * 60 * 60 * 1000 })).toThrow(); // 7 days
      });

      it('should validate compressionQuality', () => {
        // Act & Assert
        expect(() => storageConfigManager.updateConfig({ compressionQuality: -0.1 })).toThrow();
        expect(() => storageConfigManager.updateConfig({ compressionQuality: 0 })).toThrow();
        expect(() => storageConfigManager.updateConfig({ compressionQuality: 1.1 })).toThrow();
      });

      it('should validate maxFileSize', () => {
        // Act & Assert
        expect(() => storageConfigManager.updateConfig({ maxFileSize: -1 })).toThrow();
        expect(() => storageConfigManager.updateConfig({ maxFileSize: 0 })).toThrow();
        expect(() => storageConfigManager.updateConfig({ maxFileSize: 100 * 1024 * 1024 })).toThrow(); // 100MB
      });

      it('should validate supportedFormats', () => {
        // Act & Assert
        expect(() => storageConfigManager.updateConfig({ supportedFormats: [] })).toThrow();
        expect(() => storageConfigManager.updateConfig({ supportedFormats: ['invalid/format'] })).toThrow();
        expect(() => storageConfigManager.updateConfig({ supportedFormats: ['image/jpeg', 'invalid/format'] })).toThrow();
      });

      it('should handle null/undefined values', () => {
        // Act & Assert
        expect(() => storageConfigManager.updateConfig(null as any)).toThrow();
        expect(() => storageConfigManager.updateConfig(undefined as any)).toThrow();
      });
    });

    describe('reset', () => {
      it('should reset configuration to defaults', () => {
        // Arrange
        storageConfigManager.updateConfig({
          maxRetries: 5,
          retryDelay: 2000,
          batchSize: 20,
          offlineSync: false
        });

        // Act
        storageConfigManager.reset();

        // Assert
        const config = storageConfigManager.getConfig();
        expect(config.maxRetries).toBe(3);
        expect(config.retryDelay).toBe(1000);
        expect(config.batchSize).toBe(10);
        expect(config.offlineSync).toBe(true);
      });
    });

    describe('validation', () => {
      it('should validate complete configuration', () => {
        // Arrange
        const validConfig: StorageConfig = {
          maxRetries: 3,
          retryDelay: 1000,
          batchSize: 10,
          cacheExpiry: 24 * 60 * 60 * 1000,
          offlineSync: true,
          compressionQuality: 0.8,
          maxFileSize: 10 * 1024 * 1024,
          supportedFormats: ['image/jpeg', 'image/png', 'image/webp']
        };

        // Act
        storageConfigManager.updateConfig(validConfig);

        // Assert
        const config = storageConfigManager.getConfig();
        expect(config).toEqual(validConfig);
      });

      it('should handle partial configuration updates', () => {
        // Arrange
        const partialConfig: Partial<StorageConfig> = {
          maxRetries: 5,
          batchSize: 20
        };

        // Act
        storageConfigManager.updateConfig(partialConfig);

        // Assert
        const config = storageConfigManager.getConfig();
        expect(config.maxRetries).toBe(5);
        expect(config.batchSize).toBe(20);
        expect(config.retryDelay).toBe(1000); // Should remain default
        expect(config.offlineSync).toBe(true); // Should remain default
      });
    });

    describe('edge cases', () => {
      it('should handle boundary values', () => {
        // Arrange
        const boundaryConfig: Partial<StorageConfig> = {
          maxRetries: 1,
          retryDelay: 100,
          batchSize: 1,
          cacheExpiry: 60 * 1000, // 1 minute
          compressionQuality: 0.1,
          maxFileSize: 1024 * 1024, // 1MB
          supportedFormats: ['image/jpeg']
        };

        // Act
        storageConfigManager.updateConfig(boundaryConfig);

        // Assert
        const config = storageConfigManager.getConfig();
        expect(config.maxRetries).toBe(1);
        expect(config.retryDelay).toBe(100);
        expect(config.batchSize).toBe(1);
        expect(config.cacheExpiry).toBe(60 * 1000);
        expect(config.compressionQuality).toBe(0.1);
        expect(config.maxFileSize).toBe(1024 * 1024);
        expect(config.supportedFormats).toEqual(['image/jpeg']);
      });

      it('should handle maximum allowed values', () => {
        // Arrange
        const maxConfig: Partial<StorageConfig> = {
          maxRetries: 100,
          retryDelay: 30000, // 30 seconds
          batchSize: 100,
          cacheExpiry: 6 * 24 * 60 * 60 * 1000, // 6 days
          compressionQuality: 1.0,
          maxFileSize: 50 * 1024 * 1024, // 50MB
          supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        };

        // Act
        storageConfigManager.updateConfig(maxConfig);

        // Assert
        const config = storageConfigManager.getConfig();
        expect(config.maxRetries).toBe(100);
        expect(config.retryDelay).toBe(30000);
        expect(config.batchSize).toBe(100);
        expect(config.cacheExpiry).toBe(6 * 24 * 60 * 60 * 1000);
        expect(config.compressionQuality).toBe(1.0);
        expect(config.maxFileSize).toBe(50 * 1024 * 1024);
        expect(config.supportedFormats).toEqual(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
      });
    });
  });
});
