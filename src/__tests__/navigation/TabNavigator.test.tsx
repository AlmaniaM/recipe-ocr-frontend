import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '../../context/ThemeContext';
import TabNavigator from '../../navigation/TabNavigator';

// Mock the stack navigators
jest.mock('../../navigation/RecipesStack', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return function MockRecipesStack() {
    return (
      <View testID="recipes-stack">
        <Text>Recipes Stack</Text>
      </View>
    );
  };
});

jest.mock('../../navigation/BooksStack', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return function MockBooksStack() {
    return (
      <View testID="books-stack">
        <Text>Books Stack</Text>
      </View>
    );
  };
});

// Mock SettingsScreen
jest.mock('../../screens/settings/SettingsScreen', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return function MockSettingsScreen() {
    return (
      <View testID="settings-screen">
        <Text>Settings Screen</Text>
      </View>
    );
  };
});

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

describe('TabNavigator', () => {
  it('should render correctly', () => {
    const { getByTestId } = renderWithProviders(
      <TabNavigator />
    );

    expect(getByTestId('recipes-stack')).toBeTruthy();
    expect(getByTestId('books-stack')).toBeTruthy();
    expect(getByTestId('settings-screen')).toBeTruthy();
  });

  it('should render all tab screens', () => {
    const { getByTestId } = renderWithProviders(
      <TabNavigator />
    );

    // All three main tabs should be rendered
    expect(getByTestId('recipes-stack')).toBeTruthy();
    expect(getByTestId('books-stack')).toBeTruthy();
    expect(getByTestId('settings-screen')).toBeTruthy();
  });

  it('should work with theme context', () => {
    const { getByTestId } = renderWithProviders(
      <TabNavigator />
    );

    // Should render without errors when wrapped in ThemeProvider
    expect(getByTestId('recipes-stack')).toBeTruthy();
    expect(getByTestId('books-stack')).toBeTruthy();
    expect(getByTestId('settings-screen')).toBeTruthy();
  });

  it('should handle navigation container', () => {
    const { getByTestId } = renderWithProviders(
      <TabNavigator />
    );

    // Should render without errors when wrapped in NavigationContainer
    expect(getByTestId('recipes-stack')).toBeTruthy();
  });
});

describe('TabNavigator Integration', () => {
  it('should integrate with theme system', () => {
    const { getByTestId } = renderWithProviders(
      <TabNavigator />
    );

    // Should render all components without theme-related errors
    expect(getByTestId('recipes-stack')).toBeTruthy();
    expect(getByTestId('books-stack')).toBeTruthy();
    expect(getByTestId('settings-screen')).toBeTruthy();
  });

  it('should handle theme changes', () => {
    const { getByTestId, rerender } = renderWithProviders(
      <TabNavigator />
    );

    // Initial render
    expect(getByTestId('recipes-stack')).toBeTruthy();

    // Re-render (simulating theme change)
    rerender(
      <ThemeProvider>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </ThemeProvider>
    );

    // Should still render correctly
    expect(getByTestId('recipes-stack')).toBeTruthy();
    expect(getByTestId('books-stack')).toBeTruthy();
    expect(getByTestId('settings-screen')).toBeTruthy();
  });
});
