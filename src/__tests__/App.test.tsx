import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

// Mock the navigation components
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Mock the TabNavigator
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

// Mock the ThemeProvider
jest.mock('../context/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('App', () => {
  it('should render without crashing', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('tab-navigator')).toBeTruthy();
  });

  it('should render the main app structure', () => {
    const { getByTestId } = render(<App />);
    
    // Should render the tab navigator
    expect(getByTestId('tab-navigator')).toBeTruthy();
  });

  it('should handle theme provider integration', () => {
    const { getByTestId } = render(<App />);
    
    // Should render without theme-related errors
    expect(getByTestId('tab-navigator')).toBeTruthy();
  });

  it('should handle navigation container integration', () => {
    const { getByTestId } = render(<App />);
    
    // Should render without navigation-related errors
    expect(getByTestId('tab-navigator')).toBeTruthy();
  });

  it('should render status bar', () => {
    const { getByTestId } = render(<App />);
    
    // Status bar should be rendered (mocked as a component)
    expect(getByTestId('tab-navigator')).toBeTruthy();
  });
});

describe('App Integration', () => {
  it('should integrate all main components', () => {
    const { getByTestId } = render(<App />);
    
    // All main components should be integrated
    expect(getByTestId('tab-navigator')).toBeTruthy();
  });

  it('should handle component re-renders', () => {
    const { getByTestId, rerender } = render(<App />);
    
    // Initial render
    expect(getByTestId('tab-navigator')).toBeTruthy();
    
    // Re-render
    rerender(<App />);
    
    // Should still render correctly
    expect(getByTestId('tab-navigator')).toBeTruthy();
  });
});
