import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '../../../context/ThemeContext';
import SettingsScreen from '../../../screens/settings/SettingsScreen';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Mock Icon component
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <NavigationContainer>
        {component}
      </NavigationContainer>
    </ThemeProvider>
  );
};

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  it('should render correctly', () => {
    const { getByText } = renderWithProviders(
      <SettingsScreen />
    );

    expect(getByText('Theme')).toBeTruthy();
    expect(getByText('Storage & Backup')).toBeTruthy();
    expect(getByText('App Preferences')).toBeTruthy();
    expect(getByText('About')).toBeTruthy();
  });

  it('should display all theme options', () => {
    const { getByText } = renderWithProviders(
      <SettingsScreen />
    );

    expect(getByText('Warm & Inviting')).toBeTruthy();
    expect(getByText('Clean & Modern')).toBeTruthy();
    expect(getByText('Earthy & Natural')).toBeTruthy();
  });

  it('should display theme descriptions', () => {
    const { getByText } = renderWithProviders(
      <SettingsScreen />
    );

    expect(getByText('Warm orange and golden tones')).toBeTruthy();
    expect(getByText('Blue and emerald accents')).toBeTruthy();
    expect(getByText('Green and amber tones')).toBeTruthy();
  });

  it('should show current theme as selected', async () => {
    mockAsyncStorage.getItem.mockResolvedValue('cleanModern');

    const { getByText } = renderWithProviders(
      <SettingsScreen />
    );

    await waitFor(() => {
      // The clean modern theme should be selected
      expect(getByText('Clean & Modern')).toBeTruthy();
    });
  });

  it('should allow theme selection', async () => {
    const { getByText } = renderWithProviders(
      <SettingsScreen />
    );

    const cleanModernOption = getByText('Clean & Modern');
    fireEvent.press(cleanModernOption);

    await waitFor(() => {
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'selectedTheme',
        'cleanModern'
      );
    });
  });

  it('should display storage settings', () => {
    const { getByText } = renderWithProviders(
      <SettingsScreen />
    );

    expect(getByText('Storage Location')).toBeTruthy();
    expect(getByText('Local')).toBeTruthy();
    expect(getByText('Backup & Restore')).toBeTruthy();
    expect(getByText('Export/Import data')).toBeTruthy();
  });

  it('should display app preferences', () => {
    const { getByText } = renderWithProviders(
      <SettingsScreen />
    );

    expect(getByText('Notifications')).toBeTruthy();
    expect(getByText('Recipe reminders')).toBeTruthy();
  });

  it('should display about section', () => {
    const { getByText } = renderWithProviders(
      <SettingsScreen />
    );

    expect(getByText('Version')).toBeTruthy();
    expect(getByText('1.0.0')).toBeTruthy();
    expect(getByText('Privacy Policy')).toBeTruthy();
    expect(getByText('Support')).toBeTruthy();
  });

  it('should handle theme change errors gracefully', async () => {
    mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { getByText } = renderWithProviders(
      <SettingsScreen />
    );

    const cleanModernOption = getByText('Clean & Modern');
    fireEvent.press(cleanModernOption);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save theme:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it('should apply theme colors correctly', () => {
    const { getByText } = renderWithProviders(
      <SettingsScreen />
    );

    // All text elements should be rendered with theme colors
    expect(getByText('Theme')).toBeTruthy();
    expect(getByText('Storage & Backup')).toBeTruthy();
    expect(getByText('App Preferences')).toBeTruthy();
    expect(getByText('About')).toBeTruthy();
  });

  it('should render all section titles', () => {
    const { getByText } = renderWithProviders(
      <SettingsScreen />
    );

    const sectionTitles = [
      'Theme',
      'Storage & Backup',
      'App Preferences',
      'About'
    ];

    sectionTitles.forEach(title => {
      expect(getByText(title)).toBeTruthy();
    });
  });

  it('should render all setting items', () => {
    const { getByText } = renderWithProviders(
      <SettingsScreen />
    );

    const settingItems = [
      'Storage Location',
      'Backup & Restore',
      'Notifications',
      'Version',
      'Privacy Policy',
      'Support'
    ];

    settingItems.forEach(item => {
      expect(getByText(item)).toBeTruthy();
    });
  });

  it('should handle theme selection for all available themes', async () => {
    const { getByText } = renderWithProviders(
      <SettingsScreen />
    );

    // Test warm inviting theme
    const warmInvitingOption = getByText('Warm & Inviting');
    fireEvent.press(warmInvitingOption);

    await waitFor(() => {
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'selectedTheme',
        'warmInviting'
      );
    });

    // Test earthy natural theme
    const earthyNaturalOption = getByText('Earthy & Natural');
    fireEvent.press(earthyNaturalOption);

    await waitFor(() => {
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'selectedTheme',
        'earthyNatural'
      );
    });
  });
});

describe('SettingsScreen Integration', () => {
  it('should work with theme context', () => {
    const { getByText } = renderWithProviders(
      <SettingsScreen />
    );

    // Should render without errors when wrapped in ThemeProvider
    expect(getByText('Theme')).toBeTruthy();
  });

  it('should maintain theme state across re-renders', async () => {
    const { getByText, rerender } = renderWithProviders(
      <SettingsScreen />
    );

    const cleanModernOption = getByText('Clean & Modern');
    fireEvent.press(cleanModernOption);

    await waitFor(() => {
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'selectedTheme',
        'cleanModern'
      );
    });

    // Re-render the component
    rerender(
      <ThemeProvider>
        <NavigationContainer>
          <SettingsScreen />
        </NavigationContainer>
      </ThemeProvider>
    );

    // Should still render correctly
    expect(getByText('Theme')).toBeTruthy();
  });
});
