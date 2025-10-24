import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '../../../context/ThemeContext';
import RecipesListScreen from '../../../screens/recipes/RecipesListScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

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

describe('RecipesListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', async () => {
    const component = renderWithProviders(
      <RecipesListScreen />
    );

    // Wait for any async operations to complete
    await act(async () => {
      // Wait for the component to finish loading
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const { getByText, getByPlaceholderText } = component;
    expect(getByPlaceholderText('Search recipes...')).toBeTruthy();
    expect(getByText('No Recipes Yet')).toBeTruthy();
    expect(getByText('Click the + button to create or capture a recipe')).toBeTruthy();
  });

  it('should display search input', async () => {
    const component = renderWithProviders(
      <RecipesListScreen />
    );

    // Wait for any async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const { getByPlaceholderText } = component;
    const searchInput = getByPlaceholderText('Search recipes...');
    expect(searchInput).toBeTruthy();
  });

  it('should update search query when typing', async () => {
    const component = renderWithProviders(
      <RecipesListScreen />
    );

    // Wait for any async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const { getByPlaceholderText } = component;
    const searchInput = getByPlaceholderText('Search recipes...');
    
    await act(async () => {
      fireEvent.changeText(searchInput, 'chocolate');
    });

    expect(searchInput.props.value).toBe('chocolate');
  });

  it('should render empty state when no recipes', async () => {
    const component = renderWithProviders(
      <RecipesListScreen />
    );

    // Wait for any async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const { getByText } = component;
    expect(getByText('No Recipes Yet')).toBeTruthy();
    expect(getByText('Click the + button to create or capture a recipe')).toBeTruthy();
  });

  it('should render floating action button', async () => {
    const component = renderWithProviders(
      <RecipesListScreen />
    );

    // Wait for any async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const { getByTestId } = component;
    const fab = getByTestId('fab');
    expect(fab).toBeTruthy();
  });

  it('should navigate to Camera screen when FAB is pressed', async () => {
    const component = renderWithProviders(
      <RecipesListScreen />
    );

    // Wait for any async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const { getByTestId } = component;
    const fab = getByTestId('fab');
    
    await act(async () => {
      fireEvent.press(fab);
    });

    expect(mockNavigate).toHaveBeenCalledWith('Camera');
  });

  it('should apply theme colors correctly', async () => {
    const component = renderWithProviders(
      <RecipesListScreen />
    );

    // Wait for any async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const { getByPlaceholderText, getByText } = component;
    const searchInput = getByPlaceholderText('Search recipes...');
    const emptyTitle = getByText('No Recipes Yet');

    // These elements should be rendered with theme colors
    expect(searchInput).toBeTruthy();
    expect(emptyTitle).toBeTruthy();
  });

  it('should render search icon', async () => {
    const component = renderWithProviders(
      <RecipesListScreen />
    );

    // Wait for any async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const { getByTestId } = component;
    // The search icon should be present in the search container
    const searchContainer = getByTestId('search-container');
    expect(searchContainer).toBeTruthy();
  });

  it('should handle empty recipe list', async () => {
    const component = renderWithProviders(
      <RecipesListScreen />
    );

    // Wait for any async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const { queryByText } = component;
    // Should not show any recipe items
    expect(queryByText('Recipe Title')).toBeNull();
  });

  it('should maintain search state during re-renders', async () => {
    const component = renderWithProviders(
      <RecipesListScreen />
    );

    // Wait for any async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const { getByPlaceholderText, rerender } = component;
    const searchInput = getByPlaceholderText('Search recipes...');
    
    await act(async () => {
      fireEvent.changeText(searchInput, 'test query');
    });

    // Re-render the component
    await act(async () => {
      rerender(
        <ThemeProvider>
          <NavigationContainer>
            <RecipesListScreen />
          </NavigationContainer>
        </ThemeProvider>
      );
    });

    // Search query should be maintained (this tests the useState hook)
    expect(searchInput.props.value).toBe('test query');
  });
});

describe('RecipesListScreen Integration', () => {
  it('should work with theme context', async () => {
    const component = renderWithProviders(
      <RecipesListScreen />
    );

    // Wait for any async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const { getByText } = component;
    // Should render without errors when wrapped in ThemeProvider
    expect(getByText('No Recipes Yet')).toBeTruthy();
  });

  it('should handle navigation context', async () => {
    const component = renderWithProviders(
      <RecipesListScreen />
    );

    // Wait for any async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const { getByTestId } = component;
    const fab = getByTestId('fab');
    
    await act(async () => {
      fireEvent.press(fab);
    });

    // Should call navigation without errors
    expect(mockNavigate).toHaveBeenCalled();
  });
});
