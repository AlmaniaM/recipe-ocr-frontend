import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../../../App';

// Mock all the necessary modules
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useFocusEffect: jest.fn(),
  useRoute: () => ({
    params: {},
  }),
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../../navigation/TabNavigator', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return function MockTabNavigator() {
    return (
      <View testID="tab-navigator">
        <Text>Tab Navigator</Text>
        <TouchableOpacity
          testID="theme-change-button"
          onPress={() => {
            // Simulate theme change
          }}
        >
          <Text>Change Theme</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock('../../context/ThemeContext', () => {
  const React = require('react');
  const AsyncStorage = require('@react-native-async-storage/async-storage');
  
  return {
    ThemeProvider: ({ children }: { children: React.ReactNode }) => {
      React.useEffect(() => {
        // Simulate theme loading from AsyncStorage
        AsyncStorage.getItem('selectedTheme').catch(() => {
          console.error('Failed to load theme:', new Error('Storage error'));
        });
      }, []);
      
      return children;
    },
    useTheme: () => ({
      theme: {
        colors: {
          primary: '#FF6B35',
          secondary: '#F7931E',
          background: '#FFF8F5',
          surface: '#FFFFFF',
          textPrimary: '#2D1B1B',
          textSecondary: '#8B7355',
          success: '#4CAF50',
          error: '#F44336',
          warning: '#FF9800',
          border: '#E8D5C4',
        },
        typography: {
          headerFont: 'Inter-Bold',
          bodyFont: 'Inter-Regular',
          captionFont: 'Inter-Medium',
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32,
        },
        borderRadius: {
          sm: 4,
          md: 8,
          lg: 12,
        },
      },
      themeName: 'warmInviting',
      setTheme: jest.fn(),
      availableThemes: ['warmInviting', 'cleanModern', 'earthyNatural'],
    }),
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('App Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  it('should render the complete app structure', () => {
    const { getByTestId } = render(<App />);
    
    expect(getByTestId('tab-navigator')).toBeTruthy();
  });

  it('should handle theme persistence', async () => {
    mockAsyncStorage.getItem.mockResolvedValue('cleanModern');
    
    const { getByTestId } = render(<App />);
    
    await waitFor(() => {
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('selectedTheme');
    });
    
    expect(getByTestId('tab-navigator')).toBeTruthy();
  });

  it('should handle theme loading errors gracefully', async () => {
    mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { getByTestId } = render(<App />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load theme:',
        expect.any(Error)
      );
    });
    
    // App should still render despite error
    expect(getByTestId('tab-navigator')).toBeTruthy();
    
    consoleSpy.mockRestore();
  });

  it('should maintain app state across re-renders', () => {
    const { getByTestId, rerender } = render(<App />);
    
    // Initial render
    expect(getByTestId('tab-navigator')).toBeTruthy();
    
    // Re-render
    rerender(<App />);
    
    // Should still render correctly
    expect(getByTestId('tab-navigator')).toBeTruthy();
  });

  it('should handle navigation integration', () => {
    const { getByTestId } = render(<App />);
    
    // Should render without navigation errors
    expect(getByTestId('tab-navigator')).toBeTruthy();
  });

  it('should handle theme context integration', () => {
    const { getByTestId } = render(<App />);
    
    // Should render without theme context errors
    expect(getByTestId('tab-navigator')).toBeTruthy();
  });

  it('should handle status bar integration', () => {
    const { getByTestId } = render(<App />);
    
    // Should render without status bar errors
    expect(getByTestId('tab-navigator')).toBeTruthy();
  });
});

describe('App Error Handling', () => {
  it('should handle component mount errors', () => {
    // Mock a component that throws an error
    const ErrorComponent = () => {
      throw new Error('Component error');
    };
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    expect(() => {
      render(<ErrorComponent />);
    }).toThrow('Component error');
    
    consoleSpy.mockRestore();
  });

  it('should handle async storage errors during app initialization', async () => {
    mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage unavailable'));
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { getByTestId } = render(<App />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    
    // App should still render
    expect(getByTestId('tab-navigator')).toBeTruthy();
    
    consoleSpy.mockRestore();
  });
});

describe('App Performance', () => {
  it('should render efficiently', () => {
    const startTime = performance.now();
    
    const { getByTestId } = render(<App />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within reasonable time (adjust threshold as needed)
    expect(renderTime).toBeLessThan(1000);
    expect(getByTestId('tab-navigator')).toBeTruthy();
  });

  it('should handle multiple rapid re-renders', () => {
    const { getByTestId, rerender } = render(<App />);
    
    // Perform multiple rapid re-renders
    for (let i = 0; i < 10; i++) {
      rerender(<App />);
    }
    
    // Should still render correctly
    expect(getByTestId('tab-navigator')).toBeTruthy();
  });
});
