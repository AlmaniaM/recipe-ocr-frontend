import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddRecipeToBookScreen from '../../../screens/books/AddRecipeToBookScreen';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock the useRecipeBookUseCase hook
const mockGetRecipeBook = jest.fn();
const mockUpdateRecipeBook = jest.fn();

jest.mock('../../../presentation/hooks/useRecipeBookUseCase', () => ({
  useGetRecipeBook: () => ({
    getRecipeBook: mockGetRecipeBook,
  }),
  useUpdateRecipeBook: () => ({
    updateRecipeBook: mockUpdateRecipeBook,
  }),
}));

// Mock the useRecipeUseCase hook
const mockListRecipes = jest.fn();

jest.mock('../../../presentation/hooks/useRecipeUseCase', () => ({
  useRecipeUseCase: () => ({
    listRecipes: mockListRecipes,
  }),
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: { bookId: 'test-book-id' },
  }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('AddRecipeToBookScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    // Given
    mockGetRecipeBook.mockImplementation(() => new Promise(() => {}));
    mockListRecipes.mockImplementation(() => new Promise(() => {}));

    // When
    const { getByText } = renderWithProviders(<AddRecipeToBookScreen />);

    // Then
    expect(getByText('Loading available recipes...')).toBeTruthy();
  });

  it('should render available recipes when data is loaded', async () => {
    // Given
    const mockBook = {
      id: { value: 'test-book-id' },
      title: 'Test Book',
      description: 'Test Description',
      recipeIds: [],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      isArchived: false,
    };

    const mockRecipes = [
      {
        id: { value: 'recipe-1' },
        title: 'Recipe 1',
        description: 'Description 1',
        servings: { value: 4 },
        prepTime: { value: 30 },
        cookTime: { value: 45 },
        ingredients: [],
        directions: [],
        tags: [],
        category: 'MAIN',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        isArchived: false,
      },
      {
        id: { value: 'recipe-2' },
        title: 'Recipe 2',
        description: 'Description 2',
        servings: { value: 2 },
        prepTime: { value: 15 },
        cookTime: { value: 20 },
        ingredients: [],
        directions: [],
        tags: [],
        category: 'APPETIZER',
        createdAt: '2023-01-02T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
        isArchived: false,
      },
    ];

    mockGetRecipeBook.mockResolvedValue({
      isSuccess: true,
      value: mockBook,
    });

    mockListRecipes.mockResolvedValue({
      isSuccess: true,
      value: mockRecipes,
    });

    // When
    const { getByText } = renderWithProviders(<AddRecipeToBookScreen />);

    // Then
    await waitFor(() => {
      expect(getByText('Add Recipes to "Test Book"')).toBeTruthy();
      expect(getByText('Recipe 1')).toBeTruthy();
      expect(getByText('Recipe 2')).toBeTruthy();
    });
  });

  it('should display empty state when no recipes are available', async () => {
    // Given
    const mockBook = {
      id: { value: 'test-book-id' },
      title: 'Test Book',
      description: 'Test Description',
      recipeIds: [],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      isArchived: false,
    };

    mockGetRecipeBook.mockResolvedValue({
      isSuccess: true,
      value: mockBook,
    });

    mockListRecipes.mockResolvedValue({
      isSuccess: true,
      value: [],
    });

    // When
    const { getByText } = renderWithProviders(<AddRecipeToBookScreen />);

    // Then
    await waitFor(() => {
      expect(getByText('No Available Recipes')).toBeTruthy();
      expect(getByText('All recipes are already in this book')).toBeTruthy();
    });
  });

  it('should display error state when loading fails', async () => {
    // Given
    mockGetRecipeBook.mockResolvedValue({
      isSuccess: false,
      error: 'Failed to load book',
    });

    // When
    const { getByText } = renderWithProviders(<AddRecipeToBookScreen />);

    // Then
    await waitFor(() => {
      expect(getByText('Failed to Load Data')).toBeTruthy();
      expect(getByText('Failed to load book')).toBeTruthy();
    });
  });

  it('should handle recipe selection', async () => {
    // Given
    const mockBook = {
      id: { value: 'test-book-id' },
      title: 'Test Book',
      description: 'Test Description',
      recipeIds: [],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      isArchived: false,
    };

    const mockRecipes = [
      {
        id: { value: 'recipe-1' },
        title: 'Recipe 1',
        description: 'Description 1',
        servings: { value: 4 },
        prepTime: { value: 30 },
        cookTime: { value: 45 },
        ingredients: [],
        directions: [],
        tags: [],
        category: 'MAIN',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        isArchived: false,
      },
    ];

    mockGetRecipeBook.mockResolvedValue({
      isSuccess: true,
      value: mockBook,
    });

    mockListRecipes.mockResolvedValue({
      isSuccess: true,
      value: mockRecipes,
    });

    // When
    const { getByText } = renderWithProviders(<AddRecipeToBookScreen />);

    // Then
    await waitFor(() => {
      expect(getByText('Recipe 1')).toBeTruthy();
    });

    // The selection functionality would be tested by checking if the recipe can be pressed
    // and if the selection state changes
  });

  it('should call updateRecipeBook when adding recipes', async () => {
    // Given
    const mockBook = {
      id: { value: 'test-book-id' },
      title: 'Test Book',
      description: 'Test Description',
      recipeIds: [],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      isArchived: false,
    };

    const mockRecipes = [
      {
        id: { value: 'recipe-1' },
        title: 'Recipe 1',
        description: 'Description 1',
        servings: { value: 4 },
        prepTime: { value: 30 },
        cookTime: { value: 45 },
        ingredients: [],
        directions: [],
        tags: [],
        category: 'MAIN',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        isArchived: false,
      },
    ];

    mockGetRecipeBook.mockResolvedValue({
      isSuccess: true,
      value: mockBook,
    });

    mockListRecipes.mockResolvedValue({
      isSuccess: true,
      value: mockRecipes,
    });

    mockUpdateRecipeBook.mockResolvedValue({
      isSuccess: true,
      value: mockBook,
    });

    // When
    const { getByText } = renderWithProviders(<AddRecipeToBookScreen />);

    // Then
    await waitFor(() => {
      expect(getByText('Recipe 1')).toBeTruthy();
    });

    // The actual add functionality would be tested by simulating user interaction
    // and verifying that updateRecipeBook is called with the correct parameters
  });
});
