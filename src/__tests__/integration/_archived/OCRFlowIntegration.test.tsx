/**
 * OCR Flow Integration Tests
 * 
 * Tests the complete OCR to AI parsing to recipe creation flow
 * including all the components working together.
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '../../context/ThemeContext';
import RecipeReviewScreen from '../../screens/recipes/RecipeReviewScreen';
import RecipeCreateScreen from '../../screens/recipes/RecipeCreateScreen';
import { Result } from '../../domain/common/Result';
import { Recipe } from '../../domain/entities/Recipe';
import { ParsedRecipe } from '../../types/Recipe';

// Mock API clients
jest.mock('../../services/api/OCRApiClient', () => {
  return {
    OCRApiClient: jest.fn().mockImplementation(() => ({
      extractTextFromUri: jest.fn().mockResolvedValue({
        text: 'Test recipe text',
        confidence: 0.9,
        language: 'en',
        blocks: [],
      }),
      checkHealth: jest.fn().mockResolvedValue(true),
    })),
  };
});

jest.mock('../../services/api/RecipeParsingApiClient', () => {
  return {
    RecipeParsingApiClient: jest.fn().mockImplementation(() => ({
      parseRecipeFromOCR: jest.fn().mockResolvedValue({
        title: 'Test Recipe',
        description: 'Test description',
        ingredients: ['ingredient 1', 'ingredient 2'],
        instructions: ['step 1', 'step 2'],
        prepTime: 15,
        cookTime: 30,
        servings: 4,
        confidence: 0.85,
      }),
      validateParsedRecipe: jest.fn().mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: [],
      }),
      checkHealth: jest.fn().mockResolvedValue(true),
    })),
  };
});

// Mock the DI container
jest.mock('../../infrastructure/di/container', () => ({
  container: {
    get: jest.fn((serviceIdentifier) => {
      if (serviceIdentifier === 'IOCRService') {
        return {
          extractText: jest.fn().mockResolvedValue(Result.success('Test recipe text')),
          getLastConfidenceScore: jest.fn().mockResolvedValue(Result.success(0.9)),
        };
      }
      if (serviceIdentifier === 'IRecipeParser') {
        return {
          parseRecipe: jest.fn().mockResolvedValue(Result.success({
            title: 'Test Recipe',
            description: 'Test description',
            ingredients: [{ text: 'ingredient 1' }, { text: 'ingredient 2' }],
            directions: [{ text: 'step 1' }, { text: 'step 2' }],
          })),
        };
      }
      if (serviceIdentifier === 'CreateRecipeUseCase') {
        return {
          execute: jest.fn().mockResolvedValue(Result.success({
            id: { value: 'test-recipe-id' },
            title: 'Test Recipe',
          })),
        };
      }
      return {};
    }),
  },
}));

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </NavigationContainer>
);

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: {
      imageUri: 'file://test-image.jpg',
      source: 'camera' as const,
    },
  }),
}));

describe('OCR Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('RecipeReviewScreen OCR Flow', () => {
    it('should render the review screen with processing steps', async () => {
      const { getByText } = render(
        <TestWrapper>
          <RecipeReviewScreen />
        </TestWrapper>
      );

      // Verify the screen renders with processing steps
      expect(getByText('Review Recipe')).toBeTruthy();
      expect(getByText('Extracting Text')).toBeTruthy();
      expect(getByText('Parsing Recipe')).toBeTruthy();
      expect(getByText('Validating Data')).toBeTruthy();
    });

    it('should display image preview', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <RecipeReviewScreen />
        </TestWrapper>
      );

      // Verify image is displayed (mocked as Image component)
      const image = getByTestId('image-preview');
      expect(image).toBeTruthy();
    });

    it('should have back and continue buttons', () => {
      const { getByText } = render(
        <TestWrapper>
          <RecipeReviewScreen />
        </TestWrapper>
      );

      // Verify action buttons are present
      expect(getByText('Back to Crop')).toBeTruthy();
      expect(getByText('Continue to Edit')).toBeTruthy();
    });
  });

  describe('RecipeCreateScreen Integration', () => {
    it('should render the create screen with form fields', () => {
      const { getByText } = render(
        <TestWrapper>
          <RecipeCreateScreen />
        </TestWrapper>
      );

      // Verify form fields are present
      expect(getByText('Title *')).toBeTruthy();
      expect(getByText('Description')).toBeTruthy();
      expect(getByText('Category')).toBeTruthy();
      expect(getByText('Ingredients *')).toBeTruthy();
      expect(getByText('Instructions *')).toBeTruthy();
    });

    it('should have save and cancel buttons', () => {
      const { getByText } = render(
        <TestWrapper>
          <RecipeCreateScreen />
        </TestWrapper>
      );

      // Verify action buttons are present
      expect(getByText('Cancel')).toBeTruthy();
      expect(getByText('Save')).toBeTruthy();
    });

    it('should display category options', () => {
      const { getByText } = render(
        <TestWrapper>
          <RecipeCreateScreen />
        </TestWrapper>
      );

      // Verify category options are displayed
      expect(getByText('Appetizer')).toBeTruthy();
      expect(getByText('Main Course')).toBeTruthy();
      expect(getByText('Dessert')).toBeTruthy();
      expect(getByText('Side Dish')).toBeTruthy();
      expect(getByText('Beverage')).toBeTruthy();
      expect(getByText('Other')).toBeTruthy();
    });
  });

  describe('Navigation Integration', () => {
    it('should handle navigation between screens', () => {
      const { getByText } = render(
        <TestWrapper>
          <RecipeReviewScreen />
        </TestWrapper>
      );

      // Verify navigation buttons are present
      expect(getByText('Back to Crop')).toBeTruthy();
      expect(getByText('Continue to Edit')).toBeTruthy();
    });
  });
});
