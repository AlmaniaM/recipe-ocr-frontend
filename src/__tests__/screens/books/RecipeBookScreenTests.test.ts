/**
 * Recipe Book Screen Tests
 * 
 * These tests focus on the business logic and use case interactions
 * rather than React Native component rendering to avoid StyleSheet issues.
 */

import { CreateRecipeBookUseCase } from '../../../application/useCases/recipeBooks/CreateRecipeBookUseCase';
import { GetRecipeBookUseCase } from '../../../application/useCases/recipeBooks/GetRecipeBookUseCase';
import { UpdateRecipeBookUseCase } from '../../../application/useCases/recipeBooks/UpdateRecipeBookUseCase';
import { DeleteRecipeBookUseCase } from '../../../application/useCases/recipeBooks/DeleteRecipeBookUseCase';
import { ListRecipeBooksUseCase } from '../../../application/useCases/recipeBooks/ListRecipeBooksUseCase';
import { RecipeBook } from '../../../domain/entities/RecipeBook';
import { RecipeBookId } from '../../../domain/valueObjects/RecipeBookId';
import { RecipeId } from '../../../domain/valueObjects/RecipeId';
import { Result } from '../../../domain/common/Result';

// Mock repositories
const mockRecipeBookRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  delete: jest.fn(),
  getWithPagination: jest.fn(),
  findWithPagination: jest.fn(),
  search: jest.fn(),
  exists: jest.fn(),
};

describe('Recipe Book Use Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CreateRecipeBookUseCase', () => {
    it('should create a recipe book successfully', async () => {
      // Given
      const useCase = new CreateRecipeBookUseCase(mockRecipeBookRepository);
      const mockBook = RecipeBook.create('Test Book', 'Test Description').value!;
      mockRecipeBookRepository.save.mockResolvedValue(Result.success(mockBook));

      // When
      const result = await useCase.execute({
        title: 'Test Book',
        description: 'Test Description',
        recipeIds: [],
      });

      // Then
      expect(result.isSuccess).toBe(true);
      expect(result.value?.title).toBe('Test Book');
      expect(mockRecipeBookRepository.save).toHaveBeenCalled();
    });

    it('should return failure when title is empty', async () => {
      // Given
      const useCase = new CreateRecipeBookUseCase(mockRecipeBookRepository);

      // When
      const result = await useCase.execute({
        title: '',
        description: 'Test Description',
        recipeIds: [],
      });

      // Then
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe book title is required');
    });

    it('should return failure when title is too long', async () => {
      // Given
      const useCase = new CreateRecipeBookUseCase(mockRecipeBookRepository);
      const longTitle = 'a'.repeat(201);

      // When
      const result = await useCase.execute({
        title: longTitle,
        description: 'Test Description',
        recipeIds: [],
      });

      // Then
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe book title cannot exceed 200 characters');
    });
  });

  describe('GetRecipeBookUseCase', () => {
    it('should get a recipe book successfully', async () => {
      // Given
      const useCase = new GetRecipeBookUseCase(mockRecipeBookRepository);
      const mockBook = RecipeBook.create('Test Book', 'Test Description').value!;
      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(mockBook));

      // When
      const result = await useCase.execute('550e8400-e29b-41d4-a716-446655440000');

      // Then
      expect(result.isSuccess).toBe(true);
      expect(result.value?.title).toBe('Test Book');
      expect(mockRecipeBookRepository.findById).toHaveBeenCalledWith(
        expect.any(RecipeBookId)
      );
    });

    it('should return success with null when book is not found', async () => {
      // Given
      const useCase = new GetRecipeBookUseCase(mockRecipeBookRepository);
      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(null));

      // When
      const result = await useCase.execute('550e8400-e29b-41d4-a716-446655440000');

      // Then
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(null);
    });
  });

  describe('UpdateRecipeBookUseCase', () => {
    it('should update a recipe book successfully', async () => {
      // Given
      const useCase = new UpdateRecipeBookUseCase(mockRecipeBookRepository);
      const mockBook = RecipeBook.create('Test Book', 'Test Description').value!;
      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(mockBook));
      mockRecipeBookRepository.save.mockResolvedValue(Result.success(mockBook));

      // When
      const result = await useCase.execute({
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Updated Book',
        description: 'Updated Description',
        recipeIds: [],
      });

      // Then
      expect(result.isSuccess).toBe(true);
      expect(mockRecipeBookRepository.save).toHaveBeenCalled();
    });

    it('should return failure when book is not found', async () => {
      // Given
      const useCase = new UpdateRecipeBookUseCase(mockRecipeBookRepository);
      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(null));

      // When
      const result = await useCase.execute({
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Updated Book',
        description: 'Updated Description',
        recipeIds: [],
      });

      // Then
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe book with ID 550e8400-e29b-41d4-a716-446655440000 not found');
    });
  });

  describe('DeleteRecipeBookUseCase', () => {
    it('should delete a recipe book successfully', async () => {
      // Given
      const useCase = new DeleteRecipeBookUseCase(mockRecipeBookRepository);
      const mockBook = RecipeBook.create('Test Book', 'Test Description').value!;
      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(mockBook));
      mockRecipeBookRepository.exists.mockResolvedValue(Result.success(true));
      mockRecipeBookRepository.delete.mockResolvedValue(Result.successEmpty());

      // When
      const result = await useCase.deletePermanently('550e8400-e29b-41d4-a716-446655440000');

      // Then
      expect(result.isSuccess).toBe(true);
      expect(mockRecipeBookRepository.delete).toHaveBeenCalledWith(
        expect.any(RecipeBookId)
      );
    });

    it('should return failure when book is not found', async () => {
      // Given
      const useCase = new DeleteRecipeBookUseCase(mockRecipeBookRepository);
      mockRecipeBookRepository.exists.mockResolvedValue(Result.success(false));

      // When
      const result = await useCase.deletePermanently('550e8400-e29b-41d4-a716-446655440000');

      // Then
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe book with ID 550e8400-e29b-41d4-a716-446655440000 not found');
    });
  });

  describe('ListRecipeBooksUseCase', () => {
    it('should list all recipe books successfully', async () => {
      // Given
      const useCase = new ListRecipeBooksUseCase(mockRecipeBookRepository);
      const mockBooks = [
        RecipeBook.create('Book 1', 'Description 1').value!,
        RecipeBook.create('Book 2', 'Description 2').value!,
      ];
      mockRecipeBookRepository.findAll.mockResolvedValue(Result.success(mockBooks));

      // When
      const result = await useCase.getAll();

      // Then
      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(2);
      expect(mockRecipeBookRepository.findAll).toHaveBeenCalled();
    });

    it('should get paginated recipe books successfully', async () => {
      // Given
      const useCase = new ListRecipeBooksUseCase(mockRecipeBookRepository);
      const mockBooks = [
        RecipeBook.create('Book 1', 'Description 1').value!,
        RecipeBook.create('Book 2', 'Description 2').value!,
      ];
      const mockPagedResult = {
        recipeBooks: mockBooks,
        totalCount: 2,
        hasNextPage: false,
      };
      mockRecipeBookRepository.findWithPagination.mockResolvedValue(Result.success(mockPagedResult));

      // When
      const result = await useCase.getWithPagination(1, 10);

      // Then
      expect(result.isSuccess).toBe(true);
      expect(result.value.recipeBooks).toHaveLength(2);
      expect(mockRecipeBookRepository.findWithPagination).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('Recipe Book Entity', () => {
    it('should create a recipe book with valid data', () => {
      // Given & When
      const result = RecipeBook.create('Test Book', 'Test Description');

      // Then
      expect(result.isSuccess).toBe(true);
      expect(result.value?.title).toBe('Test Book');
      expect(result.value?.description).toBe('Test Description');
    });

    it('should add recipes to a book', () => {
      // Given
      const book = RecipeBook.create('Test Book', 'Test Description').value!;
      const recipeId = RecipeId.from('550e8400-e29b-41d4-a716-446655440001').value!;

      // When
      const result = book.addRecipe(recipeId);

      // Then
      expect(result.isSuccess).toBe(true);
      expect(result.value?.recipeIds).toHaveLength(1);
      expect(result.value?.recipeIds[0].value).toBe('550e8400-e29b-41d4-a716-446655440001');
    });

    it('should remove recipes from a book', () => {
      // Given
      const book = RecipeBook.create('Test Book', 'Test Description').value!;
      const recipeId = RecipeId.from('550e8400-e29b-41d4-a716-446655440001').value!;
      const bookWithRecipe = book.addRecipe(recipeId).value!;

      // When
      const result = bookWithRecipe.removeRecipe(recipeId);

      // Then
      expect(result.isSuccess).toBe(true);
      expect(result.value?.recipeIds).toHaveLength(0);
    });

    it('should update book title', () => {
      // Given
      const book = RecipeBook.create('Test Book', 'Test Description').value!;

      // When
      const result = book.updateTitle('Updated Title');

      // Then
      expect(result.isSuccess).toBe(true);
      expect(result.value?.title).toBe('Updated Title');
    });

    it('should update book description', () => {
      // Given
      const book = RecipeBook.create('Test Book', 'Test Description').value!;

      // When
      const result = book.updateDescription('Updated Description');

      // Then
      expect(result.isSuccess).toBe(true);
      expect(result.value?.description).toBe('Updated Description');
    });
  });
});
