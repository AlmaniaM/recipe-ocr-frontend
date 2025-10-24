/**
 * SettingsContext Tests
 * 
 * Tests for the SettingsContext provider and hooks.
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react-native';
import { SettingsProvider, useSettings, useSetting } from '../../context/SettingsContext';
import { DEFAULT_APP_SETTINGS } from '../../domain/entities/AppSettings';
import { Result } from '../../domain/common/Result';

// Mock the DI container
jest.mock('../../infrastructure/di/container', () => ({
  getService: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockGetService = require('../../infrastructure/di/container').getService;

// Mock settings repository
const mockSettingsRepository = {
  getSettings: jest.fn(),
  saveSettings: jest.fn(),
  resetToDefaults: jest.fn(),
  updateSetting: jest.fn(),
  hasSettings: jest.fn(),
  migrateSettings: jest.fn(),
};

describe('SettingsContext', () => {
  beforeEach(() => {
    mockGetService.mockReturnValue(mockSettingsRepository);
    jest.clearAllMocks();
  });

  describe('SettingsProvider', () => {
    it('should provide default settings initially', async () => {
      mockSettingsRepository.getSettings.mockResolvedValue(Result.success(DEFAULT_APP_SETTINGS));

      const TestComponent = () => {
        const { settings, isLoading } = useSettings();
        return (
          <>
            <div testID="loading">{isLoading.toString()}</div>
            <div testID="theme">{settings.theme}</div>
          </>
        );
      };

      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('true');

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('theme')).toHaveTextContent('warmInviting');
      });
    });

    it('should handle settings loading errors', async () => {
      mockSettingsRepository.getSettings.mockResolvedValue(Result.failure('Failed to load'));

      const TestComponent = () => {
        const { error, isLoading } = useSettings();
        return (
          <>
            <div testID="loading">{isLoading.toString()}</div>
            <div testID="error">{error || 'no error'}</div>
          </>
        );
      };

      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('Failed to load');
      });
    });
  });

  describe('useSettings', () => {
    it('should throw error when used outside provider', () => {
      const TestComponent = () => {
        useSettings();
        return null;
      };

      expect(() => render(<TestComponent />)).toThrow('useSettings must be used within a SettingsProvider');
    });

    it('should update settings successfully', async () => {
      mockSettingsRepository.getSettings.mockResolvedValue(Result.success(DEFAULT_APP_SETTINGS));
      mockSettingsRepository.updateSetting.mockResolvedValue(Result.success(undefined));

      const TestComponent = () => {
        const { settings, updateSetting } = useSettings();
        const [updated, setUpdated] = React.useState(false);

        const handleUpdate = async () => {
          await updateSetting('theme', 'cleanModern');
          setUpdated(true);
        };

        return (
          <>
            <div testID="theme">{settings.theme}</div>
            <div testID="updated">{updated.toString()}</div>
            <button testID="update" onPress={handleUpdate} />
          </>
        );
      };

      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('warmInviting');
      });

      act(() => {
        screen.getByTestId('update').props.onPress();
      });

      await waitFor(() => {
        expect(screen.getByTestId('updated')).toHaveTextContent('true');
        expect(mockSettingsRepository.updateSetting).toHaveBeenCalledWith('theme', 'cleanModern');
      });
    });

    it('should handle update errors', async () => {
      mockSettingsRepository.getSettings.mockResolvedValue(Result.success(DEFAULT_APP_SETTINGS));
      mockSettingsRepository.updateSetting.mockResolvedValue(Result.failure('Update failed'));

      const TestComponent = () => {
        const { settings, updateSetting, error } = useSettings();
        const [updated, setUpdated] = React.useState(false);

        const handleUpdate = async () => {
          await updateSetting('theme', 'cleanModern');
          setUpdated(true);
        };

        return (
          <>
            <div testID="theme">{settings.theme}</div>
            <div testID="updated">{updated.toString()}</div>
            <div testID="error">{error || 'no error'}</div>
            <button testID="update" onPress={handleUpdate} />
          </>
        );
      };

      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      );

      act(() => {
        screen.getByTestId('update').props.onPress();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Update failed');
        expect(screen.getByTestId('theme')).toHaveTextContent('warmInviting'); // Should not change
      });
    });
  });

  describe('useSetting', () => {
    it('should provide specific setting value and update function', async () => {
      mockSettingsRepository.getSettings.mockResolvedValue(Result.success(DEFAULT_APP_SETTINGS));
      mockSettingsRepository.updateSetting.mockResolvedValue(Result.success(undefined));

      const TestComponent = () => {
        const { value, update, isLoading, error } = useSetting('theme');
        const [updated, setUpdated] = React.useState(false);

        const handleUpdate = async () => {
          await update('cleanModern');
          setUpdated(true);
        };

        return (
          <>
            <div testID="value">{value}</div>
            <div testID="loading">{isLoading.toString()}</div>
            <div testID="error">{error || 'no error'}</div>
            <div testID="updated">{updated.toString()}</div>
            <button testID="update" onPress={handleUpdate} />
          </>
        );
      };

      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('value')).toHaveTextContent('warmInviting');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      act(() => {
        screen.getByTestId('update').props.onPress();
      });

      await waitFor(() => {
        expect(screen.getByTestId('updated')).toHaveTextContent('true');
        expect(mockSettingsRepository.updateSetting).toHaveBeenCalledWith('theme', 'cleanModern');
      });
    });
  });
});
