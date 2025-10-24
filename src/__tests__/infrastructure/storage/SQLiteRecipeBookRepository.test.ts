import * as SQLite from 'expo-sqlite';
import { SQLiteRecipeBookRepository } from '../../../infrastructure/storage/SQLiteRecipeBookRepository';
import { RecipeBook } from '../../../domain/entities/RecipeBook';
import { RecipeBookId } from '../../../domain/valueObjects/RecipeBookId';

// Mock SQLite
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}));

describe('SQLiteRecipeBookRepository', () => {
  let repository: SQLiteRecipeBookRepository;
  let mockDatabase: any;

  beforeEach(() => {
    // Create mock database
    mockDatabase = {
      execAsync: jest.fn(),
      runAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      getAllAsync: jest.fn(),
    };

    // Mock openDatabaseAsync to return our mock database
    (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockDatabase);

    repository = new SQLiteRecipeBookRepository();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save a recipe book successfully', async () => {
      // Arrange
      const recipeBook = createMockRecipeBook();

      // Act
      const result = await repository.save(recipeBook);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO recipe_books'),
        expect.arrayContaining([recipeBook.id.value, recipeBook.title])
      );
    });

    it('should handle save errors gracefully', async () => {
      // Arrange
      const recipeBook = createMockRecipeBook();
      mockDatabase.runAsync.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await repository.save(recipeBook);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Failed to save recipe book');
    });

    it('should return error when database is not initialized', async () => {
      // Arrange
      const repository = new SQLiteRecipeBookRepository();
      // Don't initialize the database
      (repository as any).db = null;
      const recipeBook = createMockRecipeBook();

      // Act
      const result = await repository.save(recipeBook);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Database not initialized');
    });
  });

  describe('findById', () => {
    it('should find an existing recipe book by ID', async () => {
      // Arrange
      const recipeBook = createMockRecipeBook();
      const mockRow = createMockRecipeBookRow(recipeBook);
      mockDatabase.getFirstAsync.mockResolvedValue(mockRow);

      // Act
      const result = await repository.findById(recipeBook.id);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockDatabase.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM recipe_books WHERE id = ?'),
        [recipeBook.id.value]
      );
    });

    it('should return null for non-existent recipe book', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId();
      mockDatabase.getFirstAsync.mockResolvedValue(null);

      // Act
      const result = await repository.findById(recipeBookId);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr(null)).toBeNull();
    });

    it('should handle find errors gracefully', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId();
      mockDatabase.getFirstAsync.mockRejectedValue(new Error('Database error'));

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
      const mockRows = [
        createMockRecipeBookRow(recipeBook1),
        createMockRecipeBookRow(recipeBook2)
      ];
      mockDatabase.getAllAsync.mockResolvedValue(mockRows);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM recipe_books WHERE is_archived = 0 ORDER BY created_at DESC')
      );
    });

    it('should return empty array when no recipe books exist', async () => {
      // Arrange
      mockDatabase.getAllAsync.mockResolvedValue([]);

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
      mockDatabase.getFirstAsync.mockResolvedValue({ id: recipeBook.id.value });
      mockDatabase.runAsync.mockResolvedValue({});

      // Act
      const result = await repository.update(recipeBook);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE recipe_books'),
        expect.arrayContaining([recipeBook.title, recipeBook.id.value])
      );
    });

    it('should return error for non-existent recipe book', async () => {
      // Arrange
      const recipeBook = createMockRecipeBook();
      mockDatabase.getFirstAsync.mockResolvedValue(null);

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
      mockDatabase.getFirstAsync.mockResolvedValue({ id: recipeBook.id.value });
      mockDatabase.runAsync.mockResolvedValue({});

      // Act
      const result = await repository.delete(recipeBook.id);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM recipe_books WHERE id = ?'),
        [recipeBook.id.value]
      );
    });

    it('should return error for non-existent recipe book', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId();
      mockDatabase.getFirstAsync.mockResolvedValue(null);

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
      const recipeBookId = RecipeBookId.newId();
      mockDatabase.getFirstAsync.mockResolvedValue({ '1': 1 });

      // Act
      const result = await repository.exists(recipeBookId);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr(false)).toBe(true);
    });

    it('should return false for non-existent recipe book', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId();
      mockDatabase.getFirstAsync.mockResolvedValue(null);

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
      mockDatabase.getFirstAsync.mockResolvedValue({ count: 3 });

      // Act
      const result = await repository.count();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr(0)).toBe(3);
    });
  });

  describe('findWithPagination', () => {
    it('should return paginated results', async () => {
      // Arrange
      const recipeBook = createMockRecipeBook();
      const mockRows = [createMockRecipeBookRow(recipeBook)];
      mockDatabase.getFirstAsync.mockResolvedValue({ count: 5 });
      mockDatabase.getAllAsync.mockResolvedValue(mockRows);

      // Act
      const result = await repository.findWithPagination(1, 2);

      // Assert
      expect(result.isSuccess).toBe(true);
      const paginatedResult = result.getValueOr({ recipeBooks: [], totalCount: 0, hasNextPage: false })!;
      expect(paginatedResult.recipeBooks).toHaveLength(1);
      expect(paginatedResult.totalCount).toBe(5);
      expect(paginatedResult.hasNextPage).toBe(true);
    });

    it('should handle last page correctly', async () => {
      // Arrange
      const recipeBook = createMockRecipeBook();
      const mockRows = [createMockRecipeBookRow(recipeBook)];
      mockDatabase.getFirstAsync.mockResolvedValue({ count: 3 });
      mockDatabase.getAllAsync.mockResolvedValue(mockRows);

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

  function createMockRecipeBookRow(recipeBook: RecipeBook): any {
    return {
      id: recipeBook.id.value,
      title: recipeBook.title,
      description: recipeBook.description,
      category_sort_order: JSON.stringify(recipeBook.categorySortOrder),
      is_local: recipeBook.isLocal ? 1 : 0,
      created_at: recipeBook.createdAt.toISOString(),
      updated_at: recipeBook.updatedAt.toISOString(),
      is_archived: recipeBook.isArchived ? 1 : 0
    };
  }
});
