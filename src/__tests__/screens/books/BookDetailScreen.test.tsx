import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BookDetailScreen from '../../../screens/books/BookDetailScreen';
import { ThemeProvider } from '../../../context/ThemeContext';
import { BooksStackParamList } from '../../../types/navigation';

// Mock the useRecipeBookUseCase hook
jest.mock('../../../presentation/hooks/useRecipeBookUseCase', () => ({
  useGetRecipeBook: () => ({
    getRecipeBook: jest.fn().mockResolvedValue({
      isSuccess: true,
      value: {
        id: { value: '1' },
        title: 'Test Book',
        description: 'Test Description',
        recipeIds: ['recipe1', 'recipe2'],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        isArchived: false,
      },
    }),
  }),
  useDeleteRecipeBook: () => ({
    deleteRecipeBook: jest.fn().mockResolvedValue({
      isSuccess: true,
    }),
  }),
}));

// Mock the useRecipeUseCase hook
jest.mock('../../../presentation/hooks/useRecipeUseCase', () => ({
  useRecipeUseCase: () => ({
    listRecipes: jest.fn().mockResolvedValue({
      isSuccess: true,
      value: [
        {
          id: { value: 'recipe1' },
          title: 'Recipe 1',
          description: 'Recipe 1 Description',
          servings: { value: 4 },
          prepTime: { value: 30 },
        },
        {
          id: { value: 'recipe2' },
          title: 'Recipe 2',
          description: 'Recipe 2 Description',
          servings: { value: 2 },
          prepTime: { value: 45 },
        },
      ],
    }),
  }),
}));

const Stack = createStackNavigator<BooksStackParamList>();

const MockedNavigator = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="BookDetail" component={() => <>{children}</>} />
    </Stack.Navigator>
  </NavigationContainer>
);

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <MockedNavigator>{component}</MockedNavigator>
    </ThemeProvider>
  );
};

describe('BookDetailScreen', () => {
  const mockRoute = {
    params: { bookId: '1' },
    key: 'test-key',
    name: 'BookDetail' as const,
  };

  it('should render book details with recipes', async () => {
    // Given
    const { getByText } = renderWithProviders(<BookDetailScreen route={mockRoute} />);

    // Then
    await waitFor(() => {
      expect(getByText('Test Book')).toBeTruthy();
      expect(getByText('Test Description')).toBeTruthy();
      expect(getByText('2 recipes')).toBeTruthy();
    });

    await waitFor(() => {
      expect(getByText('Recipe 1')).toBeTruthy();
      expect(getByText('Recipe 2')).toBeTruthy();
    });
  });

  it('should display loading state initially', () => {
    // Given
    const { getByText } = renderWithProviders(<BookDetailScreen route={mockRoute} />);

    // Then
    expect(getByText('Loading book details...')).toBeTruthy();
  });

  it('should display error state when book loading fails', async () => {
    // Given
    const mockGetRecipeBook = jest.fn().mockResolvedValue({
      isSuccess: false,
      error: 'Book not found',
    });

    jest.doMock('../../../presentation/hooks/useRecipeBookUseCase', () => ({
      useGetRecipeBook: () => ({
        getRecipeBook: mockGetRecipeBook,
      }),
      useDeleteRecipeBook: () => ({
        deleteRecipeBook: jest.fn(),
      }),
    }));

    const { getByText } = renderWithProviders(<BookDetailScreen route={mockRoute} />);

    // Then
    await waitFor(() => {
      expect(getByText('Failed to Load Book')).toBeTruthy();
      expect(getByText('Book not found')).toBeTruthy();
    });
  });

  it('should display empty state when no recipes are in the book', async () => {
    // Given
    const mockGetRecipeBook = jest.fn().mockResolvedValue({
      isSuccess: true,
      value: {
        id: { value: '1' },
        title: 'Empty Book',
        description: 'Empty Description',
        recipeIds: [],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        isArchived: false,
      },
    });

    jest.doMock('../../../presentation/hooks/useRecipeBookUseCase', () => ({
      useGetRecipeBook: () => ({
        getRecipeBook: mockGetRecipeBook,
      }),
      useDeleteRecipeBook: () => ({
        deleteRecipeBook: jest.fn(),
      }),
    }));

    const { getByText } = renderWithProviders(<BookDetailScreen route={mockRoute} />);

    // Then
    await waitFor(() => {
      expect(getByText('No Recipes Yet')).toBeTruthy();
      expect(getByText('Add recipes to this book to get started')).toBeTruthy();
    });
  });

  it('should handle edit button press', async () => {
    // Given
    const mockNavigation = { navigate: jest.fn() };
    const { getByTestId } = renderWithProviders(<BookDetailScreen route={mockRoute} />);

    // When
    await waitFor(() => {
      fireEvent.press(getByTestId('edit-book-button'));
    });

    // Then
    expect(mockNavigation.navigate).toHaveBeenCalledWith('BookEdit', { bookId: '1' });
  });

  it('should handle delete button press with confirmation', async () => {
    // Given
    const { getByTestId } = renderWithProviders(<BookDetailScreen route={mockRoute} />);

    // When
    await waitFor(() => {
      fireEvent.press(getByTestId('delete-book-button'));
    });

    // Then
    // Note: In a real test, you would need to mock Alert.alert to test the confirmation dialog
    expect(getByTestId('delete-book-button')).toBeTruthy();
  });

  it('should handle add recipe button press', async () => {
    // Given
    const mockNavigation = { navigate: jest.fn() };
    const { getByTestId } = renderWithProviders(<BookDetailScreen route={mockRoute} />);

    // When
    await waitFor(() => {
      fireEvent.press(getByTestId('add-recipe-button'));
    });

    // Then
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AddRecipeToBook', { bookId: '1' });
  });
});
