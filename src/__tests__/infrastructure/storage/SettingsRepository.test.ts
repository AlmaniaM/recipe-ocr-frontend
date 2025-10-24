/**
 * SettingsRepository Tests
 * 
 * Tests for the SettingsRepository implementation.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsRepository } from '../../../infrastructure/storage/SettingsRepository';
import { DEFAULT_APP_SETTINGS } from '../../../domain/entities/AppSettings';
import { Result } from '../../../domain/common/Result';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('SettingsRepository', () => {
  let settingsRepository: SettingsRepository;

  beforeEach(() => {
    settingsRepository = new SettingsRepository();
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    it('should return default settings when no settings exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await settingsRepository.getSettings();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(DEFAULT_APP_SETTINGS);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('app_settings');
    });

    it('should return saved settings when they exist', async () => {
      const savedSettings = { ...DEFAULT_APP_SETTINGS, theme: 'cleanModern' };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(savedSettings));

      const result = await settingsRepository.getSettings();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(savedSettings);
    });

    it('should handle JSON parse errors', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid json');

      const result = await settingsRepository.getSettings();

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Failed to load settings');
    });

    it('should handle AsyncStorage errors', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await settingsRepository.getSettings();

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Failed to load settings');
    });
  });

  describe('saveSettings', () => {
    it('should save settings successfully', async () => {
      const settings = { ...DEFAULT_APP_SETTINGS, theme: 'cleanModern' };
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const result = await settingsRepository.saveSettings(settings);

      expect(result.isSuccess).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('app_settings', JSON.stringify(settings));
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('app_settings_version', '1.0.0');
    });

    it('should handle AsyncStorage errors', async () => {
      const settings = { ...DEFAULT_APP_SETTINGS, theme: 'cleanModern' };
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      const result = await settingsRepository.saveSettings(settings);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Failed to save settings');
    });
  });

  describe('resetToDefaults', () => {
    it('should remove settings and version keys', async () => {
      mockAsyncStorage.removeItem.mockResolvedValue(undefined);

      const result = await settingsRepository.resetToDefaults();

      expect(result.isSuccess).toBe(true);
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('app_settings');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('app_settings_version');
    });

    it('should handle AsyncStorage errors', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));

      const result = await settingsRepository.resetToDefaults();

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Failed to reset settings');
    });
  });

  describe('updateSetting', () => {
    it('should update a specific setting', async () => {
      const currentSettings = { ...DEFAULT_APP_SETTINGS };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(currentSettings));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const result = await settingsRepository.updateSetting('theme', 'cleanModern');

      expect(result.isSuccess).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'app_settings',
        JSON.stringify({ ...currentSettings, theme: 'cleanModern' })
      );
    });

    it('should handle getSettings failure', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await settingsRepository.updateSetting('theme', 'cleanModern');

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Failed to load settings');
    });
  });

  describe('hasSettings', () => {
    it('should return true when settings exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(DEFAULT_APP_SETTINGS));

      const result = await settingsRepository.hasSettings();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(true);
    });

    it('should return false when settings do not exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await settingsRepository.hasSettings();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(false);
    });

    it('should handle AsyncStorage errors', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await settingsRepository.hasSettings();

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Failed to check settings existence');
    });
  });

  describe('migrateSettings', () => {
    it('should migrate valid old settings', async () => {
      const oldSettings = {
        theme: 'cleanModern',
        ocrQuality: 'cloud',
        aiProvider: 'claude',
        storagePreference: 'cloud-backup',
        exportFormat: 'docx',
        notifications: false,
        autoSync: true,
        debugMode: true,
        analyticsEnabled: false,
        crashReportingEnabled: false,
      };

      const result = await settingsRepository.migrateSettings(oldSettings);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(oldSettings);
    });

    it('should use defaults for invalid old settings', async () => {
      const oldSettings = {
        theme: 'invalidTheme',
        ocrQuality: 'invalidQuality',
        someNewProperty: 'value',
      };

      const result = await settingsRepository.migrateSettings(oldSettings);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(DEFAULT_APP_SETTINGS);
    });

    it('should handle null/undefined old settings', async () => {
      const result = await settingsRepository.migrateSettings(null);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(DEFAULT_APP_SETTINGS);
    });
  });
});
