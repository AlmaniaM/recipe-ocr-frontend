import { CaptureAndProcessRecipeUseCase } from '../../../application/useCases/ocr/CaptureAndProcessRecipeUseCase';
import { IOCRService } from '../../../application/ports/IOCRService';
import { IRecipeParser } from '../../../application/ports/IRecipeParser';
import { IRecipeRepository } from '../../../application/ports/IRecipeRepository';
import { Recipe } from '../../../domain/entities/Recipe';
import { RecipeCategory } from '../../../domain/enums/RecipeCategory';
import { Result } from '../../../domain/common/Result';

// Mock the services
const mockOCRService: jest.Mocked<IOCRService> = {
  extractText: jest.fn(),
  isAvailable: jest.fn(),
  getLastConfidenceScore: jest.fn(),
};

const mockRecipeParser: jest.Mocked<IRecipeParser> = {
  parseRecipe: jest.fn(),
  validateRecipeText: jest.fn(),
  getParsingConfidence: jest.fn(),
};

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

describe('CaptureAndProcessRecipeUseCase', () => {
  let useCase: CaptureAndProcessRecipeUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CaptureAndProcessRecipeUseCase(
      mockOCRService,
      mockRecipeParser,
      mockRecipeRepository
    );
  });

  describe('execute', () => {
    it('should successfully process a recipe from image', async () => {
      // Arrange
      const imageUri = 'file://path/to/image.jpg';
      const extractedText = 'Chocolate Cake Recipe\nIngredients:\n- 2 cups flour\n- 1 cup sugar\nInstructions:\n1. Mix ingredients\n2. Bake for 30 minutes';
      const mockRecipe = Recipe.create('Chocolate Cake Recipe', 'A delicious chocolate cake', RecipeCategory.Dessert).value;

      mockOCRService.isAvailable.mockResolvedValue(Result.success(true));
      mockOCRService.extractText.mockResolvedValue(Result.success(extractedText));
      mockRecipeParser.validateRecipeText.mockResolvedValue(Result.success(true));
      mockRecipeParser.parseRecipe.mockResolvedValue(Result.success(mockRecipe));
      mockRecipeRepository.save.mockResolvedValue(Result.success(mockRecipe));

      // Act
      const result = await useCase.execute(imageUri);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(mockRecipe);
      expect(mockOCRService.isAvailable).toHaveBeenCalledTimes(1);
      expect(mockOCRService.extractText).toHaveBeenCalledWith(imageUri);
      expect(mockRecipeParser.validateRecipeText).toHaveBeenCalledWith(extractedText);
      expect(mockRecipeParser.parseRecipe).toHaveBeenCalledWith(extractedText);
      expect(mockRecipeRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should process without saving to repository when requested', async () => {
      // Arrange
      const imageUri = 'file://path/to/image.jpg';
      const extractedText = 'Simple Recipe\nIngredients:\n- 1 cup flour';
      const mockRecipe = Recipe.create('Simple Recipe', 'A simple recipe', RecipeCategory.MainCourse).value;

      mockOCRService.isAvailable.mockResolvedValue(Result.success(true));
      mockOCRService.extractText.mockResolvedValue(Result.success(extractedText));
      mockRecipeParser.validateRecipeText.mockResolvedValue(Result.success(true));
      mockRecipeParser.parseRecipe.mockResolvedValue(Result.success(mockRecipe));

      // Act
      const result = await useCase.execute(imageUri, false);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(mockRecipe);
      expect(mockRecipeRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when image URI is empty', async () => {
      // Act
      const result = await useCase.execute('');

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Image URI is required');
      expect(mockOCRService.isAvailable).not.toHaveBeenCalled();
    });

    it('should fail when OCR service is not available', async () => {
      // Arrange
      const imageUri = 'file://path/to/image.jpg';

      mockOCRService.isAvailable.mockResolvedValue(Result.success(false));

      // Act
      const result = await useCase.execute(imageUri);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('OCR service is not available');
      expect(mockOCRService.extractText).not.toHaveBeenCalled();
    });

    it('should fail when OCR service availability check fails', async () => {
      // Arrange
      const imageUri = 'file://path/to/image.jpg';

      mockOCRService.isAvailable.mockResolvedValue(Result.failure('OCR service error'));

      // Act
      const result = await useCase.execute(imageUri);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('OCR service error');
      expect(mockOCRService.extractText).not.toHaveBeenCalled();
    });

    it('should fail when OCR extraction fails', async () => {
      // Arrange
      const imageUri = 'file://path/to/image.jpg';

      mockOCRService.isAvailable.mockResolvedValue(Result.success(true));
      mockOCRService.extractText.mockResolvedValue(Result.failure('OCR extraction failed'));

      // Act
      const result = await useCase.execute(imageUri);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('OCR failed: OCR extraction failed');
      expect(mockRecipeParser.validateRecipeText).not.toHaveBeenCalled();
    });

    it('should fail when no text is extracted', async () => {
      // Arrange
      const imageUri = 'file://path/to/image.jpg';

      mockOCRService.isAvailable.mockResolvedValue(Result.success(true));
      mockOCRService.extractText.mockResolvedValue(Result.success(''));

      // Act
      const result = await useCase.execute(imageUri);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('No text could be extracted from the image');
      expect(mockRecipeParser.validateRecipeText).not.toHaveBeenCalled();
    });

    it('should fail when text validation fails', async () => {
      // Arrange
      const imageUri = 'file://path/to/image.jpg';
      const extractedText = 'This is not a recipe';

      mockOCRService.isAvailable.mockResolvedValue(Result.success(true));
      mockOCRService.extractText.mockResolvedValue(Result.success(extractedText));
      mockRecipeParser.validateRecipeText.mockResolvedValue(Result.failure('Validation error'));

      // Act
      const result = await useCase.execute(imageUri);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Validation error');
      expect(mockRecipeParser.parseRecipe).not.toHaveBeenCalled();
    });

    it('should fail when text is not a recipe', async () => {
      // Arrange
      const imageUri = 'file://path/to/image.jpg';
      const extractedText = 'This is not a recipe';

      mockOCRService.isAvailable.mockResolvedValue(Result.success(true));
      mockOCRService.extractText.mockResolvedValue(Result.success(extractedText));
      mockRecipeParser.validateRecipeText.mockResolvedValue(Result.success(false));

      // Act
      const result = await useCase.execute(imageUri);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('The extracted text does not appear to be a recipe');
      expect(mockRecipeParser.parseRecipe).not.toHaveBeenCalled();
    });

    it('should fail when recipe parsing fails', async () => {
      // Arrange
      const imageUri = 'file://path/to/image.jpg';
      const extractedText = 'Chocolate Cake Recipe\nIngredients:\n- 2 cups flour';

      mockOCRService.isAvailable.mockResolvedValue(Result.success(true));
      mockOCRService.extractText.mockResolvedValue(Result.success(extractedText));
      mockRecipeParser.validateRecipeText.mockResolvedValue(Result.success(true));
      mockRecipeParser.parseRecipe.mockResolvedValue(Result.failure('Parsing failed'));

      // Act
      const result = await useCase.execute(imageUri);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Recipe parsing failed: Parsing failed');
      expect(mockRecipeRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when repository save fails', async () => {
      // Arrange
      const imageUri = 'file://path/to/image.jpg';
      const extractedText = 'Chocolate Cake Recipe\nIngredients:\n- 2 cups flour';
      const mockRecipe = Recipe.create('Chocolate Cake Recipe', 'A delicious chocolate cake', RecipeCategory.Dessert).value;

      mockOCRService.isAvailable.mockResolvedValue(Result.success(true));
      mockOCRService.extractText.mockResolvedValue(Result.success(extractedText));
      mockRecipeParser.validateRecipeText.mockResolvedValue(Result.success(true));
      mockRecipeParser.parseRecipe.mockResolvedValue(Result.success(mockRecipe));
      mockRecipeRepository.save.mockResolvedValue(Result.failure('Save failed'));

      // Act
      const result = await useCase.execute(imageUri);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Failed to save recipe: Save failed');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const imageUri = 'file://path/to/image.jpg';

      mockOCRService.isAvailable.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await useCase.execute(imageUri);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Failed to capture and process recipe');
      expect(result.error).toContain('Unexpected error');
    });
  });

  describe('executeMultiple', () => {
    it('should process multiple images successfully', async () => {
      // Arrange
      const imageUris = ['file://path/to/image1.jpg', 'file://path/to/image2.jpg'];
      const extractedText1 = 'Recipe 1\nIngredients:\n- 1 cup flour';
      const extractedText2 = 'Recipe 2\nIngredients:\n- 2 cups sugar';
      const mockRecipe1 = Recipe.create('Recipe 1', 'First recipe', RecipeCategory.MainCourse).value;
      const mockRecipe2 = Recipe.create('Recipe 2', 'Second recipe', RecipeCategory.Dessert).value;

      mockOCRService.isAvailable.mockResolvedValue(Result.success(true));
      mockOCRService.extractText
        .mockResolvedValueOnce(Result.success(extractedText1))
        .mockResolvedValueOnce(Result.success(extractedText2));
      mockRecipeParser.validateRecipeText
        .mockResolvedValueOnce(Result.success(true))
        .mockResolvedValueOnce(Result.success(true));
      mockRecipeParser.parseRecipe
        .mockResolvedValueOnce(Result.success(mockRecipe1))
        .mockResolvedValueOnce(Result.success(mockRecipe2));
      mockRecipeRepository.save
        .mockResolvedValue(Result.success(mockRecipe1))
        .mockResolvedValue(Result.success(mockRecipe2));

      // Act
      const result = await useCase.executeMultiple(imageUris);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(2);
      expect(result.value?.[0]).toBe(mockRecipe1);
      expect(result.value?.[1]).toBe(mockRecipe2);
    });

    it('should handle partial failures', async () => {
      // Arrange
      const imageUris = ['file://path/to/image1.jpg', 'file://path/to/image2.jpg'];
      const extractedText1 = 'Recipe 1\nIngredients:\n- 1 cup flour';
      const mockRecipe1 = Recipe.create('Recipe 1', 'First recipe', RecipeCategory.MainCourse).value;

      mockOCRService.isAvailable.mockResolvedValue(Result.success(true));
      mockOCRService.extractText
        .mockResolvedValueOnce(Result.success(extractedText1))
        .mockResolvedValueOnce(Result.failure('OCR failed for image 2'));
      mockRecipeParser.validateRecipeText.mockResolvedValueOnce(Result.success(true));
      mockRecipeParser.parseRecipe.mockResolvedValueOnce(Result.success(mockRecipe1));
      mockRecipeRepository.save.mockResolvedValue(Result.success(mockRecipe1));

      // Act
      const result = await useCase.executeMultiple(imageUris);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(1);
      expect(result.value?.[0]).toBe(mockRecipe1);
    });

    it('should fail when all images fail to process', async () => {
      // Arrange
      const imageUris = ['file://path/to/image1.jpg', 'file://path/to/image2.jpg'];

      mockOCRService.isAvailable.mockResolvedValue(Result.success(true));
      mockOCRService.extractText
        .mockResolvedValueOnce(Result.failure('OCR failed for image 1'))
        .mockResolvedValueOnce(Result.failure('OCR failed for image 2'));

      // Act
      const result = await useCase.executeMultiple(imageUris);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('All images failed to process');
    });

    it('should fail when no image URIs provided', async () => {
      // Act
      const result = await useCase.executeMultiple([]);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Image URIs are required');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const imageUris = ['file://path/to/image1.jpg'];

      mockOCRService.isAvailable.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await useCase.executeMultiple(imageUris);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Failed to process multiple images');
      expect(result.error).toContain('Unexpected error');
    });
  });

  describe('getLastOCRConfidence', () => {
    it('should return OCR confidence score', async () => {
      // Arrange
      const confidence = 0.95;
      mockOCRService.getLastConfidenceScore.mockResolvedValue(Result.success(confidence));

      // Act
      const result = await useCase.getLastOCRConfidence();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(confidence);
    });

    it('should handle OCR confidence errors', async () => {
      // Arrange
      mockOCRService.getLastConfidenceScore.mockResolvedValue(Result.failure('Confidence error'));

      // Act
      const result = await useCase.getLastOCRConfidence();

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Confidence error');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      mockOCRService.getLastConfidenceScore.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await useCase.getLastOCRConfidence();

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Failed to get OCR confidence');
      expect(result.error).toContain('Unexpected error');
    });
  });

  describe('getLastParsingConfidence', () => {
    it('should return parsing confidence score', async () => {
      // Arrange
      const confidence = 0.88;
      mockRecipeParser.getParsingConfidence.mockResolvedValue(Result.success(confidence));

      // Act
      const result = await useCase.getLastParsingConfidence();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(confidence);
    });

    it('should handle parsing confidence errors', async () => {
      // Arrange
      mockRecipeParser.getParsingConfidence.mockResolvedValue(Result.failure('Parsing confidence error'));

      // Act
      const result = await useCase.getLastParsingConfidence();

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Parsing confidence error');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      mockRecipeParser.getParsingConfidence.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await useCase.getLastParsingConfidence();

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Failed to get parsing confidence');
      expect(result.error).toContain('Unexpected error');
    });
  });
});
