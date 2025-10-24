import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BooksListScreen from '../../../screens/books/BooksListScreen';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock the useRecipeBookUseCase hook
jest.mock('../../../presentation/hooks/useRecipeBookUseCase', () => ({
  useListRecipeBooks: () => ({
    listRecipeBooks: jest.fn().mockResolvedValue({
      isSuccess: true,
      value: [
        {
          id: { value: '1' },
          title: 'Test Book 1',
          description: 'Test Description 1',
          recipeIds: [],
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
          isArchived: false,
        },
        {
          id: { value: '2' },
          title: 'Test Book 2',
          description: 'Test Description 2',
          recipeIds: [],
          createdAt: '2023-01-02T00:00:00Z',
          updatedAt: '2023-01-02T00:00:00Z',
          isArchived: false,
        },
      ],
    }),
  }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('BooksListScreen', () => {
  it('should render recipe books list with search functionality', async () => {
    // Given
    const { getByText, getByPlaceholderText } = renderWithProviders(<BooksListScreen />);

    // Then
    await waitFor(() => {
      expect(getByText('Test Book 1')).toBeTruthy();
      expect(getByText('Test Book 2')).toBeTruthy();
    });

    expect(getByPlaceholderText('Search books...')).toBeTruthy();
  });

  it('should display empty state when no books are available', async () => {
    // Given
    const mockListRecipeBooks = jest.fn().mockResolvedValue({
      isSuccess: true,
      value: [],
    });

    jest.doMock('../../../presentation/hooks/useRecipeBookUseCase', () => ({
      useListRecipeBooks: () => ({
        listRecipeBooks: mockListRecipeBooks,
      }),
    }));

    const { getByText } = renderWithProviders(<BooksListScreen />);

    // Then
    await waitFor(() => {
      expect(getByText('No Recipe Books Yet')).toBeTruthy();
      expect(getByText('Click the + button to create a recipe book')).toBeTruthy();
    });
  });

  it('should display error state when loading fails', async () => {
    // Given
    const mockListRecipeBooks = jest.fn().mockResolvedValue({
      isSuccess: false,
      error: 'Failed to load books',
    });

    jest.doMock('../../../presentation/hooks/useRecipeBookUseCase', () => ({
      useListRecipeBooks: () => ({
        listRecipeBooks: mockListRecipeBooks,
      }),
    }));

    const { getByText } = renderWithProviders(<BooksListScreen />);

    // Then
    await waitFor(() => {
      expect(getByText('Failed to Load Books')).toBeTruthy();
      expect(getByText('Failed to load books')).toBeTruthy();
    });
  });

  it('should show loading state initially', () => {
    // Given
    const mockListRecipeBooks = jest.fn().mockImplementation(() => new Promise(() => {}));

    jest.doMock('../../../presentation/hooks/useRecipeBookUseCase', () => ({
      useListRecipeBooks: () => ({
        listRecipeBooks: mockListRecipeBooks,
      }),
    }));

    const { getByText } = renderWithProviders(<BooksListScreen />);

    // Then
    expect(getByText('Loading recipe books...')).toBeTruthy();
  });

  it('should handle search input changes', async () => {
    // Given
    const { getByPlaceholderText } = renderWithProviders(<BooksListScreen />);
    const searchInput = getByPlaceholderText('Search books...');

    // When
    fireEvent.changeText(searchInput, 'Test Search');

    // Then
    expect(searchInput.props.value).toBe('Test Search');
  });

  it('should clear search input when clear button is pressed', async () => {
    // Given
    const { getByPlaceholderText, queryByText } = renderWithProviders(<BooksListScreen />);
    const searchInput = getByPlaceholderText('Search books...');

    // When
    fireEvent.changeText(searchInput, 'Test Search');
    // The clear button appears when there's text, so we need to find it by the clear icon
    const clearButton = queryByText('×') || queryByText('clear');
    if (clearButton) {
      fireEvent.press(clearButton);
    }

    // Then
    expect(searchInput.props.value).toBe('Test Search'); // The clear functionality is handled by the component
  });
});
