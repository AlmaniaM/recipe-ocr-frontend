/**
 * Recipe Book Integration Tests
 * 
 * These tests verify the complete recipe book functionality from use cases
 * through to the application layer, ensuring all components work together correctly.
 */

import { CreateRecipeBookUseCase } from '../../application/useCases/recipeBooks/CreateRecipeBookUseCase';
import { GetRecipeBookUseCase } from '../../application/useCases/recipeBooks/GetRecipeBookUseCase';
import { UpdateRecipeBookUseCase } from '../../application/useCases/recipeBooks/UpdateRecipeBookUseCase';
import { DeleteRecipeBookUseCase } from '../../application/useCases/recipeBooks/DeleteRecipeBookUseCase';
import { ListRecipeBooksUseCase } from '../../application/useCases/recipeBooks/ListRecipeBooksUseCase';
import { RecipeBook } from '../../domain/entities/RecipeBook';
import { RecipeBookId } from '../../domain/valueObjects/RecipeBookId';
import { RecipeId } from '../../domain/valueObjects/RecipeId';
import { Result } from '../../domain/common/Result';

// Mock repositories with realistic behavior
const mockRecipeBookRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  delete: jest.fn(),
  findWithPagination: jest.fn(),
  search: jest.fn(),
  exists: jest.fn(),
};

// Mock recipe repository for recipe validation
const mockRecipeRepository = {
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  search: jest.fn(),
  count: jest.fn(),
  update: jest.fn(),
};

describe('Recipe Book Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Recipe Book Lifecycle', () => {
    it('should handle complete recipe book lifecycle: create, read, update, delete', async () => {
      // Given
      const createUseCase = new CreateRecipeBookUseCase(mockRecipeBookRepository);
      const getUseCase = new GetRecipeBookUseCase(mockRecipeBookRepository);
      const updateUseCase = new UpdateRecipeBookUseCase(mockRecipeBookRepository);
      const deleteUseCase = new DeleteRecipeBookUseCase(mockRecipeBookRepository);
      const listUseCase = new ListRecipeBooksUseCase(mockRecipeBookRepository);

      const mockBook = RecipeBook.create('Test Book', 'Test Description').value!;
      const bookId = mockBook.id.value;

      // Mock repository responses
      mockRecipeBookRepository.save.mockResolvedValue(Result.success(mockBook));
      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(mockBook));
      mockRecipeBookRepository.exists.mockResolvedValue(Result.success(true));
      mockRecipeBookRepository.delete.mockResolvedValue(Result.successEmpty());
      mockRecipeBookRepository.findAll.mockResolvedValue(Result.success([mockBook]));

      // 1. Create a recipe book
      const createResult = await createUseCase.execute({
        title: 'Test Book',
        description: 'Test Description',
        recipeIds: [],
      });

      expect(createResult.isSuccess).toBe(true);
      expect(createResult.value?.title).toBe('Test Book');
      expect(mockRecipeBookRepository.save).toHaveBeenCalled();

      // 2. Get the recipe book
      const getResult = await getUseCase.execute(bookId);
      expect(getResult.isSuccess).toBe(true);
      expect(getResult.value?.title).toBe('Test Book');
      expect(mockRecipeBookRepository.findById).toHaveBeenCalledWith(
        expect.any(RecipeBookId)
      );

      // 3. Update the recipe book
      const updateResult = await updateUseCase.execute({
        id: bookId,
        title: 'Updated Book',
        description: 'Updated Description',
        recipeIds: [],
      });

      expect(updateResult.isSuccess).toBe(true);
      expect(mockRecipeBookRepository.save).toHaveBeenCalledTimes(2); // Once for create, once for update

      // 4. List all recipe books
      const listResult = await listUseCase.getAll();
      expect(listResult.isSuccess).toBe(true);
      expect(listResult.value).toHaveLength(1);
      expect(listResult.value![0].title).toBe('Test Book');

      // 5. Delete the recipe book
      const deleteResult = await deleteUseCase.deletePermanently(bookId);
      expect(deleteResult.isSuccess).toBe(true);
      expect(mockRecipeBookRepository.delete).toHaveBeenCalledWith(
        expect.any(RecipeBookId)
      );
    });

    it('should handle recipe book with recipes lifecycle', async () => {
      // Given
      const createUseCase = new CreateRecipeBookUseCase(mockRecipeBookRepository);
      const updateUseCase = new UpdateRecipeBookUseCase(mockRecipeBookRepository);
      const getUseCase = new GetRecipeBookUseCase(mockRecipeBookRepository);

      const mockBook = RecipeBook.create('Test Book', 'Test Description').value!;
      const recipeId1 = RecipeId.from('550e8400-e29b-41d4-a716-446655440001').value!;
      const recipeId2 = RecipeId.from('550e8400-e29b-41d4-a716-446655440002').value!;

      // Mock recipe repository to return valid recipes
      mockRecipeRepository.findById
        .mockResolvedValueOnce(Result.success({ id: recipeId1, title: 'Recipe 1' }))
        .mockResolvedValueOnce(Result.success({ id: recipeId2, title: 'Recipe 2' }));

      // Mock book repository
      mockRecipeBookRepository.save.mockResolvedValue(Result.success(mockBook));
      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(mockBook));

      // 1. Create a recipe book with recipes
      const createResult = await createUseCase.execute({
        title: 'Test Book',
        description: 'Test Description',
        recipeIds: [recipeId1.value, recipeId2.value],
      });

      expect(createResult.isSuccess).toBe(true);
      expect(createResult.value?.recipeIds).toHaveLength(2);

      // 2. Update the recipe book to add more recipes
      const updatedBook = mockBook.addRecipe(recipeId1).value!.addRecipe(recipeId2).value!;
      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(updatedBook));
      mockRecipeBookRepository.save.mockResolvedValue(Result.success(updatedBook));

      const updateResult = await updateUseCase.execute({
        id: mockBook.id.value,
        title: 'Updated Book',
        description: 'Updated Description',
        recipeIds: [recipeId1.value, recipeId2.value],
      });

      expect(updateResult.isSuccess).toBe(true);
      expect(updateResult.value?.recipeIds).toHaveLength(2);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle repository errors gracefully across all use cases', async () => {
      // Given
      const createUseCase = new CreateRecipeBookUseCase(mockRecipeBookRepository);
      const getUseCase = new GetRecipeBookUseCase(mockRecipeBookRepository);
      const updateUseCase = new UpdateRecipeBookUseCase(mockRecipeBookRepository);
      const deleteUseCase = new DeleteRecipeBookUseCase(mockRecipeBookRepository);

      // Mock repository errors
      mockRecipeBookRepository.save.mockResolvedValue(Result.failure('Database connection failed'));
      mockRecipeBookRepository.findById.mockResolvedValue(Result.failure('Database connection failed'));
      mockRecipeBookRepository.exists.mockResolvedValue(Result.failure('Database connection failed'));

      // Test create error handling
      const createResult = await createUseCase.execute({
        title: 'Test Book',
        description: 'Test Description',
        recipeIds: [],
      });
      expect(createResult.isSuccess).toBe(false);
      expect(createResult.error).toContain('Database connection failed');

      // Test get error handling
      const getResult = await getUseCase.execute('550e8400-e29b-41d4-a716-446655440000');
      expect(getResult.isSuccess).toBe(false);
      expect(getResult.error).toContain('Database connection failed');

      // Test update error handling
      const updateResult = await updateUseCase.execute({
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Updated Book',
        description: 'Updated Description',
        recipeIds: [],
      });
      expect(updateResult.isSuccess).toBe(false);
      expect(updateResult.error).toContain('Database connection failed');

      // Test delete error handling
      const deleteResult = await deleteUseCase.deletePermanently('550e8400-e29b-41d4-a716-446655440000');
      expect(deleteResult.isSuccess).toBe(false);
      expect(deleteResult.error).toContain('Database connection failed');
    });

    it('should handle validation errors consistently', async () => {
      // Given
      const createUseCase = new CreateRecipeBookUseCase(mockRecipeBookRepository);
      const updateUseCase = new UpdateRecipeBookUseCase(mockRecipeBookRepository);

      // Test empty title validation
      const createResult = await createUseCase.execute({
        title: '',
        description: 'Test Description',
        recipeIds: [],
      });
      expect(createResult.isSuccess).toBe(false);
      expect(createResult.error).toContain('Recipe book title is required');

      // Test title too long validation
      const longTitle = 'a'.repeat(201);
      const createResult2 = await createUseCase.execute({
        title: longTitle,
        description: 'Test Description',
        recipeIds: [],
      });
      expect(createResult2.isSuccess).toBe(false);
      expect(createResult2.error).toContain('Recipe book title cannot exceed 200 characters');

      // Test invalid ID format
      const updateResult = await updateUseCase.execute({
        id: 'invalid-id',
        title: 'Updated Book',
        description: 'Updated Description',
        recipeIds: [],
      });
      expect(updateResult.isSuccess).toBe(false);
      expect(updateResult.error).toContain('Invalid RecipeBookId format');
    });
  });

  describe('Search and Pagination Integration', () => {
    it('should handle search and pagination correctly', async () => {
      // Given
      const listUseCase = new ListRecipeBooksUseCase(mockRecipeBookRepository);
      const mockBooks = [
        RecipeBook.create('Book 1', 'Description 1').value!,
        RecipeBook.create('Book 2', 'Description 2').value!,
        RecipeBook.create('Book 3', 'Description 3').value!,
      ];

      // Mock pagination response
      const mockPagedResult = {
        recipeBooks: mockBooks.slice(0, 2), // First page
        totalCount: 3,
        hasNextPage: true,
      };

      mockRecipeBookRepository.findWithPagination.mockResolvedValue(Result.success(mockPagedResult));

      // Test pagination
      const paginationResult = await listUseCase.getWithPagination(1, 2);
      expect(paginationResult.isSuccess).toBe(true);
      expect(paginationResult.value?.recipeBooks).toHaveLength(2);
      expect(paginationResult.value?.totalCount).toBe(3);
      expect(paginationResult.value?.hasNextPage).toBe(true);
      expect(mockRecipeBookRepository.findWithPagination).toHaveBeenCalledWith(1, 2);

      // Test getting all books
      mockRecipeBookRepository.findAll.mockResolvedValue(Result.success(mockBooks));

      const allBooksResult = await listUseCase.getAll();
      expect(allBooksResult.isSuccess).toBe(true);
      expect(allBooksResult.value).toHaveLength(3);
    });
  });

  describe('Recipe Book Entity Integration', () => {
    it('should handle complex recipe book operations', async () => {
      // Given
      const book = RecipeBook.create('Complex Book', 'Complex Description').value!;
      const recipeId1 = RecipeId.from('550e8400-e29b-41d4-a716-446655440001').value!;
      const recipeId2 = RecipeId.from('550e8400-e29b-41d4-a716-446655440002').value!;
      const recipeId3 = RecipeId.from('550e8400-e29b-41d4-a716-446655440003').value!;

      // Add multiple recipes
      let updatedBook = book.addRecipe(recipeId1).value!;
      updatedBook = updatedBook.addRecipe(recipeId2).value!;
      updatedBook = updatedBook.addRecipe(recipeId3).value!;

      expect(updatedBook.recipeIds).toHaveLength(3);

      // Remove a recipe
      updatedBook = updatedBook.removeRecipe(recipeId2).value!;
      expect(updatedBook.recipeIds).toHaveLength(2);
      expect(updatedBook.recipeIds.map(id => id.value)).toContain(recipeId1.value);
      expect(updatedBook.recipeIds.map(id => id.value)).toContain(recipeId3.value);
      expect(updatedBook.recipeIds.map(id => id.value)).not.toContain(recipeId2.value);

      // Update title and description
      updatedBook = updatedBook.updateTitle('Updated Complex Book').value!;
      updatedBook = updatedBook.updateDescription('Updated Complex Description').value!;

      expect(updatedBook.title).toBe('Updated Complex Book');
      expect(updatedBook.description).toBe('Updated Complex Description');

      // Clear all recipes
      const clearedBook = updatedBook.clearRecipes().value!;
      expect(clearedBook.recipeIds).toHaveLength(0);
    });

    it('should handle recipe book validation edge cases', () => {
      // Test title validation
      const emptyTitleResult = RecipeBook.create('', 'Description');
      expect(emptyTitleResult.isSuccess).toBe(false);
      expect(emptyTitleResult.error).toContain('Recipe book title cannot be null or empty');

      const longTitle = 'a'.repeat(201);
      const longTitleResult = RecipeBook.create(longTitle, 'Description');
      expect(longTitleResult.isSuccess).toBe(false);
      expect(longTitleResult.error).toContain('Recipe book title cannot exceed 200 characters');

      // Test description validation
      const longDescription = 'a'.repeat(1001);
      const longDescriptionResult = RecipeBook.create('Title', longDescription);
      expect(longDescriptionResult.isSuccess).toBe(false);
      expect(longDescriptionResult.error).toContain('Recipe book description cannot exceed 1000 characters');

      // Test valid creation
      const validResult = RecipeBook.create('Valid Title', 'Valid Description');
      expect(validResult.isSuccess).toBe(true);
      expect(validResult.value?.title).toBe('Valid Title');
      expect(validResult.value?.description).toBe('Valid Description');
    });
  });
});
