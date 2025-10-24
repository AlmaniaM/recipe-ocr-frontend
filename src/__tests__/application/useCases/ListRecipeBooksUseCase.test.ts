import { ListRecipeBooksUseCase } from '../../../application/useCases/recipeBooks/ListRecipeBooksUseCase';
import { IRecipeBookRepository } from '../../../application/ports/IRecipeBookRepository';
import { RecipeBook } from '../../../domain/entities/RecipeBook';
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

describe('ListRecipeBooksUseCase', () => {
  let useCase: ListRecipeBooksUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ListRecipeBooksUseCase(mockRecipeBookRepository);
  });

  describe('getAll', () => {
    it('should get all recipe books successfully', async () => {
      // Arrange
      const mockRecipeBooks = [
        RecipeBook.create('Book 1', 'Description 1').value!,
        RecipeBook.create('Book 2', 'Description 2').value!,
      ];
      
      mockRecipeBookRepository.findAll.mockResolvedValue(Result.success(mockRecipeBooks));

      // Act
      const result = await useCase.getAll();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockRecipeBooks);
      expect(mockRecipeBookRepository.findAll).toHaveBeenCalled();
    });

    it('should handle repository findAll failure', async () => {
      // Arrange
      mockRecipeBookRepository.findAll.mockResolvedValue(Result.failure('Database error'));

      // Act
      const result = await useCase.getAll();

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      mockRecipeBookRepository.findAll.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await useCase.getAll();

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Failed to get recipe books: Unexpected error');
    });
  });

  describe('getWithPagination', () => {
    it('should get paginated recipe books successfully', async () => {
      // Arrange
      const mockRecipeBooks = [
        RecipeBook.create('Book 1', 'Description 1').value!,
        RecipeBook.create('Book 2', 'Description 2').value!,
      ];
      const paginationResult = {
        recipeBooks: mockRecipeBooks,
        totalCount: 10,
        hasNextPage: true,
      };
      
      mockRecipeBookRepository.findWithPagination.mockResolvedValue(Result.success(paginationResult));

      // Act
      const result = await useCase.getWithPagination(1, 10);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(paginationResult);
      expect(mockRecipeBookRepository.findWithPagination).toHaveBeenCalledWith(1, 10);
    });

    it('should fail when page is less than 1', async () => {
      // Act
      const result = await useCase.getWithPagination(0, 10);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Page number must be greater than 0');
      expect(mockRecipeBookRepository.findWithPagination).not.toHaveBeenCalled();
    });

    it('should fail when page size is less than 1', async () => {
      // Act
      const result = await useCase.getWithPagination(1, 0);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Page size must be between 1 and 100');
      expect(mockRecipeBookRepository.findWithPagination).not.toHaveBeenCalled();
    });

    it('should fail when page size is greater than 100', async () => {
      // Act
      const result = await useCase.getWithPagination(1, 101);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Page size must be between 1 and 100');
      expect(mockRecipeBookRepository.findWithPagination).not.toHaveBeenCalled();
    });

    it('should handle repository findWithPagination failure', async () => {
      // Arrange
      mockRecipeBookRepository.findWithPagination.mockResolvedValue(Result.failure('Database error'));

      // Act
      const result = await useCase.getWithPagination(1, 10);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      mockRecipeBookRepository.findWithPagination.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await useCase.getWithPagination(1, 10);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Failed to get paginated recipe books: Unexpected error');
    });
  });

  describe('getCount', () => {
    it('should get recipe book count successfully', async () => {
      // Arrange
      mockRecipeBookRepository.count.mockResolvedValue(Result.success(5));

      // Act
      const result = await useCase.getCount();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(5);
      expect(mockRecipeBookRepository.count).toHaveBeenCalled();
    });

    it('should handle repository count failure', async () => {
      // Arrange
      mockRecipeBookRepository.count.mockResolvedValue(Result.failure('Database error'));

      // Act
      const result = await useCase.getCount();

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      mockRecipeBookRepository.count.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await useCase.getCount();

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Failed to get recipe book count: Unexpected error');
    });
  });

  describe('getActive', () => {
    it('should get only active recipe books', async () => {
      // Arrange
      const activeBook = RecipeBook.create('Active Book', 'Description').value!;
      const archivedBook = RecipeBook.create('Archived Book', 'Description').value!;
      archivedBook.archive(); // Archive the book
      
      const allBooks = [activeBook, archivedBook];
      mockRecipeBookRepository.findAll.mockResolvedValue(Result.success(allBooks));

      // Act
      const result = await useCase.getActive();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(1);
      expect(result.value![0].title).toBe('Active Book');
      expect(result.value![0].isArchived).toBe(false);
    });

    it('should return empty array when no active books', async () => {
      // Arrange
      const archivedBook = RecipeBook.create('Archived Book', 'Description').value!;
      archivedBook.archive();
      
      mockRecipeBookRepository.findAll.mockResolvedValue(Result.success([archivedBook]));

      // Act
      const result = await useCase.getActive();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(0);
    });

    it('should handle repository findAll failure', async () => {
      // Arrange
      mockRecipeBookRepository.findAll.mockResolvedValue(Result.failure('Database error'));

      // Act
      const result = await useCase.getActive();

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getArchived', () => {
    it('should get only archived recipe books', async () => {
      // Arrange
      const activeBook = RecipeBook.create('Active Book', 'Description').value!;
      const archivedBook = RecipeBook.create('Archived Book', 'Description').value!;
      archivedBook.archive(); // Archive the book
      
      const allBooks = [activeBook, archivedBook];
      mockRecipeBookRepository.findAll.mockResolvedValue(Result.success(allBooks));

      // Act
      const result = await useCase.getArchived();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(1);
      expect(result.value![0].title).toBe('Archived Book');
      expect(result.value![0].isArchived).toBe(true);
    });

    it('should return empty array when no archived books', async () => {
      // Arrange
      const activeBook = RecipeBook.create('Active Book', 'Description').value!;
      
      mockRecipeBookRepository.findAll.mockResolvedValue(Result.success([activeBook]));

      // Act
      const result = await useCase.getArchived();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(0);
    });

    it('should handle repository findAll failure', async () => {
      // Arrange
      mockRecipeBookRepository.findAll.mockResolvedValue(Result.failure('Database error'));

      // Act
      const result = await useCase.getArchived();

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });
});
