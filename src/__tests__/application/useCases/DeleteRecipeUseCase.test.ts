import { DeleteRecipeUseCase } from '../../../application/useCases/recipes/DeleteRecipeUseCase';
import { IRecipeRepository } from '../../../application/ports/IRecipeRepository';
import { Recipe } from '../../../domain/entities/Recipe';
import { RecipeCategory } from '../../../domain/enums/RecipeCategory';
import { Result } from '../../../domain/common/Result';
import { RecipeId } from '../../../domain/valueObjects/RecipeId';

// Mock the repository
const mockRecipeRepository: jest.Mocked<IRecipeRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByCategory: jest.fn(),
  search: jest.fn(),
  findWithPagination: jest.fn(),
  findByTags: jest.fn(),
  exists: jest.fn(),
  delete: jest.fn(),
};

describe('DeleteRecipeUseCase', () => {
  let useCase: DeleteRecipeUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DeleteRecipeUseCase(mockRecipeRepository);
  });

  describe('execute', () => {
    it('should archive a recipe by default', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      const existingRecipe = Recipe.create('Test Recipe', 'A test recipe', RecipeCategory.MainCourse).value;
      
      mockRecipeRepository.exists.mockResolvedValue(Result.success(true));
      mockRecipeRepository.findById.mockResolvedValue(Result.success(existingRecipe));
      mockRecipeRepository.save.mockResolvedValue(Result.success(existingRecipe));

      // Act
      const result = await useCase.execute(recipeId.value);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockRecipeRepository.exists).toHaveBeenCalledWith(recipeId);
      expect(mockRecipeRepository.findById).toHaveBeenCalledWith(recipeId);
      expect(mockRecipeRepository.save).toHaveBeenCalledTimes(1);
      expect(mockRecipeRepository.delete).not.toHaveBeenCalled();
    });

    it('should permanently delete a recipe when requested', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      
      mockRecipeRepository.exists.mockResolvedValue(Result.success(true));
      mockRecipeRepository.delete.mockResolvedValue(Result.successEmpty());

      // Act
      const result = await useCase.execute(recipeId.value, true);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockRecipeRepository.exists).toHaveBeenCalledWith(recipeId);
      expect(mockRecipeRepository.delete).toHaveBeenCalledWith(recipeId);
      expect(mockRecipeRepository.findById).not.toHaveBeenCalled();
      expect(mockRecipeRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when recipe ID is invalid', async () => {
      // Arrange
      const invalidId = 'invalid-id';

      // Act
      const result = await useCase.execute(invalidId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Invalid recipe ID');
      expect(mockRecipeRepository.exists).not.toHaveBeenCalled();
    });

    it('should fail when recipe does not exist', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      
      mockRecipeRepository.exists.mockResolvedValue(Result.success(false));

      // Act
      const result = await useCase.execute(recipeId.value);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe not found');
      expect(mockRecipeRepository.findById).not.toHaveBeenCalled();
      expect(mockRecipeRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when recipe is already archived', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      const existingRecipe = Recipe.create('Test Recipe', 'A test recipe', RecipeCategory.MainCourse).value;
      const archivedRecipe = existingRecipe.archive().value;
      
      mockRecipeRepository.exists.mockResolvedValue(Result.success(true));
      mockRecipeRepository.findById.mockResolvedValue(Result.success(archivedRecipe));

      // Act
      const result = await useCase.execute(recipeId.value);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe is already archived');
      expect(mockRecipeRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when repository exists check fails', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      
      mockRecipeRepository.exists.mockResolvedValue(Result.failure('Database error'));

      // Act
      const result = await useCase.execute(recipeId.value);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Database error');
      expect(mockRecipeRepository.findById).not.toHaveBeenCalled();
    });

    it('should fail when repository findById fails', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      
      mockRecipeRepository.exists.mockResolvedValue(Result.success(true));
      mockRecipeRepository.findById.mockResolvedValue(Result.failure('Database error'));

      // Act
      const result = await useCase.execute(recipeId.value);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Database error');
      expect(mockRecipeRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when repository save fails', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      const existingRecipe = Recipe.create('Test Recipe', 'A test recipe', RecipeCategory.MainCourse).value;
      
      mockRecipeRepository.exists.mockResolvedValue(Result.success(true));
      mockRecipeRepository.findById.mockResolvedValue(Result.success(existingRecipe));
      mockRecipeRepository.save.mockResolvedValue(Result.failure('Save error'));

      // Act
      const result = await useCase.execute(recipeId.value);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Save error');
    });

    it('should fail when repository delete fails', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      
      mockRecipeRepository.exists.mockResolvedValue(Result.success(true));
      mockRecipeRepository.delete.mockResolvedValue(Result.failure('Delete error'));

      // Act
      const result = await useCase.execute(recipeId.value, true);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Delete error');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      
      mockRecipeRepository.exists.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await useCase.execute(recipeId.value);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Failed to delete recipe');
      expect(result.error).toContain('Unexpected error');
    });
  });

  describe('executeMultiple', () => {
    it('should delete multiple recipes successfully', async () => {
      // Arrange
      const recipeId1 = RecipeId.newId();
      const recipeId2 = RecipeId.newId();
      const recipeId3 = RecipeId.newId();
      const ids = [recipeId1.value, recipeId2.value, recipeId3.value];
      
      const existingRecipe1 = Recipe.create('Recipe 1', 'Description 1', RecipeCategory.MainCourse).value;
      const existingRecipe2 = Recipe.create('Recipe 2', 'Description 2', RecipeCategory.MainCourse).value;
      const existingRecipe3 = Recipe.create('Recipe 3', 'Description 3', RecipeCategory.MainCourse).value;
      
      mockRecipeRepository.exists
        .mockResolvedValueOnce(Result.success(true))
        .mockResolvedValueOnce(Result.success(true))
        .mockResolvedValueOnce(Result.success(true));
      
      mockRecipeRepository.findById
        .mockResolvedValueOnce(Result.success(existingRecipe1))
        .mockResolvedValueOnce(Result.success(existingRecipe2))
        .mockResolvedValueOnce(Result.success(existingRecipe3));
      
      mockRecipeRepository.save
        .mockResolvedValue(Result.success(existingRecipe1))
        .mockResolvedValue(Result.success(existingRecipe2))
        .mockResolvedValue(Result.success(existingRecipe3));

      // Act
      const result = await useCase.executeMultiple(ids);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value?.successCount).toBe(3);
      expect(result.value?.errors).toHaveLength(0);
    });

    it('should handle partial failures', async () => {
      // Arrange
      const recipeId1 = RecipeId.newId();
      const recipeId2 = RecipeId.newId();
      const ids = [recipeId1.value, recipeId2.value];
      
      const existingRecipe1 = Recipe.create('Recipe 1', 'Description 1', RecipeCategory.MainCourse).value;
      
      mockRecipeRepository.exists
        .mockResolvedValueOnce(Result.success(true))
        .mockResolvedValueOnce(Result.success(false)); // Second recipe doesn't exist
      
      mockRecipeRepository.findById.mockResolvedValueOnce(Result.success(existingRecipe1));
      mockRecipeRepository.save.mockResolvedValue(Result.success(existingRecipe1));

      // Act
      const result = await useCase.executeMultiple(ids);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value?.successCount).toBe(1);
      expect(result.value?.errors).toHaveLength(1);
      expect(result.value?.errors[0]).toContain('Recipe not found');
    });

    it('should fail when all deletions fail', async () => {
      // Arrange
      const recipeId1 = RecipeId.newId();
      const recipeId2 = RecipeId.newId();
      const ids = [recipeId1.value, recipeId2.value];
      
      mockRecipeRepository.exists
        .mockResolvedValueOnce(Result.success(false))
        .mockResolvedValueOnce(Result.success(false));

      // Act
      const result = await useCase.executeMultiple(ids);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('All deletions failed');
    });

    it('should fail when no IDs provided', async () => {
      // Act
      const result = await useCase.executeMultiple([]);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe IDs are required');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      const ids = [recipeId.value];
      
      mockRecipeRepository.exists.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await useCase.executeMultiple(ids);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Failed to delete multiple recipes');
      expect(result.error).toContain('Unexpected error');
    });
  });

  describe('restore', () => {
    it('should restore an archived recipe', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      const existingRecipe = Recipe.create('Test Recipe', 'A test recipe', RecipeCategory.MainCourse).value;
      const archivedRecipe = existingRecipe.archive().value;
      
      mockRecipeRepository.findById.mockResolvedValue(Result.success(archivedRecipe));
      mockRecipeRepository.save.mockResolvedValue(Result.success(existingRecipe));

      // Act
      const result = await useCase.restore(recipeId.value);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockRecipeRepository.findById).toHaveBeenCalledWith(recipeId);
      expect(mockRecipeRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should fail when recipe is not found', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      
      mockRecipeRepository.findById.mockResolvedValue(Result.success(null));

      // Act
      const result = await useCase.restore(recipeId.value);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe not found');
      expect(mockRecipeRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when recipe is not archived', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      const existingRecipe = Recipe.create('Test Recipe', 'A test recipe', RecipeCategory.MainCourse).value;
      
      mockRecipeRepository.findById.mockResolvedValue(Result.success(existingRecipe));

      // Act
      const result = await useCase.restore(recipeId.value);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe is not archived');
      expect(mockRecipeRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when repository findById fails', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      
      mockRecipeRepository.findById.mockResolvedValue(Result.failure('Database error'));

      // Act
      const result = await useCase.restore(recipeId.value);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Database error');
      expect(mockRecipeRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when repository save fails', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      const existingRecipe = Recipe.create('Test Recipe', 'A test recipe', RecipeCategory.MainCourse).value;
      const archivedRecipe = existingRecipe.archive().value;
      
      mockRecipeRepository.findById.mockResolvedValue(Result.success(archivedRecipe));
      mockRecipeRepository.save.mockResolvedValue(Result.failure('Save error'));

      // Act
      const result = await useCase.restore(recipeId.value);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Save error');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const recipeId = RecipeId.newId();
      
      mockRecipeRepository.findById.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await useCase.restore(recipeId.value);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Failed to restore recipe');
      expect(result.error).toContain('Unexpected error');
    });
  });
});
