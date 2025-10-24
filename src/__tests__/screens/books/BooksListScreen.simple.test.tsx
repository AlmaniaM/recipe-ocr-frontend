import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BooksListScreen from '../../../screens/books/BooksListScreen';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock the useRecipeBookUseCase hook
const mockListRecipeBooks = jest.fn();

jest.mock('../../../presentation/hooks/useRecipeBookUseCase', () => ({
  useListRecipeBooks: () => ({
    listRecipeBooks: mockListRecipeBooks,
  }),
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    // Given
    mockListRecipeBooks.mockImplementation(() => new Promise(() => {}));

    // When
    const { getByText } = renderWithProviders(<BooksListScreen />);

    // Then
    expect(getByText('Loading recipe books...')).toBeTruthy();
  });

  it('should render recipe books list when data is loaded', async () => {
    // Given
    const mockBooks = [
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
    ];

    mockListRecipeBooks.mockResolvedValue({
      isSuccess: true,
      value: mockBooks,
    });

    // When
    const { getByText } = renderWithProviders(<BooksListScreen />);

    // Then
    await waitFor(() => {
      expect(getByText('Test Book 1')).toBeTruthy();
      expect(getByText('Test Book 2')).toBeTruthy();
    });
  });

  it('should display empty state when no books are available', async () => {
    // Given
    mockListRecipeBooks.mockResolvedValue({
      isSuccess: true,
      value: [],
    });

    // When
    const { getByText } = renderWithProviders(<BooksListScreen />);

    // Then
    await waitFor(() => {
      expect(getByText('No Recipe Books Yet')).toBeTruthy();
      expect(getByText('Click the + button to create a recipe book')).toBeTruthy();
    });
  });

  it('should display error state when loading fails', async () => {
    // Given
    mockListRecipeBooks.mockResolvedValue({
      isSuccess: false,
      error: 'Failed to load books',
    });

    // When
    const { getByText } = renderWithProviders(<BooksListScreen />);

    // Then
    await waitFor(() => {
      expect(getByText('Failed to Load Books')).toBeTruthy();
      expect(getByText('Failed to load books')).toBeTruthy();
    });
  });

  it('should handle search input changes', async () => {
    // Given
    mockListRecipeBooks.mockResolvedValue({
      isSuccess: true,
      value: [],
    });

    const { getByPlaceholderText } = renderWithProviders(<BooksListScreen />);
    const searchInput = getByPlaceholderText('Search books...');

    // When
    fireEvent.changeText(searchInput, 'Test Search');

    // Then
    expect(searchInput.props.value).toBe('Test Search');
  });

  it('should call listRecipeBooks with search query when search is submitted', async () => {
    // Given
    mockListRecipeBooks.mockResolvedValue({
      isSuccess: true,
      value: [],
    });

    const { getByPlaceholderText } = renderWithProviders(<BooksListScreen />);
    const searchInput = getByPlaceholderText('Search books...');

    // When
    fireEvent.changeText(searchInput, 'Test Search');
    fireEvent(searchInput, 'submitEditing');

    // Then
    await waitFor(() => {
      expect(mockListRecipeBooks).toHaveBeenCalledWith({ search: 'Test Search' });
    });
  });
});
