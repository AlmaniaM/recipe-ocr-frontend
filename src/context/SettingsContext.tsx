/**
 * Settings Context Provider
 * 
 * Provides global access to application settings with persistence.
 * This follows the Clean Architecture principle by keeping the presentation
 * layer decoupled from the infrastructure layer.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, DEFAULT_APP_SETTINGS, SettingsKey } from '../domain/entities/AppSettings';
import { Result } from '../domain/common/Result';
import { getService } from '../infrastructure/di/container';
import { TYPES } from '../infrastructure/di/types';
import { ISettingsRepository } from '../application/ports/ISettingsRepository';

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends SettingsKey>(key: K, value: AppSettings[K]) => Promise<Result<void>>;
  resetToDefaults: () => Promise<Result<void>>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get settings repository from DI container
  const settingsRepository = getService<ISettingsRepository>(TYPES.SettingsRepository);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await settingsRepository.getSettings();
      if (result.isSuccess) {
        setSettings(result.value);
      } else {
        setError(result.error);
        console.error('Failed to load settings:', result.error);
      }
    } catch (error) {
      const errorMessage = `Failed to load settings: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      console.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async <K extends SettingsKey>(
    key: K,
    value: AppSettings[K]
  ): Promise<Result<void>> => {
    try {
      setError(null);

      // Optimistically update the UI
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      // Save to storage
      const result = await settingsRepository.updateSetting(key, value);
      
      if (!result.isSuccess) {
        // Revert on error
        setSettings(settings);
        setError(result.error);
        return result;
      }

      return Result.success(undefined);
    } catch (error) {
      const errorMessage = `Failed to update setting: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      
      // Revert on error
      setSettings(settings);
      
      return Result.failure(errorMessage);
    }
  };

  const resetToDefaults = async (): Promise<Result<void>> => {
    try {
      setError(null);
      setIsLoading(true);

      const result = await settingsRepository.resetToDefaults();
      if (result.isSuccess) {
        setSettings(DEFAULT_APP_SETTINGS);
      } else {
        setError(result.error);
        return result;
      }

      return Result.success(undefined);
    } catch (error) {
      const errorMessage = `Failed to reset settings: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      return Result.failure(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const contextValue: SettingsContextType = {
    settings,
    updateSetting,
    resetToDefaults,
    isLoading,
    error,
    clearError,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Hook for accessing specific settings
export const useSetting = <K extends SettingsKey>(key: K): {
  value: AppSettings[K];
  update: (value: AppSettings[K]) => Promise<Result<void>>;
  isLoading: boolean;
  error: string | null;
} => {
  const { settings, updateSetting, isLoading, error } = useSettings();
  
  return {
    value: settings[key],
    update: (value: AppSettings[K]) => updateSetting(key, value),
    isLoading,
    error,
  };
};
