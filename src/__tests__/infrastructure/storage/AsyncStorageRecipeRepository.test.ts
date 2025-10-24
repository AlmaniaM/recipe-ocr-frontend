import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageRecipeRepository } from '../../../infrastructure/storage/AsyncStorageRecipeRepository';
import { Recipe } from '../../../domain/entities/Recipe';
import { RecipeId } from '../../../domain/valueObjects/RecipeId';
import { RecipeCategory } from '../../../domain/enums/RecipeCategory';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
}));

describe('AsyncStorageRecipeRepository', () => {
  let repository: AsyncStorageRecipeRepository;
  let mockAsyncStorage: jest.Mocked<typeof AsyncStorage>;

  beforeEach(() => {
    repository = new AsyncStorageRecipeRepository();
    mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  describe('save', () => {
    it('should save a recipe successfully', async () => {
      // Arrange
      const recipe = createMockRecipe();
      mockAsyncStorage.getItem.mockResolvedValue(null); // No existing recipes

      // Act
      const result = await repository.save(recipe);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'recipes',
        expect.stringContaining(recipe.id.value)
      );
    });

    it('should handle save errors gracefully', async () => {
      // Arrange
      const recipe = createMockRecipe();
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      // Act
      const result = await repository.save(recipe);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Failed to save recipe');
    });
  });

  describe('findById', () => {
    it('should find an existing recipe by ID', async () => {
      // Arrange
      const recipe = createMockRecipe();
      const serializedRecipe = serializeRecipe(recipe);
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([[recipe.id.value, serializedRecipe]]));

      // Act
      const result = await repository.findById(recipe.id);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr(null)).toBeDefined();
    });

    it('should return null for non-existent recipe', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      mockAsyncStorage.getItem.mockResolvedValue(null);

      // Act
      const result = await repository.findById(recipeId);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr(null)).toBeNull();
    });

    it('should handle find errors gracefully', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

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
      const serializedRecipes = [
        [recipe1.id.value, serializeRecipe(recipe1)],
        [recipe2.id.value, serializeRecipe(recipe2)]
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(serializedRecipes));

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr([])).toHaveLength(2);
    });

    it('should return empty array when no recipes exist', async () => {
      // Arrange
      mockAsyncStorage.getItem.mockResolvedValue(null);

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
      const serializedRecipes = [
        [mainDishRecipe.id.value, serializeRecipe(mainDishRecipe)],
        [dessertRecipe.id.value, serializeRecipe(dessertRecipe)]
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(serializedRecipes));

      // Act
      const result = await repository.findByCategory(RecipeCategory.MainCourse);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr([])).toHaveLength(1);
    });
  });

  describe('search', () => {
    it('should search recipes by title', async () => {
      // Arrange
      const recipe1 = createMockRecipe(RecipeCategory.MainCourse, 'Chicken Pasta');
      const recipe2 = createMockRecipe(RecipeCategory.Dessert, 'Chocolate Cake');
      const serializedRecipes = [
        [recipe1.id.value, serializeRecipe(recipe1)],
        [recipe2.id.value, serializeRecipe(recipe2)]
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(serializedRecipes));

      // Act
      const result = await repository.search('chicken');

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr([])).toHaveLength(1);
    });

    it('should search recipes by description', async () => {
      // Arrange
      const recipe1 = createMockRecipe(RecipeCategory.MainCourse, 'Pasta', 'Delicious chicken pasta');
      const recipe2 = createMockRecipe(RecipeCategory.Dessert, 'Cake', 'Sweet chocolate cake');
      const serializedRecipes = [
        [recipe1.id.value, serializeRecipe(recipe1)],
        [recipe2.id.value, serializeRecipe(recipe2)]
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(serializedRecipes));

      // Act
      const result = await repository.search('chicken');

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr([])).toHaveLength(1);
    });

    it('should return empty array for empty search query', async () => {
      // Act
      const result = await repository.search('');

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr([])).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update an existing recipe', async () => {
      // Arrange
      const recipe = createMockRecipe();
      const serializedRecipe = serializeRecipe(recipe);
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([[recipe.id.value, serializedRecipe]]));

      // Act
      const result = await repository.update(recipe);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should return error for non-existent recipe', async () => {
      // Arrange
      const recipe = createMockRecipe();
      mockAsyncStorage.getItem.mockResolvedValue(null);

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
      const serializedRecipe = serializeRecipe(recipe);
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([[recipe.id.value, serializedRecipe]]));

      // Act
      const result = await repository.delete(recipe.id);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should return error for non-existent recipe', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      mockAsyncStorage.getItem.mockResolvedValue(null);

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
      const recipe = createMockRecipe();
      const serializedRecipe = serializeRecipe(recipe);
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([[recipe.id.value, serializedRecipe]]));

      // Act
      const result = await repository.exists(recipe.id);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValueOr(false)).toBe(true);
    });

    it('should return false for non-existent recipe', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      mockAsyncStorage.getItem.mockResolvedValue(null);

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
      const recipe1 = createMockRecipe();
      const recipe2 = createMockRecipe();
      const serializedRecipes = [
        [recipe1.id.value, serializeRecipe(recipe1)],
        [recipe2.id.value, serializeRecipe(recipe2)]
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(serializedRecipes));

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
      const recipes = Array.from({ length: 5 }, () => createMockRecipe());
      const serializedRecipes = recipes.map(recipe => [recipe.id.value, serializeRecipe(recipe)]);
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(serializedRecipes));

      // Act
      const result = await repository.findWithPagination(1, 2);

      // Assert
      expect(result.isSuccess).toBe(true);
      const paginatedResult = result.getValueOr({ recipes: [], totalCount: 0, hasNextPage: false })!;
      expect(paginatedResult.recipes).toHaveLength(2);
      expect(paginatedResult.totalCount).toBe(5);
      expect(paginatedResult.hasNextPage).toBe(true);
    });

    it('should handle last page correctly', async () => {
      // Arrange
      const recipes = Array.from({ length: 3 }, () => createMockRecipe());
      const serializedRecipes = recipes.map(recipe => [recipe.id.value, serializeRecipe(recipe)]);
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(serializedRecipes));

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
  function createMockRecipe(category: RecipeCategory = RecipeCategory.MainCourse, title: string = 'Test Recipe', description: string = 'Test Description'): Recipe {
    const recipeResult = Recipe.create(title, description, category);
    return recipeResult.getValueOrThrow();
  }

  function serializeRecipe(recipe: Recipe): any {
    return {
      id: recipe.id.value,
      title: recipe.title,
      description: recipe.description,
      category: recipe.category,
      prepTime: recipe.prepTime ? {
        minMinutes: recipe.prepTime.minMinutes,
        maxMinutes: recipe.prepTime.maxMinutes
      } : null,
      cookTime: recipe.cookTime ? {
        minMinutes: recipe.cookTime.minMinutes,
        maxMinutes: recipe.cookTime.maxMinutes
      } : null,
      servings: recipe.servings ? {
        count: recipe.servings.count,
        description: recipe.servings.description
      } : null,
      source: recipe.source,
      imagePath: recipe.imagePath,
      imageUrl: recipe.imageUrl,
      isLocal: recipe.isLocal,
      createdAt: recipe.createdAt.toISOString(),
      updatedAt: recipe.updatedAt.toISOString(),
      isArchived: recipe.isArchived,
      ingredients: [],
      directions: [],
      tags: []
    };
  }
});
