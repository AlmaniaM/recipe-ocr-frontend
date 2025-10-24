import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '../../context/ThemeContext';
import { themes, defaultTheme } from '../../constants/themes';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Test component to access theme context
const TestComponent = () => {
  const { theme, themeName, setTheme, availableThemes } = useTheme();
  return (
    <>
      <div data-testid="theme-name">{themeName}</div>
      <div data-testid="theme-primary">{theme.colors.primary}</div>
      <div data-testid="available-themes">{availableThemes.join(',')}</div>
      <div
        data-testid="set-theme-button"
        onClick={() => setTheme('cleanModern')}
      >
        Set Clean Modern
      </div>
    </>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide default theme on initial render', () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(getByTestId('theme-name')).toHaveTextContent(defaultTheme);
    expect(getByTestId('theme-primary')).toHaveTextContent(
      themes[defaultTheme].colors.primary
    );
  });

  it('should load saved theme from AsyncStorage', async () => {
    const savedTheme = 'cleanModern';
    mockAsyncStorage.getItem.mockResolvedValue(savedTheme);

    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('selectedTheme');
    });

    await waitFor(() => {
      expect(getByTestId('theme-name')).toHaveTextContent(savedTheme);
      expect(getByTestId('theme-primary')).toHaveTextContent(
        themes[savedTheme].colors.primary
      );
    });
  });

  it('should handle AsyncStorage errors gracefully', async () => {
    mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load theme:',
        expect.any(Error)
      );
    });

    // Should still use default theme
    expect(getByTestId('theme-name')).toHaveTextContent(defaultTheme);

    consoleSpy.mockRestore();
  });

  it('should change theme and save to AsyncStorage', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();

    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await act(async () => {
      fireEvent.click(getByTestId('set-theme-button'));
    });

    await waitFor(() => {
      expect(getByTestId('theme-name')).toHaveTextContent('cleanModern');
      expect(getByTestId('theme-primary')).toHaveTextContent(
        themes.cleanModern.colors.primary
      );
    });

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      'selectedTheme',
      'cleanModern'
    );
  });

  it('should handle setItem errors gracefully', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockRejectedValue(new Error('Save error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await act(async () => {
      fireEvent.click(getByTestId('set-theme-button'));
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save theme:',
        expect.any(Error)
      );
    });

    // Theme should still change despite save error
    expect(getByTestId('theme-name')).toHaveTextContent('cleanModern');

    consoleSpy.mockRestore();
  });

  it('should not change theme for invalid theme name', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const TestComponentWithInvalidTheme = () => {
      const { theme, themeName, setTheme } = useTheme();
      return (
        <>
          <div data-testid="theme-name">{themeName}</div>
          <div data-testid="theme-primary">{theme.colors.primary}</div>
        <div
          data-testid="set-invalid-theme"
          onClick={() => setTheme('invalidTheme')}
        >
          Set Invalid Theme
        </div>
        </>
      );
    };

    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponentWithInvalidTheme />
      </ThemeProvider>
    );

    const initialTheme = getByTestId('theme-name').textContent;

    await act(async () => {
      fireEvent.click(getByTestId('set-invalid-theme'));
    });

    // Theme should remain unchanged
    expect(getByTestId('theme-name')).toHaveTextContent(initialTheme);
  });

  it('should provide all available themes', () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const availableThemesText = getByTestId('available-themes').textContent;
    const availableThemes = availableThemesText?.split(',') || [];

    expect(availableThemes).toContain('warmInviting');
    expect(availableThemes).toContain('cleanModern');
    expect(availableThemes).toContain('earthyNatural');
    expect(availableThemes).toHaveLength(3);
  });

  it('should throw error when useTheme is used outside ThemeProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleSpy.mockRestore();
  });
});
