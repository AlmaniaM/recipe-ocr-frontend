/**
 * Settings Repository Implementation
 * 
 * Handles persistence of application settings using AsyncStorage.
 * Implements the ISettingsRepository interface with proper error handling
 * and settings migration support.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { injectable } from 'inversify';
import { ISettingsRepository } from '../../application/ports/ISettingsRepository';
import { AppSettings, DEFAULT_APP_SETTINGS } from '../../domain/entities/AppSettings';
import { Result } from '../../domain/common/Result';

@injectable()
export class SettingsRepository implements ISettingsRepository {
  private readonly storageKey = 'app_settings';
  private readonly versionKey = 'app_settings_version';
  private readonly currentVersion = '1.0.0';

  async getSettings(): Promise<Result<AppSettings>> {
    try {
      const settingsJson = await AsyncStorage.getItem(this.storageKey);
      
      if (!settingsJson) {
        return Result.success(DEFAULT_APP_SETTINGS);
      }
      
      const settings = JSON.parse(settingsJson) as AppSettings;
      const migratedSettings = await this.migrateSettingsIfNeeded(settings);
      
      return Result.success(migratedSettings);
    } catch (error) {
      const errorMessage = `Failed to load settings: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return Result.failure(errorMessage);
    }
  }

  async saveSettings(settings: AppSettings): Promise<Result<void>> {
    try {
      const settingsJson = JSON.stringify(settings);
      await AsyncStorage.setItem(this.storageKey, settingsJson);
      await AsyncStorage.setItem(this.versionKey, this.currentVersion);
      return Result.success(undefined);
    } catch (error) {
      const errorMessage = `Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return Result.failure(errorMessage);
    }
  }

  async resetToDefaults(): Promise<Result<void>> {
    try {
      await AsyncStorage.removeItem(this.storageKey);
      await AsyncStorage.removeItem(this.versionKey);
      return Result.success(undefined);
    } catch (error) {
      const errorMessage = `Failed to reset settings: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return Result.failure(errorMessage);
    }
  }

  async updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<Result<void>> {
    try {
      const currentSettingsResult = await this.getSettings();
      if (!currentSettingsResult.isSuccess) {
        return Result.failure(currentSettingsResult.error);
      }

      const updatedSettings = {
        ...currentSettingsResult.value,
        [key]: value,
      };

      return await this.saveSettings(updatedSettings);
    } catch (error) {
      const errorMessage = `Failed to update setting ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return Result.failure(errorMessage);
    }
  }

  async hasSettings(): Promise<Result<boolean>> {
    try {
      const settingsJson = await AsyncStorage.getItem(this.storageKey);
      return Result.success(settingsJson !== null);
    } catch (error) {
      const errorMessage = `Failed to check settings existence: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return Result.failure(errorMessage);
    }
  }

  async migrateSettings(oldSettings: any): Promise<Result<AppSettings>> {
    try {
      // Start with default settings
      const migratedSettings = { ...DEFAULT_APP_SETTINGS };

      // Migrate known settings from old format
      if (oldSettings && typeof oldSettings === 'object') {
        // Theme migration
        if (oldSettings.theme && typeof oldSettings.theme === 'string') {
          const validThemes = ['warmInviting', 'cleanModern', 'earthyNatural'];
          if (validThemes.includes(oldSettings.theme)) {
            migratedSettings.theme = oldSettings.theme;
          }
        }

        // OCR Quality migration
        if (oldSettings.ocrQuality && typeof oldSettings.ocrQuality === 'string') {
          const validOcrQuality = ['on-device', 'cloud', 'hybrid'];
          if (validOcrQuality.includes(oldSettings.ocrQuality)) {
            migratedSettings.ocrQuality = oldSettings.ocrQuality;
          }
        }

        // AI Provider migration
        if (oldSettings.aiProvider && typeof oldSettings.aiProvider === 'string') {
          const validAiProvider = ['claude', 'local-llm', 'auto'];
          if (validAiProvider.includes(oldSettings.aiProvider)) {
            migratedSettings.aiProvider = oldSettings.aiProvider;
          }
        }

        // Storage Preference migration
        if (oldSettings.storagePreference && typeof oldSettings.storagePreference === 'string') {
          const validStoragePreference = ['local-only', 'cloud-backup'];
          if (validStoragePreference.includes(oldSettings.storagePreference)) {
            migratedSettings.storagePreference = oldSettings.storagePreference;
          }
        }

        // Export Format migration
        if (oldSettings.exportFormat && typeof oldSettings.exportFormat === 'string') {
          const validExportFormat = ['pdf', 'docx', 'excel', 'csv'];
          if (validExportFormat.includes(oldSettings.exportFormat)) {
            migratedSettings.exportFormat = oldSettings.exportFormat;
          }
        }

        // Boolean settings migration
        if (typeof oldSettings.notifications === 'boolean') {
          migratedSettings.notifications = oldSettings.notifications;
        }

        if (typeof oldSettings.autoSync === 'boolean') {
          migratedSettings.autoSync = oldSettings.autoSync;
        }

        if (typeof oldSettings.debugMode === 'boolean') {
          migratedSettings.debugMode = oldSettings.debugMode;
        }

        if (typeof oldSettings.analyticsEnabled === 'boolean') {
          migratedSettings.analyticsEnabled = oldSettings.analyticsEnabled;
        }

        if (typeof oldSettings.crashReportingEnabled === 'boolean') {
          migratedSettings.crashReportingEnabled = oldSettings.crashReportingEnabled;
        }
      }

      return Result.success(migratedSettings);
    } catch (error) {
      const errorMessage = `Failed to migrate settings: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return Result.failure(errorMessage);
    }
  }

  private async migrateSettingsIfNeeded(settings: AppSettings): Promise<AppSettings> {
    try {
      const versionResult = await this.getVersion();
      if (!versionResult.isSuccess || versionResult.value !== this.currentVersion) {
        // Settings need migration
        const migrationResult = await this.migrateSettings(settings);
        if (migrationResult.isSuccess) {
          // Save migrated settings
          await this.saveSettings(migrationResult.value);
          return migrationResult.value;
        }
      }
      return settings;
    } catch (error) {
      console.warn('Settings migration failed, using current settings:', error);
      return settings;
    }
  }

  private async getVersion(): Promise<Result<string>> {
    try {
      const version = await AsyncStorage.getItem(this.versionKey);
      return Result.success(version || '0.0.0');
    } catch (error) {
      const errorMessage = `Failed to get settings version: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return Result.failure(errorMessage);
    }
  }
}
