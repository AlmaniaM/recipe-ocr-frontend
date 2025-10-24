import { UpdateRecipeBookUseCase } from '../../../application/useCases/recipeBooks/UpdateRecipeBookUseCase';
import { IRecipeBookRepository } from '../../../application/ports/IRecipeBookRepository';
import { RecipeBook } from '../../../domain/entities/RecipeBook';
import { RecipeBookId } from '../../../domain/valueObjects/RecipeBookId';
import { RecipeId } from '../../../domain/valueObjects/RecipeId';
import { Result } from '../../../domain/common/Result';
import { UpdateRecipeBookDto } from '../../../application/dto/RecipeBookDto';

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

describe('UpdateRecipeBookUseCase', () => {
  let useCase: UpdateRecipeBookUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateRecipeBookUseCase(mockRecipeBookRepository);
  });

  describe('execute', () => {
    it('should update recipe book title successfully', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      const existingBook = RecipeBook.create('Old Title', 'Description').value!;
      const dto: UpdateRecipeBookDto = {
        id: recipeBookId,
        title: 'New Title',
      };

      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(existingBook));
      mockRecipeBookRepository.save.mockResolvedValue(Result.successEmpty());

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value!.title).toBe('New Title');
      expect(mockRecipeBookRepository.save).toHaveBeenCalledWith(expect.any(RecipeBook));
    });

    it('should update recipe book description successfully', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      const existingBook = RecipeBook.create('Title', 'Old Description').value!;
      const dto: UpdateRecipeBookDto = {
        id: recipeBookId,
        description: 'New Description',
      };

      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(existingBook));
      mockRecipeBookRepository.save.mockResolvedValue(Result.successEmpty());

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value!.description).toBe('New Description');
      expect(mockRecipeBookRepository.save).toHaveBeenCalledWith(expect.any(RecipeBook));
    });

    it('should update recipe book recipes successfully', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      const recipeId1 = RecipeId.newId().value;
      const recipeId2 = RecipeId.newId().value;
      const existingBook = RecipeBook.create('Title', 'Description').value!;
      const dto: UpdateRecipeBookDto = {
        id: recipeBookId,
        recipeIds: [recipeId1, recipeId2],
      };

      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(existingBook));
      mockRecipeBookRepository.save.mockResolvedValue(Result.successEmpty());

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value!.recipeCount).toBe(2);
      expect(mockRecipeBookRepository.save).toHaveBeenCalledWith(expect.any(RecipeBook));
    });

    it('should update multiple fields successfully', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      const recipeId1 = RecipeId.newId().value;
      const existingBook = RecipeBook.create('Old Title', 'Old Description').value!;
      const dto: UpdateRecipeBookDto = {
        id: recipeBookId,
        title: 'New Title',
        description: 'New Description',
        recipeIds: [recipeId1],
      };

      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(existingBook));
      mockRecipeBookRepository.save.mockResolvedValue(Result.successEmpty());

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value!.title).toBe('New Title');
      expect(result.value!.description).toBe('New Description');
      expect(result.value!.recipeCount).toBe(1);
      expect(mockRecipeBookRepository.save).toHaveBeenCalledWith(expect.any(RecipeBook));
    });

    it('should fail when recipe book ID is invalid', async () => {
      // Arrange
      const dto: UpdateRecipeBookDto = {
        id: 'invalid-id',
        title: 'New Title',
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Invalid RecipeBookId format');
      expect(mockRecipeBookRepository.findById).not.toHaveBeenCalled();
    });

    it('should fail when recipe book is not found', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      const dto: UpdateRecipeBookDto = {
        id: recipeBookId,
        title: 'New Title',
      };

      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(null));

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(`Recipe book with ID ${recipeBookId} not found`);
      expect(mockRecipeBookRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when repository findById fails', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      const dto: UpdateRecipeBookDto = {
        id: recipeBookId,
        title: 'New Title',
      };

      mockRecipeBookRepository.findById.mockResolvedValue(Result.failure('Database error'));

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should fail when title is empty', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      const dto: UpdateRecipeBookDto = {
        id: recipeBookId,
        title: '',
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Recipe book title cannot be empty or exceed 200 characters');
      expect(mockRecipeBookRepository.findById).not.toHaveBeenCalled();
    });

    it('should fail when title is too long', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      const dto: UpdateRecipeBookDto = {
        id: recipeBookId,
        title: 'A'.repeat(201),
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Recipe book title cannot be empty or exceed 200 characters');
      expect(mockRecipeBookRepository.findById).not.toHaveBeenCalled();
    });

    it('should fail when description is too long', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      const dto: UpdateRecipeBookDto = {
        id: recipeBookId,
        description: 'A'.repeat(1001),
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Recipe book description cannot exceed 1000 characters');
      expect(mockRecipeBookRepository.findById).not.toHaveBeenCalled();
    });

    it('should fail when too many recipes are provided', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      const recipeIds = Array.from({ length: 101 }, () => RecipeId.newId().value);
      const dto: UpdateRecipeBookDto = {
        id: recipeBookId,
        recipeIds,
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Recipe book cannot contain more than 100 recipes');
      expect(mockRecipeBookRepository.findById).not.toHaveBeenCalled();
    });

    it('should fail when invalid recipe ID is provided', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      const existingBook = RecipeBook.create('Title', 'Description').value!;
      const dto: UpdateRecipeBookDto = {
        id: recipeBookId,
        recipeIds: ['invalid-id'],
      };

      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(existingBook));

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Invalid recipe ID: invalid-id');
      expect(mockRecipeBookRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when repository save fails', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      const existingBook = RecipeBook.create('Title', 'Description').value!;
      const dto: UpdateRecipeBookDto = {
        id: recipeBookId,
        title: 'New Title',
      };

      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(existingBook));
      mockRecipeBookRepository.save.mockResolvedValue(Result.failure('Database error'));

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      const dto: UpdateRecipeBookDto = {
        id: recipeBookId,
        title: 'New Title',
      };

      mockRecipeBookRepository.findById.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Failed to update recipe book: Unexpected error');
    });

    it('should handle empty recipe IDs array', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      const existingBook = RecipeBook.create('Title', 'Description').value!;
      const dto: UpdateRecipeBookDto = {
        id: recipeBookId,
        recipeIds: [],
      };

      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(existingBook));
      mockRecipeBookRepository.save.mockResolvedValue(Result.successEmpty());

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value!.recipeCount).toBe(0);
    });

    it('should update with trimmed title and description', async () => {
      // Arrange
      const recipeBookId = RecipeBookId.newId().value;
      const existingBook = RecipeBook.create('Title', 'Description').value!;
      const dto: UpdateRecipeBookDto = {
        id: recipeBookId,
        title: '  New Title  ',
        description: '  New Description  ',
      };

      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(existingBook));
      mockRecipeBookRepository.save.mockResolvedValue(Result.successEmpty());

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value!.title).toBe('New Title');
      expect(result.value!.description).toBe('New Description');
    });
  });
});
