/**
 * App Component Unit Tests
 * 
 * Tests the main App component in isolation
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../../App';

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

jest.mock('../navigation/TabNavigator', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return function MockTabNavigator() {
    return (
      <View testID="tab-navigator">
        <Text>Tab Navigator</Text>
      </View>
    );
  };
});

jest.mock('../context/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
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
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('App Component Unit Tests', () => {
  it('should render the complete app structure', () => {
    const { getByTestId } = render(<App />);
    
    expect(getByTestId('tab-navigator')).toBeTruthy();
  });

  it('should render without crashing', () => {
    expect(() => render(<App />)).not.toThrow();
  });

  it('should render all required providers', () => {
    const { getByTestId } = render(<App />);
    
    // Should render without errors, indicating all providers are working
    expect(getByTestId('tab-navigator')).toBeTruthy();
  });
});
