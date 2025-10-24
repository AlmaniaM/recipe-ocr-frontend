import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '../../context/ThemeContext';
import { CreateRecipeUseCase } from '../../application/useCases/recipes/CreateRecipeUseCase';
import { UpdateRecipeUseCase } from '../../application/useCases/recipes/UpdateRecipeUseCase';
import { DeleteRecipeUseCase } from '../../application/useCases/recipes/DeleteRecipeUseCase';
import { CaptureAndProcessRecipeUseCase } from '../../application/useCases/ocr/CaptureAndProcessRecipeUseCase';
import { ThemeAwareErrorHandler } from '../../application/utils/ThemeAwareErrorHandler';
import { CreateRecipeDto, UpdateRecipeDto } from '../../application/dto/RecipeDto';
import { RecipeCategory } from '../../domain/enums/RecipeCategory';
import { Result } from '../../domain/common/Result';
import { Recipe } from '../../domain/entities/Recipe';

// Mock the repository
const mockRecipeRepository = {
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

// Mock the OCR service
const mockOCRService = {
  extractText: jest.fn(),
  isAvailable: jest.fn(),
  getLastConfidenceScore: jest.fn(),
};

// Mock the recipe parser
const mockRecipeParser = {
  parseRecipe: jest.fn(),
  validateRecipeText: jest.fn(),
  getParsingConfidence: jest.fn(),
};

// Test component that uses use cases with theme context
const TestComponent: React.FC<{ themeName: string }> = ({ themeName }) => {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    testUseCasesWithTheme();
  }, [themeName]);

  const testUseCasesWithTheme = async () => {
    try {
      // Test CreateRecipeUseCase with theme
      const createUseCase = new CreateRecipeUseCase(mockRecipeRepository);
      const createDto: CreateRecipeDto = {
        title: 'Test Recipe',
        description: 'A test recipe',
        category: RecipeCategory.MainCourse,
      };

      const createResult = await createUseCase.execute(createDto);
      if (!createResult.isSuccess) {
        setError(createResult.error);
        return;
      }

      setSuccess('Create recipe test passed');
    } catch (err) {
      setError(`Unexpected error: ${err}`);
    }
  };

  return (
    <>
      {error && <div testID="error">{error}</div>}
      {success && <div testID="success">{success}</div>}
    </>
  );
};

describe('Use Case Theme Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ThemeAwareErrorHandler', () => {
    it('should create user-friendly error messages for warm inviting theme', () => {
      const theme = {
        name: 'Warm & Inviting',
        colors: {
          primary: '#FF6B35',
          secondary: '#F7931E',
          background: '#FFF8F5',
          surface: '#FFFFFF',
          textPrimary: '#2D1B1B',
          textSecondary: '#8B7355',
          success: '#4CAF50',
          error: '#F44336',
          warning: '#FF9800',
          border: '#E8D5C4',
        },
        typography: {
          headerFont: 'Inter-Bold',
          bodyFont: 'Inter-Regular',
          captionFont: 'Inter-Medium',
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32,
        },
        borderRadius: {
          sm: 4,
          md: 8,
          lg: 12,
        }
      };

      const error = 'Recipe title is required';
      const userFriendlyError = ThemeAwareErrorHandler.createUserFriendlyError(
        error,
        theme,
        'Recipe Creation'
      );

      expect(userFriendlyError).toContain('💕');
      expect(userFriendlyError).toContain('Please enter a recipe title');
    });

    it('should create user-friendly error messages for clean modern theme', () => {
      const theme = {
        name: 'Clean & Modern',
        colors: {
          primary: '#2563EB',
          secondary: '#10B981',
          background: '#FAFAFA',
          surface: '#FFFFFF',
          textPrimary: '#111827',
          textSecondary: '#6B7280',
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
          border: '#E5E7EB',
          accent: '#F59E0B',
        },
        typography: {
          headerFont: 'SFProDisplay-Bold',
          bodyFont: 'SFProText-Regular',
          captionFont: 'SFProText-Medium',
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32,
        },
        borderRadius: {
          sm: 4,
          md: 8,
          lg: 12,
        }
      };

      const error = 'Database error';
      const userFriendlyError = ThemeAwareErrorHandler.createUserFriendlyError(
        error,
        theme,
        'Recipe Update'
      );

      expect(userFriendlyError).toContain('✨');
      expect(userFriendlyError).toContain('Unable to save your changes');
    });

    it('should create user-friendly error messages for earthy natural theme', () => {
      const theme = {
        name: 'Earthy & Natural',
        colors: {
          primary: '#059669',
          secondary: '#D97706',
          background: '#FEFEFE',
          surface: '#FFFFFF',
          textPrimary: '#1F2937',
          textSecondary: '#6B7280',
          success: '#059669',
          error: '#DC2626',
          warning: '#D97706',
          border: '#D1D5DB',
          accent: '#DC2626',
        },
        typography: {
          headerFont: 'Poppins-Bold',
          bodyFont: 'OpenSans-Regular',
          captionFont: 'OpenSans-Medium',
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32,
        },
        borderRadius: {
          sm: 4,
          md: 8,
          lg: 12,
        }
      };

      const error = 'OCR service is not available';
      const userFriendlyError = ThemeAwareErrorHandler.createUserFriendlyError(
        error,
        theme,
        'Recipe Processing'
      );

      expect(userFriendlyError).toContain('🌱');
      expect(userFriendlyError).toContain('Text recognition is currently unavailable');
    });

    it('should get appropriate error severity levels', () => {
      expect(ThemeAwareErrorHandler.getErrorSeverity('Database error')).toBe('high');
      expect(ThemeAwareErrorHandler.getErrorSeverity('OCR service is not available')).toBe('high');
      expect(ThemeAwareErrorHandler.getErrorSeverity('No text could be extracted from the image')).toBe('medium');
      expect(ThemeAwareErrorHandler.getErrorSeverity('Recipe title is required')).toBe('low');
    });

    it('should get theme-appropriate error colors', () => {
      const theme = {
        name: 'Clean & Modern',
        colors: {
          primary: '#2563EB',
          secondary: '#10B981',
          background: '#FAFAFA',
          surface: '#FFFFFF',
          textPrimary: '#111827',
          textSecondary: '#6B7280',
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
          border: '#E5E7EB',
          accent: '#F59E0B',
        },
        typography: {
          headerFont: 'SFProDisplay-Bold',
          bodyFont: 'SFProText-Regular',
          captionFont: 'SFProText-Medium',
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32,
        },
        borderRadius: {
          sm: 4,
          md: 8,
          lg: 12,
        }
      };

      expect(ThemeAwareErrorHandler.getErrorColor(theme, 'high')).toBe('#EF4444');
      expect(ThemeAwareErrorHandler.getErrorColor(theme, 'medium')).toBe('#F59E0B');
      expect(ThemeAwareErrorHandler.getErrorColor(theme, 'low')).toBe('#6B7280');
      expect(ThemeAwareErrorHandler.getSuccessColor(theme)).toBe('#10B981');
    });
  });

  describe('Use Cases with Theme Context', () => {
    it('should handle CreateRecipeUseCase with theme-aware error handling', async () => {
      // Arrange
      const createUseCase = new CreateRecipeUseCase(mockRecipeRepository);
      const createDto: CreateRecipeDto = {
        title: '', // Invalid empty title
        description: 'A test recipe',
        category: RecipeCategory.MainCourse,
      };

      const theme = {
        name: 'Warm & Inviting',
        colors: {
          primary: '#FF6B35',
          secondary: '#F7931E',
          background: '#FFF8F5',
          surface: '#FFFFFF',
          textPrimary: '#2D1B1B',
          textSecondary: '#8B7355',
          success: '#4CAF50',
          error: '#F44336',
          warning: '#FF9800',
          border: '#E8D5C4',
        },
        typography: {
          headerFont: 'Inter-Bold',
          bodyFont: 'Inter-Regular',
          captionFont: 'Inter-Medium',
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32,
        },
        borderRadius: {
          sm: 4,
          md: 8,
          lg: 12,
        }
      };

      // Act
      const result = await createUseCase.execute(createDto);
      const themeAwareResult = ThemeAwareErrorHandler.wrapWithThemeHandling(
        result,
        theme,
        'Recipe Creation'
      );

      // Assert
      expect(themeAwareResult.isSuccess).toBe(false);
      expect(themeAwareResult.error).toContain('💕');
      expect(themeAwareResult.error).toContain('Please enter a recipe title');
    });

    it('should handle UpdateRecipeUseCase with theme-aware error handling', async () => {
      // Arrange
      const updateUseCase = new UpdateRecipeUseCase(mockRecipeRepository);
      const updateDto: UpdateRecipeDto = {
        id: 'invalid-id',
        title: 'Updated Recipe',
      };

      const theme = {
        name: 'Clean & Modern',
        colors: {
          primary: '#2563EB',
          secondary: '#10B981',
          background: '#FAFAFA',
          surface: '#FFFFFF',
          textPrimary: '#111827',
          textSecondary: '#6B7280',
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
          border: '#E5E7EB',
          accent: '#F59E0B',
        },
        typography: {
          headerFont: 'SFProDisplay-Bold',
          bodyFont: 'SFProText-Regular',
          captionFont: 'SFProText-Medium',
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32,
        },
        borderRadius: {
          sm: 4,
          md: 8,
          lg: 12,
        }
      };

      // Act
      const result = await updateUseCase.execute(updateDto);
      const themeAwareResult = ThemeAwareErrorHandler.wrapWithThemeHandling(
        result,
        theme,
        'Recipe Update'
      );

      // Assert
      expect(themeAwareResult.isSuccess).toBe(false);
      expect(themeAwareResult.error).toContain('✨');
    });

    it('should handle CaptureAndProcessRecipeUseCase with theme-aware error handling', async () => {
      // Arrange
      const captureUseCase = new CaptureAndProcessRecipeUseCase(
        mockOCRService,
        mockRecipeParser,
        mockRecipeRepository
      );

      const theme = {
        name: 'Earthy & Natural',
        colors: {
          primary: '#059669',
          secondary: '#D97706',
          background: '#FEFEFE',
          surface: '#FFFFFF',
          textPrimary: '#1F2937',
          textSecondary: '#6B7280',
          success: '#059669',
          error: '#DC2626',
          warning: '#D97706',
          border: '#D1D5DB',
          accent: '#DC2626',
        },
        typography: {
          headerFont: 'Poppins-Bold',
          bodyFont: 'OpenSans-Regular',
          captionFont: 'OpenSans-Medium',
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32,
        },
        borderRadius: {
          sm: 4,
          md: 8,
          lg: 12,
        }
      };

      // Mock OCR service to return unavailable
      mockOCRService.isAvailable.mockResolvedValue(Result.success(false));

      // Act
      const result = await captureUseCase.execute('file://path/to/image.jpg');
      const themeAwareResult = ThemeAwareErrorHandler.wrapWithThemeHandling(
        result,
        theme,
        'Recipe Processing'
      );

      // Assert
      expect(themeAwareResult.isSuccess).toBe(false);
      expect(themeAwareResult.error).toContain('🌱');
      expect(themeAwareResult.error).toContain('Text recognition is currently unavailable');
    });

    it('should handle successful operations with theme-aware success messages', async () => {
      // Arrange
      const createUseCase = new CreateRecipeUseCase(mockRecipeRepository);
      const createDto: CreateRecipeDto = {
        title: 'Test Recipe',
        description: 'A test recipe',
        category: RecipeCategory.MainCourse,
      };

      const mockRecipe = Recipe.create('Test Recipe', 'A test recipe', RecipeCategory.MainCourse).value;
      mockRecipeRepository.save.mockResolvedValue(Result.success(mockRecipe));

      const theme = {
        name: 'Warm & Inviting',
        colors: {
          primary: '#FF6B35',
          secondary: '#F7931E',
          background: '#FFF8F5',
          surface: '#FFFFFF',
          textPrimary: '#2D1B1B',
          textSecondary: '#8B7355',
          success: '#4CAF50',
          error: '#F44336',
          warning: '#FF9800',
          border: '#E8D5C4',
        },
        typography: {
          headerFont: 'Inter-Bold',
          bodyFont: 'Inter-Regular',
          captionFont: 'Inter-Medium',
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32,
        },
        borderRadius: {
          sm: 4,
          md: 8,
          lg: 12,
        }
      };

      // Act
      const result = await createUseCase.execute(createDto);
      const successMessage = ThemeAwareErrorHandler.createSuccessMessage(
        'Recipe created successfully',
        theme,
        'Recipe Creation'
      );

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(successMessage).toContain('💕');
      expect(successMessage).toContain('Recipe saved! 🎉');
    });
  });

  describe('Theme Context Integration', () => {
    it('should render test component with theme context', async () => {
      // Arrange
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent themeName="warmInviting" />
        </ThemeProvider>
      );

      // Mock successful recipe creation
      const mockRecipe = Recipe.create('Test Recipe', 'A test recipe', RecipeCategory.MainCourse).value;
      mockRecipeRepository.save.mockResolvedValue(Result.success(mockRecipe));

      // Act & Assert
      await waitFor(() => {
        expect(getByTestId('success')).toBeTruthy();
      });
    });

    it('should handle theme switching in use case context', async () => {
      // Arrange
      const { getByTestId, rerender } = render(
        <ThemeProvider>
          <TestComponent themeName="warmInviting" />
        </ThemeProvider>
      );

      // Mock successful recipe creation
      const mockRecipe = Recipe.create('Test Recipe', 'A test recipe', RecipeCategory.MainCourse).value;
      mockRecipeRepository.save.mockResolvedValue(Result.success(mockRecipe));

      // Act - switch theme
      rerender(
        <ThemeProvider>
          <TestComponent themeName="cleanModern" />
        </ThemeProvider>
      );

      // Assert
      await waitFor(() => {
        expect(getByTestId('success')).toBeTruthy();
      });
    });
  });
});
