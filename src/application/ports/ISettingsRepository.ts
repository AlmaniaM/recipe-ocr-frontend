/**
 * Settings Repository Interface
 * 
 * Defines the contract for settings persistence operations.
 * This follows the Interface Segregation Principle by providing
 * a focused interface for settings management.
 */

import { AppSettings } from '../../domain/entities/AppSettings';
import { Result } from '../../domain/common/Result';

export interface ISettingsRepository {
  /**
   * Retrieves the current application settings
   * @returns Promise containing the settings or error
   */
  getSettings(): Promise<Result<AppSettings>>;

  /**
   * Saves the application settings
   * @param settings - The settings to save
   * @returns Promise containing success or error
   */
  saveSettings(settings: AppSettings): Promise<Result<void>>;

  /**
   * Resets settings to default values
   * @returns Promise containing success or error
   */
  resetToDefaults(): Promise<Result<void>>;

  /**
   * Updates a specific setting
   * @param key - The setting key to update
   * @param value - The new value
   * @returns Promise containing success or error
   */
  updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<Result<void>>;

  /**
   * Checks if settings exist in storage
   * @returns Promise containing boolean result
   */
  hasSettings(): Promise<Result<boolean>>;

  /**
   * Migrates settings from an older version
   * @param oldSettings - The old settings object
   * @returns Promise containing migrated settings or error
   */
  migrateSettings(oldSettings: any): Promise<Result<AppSettings>>;
}
