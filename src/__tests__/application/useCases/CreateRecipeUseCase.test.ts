import { CreateRecipeUseCase } from '../../../application/useCases/recipes/CreateRecipeUseCase';
import { IRecipeRepository } from '../../../application/ports/IRecipeRepository';
import { CreateRecipeDto } from '../../../application/dto/RecipeDto';
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

describe('CreateRecipeUseCase', () => {
  let useCase: CreateRecipeUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateRecipeUseCase(mockRecipeRepository);
  });

  describe('execute', () => {
    it('should create a recipe with minimal data', async () => {
      // Arrange
      const createDto: CreateRecipeDto = {
        title: 'Test Recipe',
        description: 'A test recipe',
        category: RecipeCategory.MainCourse,
      };

      const mockRecipe = Recipe.create('Test Recipe', 'A test recipe', RecipeCategory.MainCourse).value;
      mockRecipeRepository.save.mockResolvedValue(Result.success(mockRecipe));

      // Act
      const result = await useCase.execute(createDto);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value?.title).toBe('Test Recipe');
      expect(mockRecipeRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should create a recipe with all properties', async () => {
      // Arrange
      const createDto: CreateRecipeDto = {
        title: 'Complete Recipe',
        description: 'A complete test recipe',
        category: RecipeCategory.Dessert,
        prepTime: {
          minMinutes: 15,
          maxMinutes: 20,
          displayText: '15-20 minutes',
        },
        cookTime: {
          minMinutes: 30,
          maxMinutes: null,
          displayText: '30 minutes',
        },
        servings: {
          minServings: 4,
          maxServings: 6,
          displayText: '4-6 servings',
        },
        source: 'Test Cookbook',
        imagePath: '/path/to/image.jpg',
        ingredients: [
          {
            id: '1',
            name: 'Flour',
            amount: {
              quantity: 2,
              unit: 'cups',
              displayText: '2 cups',
            },
            notes: 'All-purpose',
            order: 1,
          },
        ],
        directions: [
          {
            id: '1',
            instruction: 'Mix ingredients',
            order: 1,
            notes: 'Mix well',
          },
        ],
        tags: [
          {
            id: '1',
            name: 'Easy',
            color: '#FF0000',
          },
        ],
      };

      const mockRecipe = Recipe.create('Complete Recipe', 'A complete test recipe', RecipeCategory.Dessert).value;
      mockRecipeRepository.save.mockResolvedValue(Result.success(mockRecipe));

      // Act
      const result = await useCase.execute(createDto);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockRecipeRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should fail when title is empty', async () => {
      // Arrange
      const createDto: CreateRecipeDto = {
        title: '',
        description: 'A test recipe',
        category: RecipeCategory.MainCourse,
      };

      // Act
      const result = await useCase.execute(createDto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe title is required');
      expect(mockRecipeRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when title is too long', async () => {
      // Arrange
      const createDto: CreateRecipeDto = {
        title: 'A'.repeat(201),
        description: 'A test recipe',
        category: RecipeCategory.MainCourse,
      };

      // Act
      const result = await useCase.execute(createDto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe title cannot exceed 200 characters');
      expect(mockRecipeRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when description is too long', async () => {
      // Arrange
      const createDto: CreateRecipeDto = {
        title: 'Test Recipe',
        description: 'A'.repeat(1001),
        category: RecipeCategory.MainCourse,
      };

      // Act
      const result = await useCase.execute(createDto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe description cannot exceed 1000 characters');
      expect(mockRecipeRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when source is too long', async () => {
      // Arrange
      const createDto: CreateRecipeDto = {
        title: 'Test Recipe',
        description: 'A test recipe',
        category: RecipeCategory.MainCourse,
        source: 'A'.repeat(201),
      };

      // Act
      const result = await useCase.execute(createDto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe source cannot exceed 200 characters');
      expect(mockRecipeRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when repository save fails', async () => {
      // Arrange
      const createDto: CreateRecipeDto = {
        title: 'Test Recipe',
        description: 'A test recipe',
        category: RecipeCategory.MainCourse,
      };

      mockRecipeRepository.save.mockResolvedValue(Result.failure('Database error'));

      // Act
      const result = await useCase.execute(createDto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Database error');
    });

    it('should handle invalid time range', async () => {
      // Arrange
      const createDto: CreateRecipeDto = {
        title: 'Test Recipe',
        description: 'A test recipe',
        category: RecipeCategory.MainCourse,
        prepTime: {
          minMinutes: -5, // Invalid negative value
          maxMinutes: 10,
          displayText: 'Invalid',
        },
      };

      // Act
      const result = await useCase.execute(createDto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Invalid time range');
      expect(mockRecipeRepository.save).not.toHaveBeenCalled();
    });

    it('should handle invalid serving size', async () => {
      // Arrange
      const createDto: CreateRecipeDto = {
        title: 'Test Recipe',
        description: 'A test recipe',
        category: RecipeCategory.MainCourse,
        servings: {
          minServings: 0, // Invalid zero value
          maxServings: 5,
          displayText: 'Invalid',
        },
      };

      // Act
      const result = await useCase.execute(createDto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Invalid serving size');
      expect(mockRecipeRepository.save).not.toHaveBeenCalled();
    });

    it('should handle invalid ingredient', async () => {
      // Arrange
      const createDto: CreateRecipeDto = {
        title: 'Test Recipe',
        description: 'A test recipe',
        category: RecipeCategory.MainCourse,
        ingredients: [
          {
            id: '1',
            name: '', // Invalid empty name
            amount: null,
            notes: null,
            order: 1,
          },
        ],
      };

      // Act
      const result = await useCase.execute(createDto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Invalid ingredient');
      expect(mockRecipeRepository.save).not.toHaveBeenCalled();
    });

    it('should handle invalid direction', async () => {
      // Arrange
      const createDto: CreateRecipeDto = {
        title: 'Test Recipe',
        description: 'A test recipe',
        category: RecipeCategory.MainCourse,
        directions: [
          {
            id: '1',
            instruction: '', // Invalid empty instruction
            order: 1,
            notes: null,
          },
        ],
      };

      // Act
      const result = await useCase.execute(createDto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Invalid direction');
      expect(mockRecipeRepository.save).not.toHaveBeenCalled();
    });

    it('should handle invalid tag', async () => {
      // Arrange
      const createDto: CreateRecipeDto = {
        title: 'Test Recipe',
        description: 'A test recipe',
        category: RecipeCategory.MainCourse,
        tags: [
          {
            id: '1',
            name: '', // Invalid empty name
            color: '#FF0000',
          },
        ],
      };

      // Act
      const result = await useCase.execute(createDto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Invalid tag');
      expect(mockRecipeRepository.save).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const createDto: CreateRecipeDto = {
        title: 'Test Recipe',
        description: 'A test recipe',
        category: RecipeCategory.MainCourse,
      };

      mockRecipeRepository.save.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await useCase.execute(createDto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Failed to create recipe');
      expect(result.error).toContain('Unexpected error');
    });
  });
});
