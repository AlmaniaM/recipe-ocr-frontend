import { CreateRecipeBookUseCase } from '../../../application/useCases/recipeBooks/CreateRecipeBookUseCase';
import { IRecipeBookRepository } from '../../../application/ports/IRecipeBookRepository';
import { RecipeBook } from '../../../domain/entities/RecipeBook';
import { RecipeBookId } from '../../../domain/valueObjects/RecipeBookId';
import { RecipeId } from '../../../domain/valueObjects/RecipeId';
import { Result } from '../../../domain/common/Result';
import { CreateRecipeBookDto } from '../../../application/dto/RecipeBookDto';

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

describe('CreateRecipeBookUseCase', () => {
  let useCase: CreateRecipeBookUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateRecipeBookUseCase(mockRecipeBookRepository);
  });

  describe('execute', () => {
    it('should create a recipe book successfully with minimal data', async () => {
      // Arrange
      const dto: CreateRecipeBookDto = {
        title: 'My Recipe Book',
        description: null,
      };

      const mockRecipeBook = RecipeBook.create('My Recipe Book', null).value!;
      mockRecipeBookRepository.save.mockResolvedValue(Result.successEmpty());

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeInstanceOf(RecipeBook);
      expect(result.value!.title).toBe('My Recipe Book');
      expect(result.value!.description).toBeNull();
      expect(mockRecipeBookRepository.save).toHaveBeenCalledWith(expect.any(RecipeBook));
    });

    it('should create a recipe book successfully with all data', async () => {
      // Arrange
      const recipeId1 = RecipeId.newId().value;
      const recipeId2 = RecipeId.newId().value;
      const dto: CreateRecipeBookDto = {
        title: 'My Recipe Book',
        description: 'A collection of my favorite recipes',
        coverImagePath: '/path/to/cover.jpg',
        coverImageUrl: 'https://example.com/cover.jpg',
        recipeIds: [recipeId1, recipeId2],
      };

      mockRecipeBookRepository.save.mockResolvedValue(Result.successEmpty());

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeInstanceOf(RecipeBook);
      expect(result.value!.title).toBe('My Recipe Book');
      expect(result.value!.description).toBe('A collection of my favorite recipes');
      expect(result.value!.recipeCount).toBe(2);
      expect(mockRecipeBookRepository.save).toHaveBeenCalledWith(expect.any(RecipeBook));
    });

    it('should fail when title is empty', async () => {
      // Arrange
      const dto: CreateRecipeBookDto = {
        title: '',
        description: 'A collection of recipes',
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Recipe book title is required');
      expect(mockRecipeBookRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when title is too long', async () => {
      // Arrange
      const dto: CreateRecipeBookDto = {
        title: 'A'.repeat(201),
        description: 'A collection of recipes',
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Recipe book title cannot exceed 200 characters');
      expect(mockRecipeBookRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when description is too long', async () => {
      // Arrange
      const dto: CreateRecipeBookDto = {
        title: 'My Recipe Book',
        description: 'A'.repeat(1001),
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Recipe book description cannot exceed 1000 characters');
      expect(mockRecipeBookRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when too many recipes are provided', async () => {
      // Arrange
      const recipeIds = Array.from({ length: 101 }, () => RecipeId.newId().value);
      const dto: CreateRecipeBookDto = {
        title: 'My Recipe Book',
        recipeIds,
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Recipe book cannot contain more than 100 recipes');
      expect(mockRecipeBookRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when invalid recipe ID is provided', async () => {
      // Arrange
      const dto: CreateRecipeBookDto = {
        title: 'My Recipe Book',
        recipeIds: ['invalid-id'],
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Invalid recipe ID: invalid-id');
      expect(mockRecipeBookRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when repository save fails', async () => {
      // Arrange
      const dto: CreateRecipeBookDto = {
        title: 'My Recipe Book',
        description: 'A collection of recipes',
      };

      mockRecipeBookRepository.save.mockResolvedValue(Result.failure('Database error'));

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const dto: CreateRecipeBookDto = {
        title: 'My Recipe Book',
        description: 'A collection of recipes',
      };

      mockRecipeBookRepository.save.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Failed to create recipe book: Unexpected error');
    });

    it('should create recipe book with trimmed title and description', async () => {
      // Arrange
      const dto: CreateRecipeBookDto = {
        title: '  My Recipe Book  ',
        description: '  A collection of recipes  ',
      };

      mockRecipeBookRepository.save.mockResolvedValue(Result.successEmpty());

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value!.title).toBe('My Recipe Book');
      expect(result.value!.description).toBe('A collection of recipes');
    });

    it('should handle empty recipe IDs array', async () => {
      // Arrange
      const dto: CreateRecipeBookDto = {
        title: 'My Recipe Book',
        recipeIds: [],
      };

      mockRecipeBookRepository.save.mockResolvedValue(Result.successEmpty());

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value!.recipeCount).toBe(0);
    });
  });
});
