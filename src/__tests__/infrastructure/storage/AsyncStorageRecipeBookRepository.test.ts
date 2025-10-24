import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageRecipeBookRepository } from '../../../infrastructure/storage/AsyncStorageRecipeBookRepository';
import { RecipeBook } from '../../../domain/entities/RecipeBook';
import { RecipeBookId } from '../../../domain/valueObjects/RecipeBookId';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
}));

describe('AsyncStorageRecipeBookRepository', () => {
  let repository: AsyncStorageRecipeBookRepository;
  let mockAsyncStorage: jest.Mocked<typeof AsyncStorage>;

  beforeEach(() => {
    repository = new AsyncStorageRecipeBookRepository();
    mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  describe('save', () => {
    it('should save a recipe book successfully', async () => {
      // Arrange
      const recipeBook = createMockRecipeBook();
      mockAsyncStorage.getItem.mockResolvedValue(null); // No existing recipe books

      // Act
      const result = await repository.save(recipeBook);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'recipe_books',
        expect.stringContaining(recipeBook.id.value)
      );
    });

    it('should handle save errors gracefully', async () => {
      // Arrange
      const recipeBook = createMockRecipeBook();
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      // Act
      const result = await repository.save(recipeBook);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Failed to save recipe book');
    });
  });

  describe('findById', () => {
    it('should find an existing recipe book by ID', async () => {
      // Arrange
      const recipeBook = createMockRecipeBook();
      const serializedRecipeBook = serializeRecipeBook(recipeBook);
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([[recipeBook.id.value, serializedRecipeBook]]));

      // Act
      const result = await repository.findById(recipeBook.id);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr(null)).toBeDefined();
    });

    it('should return null for non-existent recipe book', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId();
      mockAsyncStorage.getItem.mockResolvedValue(null);

      // Act
      const result = await repository.findById(recipeBookId);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr(null)).toBeNull();
    });

    it('should handle find errors gracefully', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId();
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      // Act
      const result = await repository.findById(recipeBookId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Failed to find recipe book by ID');
    });
  });

  describe('findAll', () => {
    it('should return all recipe books', async () => {
      // Arrange
      const recipeBook1 = createMockRecipeBook();
      const recipeBook2 = createMockRecipeBook();
      const serializedRecipeBooks = [
        [recipeBook1.id.value, serializeRecipeBook(recipeBook1)],
        [recipeBook2.id.value, serializeRecipeBook(recipeBook2)]
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(serializedRecipeBooks));

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr([])).toHaveLength(2);
    });

    it('should return empty array when no recipe books exist', async () => {
      // Arrange
      mockAsyncStorage.getItem.mockResolvedValue(null);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr([])).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update an existing recipe book', async () => {
      // Arrange
      const recipeBook = createMockRecipeBook();
      const serializedRecipeBook = serializeRecipeBook(recipeBook);
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([[recipeBook.id.value, serializedRecipeBook]]));

      // Act
      const result = await repository.update(recipeBook);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should return error for non-existent recipe book', async () => {
      // Arrange
      const recipeBook = createMockRecipeBook();
      mockAsyncStorage.getItem.mockResolvedValue(null);

      // Act
      const result = await repository.update(recipeBook);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe book not found');
    });
  });

  describe('delete', () => {
    it('should delete an existing recipe book', async () => {
      // Arrange
      const recipeBook = createMockRecipeBook();
      const serializedRecipeBook = serializeRecipeBook(recipeBook);
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([[recipeBook.id.value, serializedRecipeBook]]));

      // Act
      const result = await repository.delete(recipeBook.id);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should return error for non-existent recipe book', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId();
      mockAsyncStorage.getItem.mockResolvedValue(null);

      // Act
      const result = await repository.delete(recipeBookId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe book not found');
    });
  });

  describe('exists', () => {
    it('should return true for existing recipe book', async () => {
      // Arrange
      const recipeBook = createMockRecipeBook();
      const serializedRecipeBook = serializeRecipeBook(recipeBook);
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([[recipeBook.id.value, serializedRecipeBook]]));

      // Act
      const result = await repository.exists(recipeBook.id);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr(false)).toBe(true);
    });

    it('should return false for non-existent recipe book', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId();
      mockAsyncStorage.getItem.mockResolvedValue(null);

      // Act
      const result = await repository.exists(recipeBookId);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr(true)).toBe(false);
    });
  });

  describe('count', () => {
    it('should return correct count of recipe books', async () => {
      // Arrange
      const recipeBook1 = createMockRecipeBook();
      const recipeBook2 = createMockRecipeBook();
      const serializedRecipeBooks = [
        [recipeBook1.id.value, serializeRecipeBook(recipeBook1)],
        [recipeBook2.id.value, serializeRecipeBook(recipeBook2)]
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(serializedRecipeBooks));

      // Act
      const result = await repository.count();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr(0)).toBe(2);
    });
  });

  describe('findWithPagination', () => {
    it('should return paginated results', async () => {
      // Arrange
      const recipeBooks = Array.from({ length: 5 }, () => createMockRecipeBook());
      const serializedRecipeBooks = recipeBooks.map(recipeBook => [recipeBook.id.value, serializeRecipeBook(recipeBook)]);
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(serializedRecipeBooks));

      // Act
      const result = await repository.findWithPagination(1, 2);

      // Assert
      expect(result.isSuccess).toBe(true);
      const paginatedResult = result.getValueOr({ recipeBooks: [], totalCount: 0, hasNextPage: false })!;
      expect(paginatedResult.recipeBooks).toHaveLength(2);
      expect(paginatedResult.totalCount).toBe(5);
      expect(paginatedResult.hasNextPage).toBe(true);
    });

    it('should handle last page correctly', async () => {
      // Arrange
      const recipeBooks = Array.from({ length: 3 }, () => createMockRecipeBook());
      const serializedRecipeBooks = recipeBooks.map(recipeBook => [recipeBook.id.value, serializeRecipeBook(recipeBook)]);
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(serializedRecipeBooks));

      // Act
      const result = await repository.findWithPagination(2, 2);

      // Assert
      expect(result.isSuccess).toBe(true);
      const paginatedResult = result.getValueOr({ recipeBooks: [], totalCount: 0, hasNextPage: false })!;
      expect(paginatedResult.recipeBooks).toHaveLength(1);
      expect(paginatedResult.totalCount).toBe(3);
      expect(paginatedResult.hasNextPage).toBe(false);
    });
  });

  // Helper functions
  function createMockRecipeBook(title: string = 'Test Recipe Book', description: string = 'Test Description'): RecipeBook {
    const recipeBookResult = RecipeBook.create(title, description);
    return recipeBookResult.getValueOrThrow();
  }

  function serializeRecipeBook(recipeBook: RecipeBook): any {
    return {
      id: recipeBook.id.value,
      title: recipeBook.title,
      description: recipeBook.description,
      categorySortOrder: recipeBook.categorySortOrder,
      isLocal: recipeBook.isLocal,
      createdAt: recipeBook.createdAt.toISOString(),
      updatedAt: recipeBook.updatedAt.toISOString(),
      isArchived: recipeBook.isArchived,
      recipeIds: recipeBook.recipeIds.map(id => id.value)
    };
  }
});
