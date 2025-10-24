import * as SQLite from 'expo-sqlite';
import { SQLiteRecipeRepository } from '../../../infrastructure/storage/SQLiteRecipeRepository';
import { Recipe } from '../../../domain/entities/Recipe';
import { RecipeId } from '../../../domain/valueObjects/RecipeId';
import { RecipeCategory } from '../../../domain/enums/RecipeCategory';

// Mock SQLite
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}));

describe('SQLiteRecipeRepository', () => {
  let repository: SQLiteRecipeRepository;
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

    repository = new SQLiteRecipeRepository();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save a recipe successfully', async () => {
      // Arrange
      const recipe = createMockRecipe();

      // Act
      const result = await repository.save(recipe);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO recipes'),
        expect.arrayContaining([recipe.id.value, recipe.title])
      );
    });

    it('should handle save errors gracefully', async () => {
      // Arrange
      const recipe = createMockRecipe();
      mockDatabase.runAsync.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await repository.save(recipe);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Failed to save recipe');
    });

    it('should return error when database is not initialized', async () => {
      // Arrange
      const repository = new SQLiteRecipeRepository();
      // Don't initialize the database
      (repository as any).db = null;
      const recipe = createMockRecipe();

      // Act
      const result = await repository.save(recipe);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Database not initialized');
    });
  });

  describe('findById', () => {
    it('should find an existing recipe by ID', async () => {
      // Arrange
      const recipe = createMockRecipe();
      const mockRow = createMockRecipeRow(recipe);
      mockDatabase.getFirstAsync.mockResolvedValue(mockRow);

      // Act
      const result = await repository.findById(recipe.id);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockDatabase.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM recipes WHERE id = ?'),
        [recipe.id.value]
      );
    });

    it('should return null for non-existent recipe', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      mockDatabase.getFirstAsync.mockResolvedValue(null);

      // Act
      const result = await repository.findById(recipeId);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr(null)).toBeNull();
    });

    it('should handle find errors gracefully', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      mockDatabase.getFirstAsync.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await repository.findById(recipeId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Failed to find recipe by ID');
    });
  });

  describe('findAll', () => {
    it('should return all recipes', async () => {
      // Arrange
      const recipe1 = createMockRecipe();
      const recipe2 = createMockRecipe();
      const mockRows = [
        createMockRecipeRow(recipe1),
        createMockRecipeRow(recipe2)
      ];
      mockDatabase.getAllAsync.mockResolvedValue(mockRows);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM recipes WHERE is_archived = 0 ORDER BY created_at DESC')
      );
    });

    it('should return empty array when no recipes exist', async () => {
      // Arrange
      mockDatabase.getAllAsync.mockResolvedValue([]);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr([])).toEqual([]);
    });
  });

  describe('findByCategory', () => {
    it('should filter recipes by category', async () => {
      // Arrange
      const mainDishRecipe = createMockRecipe(RecipeCategory.MainCourse);
      const dessertRecipe = createMockRecipe(RecipeCategory.Dessert);
      const mockRows = [
        createMockRecipeRow(mainDishRecipe),
        createMockRecipeRow(dessertRecipe)
      ];
      mockDatabase.getAllAsync.mockResolvedValue(mockRows);

      // Act
      const result = await repository.findByCategory(RecipeCategory.MainCourse);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE category = ? AND is_archived = 0'),
        [RecipeCategory.MainCourse]
      );
    });
  });

  describe('search', () => {
    it('should search recipes by title and description', async () => {
      // Arrange
      const recipe = createMockRecipe();
      const mockRows = [createMockRecipeRow(recipe)];
      mockDatabase.getAllAsync.mockResolvedValue(mockRows);

      // Act
      const result = await repository.search('chicken');

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE (LOWER(title) LIKE ? OR LOWER(description) LIKE ?)'),
        ['%chicken%', '%chicken%']
      );
    });

    it('should return empty array for empty search query', async () => {
      // Act
      const result = await repository.search('');

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr([])).toEqual([]);
    });
  });

  describe('findByTags', () => {
    it('should find recipes by tag IDs', async () => {
      // Arrange
      const recipe = createMockRecipe();
      const mockRows = [createMockRecipeRow(recipe)];
      mockDatabase.getAllAsync.mockResolvedValue(mockRows);
      const tagIds = ['tag1', 'tag2'];

      // Act
      const result = await repository.findByTags(tagIds);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('INNER JOIN recipe_tags'),
        tagIds
      );
    });

    it('should return empty array for empty tag IDs', async () => {
      // Act
      const result = await repository.findByTags([]);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr([])).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update an existing recipe', async () => {
      // Arrange
      const recipe = createMockRecipe();
      mockDatabase.getFirstAsync.mockResolvedValue({ id: recipe.id.value });
      mockDatabase.runAsync.mockResolvedValue({});

      // Act
      const result = await repository.update(recipe);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE recipes'),
        expect.arrayContaining([recipe.title, recipe.id.value])
      );
    });

    it('should return error for non-existent recipe', async () => {
      // Arrange
      const recipe = createMockRecipe();
      mockDatabase.getFirstAsync.mockResolvedValue(null);

      // Act
      const result = await repository.update(recipe);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe not found');
    });
  });

  describe('delete', () => {
    it('should delete an existing recipe', async () => {
      // Arrange
      const recipe = createMockRecipe();
      mockDatabase.getFirstAsync.mockResolvedValue({ id: recipe.id.value });
      mockDatabase.runAsync.mockResolvedValue({});

      // Act
      const result = await repository.delete(recipe.id);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM recipes WHERE id = ?'),
        [recipe.id.value]
      );
    });

    it('should return error for non-existent recipe', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      mockDatabase.getFirstAsync.mockResolvedValue(null);

      // Act
      const result = await repository.delete(recipeId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe not found');
    });
  });

  describe('exists', () => {
    it('should return true for existing recipe', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      mockDatabase.getFirstAsync.mockResolvedValue({ '1': 1 });

      // Act
      const result = await repository.exists(recipeId);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr(false)).toBe(true);
    });

    it('should return false for non-existent recipe', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      mockDatabase.getFirstAsync.mockResolvedValue(null);

      // Act
      const result = await repository.exists(recipeId);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr(true)).toBe(false);
    });
  });

  describe('count', () => {
    it('should return correct count of recipes', async () => {
      // Arrange
      mockDatabase.getFirstAsync.mockResolvedValue({ count: 5 });

      // Act
      const result = await repository.count();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr(0)).toBe(5);
    });
  });

  describe('findWithPagination', () => {
    it('should return paginated results', async () => {
      // Arrange
      const recipe = createMockRecipe();
      const mockRows = [createMockRecipeRow(recipe)];
      mockDatabase.getFirstAsync.mockResolvedValue({ count: 5 });
      mockDatabase.getAllAsync.mockResolvedValue(mockRows);

      // Act
      const result = await repository.findWithPagination(1, 2);

      // Assert
      expect(result.isSuccess).toBe(true);
      const paginatedResult = result.getValueOr({ recipes: [], totalCount: 0, hasNextPage: false })!;
      expect(paginatedResult.recipes).toHaveLength(1);
      expect(paginatedResult.totalCount).toBe(5);
      expect(paginatedResult.hasNextPage).toBe(true);
    });

    it('should handle last page correctly', async () => {
      // Arrange
      const recipe = createMockRecipe();
      const mockRows = [createMockRecipeRow(recipe)];
      mockDatabase.getFirstAsync.mockResolvedValue({ count: 3 });
      mockDatabase.getAllAsync.mockResolvedValue(mockRows);

      // Act
      const result = await repository.findWithPagination(2, 2);

      // Assert
      expect(result.isSuccess).toBe(true);
      const paginatedResult = result.getValueOr({ recipes: [], totalCount: 0, hasNextPage: false })!;
      expect(paginatedResult.recipes).toHaveLength(1);
      expect(paginatedResult.totalCount).toBe(3);
      expect(paginatedResult.hasNextPage).toBe(false);
    });
  });

  // Helper functions
  function createMockRecipe(category: RecipeCategory = RecipeCategory.MainCourse, title: string = 'Test Recipe'): Recipe {
    const recipeResult = Recipe.create(title, 'Test Description', category);
    return recipeResult.getValueOrThrow();
  }

  function createMockRecipeRow(recipe: Recipe): any {
    return {
      id: recipe.id.value,
      title: recipe.title,
      description: recipe.description,
      category: recipe.category,
      prep_time_minutes: null,
      prep_time_hours: null,
      cook_time_minutes: null,
      cook_time_hours: null,
      servings_min: null,
      servings_max: null,
      source: recipe.source,
      image_path: recipe.imagePath,
      image_url: recipe.imageUrl,
      is_local: recipe.isLocal ? 1 : 0,
      created_at: recipe.createdAt.toISOString(),
      updated_at: recipe.updatedAt.toISOString(),
      is_archived: recipe.isArchived ? 1 : 0
    };
  }
});
