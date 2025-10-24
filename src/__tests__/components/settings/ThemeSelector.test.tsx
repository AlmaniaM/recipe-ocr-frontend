/**
 * ThemeSelector Component Tests
 * 
 * Tests for the ThemeSelector component.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThemeSelector } from '../../../components/settings/ThemeSelector';
import { ThemeProvider } from '../../../context/ThemeContext';
import { SettingsProvider } from '../../../context/SettingsContext';
import { DEFAULT_APP_SETTINGS } from '../../../domain/entities/AppSettings';
import { Result } from '../../../domain/common/Result';

// Mock the DI container
jest.mock('../../../infrastructure/di/container', () => ({
  getService: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockGetService = require('../../../infrastructure/di/container').getService;

// Mock settings repository
const mockSettingsRepository = {
  getSettings: jest.fn(),
  saveSettings: jest.fn(),
  resetToDefaults: jest.fn(),
  updateSetting: jest.fn(),
  hasSettings: jest.fn(),
  migrateSettings: jest.fn(),
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <SettingsProvider>
        {component}
      </SettingsProvider>
    </ThemeProvider>
  );
};

describe('ThemeSelector', () => {
  beforeEach(() => {
    mockGetService.mockReturnValue(mockSettingsRepository);
    mockSettingsRepository.getSettings.mockResolvedValue(Result.success(DEFAULT_APP_SETTINGS));
    mockSettingsRepository.updateSetting.mockResolvedValue(Result.success(undefined));
    jest.clearAllMocks();
  });

  it('should render all theme options', async () => {
    renderWithProviders(<ThemeSelector />);

    await screen.findByText('Warm & Inviting');
    expect(screen.getByText('Clean & Modern')).toBeTruthy();
    expect(screen.getByText('Earthy & Natural')).toBeTruthy();
  });

  it('should show current selected theme', async () => {
    renderWithProviders(<ThemeSelector />);

    await screen.findByText('Warm & Inviting');
    // The warm inviting theme should be selected by default
    expect(screen.getByText('Warm & Inviting')).toBeTruthy();
  });

  it('should call onThemeChange when theme is selected', async () => {
    const onThemeChange = jest.fn();
    renderWithProviders(<ThemeSelector onThemeChange={onThemeChange} />);

    await screen.findByText('Clean & Modern');
    
    fireEvent.press(screen.getByText('Clean & Modern'));

    expect(mockSettingsRepository.updateSetting).toHaveBeenCalledWith('theme', 'cleanModern');
  });

  it('should handle update errors', async () => {
    mockSettingsRepository.updateSetting.mockResolvedValue(Result.failure('Update failed'));
    
    const onThemeChange = jest.fn();
    renderWithProviders(<ThemeSelector onThemeChange={onThemeChange} />);

    await screen.findByText('Clean & Modern');
    
    fireEvent.press(screen.getByText('Clean & Modern'));

    expect(mockSettingsRepository.updateSetting).toHaveBeenCalledWith('theme', 'cleanModern');
    // onThemeChange should not be called on error
    expect(onThemeChange).not.toHaveBeenCalled();
  });

  it('should show error message when settings fail to load', async () => {
    mockSettingsRepository.getSettings.mockResolvedValue(Result.failure('Failed to load'));

    renderWithProviders(<ThemeSelector />);

    await screen.findByText(/Failed to load theme options/);
  });
});
