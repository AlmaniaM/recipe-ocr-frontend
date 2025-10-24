import { UpdateRecipeUseCase } from '../../../application/useCases/recipes/UpdateRecipeUseCase';
import { IRecipeRepository } from '../../../application/ports/IRecipeRepository';
import { UpdateRecipeDto } from '../../../application/dto/RecipeDto';
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

describe('UpdateRecipeUseCase', () => {
  let useCase: UpdateRecipeUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateRecipeUseCase(mockRecipeRepository);
  });

  describe('execute', () => {
    it('should update a recipe with minimal changes', async () => {
      // Arrange
      const existingRecipe = Recipe.create('Original Title', 'Original description', RecipeCategory.MainCourse).value;
      const updateDto: UpdateRecipeDto = {
        id: existingRecipe.id.value,
        title: 'Updated Title',
      };

      mockRecipeRepository.findById.mockResolvedValue(Result.success(existingRecipe));
      mockRecipeRepository.save.mockResolvedValue(Result.success(existingRecipe));

      // Act
      const result = await useCase.execute(updateDto);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockRecipeRepository.findById).toHaveBeenCalledWith(existingRecipe.id);
      expect(mockRecipeRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should update all recipe properties', async () => {
      // Arrange
      const existingRecipe = Recipe.create('Original Title', 'Original description', RecipeCategory.MainCourse).value;
      const updateDto: UpdateRecipeDto = {
        id: existingRecipe.id.value,
        title: 'Updated Title',
        description: 'Updated description',
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
        source: 'Updated source',
        imagePath: '/path/to/updated/image.jpg',
        imageUrl: 'https://example.com/image.jpg',
      };

      mockRecipeRepository.findById.mockResolvedValue(Result.success(existingRecipe));
      mockRecipeRepository.save.mockResolvedValue(Result.success(existingRecipe));

      // Act
      const result = await useCase.execute(updateDto);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockRecipeRepository.findById).toHaveBeenCalledWith(existingRecipe.id);
      expect(mockRecipeRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should fail when recipe ID is empty', async () => {
      // Arrange
      const updateDto: UpdateRecipeDto = {
        id: '',
        title: 'Updated Title',
      };

      // Act
      const result = await useCase.execute(updateDto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe ID is required');
      expect(mockRecipeRepository.findById).not.toHaveBeenCalled();
    });

    it('should fail when recipe is not found', async () => {
      // Arrange
      const updateDto: UpdateRecipeDto = {
        id: 'non-existent-id',
        title: 'Updated Title',
      };

      mockRecipeRepository.findById.mockResolvedValue(Result.success(null));

      // Act
      const result = await useCase.execute(updateDto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe not found');
      expect(mockRecipeRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when title is empty', async () => {
      // Arrange
      const existingRecipe = Recipe.create('Original Title', 'Original description', RecipeCategory.MainCourse).value;
      const updateDto: UpdateRecipeDto = {
        id: existingRecipe.id.value,
        title: '',
      };

      // Act
      const result = await useCase.execute(updateDto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe title cannot be empty');
      expect(mockRecipeRepository.findById).not.toHaveBeenCalled();
    });

    it('should fail when title is too long', async () => {
      // Arrange
      const existingRecipe = Recipe.create('Original Title', 'Original description', RecipeCategory.MainCourse).value;
      const updateDto: UpdateRecipeDto = {
        id: existingRecipe.id.value,
        title: 'A'.repeat(201),
      };

      // Act
      const result = await useCase.execute(updateDto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe title cannot exceed 200 characters');
      expect(mockRecipeRepository.findById).not.toHaveBeenCalled();
    });

    it('should fail when description is too long', async () => {
      // Arrange
      const existingRecipe = Recipe.create('Original Title', 'Original description', RecipeCategory.MainCourse).value;
      const updateDto: UpdateRecipeDto = {
        id: existingRecipe.id.value,
        description: 'A'.repeat(1001),
      };

      // Act
      const result = await useCase.execute(updateDto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe description cannot exceed 1000 characters');
      expect(mockRecipeRepository.findById).not.toHaveBeenCalled();
    });

    it('should fail when source is too long', async () => {
      // Arrange
      const existingRecipe = Recipe.create('Original Title', 'Original description', RecipeCategory.MainCourse).value;
      const updateDto: UpdateRecipeDto = {
        id: existingRecipe.id.value,
        source: 'A'.repeat(201),
      };

      // Act
      const result = await useCase.execute(updateDto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe source cannot exceed 200 characters');
      expect(mockRecipeRepository.findById).not.toHaveBeenCalled();
    });

    it('should handle null values for optional properties', async () => {
      // Arrange
      const existingRecipe = Recipe.create('Original Title', 'Original description', RecipeCategory.MainCourse).value;
      const updateDto: UpdateRecipeDto = {
        id: existingRecipe.id.value,
        description: null,
        prepTime: null,
        cookTime: null,
        servings: null,
        source: null,
        imagePath: null,
        imageUrl: null,
      };

      mockRecipeRepository.findById.mockResolvedValue(Result.success(existingRecipe));
      mockRecipeRepository.save.mockResolvedValue(Result.success(existingRecipe));

      // Act
      const result = await useCase.execute(updateDto);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockRecipeRepository.findById).toHaveBeenCalledWith(existingRecipe.id);
      expect(mockRecipeRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should update ingredients when provided', async () => {
      // Arrange
      const existingRecipe = Recipe.create('Original Title', 'Original description', RecipeCategory.MainCourse).value;
      const updateDto: UpdateRecipeDto = {
        id: existingRecipe.id.value,
        ingredients: [
          {
            id: '1',
            name: 'New Ingredient',
            amount: {
              quantity: 1,
              unit: 'cup',
              displayText: '1 cup',
            },
            notes: 'Fresh',
            order: 1,
          },
        ],
      };

      mockRecipeRepository.findById.mockResolvedValue(Result.success(existingRecipe));
      mockRecipeRepository.save.mockResolvedValue(Result.success(existingRecipe));

      // Act
      const result = await useCase.execute(updateDto);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockRecipeRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should update directions when provided', async () => {
      // Arrange
      const existingRecipe = Recipe.create('Original Title', 'Original description', RecipeCategory.MainCourse).value;
      const updateDto: UpdateRecipeDto = {
        id: existingRecipe.id.value,
        directions: [
          {
            id: '1',
            instruction: 'New instruction',
            order: 1,
            notes: 'Important step',
          },
        ],
      };

      mockRecipeRepository.findById.mockResolvedValue(Result.success(existingRecipe));
      mockRecipeRepository.save.mockResolvedValue(Result.success(existingRecipe));

      // Act
      const result = await useCase.execute(updateDto);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockRecipeRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should update tags when provided', async () => {
      // Arrange
      const existingRecipe = Recipe.create('Original Title', 'Original description', RecipeCategory.MainCourse).value;
      const updateDto: UpdateRecipeDto = {
        id: existingRecipe.id.value,
        tags: [
          {
            id: '1',
            name: 'New Tag',
            color: '#FF0000',
          },
        ],
      };

      mockRecipeRepository.findById.mockResolvedValue(Result.success(existingRecipe));
      mockRecipeRepository.save.mockResolvedValue(Result.success(existingRecipe));

      // Act
      const result = await useCase.execute(updateDto);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockRecipeRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should fail when repository findById fails', async () => {
      // Arrange
      const updateDto: UpdateRecipeDto = {
        id: 'valid-id',
        title: 'Updated Title',
      };

      mockRecipeRepository.findById.mockResolvedValue(Result.failure('Database error'));

      // Act
      const result = await useCase.execute(updateDto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Database error');
      expect(mockRecipeRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when repository save fails', async () => {
      // Arrange
      const existingRecipe = Recipe.create('Original Title', 'Original description', RecipeCategory.MainCourse).value;
      const updateDto: UpdateRecipeDto = {
        id: existingRecipe.id.value,
        title: 'Updated Title',
      };

      mockRecipeRepository.findById.mockResolvedValue(Result.success(existingRecipe));
      mockRecipeRepository.save.mockResolvedValue(Result.failure('Save error'));

      // Act
      const result = await useCase.execute(updateDto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Save error');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const updateDto: UpdateRecipeDto = {
        id: 'valid-id',
        title: 'Updated Title',
      };

      mockRecipeRepository.findById.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await useCase.execute(updateDto);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Failed to update recipe');
      expect(result.error).toContain('Unexpected error');
    });
  });
});
