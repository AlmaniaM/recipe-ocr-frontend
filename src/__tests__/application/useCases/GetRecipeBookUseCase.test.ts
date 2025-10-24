import { GetRecipeBookUseCase } from '../../../application/useCases/recipeBooks/GetRecipeBookUseCase';
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

describe('GetRecipeBookUseCase', () => {
  let useCase: GetRecipeBookUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetRecipeBookUseCase(mockRecipeBookRepository);
  });

  describe('execute', () => {
    it('should get a recipe book successfully', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      const mockRecipeBook = RecipeBook.create('My Recipe Book', 'Description').value!;
      
      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(mockRecipeBook));

      // Act
      const result = await useCase.execute(recipeBookId);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(mockRecipeBook);
      expect(mockRecipeBookRepository.findById).toHaveBeenCalledWith(expect.any(RecipeBookId));
    });

    it('should return null when recipe book is not found', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      
      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(null));

      // Act
      const result = await useCase.execute(recipeBookId);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeNull();
      expect(mockRecipeBookRepository.findById).toHaveBeenCalledWith(expect.any(RecipeBookId));
    });

    it('should fail when recipe book ID is invalid', async () => {
      // Arrange
      const invalidId = 'invalid-id';

      // Act
      const result = await useCase.execute(invalidId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Invalid RecipeBookId format');
      expect(mockRecipeBookRepository.findById).not.toHaveBeenCalled();
    });

    it('should fail when repository findById fails', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      
      mockRecipeBookRepository.findById.mockResolvedValue(Result.failure('Database error'));

      // Act
      const result = await useCase.execute(recipeBookId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      
      mockRecipeBookRepository.findById.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await useCase.execute(recipeBookId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Failed to get recipe book: Unexpected error');
    });

    it('should handle empty string ID', async () => {
      // Arrange
      const emptyId = '';

      // Act
      const result = await useCase.execute(emptyId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Invalid RecipeBookId format');
      expect(mockRecipeBookRepository.findById).not.toHaveBeenCalled();
    });

    it('should handle null ID', async () => {
      // Arrange
      const nullId = null as any;

      // Act
      const result = await useCase.execute(nullId);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Invalid RecipeBookId format');
      expect(mockRecipeBookRepository.findById).not.toHaveBeenCalled();
    });
  });
});
