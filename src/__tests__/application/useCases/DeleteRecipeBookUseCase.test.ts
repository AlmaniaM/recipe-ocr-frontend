import { DeleteRecipeBookUseCase } from '../../../application/useCases/recipeBooks/DeleteRecipeBookUseCase';
import { IRecipeBookRepository } from '../../../application/ports/IRecipeBookRepository';
import { RecipeBook } from '../../../domain/entities/RecipeBook';
import { RecipeBookId } from '../../../domain/valueObjects/RecipeBookId';
import { Result } from '../../../domain/common/Result';

// Mock the repository
const mockRecipeBookRepository: jest.Mocked<IRecipeBookRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(),
  count: jest.fn(),
  findWithPagination: jest.fn(),
};

describe('DeleteRecipeBookUseCase', () => {
  let useCase: DeleteRecipeBookUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DeleteRecipeBookUseCase(mockRecipeBookRepository);
  });

  describe('archive', () => {
    it('should archive a recipe book successfully', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      const existingBook = RecipeBook.create('My Recipe Book', 'Description').value!;
      
      mockRecipeBookRepository.exists.mockResolvedValue(Result.success(true));
      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(existingBook));
      mockRecipeBookRepository.save.mockResolvedValue(Result.successEmpty());

      // Act
      const result = await useCase.archive(recipeBookId);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockRecipeBookRepository.exists).toHaveBeenCalledWith(expect.any(RecipeBookId));
      expect(mockRecipeBookRepository.findById).toHaveBeenCalledWith(expect.any(RecipeBookId));
      expect(mockRecipeBookRepository.save).toHaveBeenCalledWith(expect.any(RecipeBook));
    });

    it('should fail when recipe book ID is invalid', async () => {
      // Arrange
      const invalidId = 'invalid-id';

      // Act
      const result = await useCase.archive(invalidId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Invalid RecipeBookId format');
      expect(mockRecipeBookRepository.exists).not.toHaveBeenCalled();
    });

    it('should fail when recipe book does not exist', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      
      mockRecipeBookRepository.exists.mockResolvedValue(Result.success(false));

      // Act
      const result = await useCase.archive(recipeBookId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(`Recipe book with ID ${recipeBookId} not found`);
      expect(mockRecipeBookRepository.findById).not.toHaveBeenCalled();
    });

    it('should fail when repository exists check fails', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      
      mockRecipeBookRepository.exists.mockResolvedValue(Result.failure('Database error'));

      // Act
      const result = await useCase.archive(recipeBookId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should fail when repository findById fails', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      
      mockRecipeBookRepository.exists.mockResolvedValue(Result.success(true));
      mockRecipeBookRepository.findById.mockResolvedValue(Result.failure('Database error'));

      // Act
      const result = await useCase.archive(recipeBookId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should fail when recipe book is already archived', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      const existingBook = RecipeBook.create('My Recipe Book', 'Description').value!;
      existingBook.archive(); // Already archived
      
      mockRecipeBookRepository.exists.mockResolvedValue(Result.success(true));
      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(existingBook));

      // Act
      const result = await useCase.archive(recipeBookId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Recipe book is already archived');
      expect(mockRecipeBookRepository.save).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      
      mockRecipeBookRepository.exists.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await useCase.archive(recipeBookId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Failed to archive recipe book: Unexpected error');
    });
  });

  describe('unarchive', () => {
    it('should unarchive a recipe book successfully', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      const existingBook = RecipeBook.create('My Recipe Book', 'Description').value!;
      existingBook.archive(); // Archive first
      
      mockRecipeBookRepository.exists.mockResolvedValue(Result.success(true));
      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(existingBook));
      mockRecipeBookRepository.save.mockResolvedValue(Result.successEmpty());

      // Act
      const result = await useCase.unarchive(recipeBookId);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockRecipeBookRepository.exists).toHaveBeenCalledWith(expect.any(RecipeBookId));
      expect(mockRecipeBookRepository.findById).toHaveBeenCalledWith(expect.any(RecipeBookId));
      expect(mockRecipeBookRepository.save).toHaveBeenCalledWith(expect.any(RecipeBook));
    });

    it('should fail when recipe book is not archived', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      const existingBook = RecipeBook.create('My Recipe Book', 'Description').value!;
      // Not archived
      
      mockRecipeBookRepository.exists.mockResolvedValue(Result.success(true));
      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(existingBook));

      // Act
      const result = await useCase.unarchive(recipeBookId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Recipe book is not archived');
      expect(mockRecipeBookRepository.save).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      
      mockRecipeBookRepository.exists.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await useCase.unarchive(recipeBookId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Failed to unarchive recipe book: Unexpected error');
    });
  });

  describe('deletePermanently', () => {
    it('should delete a recipe book permanently successfully', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      
      mockRecipeBookRepository.exists.mockResolvedValue(Result.success(true));
      mockRecipeBookRepository.delete.mockResolvedValue(Result.successEmpty());

      // Act
      const result = await useCase.deletePermanently(recipeBookId);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockRecipeBookRepository.exists).toHaveBeenCalledWith(expect.any(RecipeBookId));
      expect(mockRecipeBookRepository.delete).toHaveBeenCalledWith(expect.any(RecipeBookId));
    });

    it('should fail when recipe book does not exist', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      
      mockRecipeBookRepository.exists.mockResolvedValue(Result.success(false));

      // Act
      const result = await useCase.deletePermanently(recipeBookId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(`Recipe book with ID ${recipeBookId} not found`);
      expect(mockRecipeBookRepository.delete).not.toHaveBeenCalled();
    });

    it('should fail when repository delete fails', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      
      mockRecipeBookRepository.exists.mockResolvedValue(Result.success(true));
      mockRecipeBookRepository.delete.mockResolvedValue(Result.failure('Database error'));

      // Act
      const result = await useCase.deletePermanently(recipeBookId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      
      mockRecipeBookRepository.exists.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await useCase.deletePermanently(recipeBookId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Failed to delete recipe book: Unexpected error');
    });
  });

  describe('deleteMultiple', () => {
    it('should delete multiple recipe books successfully', async () => {
      // Arrange
      const recipeBookId1 = RecipeBookId.newId().value;
      const recipeBookId2 = RecipeBookId.newId().value;
      const ids = [recipeBookId1, recipeBookId2];
      
      mockRecipeBookRepository.exists.mockResolvedValue(Result.success(true));
      mockRecipeBookRepository.delete.mockResolvedValue(Result.successEmpty());

      // Act
      const result = await useCase.deleteMultiple(ids);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockRecipeBookRepository.delete).toHaveBeenCalledTimes(2);
    });

    it('should fail when no IDs provided', async () => {
      // Act
      const result = await useCase.deleteMultiple([]);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('No recipe book IDs provided');
      expect(mockRecipeBookRepository.delete).not.toHaveBeenCalled();
    });

    it('should fail when too many IDs provided', async () => {
      // Arrange
      const ids = Array.from({ length: 51 }, () => RecipeBookId.newId().value);

      // Act
      const result = await useCase.deleteMultiple(ids);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Cannot delete more than 50 recipe books at once');
      expect(mockRecipeBookRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle partial failures', async () => {
      // Arrange
      const recipeBookId1 = RecipeBookId.newId().value;
      const recipeBookId2 = RecipeBookId.newId().value;
      const ids = [recipeBookId1, recipeBookId2];
      
      mockRecipeBookRepository.exists.mockResolvedValue(Result.success(true));
      mockRecipeBookRepository.delete
        .mockResolvedValueOnce(Result.successEmpty())
        .mockResolvedValueOnce(Result.failure('Delete failed'));

      // Act
      const result = await useCase.deleteMultiple(ids);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Some deletions failed');
      expect(result.error).toContain('Delete failed');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      const ids = [recipeBookId];
      
      mockRecipeBookRepository.exists.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await useCase.deleteMultiple(ids);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Failed to delete multiple recipe books: Unexpected error');
    });
  });
});
