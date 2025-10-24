import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../../App';

// Mock all necessary modules for E2E testing
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Mock the actual screens for E2E testing
jest.mock('../../screens/recipes/RecipesListScreen', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity, TextInput } = require('react-native');
  return function MockRecipesListScreen() {
    const [searchQuery, setSearchQuery] = React.useState('');
    return (
      <View testID="recipes-list-screen">
        <Text>Recipes List</Text>
        <TextInput
          testID="search-input"
          placeholder="Search recipes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          testID="add-recipe-button"
          onPress={() => {
            // Navigate to camera
          }}
        >
          <Text>Add Recipe</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock('../../screens/settings/SettingsScreen', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return function MockSettingsScreen() {
    return (
      <View testID="settings-screen">
        <Text>Settings</Text>
        <TouchableOpacity
          testID="theme-warm-inviting"
          onPress={() => {
            // Change theme
          }}
        >
          <Text>Warm & Inviting</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="theme-clean-modern"
          onPress={() => {
            // Change theme
          }}
        >
          <Text>Clean & Modern</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="theme-earthy-natural"
          onPress={() => {
            // Change theme
          }}
        >
          <Text>Earthy & Natural</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock('../../navigation/TabNavigator', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return function MockTabNavigator() {
    const [currentTab, setCurrentTab] = React.useState('recipes');
    
    return (
      <View testID="tab-navigator">
        <View testID="tab-bar">
          <TouchableOpacity
            testID="recipes-tab"
            onPress={() => setCurrentTab('recipes')}
          >
            <Text>Recipes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="books-tab"
            onPress={() => setCurrentTab('books')}
          >
            <Text>Books</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="settings-tab"
            onPress={() => setCurrentTab('settings')}
          >
            <Text>Settings</Text>
          </TouchableOpacity>
        </View>
        <View testID="tab-content">
          {currentTab === 'recipes' && <Text testID="recipes-content">Recipes Content</Text>}
          {currentTab === 'books' && <Text testID="books-content">Books Content</Text>}
          {currentTab === 'settings' && <Text testID="settings-content">Settings Content</Text>}
        </View>
      </View>
    );
  };
});

jest.mock('../../context/ThemeContext', () => ({
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
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('User Flow E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  describe('App Launch Flow', () => {
    it('should launch app and show default screen', async () => {
      const { getByTestId } = render(<App />);
      
      await waitFor(() => {
        expect(getByTestId('tab-navigator')).toBeTruthy();
      });
      
      // Should show recipes tab by default
      expect(getByTestId('recipes-content')).toBeTruthy();
    });

    it('should load saved theme on app launch', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('cleanModern');
      
      const { getByTestId } = render(<App />);
      
      await waitFor(() => {
        expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('selectedTheme');
      });
      
      expect(getByTestId('tab-navigator')).toBeTruthy();
    });
  });

  describe('Navigation Flow', () => {
    it('should navigate between tabs', async () => {
      const { getByTestId } = render(<App />);
      
      // Start on recipes tab
      expect(getByTestId('recipes-content')).toBeTruthy();
      
      // Navigate to books tab
      fireEvent.press(getByTestId('books-tab'));
      expect(getByTestId('books-content')).toBeTruthy();
      
      // Navigate to settings tab
      fireEvent.press(getByTestId('settings-tab'));
      expect(getByTestId('settings-content')).toBeTruthy();
      
      // Navigate back to recipes tab
      fireEvent.press(getByTestId('recipes-tab'));
      expect(getByTestId('recipes-content')).toBeTruthy();
    });
  });

  describe('Recipe Management Flow', () => {
    it('should search for recipes', async () => {
      const { getByTestId } = render(<App />);
      
      // Navigate to recipes tab
      fireEvent.press(getByTestId('recipes-tab'));
      
      // Search for recipes
      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'chocolate');
      
      expect(searchInput.props.value).toBe('chocolate');
    });

    it('should add new recipe', async () => {
      const { getByTestId } = render(<App />);
      
      // Navigate to recipes tab
      fireEvent.press(getByTestId('recipes-tab'));
      
      // Press add recipe button
      fireEvent.press(getByTestId('add-recipe-button'));
      
      // Should trigger navigation (mocked)
      expect(getByTestId('recipes-list-screen')).toBeTruthy();
    });
  });

  describe('Settings Flow', () => {
    it('should change theme', async () => {
      const { getByTestId } = render(<App />);
      
      // Navigate to settings tab
      fireEvent.press(getByTestId('settings-tab'));
      
      // Change to clean modern theme
      fireEvent.press(getByTestId('theme-clean-modern'));
      
      // Should save theme to storage
      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          'selectedTheme',
          'cleanModern'
        );
      });
    });

    it('should change to all available themes', async () => {
      const { getByTestId } = render(<App />);
      
      // Navigate to settings tab
      fireEvent.press(getByTestId('settings-tab'));
      
      // Test all theme options
      const themes = ['theme-warm-inviting', 'theme-clean-modern', 'theme-earthy-natural'];
      
      for (const theme of themes) {
        fireEvent.press(getByTestId(theme));
        
        await waitFor(() => {
          expect(mockAsyncStorage.setItem).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle storage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const { getByTestId } = render(<App />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to load theme:',
          expect.any(Error)
        );
      });
      
      // App should still function
      expect(getByTestId('tab-navigator')).toBeTruthy();
      
      consoleSpy.mockRestore();
    });

    it('should handle theme save errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Save error'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const { getByTestId } = render(<App />);
      
      // Navigate to settings and try to change theme
      fireEvent.press(getByTestId('settings-tab'));
      fireEvent.press(getByTestId('theme-clean-modern'));
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to save theme:',
          expect.any(Error)
        );
      });
      
      // App should still function
      expect(getByTestId('tab-navigator')).toBeTruthy();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Performance Flow', () => {
    it('should handle rapid navigation without issues', async () => {
      const { getByTestId } = render(<App />);
      
      // Rapidly switch between tabs
      for (let i = 0; i < 10; i++) {
        fireEvent.press(getByTestId('recipes-tab'));
        fireEvent.press(getByTestId('books-tab'));
        fireEvent.press(getByTestId('settings-tab'));
      }
      
      // Should still be functional
      expect(getByTestId('tab-navigator')).toBeTruthy();
    });

    it('should handle rapid theme changes without issues', async () => {
      const { getByTestId } = render(<App />);
      
      // Navigate to settings
      fireEvent.press(getByTestId('settings-tab'));
      
      // Rapidly change themes
      const themes = ['theme-warm-inviting', 'theme-clean-modern', 'theme-earthy-natural'];
      for (let i = 0; i < 5; i++) {
        for (const theme of themes) {
          fireEvent.press(getByTestId(theme));
        }
      }
      
      // Should still be functional
      expect(getByTestId('tab-navigator')).toBeTruthy();
    });
  });
});
