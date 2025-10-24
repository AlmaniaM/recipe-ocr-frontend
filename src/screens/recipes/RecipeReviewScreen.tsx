import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../context/ThemeContext';
import { OCRResult, ParsedRecipe, Ingredient } from '../../types/Recipe';
import { RecipeParsingApiClient } from '../../services/api/RecipeParsingApiClient';
import { OCRApiClient } from '../../services/api/OCRApiClient';
import { container } from '../../infrastructure/di/container';
import { TYPES } from '../../infrastructure/di/types';
import { IOCRService } from '../../application/ports/IOCRService';
import { IRecipeParser } from '../../application/ports/IRecipeParser';
import { Result } from '../../domain/common/Result';

// Navigation types
type RootStackParamList = {
  RecipeReview: {
    imageUri: string;
    source: 'camera' | 'gallery';
  };
  RecipeCreate: {
    parsedRecipe?: ParsedRecipe;
    imageUri?: string;
  };
  ImageCrop: {
    imageUri: string;
  };
};

type RecipeReviewScreenRouteProp = RouteProp<RootStackParamList, 'RecipeReview'>;
type RecipeReviewScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RecipeReview'>;

interface ProcessingStep {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

export default function RecipeReviewScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<RecipeReviewScreenNavigationProp>();
  const route = useRoute<RecipeReviewScreenRouteProp>();
  const { imageUri, source } = route.params;

  // State management
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [parsedRecipe, setParsedRecipe] = useState<ParsedRecipe | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { id: 'ocr', title: 'Extracting Text', status: 'pending' },
    { id: 'parsing', title: 'Parsing Recipe', status: 'pending' },
    { id: 'validation', title: 'Validating Data', status: 'pending' },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Services
  const ocrService = container.get<IOCRService>(TYPES.OCRService);
  const recipeParser = container.get<IRecipeParser>(TYPES.RecipeParser);
  const ocrApiClient = new OCRApiClient();
  const parsingApiClient = new RecipeParsingApiClient();

  // Process the image through OCR and AI parsing
  const processImage = useCallback(async () => {
    if (!imageUri) {
      setError('No image provided');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));

    try {
      // Step 1: OCR Text Extraction
      setProcessingSteps(prev => 
        prev.map(step => 
          step.id === 'ocr' ? { ...step, status: 'processing' } : step
        )
      );

      const ocrResult = await performOCR(imageUri);
      if (!ocrResult.isSuccess) {
        throw new Error(ocrResult.error);
      }

      setOcrResult(ocrResult.value);
      setProcessingSteps(prev => 
        prev.map(step => 
          step.id === 'ocr' ? { ...step, status: 'completed' } : step
        )
      );

      // Step 2: AI Recipe Parsing
      setProcessingSteps(prev => 
        prev.map(step => 
          step.id === 'parsing' ? { ...step, status: 'processing' } : step
        )
      );

      const parsedRecipe = await performRecipeParsing(ocrResult.value.text, imageUri);
      if (!parsedRecipe.isSuccess) {
        throw new Error(parsedRecipe.error);
      }

      setParsedRecipe(parsedRecipe.value);
      setProcessingSteps(prev => 
        prev.map(step => 
          step.id === 'parsing' ? { ...step, status: 'completed' } : step
        )
      );

      // Step 3: Validation
      setProcessingSteps(prev => 
        prev.map(step => 
          step.id === 'validation' ? { ...step, status: 'processing' } : step
        )
      );

      const validationResult = await validateParsedRecipe(parsedRecipe.value);
      if (!validationResult.isSuccess) {
        console.warn('Recipe validation warnings:', validationResult.error);
      }

      setProcessingSteps(prev => 
        prev.map(step => 
          step.id === 'validation' ? { ...step, status: 'completed' } : step
        )
      );

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      
      // Update the current processing step to error
      setProcessingSteps(prev => 
        prev.map(step => 
          step.status === 'processing' 
            ? { ...step, status: 'error', error: errorMessage }
            : step
        )
      );
    } finally {
      setIsProcessing(false);
    }
  }, [imageUri]);

  // Perform OCR using the hybrid service
  const performOCR = async (imageUri: string): Promise<Result<OCRResult>> => {
    try {
      // Try local OCR first
      const localResult = await ocrService.extractText(imageUri);
      if (localResult.isSuccess) {
        // Convert to OCRResult format
        const confidence = await ocrService.getLastConfidenceScore();
        return Result.success({
          text: localResult.value,
          confidence: confidence.isSuccess ? confidence.value : 0.8,
          language: 'en',
          blocks: [],
        });
      }

      // Fallback to cloud OCR via API
      const cloudResult = await ocrApiClient.extractTextFromUri(imageUri, {
        language: 'en',
        enhanceImage: true,
      });

      return Result.success(cloudResult);
    } catch (error) {
      return Result.failure(`OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Perform recipe parsing using AI
  const performRecipeParsing = async (text: string, imageUri: string): Promise<Result<ParsedRecipe>> => {
    try {
      // Try local parser first
      const localResult = await recipeParser.parseRecipe(text);
      if (localResult.isSuccess) {
        // Convert Recipe entity to ParsedRecipe
        const parsedRecipe = convertRecipeToParsedRecipe(localResult.value);
        return Result.success(parsedRecipe);
      }

      // Fallback to cloud parsing via API
      const cloudResult = await parsingApiClient.parseRecipeFromOCR(text, imageUri, {
        language: 'en',
        parseMode: 'detailed',
      });

      return Result.success(cloudResult);
    } catch (error) {
      return Result.failure(`Recipe parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Convert Recipe entity to ParsedRecipe
  const convertRecipeToParsedRecipe = (recipe: any): ParsedRecipe => {
    // Get confidence from parser
    const confidence = 0.8; // Default confidence, could be enhanced to get actual confidence

    return {
      title: recipe.title || 'Untitled Recipe',
      description: recipe.description,
      ingredients: recipe.ingredients?.map((ing: any) => ing.text) || [],
      instructions: recipe.directions?.map((dir: any) => dir.text) || [],
      prepTime: recipe.prepTime?.minutes,
      cookTime: recipe.cookTime?.minutes,
      servings: recipe.servings?.count,
      confidence,
    };
  };

  // Validate parsed recipe
  const validateParsedRecipe = async (recipe: ParsedRecipe): Promise<Result<boolean>> => {
    try {
      const validation = await parsingApiClient.validateParsedRecipe(recipe);
      
      if (!validation.isValid) {
        return Result.failure(`Validation failed: ${validation.errors.join(', ')}`);
      }

      if (validation.warnings.length > 0) {
        console.warn('Recipe validation warnings:', validation.warnings);
      }

      return Result.success(true);
    } catch (error) {
      return Result.failure(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle retry
  const handleRetry = () => {
    processImage();
  };

  // Handle continue to recipe creation
  const handleContinue = () => {
    if (!parsedRecipe) {
      Alert.alert('Error', 'No parsed recipe available');
      return;
    }

    navigation.navigate('RecipeCreate', {
      parsedRecipe,
      imageUri,
    });
  };

  // Handle back to image crop
  const handleBack = () => {
    navigation.goBack();
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await processImage();
    setIsRefreshing(false);
  };

  // Process image on mount
  useEffect(() => {
    processImage();
  }, [processImage]);

  // Render processing step
  const renderProcessingStep = (step: ProcessingStep) => {
    const getStepIcon = () => {
      switch (step.status) {
        case 'completed':
          return '✓';
        case 'processing':
          return <ActivityIndicator size="small" color={theme.colors.primary} />;
        case 'error':
          return '✗';
        default:
          return '○';
      }
    };

    const getStepColor = () => {
      switch (step.status) {
        case 'completed':
          return theme.colors.success;
        case 'processing':
          return theme.colors.primary;
        case 'error':
          return theme.colors.error;
        default:
          return theme.colors.textSecondary;
      }
    };

    return (
      <View key={step.id} style={styles.processingStep}>
        <View style={[styles.stepIcon, { borderColor: getStepColor() }]}>
          {getStepIcon()}
        </View>
        <View style={styles.stepContent}>
          <Text style={[styles.stepTitle, { color: getStepColor() }]}>
            {step.title}
          </Text>
          {step.error && (
            <Text style={[styles.stepError, { color: theme.colors.error }]}>
              {step.error}
            </Text>
          )}
        </View>
      </View>
    );
  };

  // Render OCR result
  const renderOCRResult = () => {
    if (!ocrResult) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Extracted Text
        </Text>
        <View style={[styles.ocrContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.ocrText, { color: theme.colors.textPrimary }]}>
            {ocrResult.text}
          </Text>
          <View style={styles.ocrMetadata}>
            <Text style={[styles.ocrConfidence, { color: theme.colors.textSecondary }]}>
              Confidence: {Math.round(ocrResult.confidence * 100)}%
            </Text>
            <Text style={[styles.ocrLanguage, { color: theme.colors.textSecondary }]}>
              Language: {ocrResult.language}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render parsed recipe
  const renderParsedRecipe = () => {
    if (!parsedRecipe) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Parsed Recipe
        </Text>
        
        <View style={[styles.recipeContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.recipeTitle, { color: theme.colors.textPrimary }]}>
            {parsedRecipe.title}
          </Text>
          
          {parsedRecipe.description && (
            <Text style={[styles.recipeDescription, { color: theme.colors.textSecondary }]}>
              {parsedRecipe.description}
            </Text>
          )}

          <View style={styles.recipeMetadata}>
            {parsedRecipe.prepTime && (
              <Text style={[styles.recipeMeta, { color: theme.colors.textSecondary }]}>
                Prep: {parsedRecipe.prepTime} min
              </Text>
            )}
            {parsedRecipe.cookTime && (
              <Text style={[styles.recipeMeta, { color: theme.colors.textSecondary }]}>
                Cook: {parsedRecipe.cookTime} min
              </Text>
            )}
            {parsedRecipe.servings && (
              <Text style={[styles.recipeMeta, { color: theme.colors.textSecondary }]}>
                Serves: {parsedRecipe.servings}
              </Text>
            )}
            <Text style={[styles.recipeMeta, { color: theme.colors.textSecondary }]}>
              Confidence: {Math.round(parsedRecipe.confidence * 100)}%
            </Text>
          </View>

          {parsedRecipe.ingredients.length > 0 && (
            <View style={styles.ingredientsSection}>
              <Text style={[styles.ingredientsTitle, { color: theme.colors.textPrimary }]}>
                Ingredients
              </Text>
              {parsedRecipe.ingredients.map((ingredient, index) => (
                <Text key={index} style={[styles.ingredient, { color: theme.colors.textSecondary }]}>
                  • {ingredient}
                </Text>
              ))}
            </View>
          )}

          {parsedRecipe.instructions.length > 0 && (
            <View style={styles.instructionsSection}>
              <Text style={[styles.instructionsTitle, { color: theme.colors.textPrimary }]}>
                Instructions
              </Text>
              {parsedRecipe.instructions.map((instruction, index) => (
                <Text key={index} style={[styles.instruction, { color: theme.colors.textSecondary }]}>
                  {index + 1}. {instruction}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            Review Recipe
          </Text>
        </View>

        {/* Image Preview */}
        <View style={styles.imageSection}>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        </View>

        {/* Processing Steps */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Processing Steps
          </Text>
          {processingSteps.map(renderProcessingStep)}
        </View>

        {/* Error Display */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '20', borderColor: theme.colors.error }]}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
            <TouchableOpacity onPress={handleRetry} style={[styles.retryButton, { backgroundColor: theme.colors.error }]}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* OCR Result */}
        {ocrResult && renderOCRResult()}

        {/* Parsed Recipe */}
        {parsedRecipe && renderParsedRecipe()}
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.actionButton, styles.secondaryButton, { borderColor: theme.colors.border }]}
        >
          <Text style={[styles.actionButtonText, { color: theme.colors.textPrimary }]}>
            Back to Crop
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleContinue}
          style={[styles.actionButton, styles.primaryButton, { backgroundColor: theme.colors.primary }]}
          disabled={!parsedRecipe || isProcessing}
        >
          <Text style={[styles.actionButtonText, { color: 'white' }]}>
            {isProcessing ? 'Processing...' : 'Continue to Edit'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  imageSection: {
    padding: 16,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  processingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepError: {
    fontSize: 14,
    marginTop: 4,
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  ocrContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  ocrText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  ocrMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ocrConfidence: {
    fontSize: 12,
  },
  ocrLanguage: {
    fontSize: 12,
  },
  recipeContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  recipeMetadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  recipeMeta: {
    fontSize: 12,
    marginRight: 16,
    marginBottom: 4,
  },
  ingredientsSection: {
    marginBottom: 16,
  },
  ingredientsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ingredient: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  instructionsSection: {
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    // backgroundColor set dynamically
  },
  secondaryButton: {
    borderWidth: 1,
    // borderColor set dynamically
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
