import { Container } from 'inversify';
import { CreateRecipeBookUseCase } from '../../application/useCases/recipeBooks/CreateRecipeBookUseCase';
import { GetRecipeBookUseCase } from '../../application/useCases/recipeBooks/GetRecipeBookUseCase';
import { ListRecipeBooksUseCase } from '../../application/useCases/recipeBooks/ListRecipeBooksUseCase';
import { UpdateRecipeBookUseCase } from '../../application/useCases/recipeBooks/UpdateRecipeBookUseCase';
import { DeleteRecipeBookUseCase } from '../../application/useCases/recipeBooks/DeleteRecipeBookUseCase';
import { IRecipeBookRepository } from '../../application/ports/IRecipeBookRepository';
import { RecipeBook } from '../../domain/entities/RecipeBook';
import { RecipeBookId } from '../../domain/valueObjects/RecipeBookId';
import { Result } from '../../domain/common/Result';
import { TYPES } from '../../infrastructure/di/types';

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

// Helper function to create a container with RecipeBook use cases
  const createRecipeBookContainer = () => {
    const container = new Container();
    container.bind<IRecipeBookRepository>(TYPES.RecipeBookRepository).toConstantValue(mockRecipeBookRepository);
    
    // Bind use cases with explicit constructor injection
    container.bind<CreateRecipeBookUseCase>(TYPES.CreateRecipeBookUseCase)
      .toDynamicValue(() => new CreateRecipeBookUseCase(mockRecipeBookRepository));
    container.bind<GetRecipeBookUseCase>(TYPES.GetRecipeBookUseCase)
      .toDynamicValue(() => new GetRecipeBookUseCase(mockRecipeBookRepository));
    container.bind<ListRecipeBooksUseCase>(TYPES.ListRecipeBooksUseCase)
      .toDynamicValue(() => new ListRecipeBooksUseCase(mockRecipeBookRepository));
    container.bind<UpdateRecipeBookUseCase>(TYPES.UpdateRecipeBookUseCase)
      .toDynamicValue(() => new UpdateRecipeBookUseCase(mockRecipeBookRepository));
    container.bind<DeleteRecipeBookUseCase>(TYPES.DeleteRecipeBookUseCase)
      .toDynamicValue(() => new DeleteRecipeBookUseCase(mockRecipeBookRepository));
    
    return container;
  };

describe('RecipeBook Use Case Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Use Case Integration', () => {
    it('should integrate CreateRecipeBookUseCase with dependency injection', async () => {
      const container = createRecipeBookContainer();
      mockRecipeBookRepository.save.mockResolvedValue(Result.successEmpty());

      const createUseCase = container.get<CreateRecipeBookUseCase>(TYPES.CreateRecipeBookUseCase);
      const result = await createUseCase.execute({
        title: 'Test Recipe Book',
        description: 'A test recipe book',
      });

      expect(result.isSuccess).toBe(true);
      expect(mockRecipeBookRepository.save).toHaveBeenCalled();
    });

    it('should integrate GetRecipeBookUseCase with dependency injection', async () => {
      const container = createRecipeBookContainer();
      const mockRecipeBook = RecipeBook.create('Test Book', 'Description').value!;
      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(mockRecipeBook));

      const getUseCase = container.get<GetRecipeBookUseCase>(TYPES.GetRecipeBookUseCase);
      const result = await getUseCase.execute(RecipeBookId.newId().value);

      expect(result.isSuccess).toBe(true);
      expect(mockRecipeBookRepository.findById).toHaveBeenCalled();
    });

    it('should integrate ListRecipeBooksUseCase with dependency injection', async () => {
      const container = createRecipeBookContainer();
      const mockRecipeBooks = [RecipeBook.create('Book 1', 'Description').value!];
      mockRecipeBookRepository.findAll.mockResolvedValue(Result.success(mockRecipeBooks));

      const listUseCase = container.get<ListRecipeBooksUseCase>(TYPES.ListRecipeBooksUseCase);
      const result = await listUseCase.getAll();

      expect(result.isSuccess).toBe(true);
      expect(mockRecipeBookRepository.findAll).toHaveBeenCalled();
    });

    it('should integrate UpdateRecipeBookUseCase with dependency injection', async () => {
      const container = createRecipeBookContainer();
      const mockRecipeBook = RecipeBook.create('Test Book', 'Description').value!;
      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(mockRecipeBook));
      mockRecipeBookRepository.save.mockResolvedValue(Result.successEmpty());

      const updateUseCase = container.get<UpdateRecipeBookUseCase>(TYPES.UpdateRecipeBookUseCase);
      const result = await updateUseCase.execute({
        id: RecipeBookId.newId().value,
        title: 'Updated Recipe Book',
      });

      expect(result.isSuccess).toBe(true);
      expect(mockRecipeBookRepository.findById).toHaveBeenCalled();
      expect(mockRecipeBookRepository.save).toHaveBeenCalled();
    });

    it('should integrate DeleteRecipeBookUseCase with dependency injection', async () => {
      const container = createRecipeBookContainer();
      const mockRecipeBook = RecipeBook.create('Test Book', 'Description').value!;
      mockRecipeBookRepository.exists.mockResolvedValue(Result.success(true));
      mockRecipeBookRepository.findById.mockResolvedValue(Result.success(mockRecipeBook));
      mockRecipeBookRepository.save.mockResolvedValue(Result.successEmpty());

      const deleteUseCase = container.get<DeleteRecipeBookUseCase>(TYPES.DeleteRecipeBookUseCase);
      const result = await deleteUseCase.archive(RecipeBookId.newId().value);

      expect(result.isSuccess).toBe(true);
      expect(mockRecipeBookRepository.exists).toHaveBeenCalled();
      expect(mockRecipeBookRepository.findById).toHaveBeenCalled();
      expect(mockRecipeBookRepository.save).toHaveBeenCalled();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle CreateRecipeBookUseCase errors gracefully', async () => {
      const container = createRecipeBookContainer();
      mockRecipeBookRepository.save.mockResolvedValue(Result.failure('Database error'));

      const createUseCase = container.get<CreateRecipeBookUseCase>(TYPES.CreateRecipeBookUseCase);
      const result = await createUseCase.execute({
        title: 'Test Recipe Book',
        description: 'A test recipe book',
      });

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should handle GetRecipeBookUseCase errors gracefully', async () => {
      const container = createRecipeBookContainer();
      mockRecipeBookRepository.findById.mockResolvedValue(Result.failure('Database error'));

      const getUseCase = container.get<GetRecipeBookUseCase>(TYPES.GetRecipeBookUseCase);
      const result = await getUseCase.execute(RecipeBookId.newId().value);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should handle ListRecipeBooksUseCase errors gracefully', async () => {
      const container = createRecipeBookContainer();
      mockRecipeBookRepository.findAll.mockResolvedValue(Result.failure('Database error'));

      const listUseCase = container.get<ListRecipeBooksUseCase>(TYPES.ListRecipeBooksUseCase);
      const result = await listUseCase.getAll();

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should handle UpdateRecipeBookUseCase errors gracefully', async () => {
      const container = createRecipeBookContainer();
      mockRecipeBookRepository.findById.mockResolvedValue(Result.failure('Database error'));

      const updateUseCase = container.get<UpdateRecipeBookUseCase>(TYPES.UpdateRecipeBookUseCase);
      const result = await updateUseCase.execute({
        id: RecipeBookId.newId().value,
        title: 'Updated Recipe Book',
      });

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should handle DeleteRecipeBookUseCase errors gracefully', async () => {
      const container = createRecipeBookContainer();
      mockRecipeBookRepository.exists.mockResolvedValue(Result.failure('Database error'));

      const deleteUseCase = container.get<DeleteRecipeBookUseCase>(TYPES.DeleteRecipeBookUseCase);
      const result = await deleteUseCase.archive(RecipeBookId.newId().value);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });
});
