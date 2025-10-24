import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../context/ThemeContext';
import { ParsedRecipe, Ingredient } from '../../types/Recipe';
import { RecipeCategory } from '../../domain/enums/RecipeCategory';
import { CreateRecipeDto, TimeRangeDto, ServingSizeDto, IngredientDto, DirectionDto } from '../../application/dto/RecipeDto';
import { container } from '../../infrastructure/di/container';
import { TYPES } from '../../infrastructure/di/types';
import { CreateRecipeUseCase } from '../../application/useCases/recipes/CreateRecipeUseCase';
import { Result } from '../../domain/common/Result';

// Navigation types
type RootStackParamList = {
  RecipeCreate: {
    parsedRecipe?: ParsedRecipe;
    imageUri?: string;
  };
  RecipeDetail: {
    recipeId: string;
  };
  RecipeReview: {
    imageUri: string;
    source: 'camera' | 'gallery';
  };
};

type RecipeCreateScreenRouteProp = RouteProp<RootStackParamList, 'RecipeCreate'>;
type RecipeCreateScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RecipeCreate'>;

interface FormData {
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: string;
  category: RecipeCategory;
  tags: string[];
  source: string;
}

const CATEGORY_OPTIONS = [
  { value: RecipeCategory.Appetizer, label: 'Appetizer' },
  { value: RecipeCategory.MainCourse, label: 'Main Course' },
  { value: RecipeCategory.Dessert, label: 'Dessert' },
  { value: RecipeCategory.SideDish, label: 'Side Dish' },
  { value: RecipeCategory.Beverage, label: 'Beverage' },
  { value: RecipeCategory.Other, label: 'Other' },
];

export default function RecipeCreateScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<RecipeCreateScreenNavigationProp>();
  const route = useRoute<RecipeCreateScreenRouteProp>();
  const { parsedRecipe, imageUri } = route.params;

  // Services
  const createRecipeUseCase = container.get<CreateRecipeUseCase>(TYPES.CreateRecipeUseCase);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    ingredients: [],
    instructions: [],
    prepTime: '',
    cookTime: '',
    servings: '',
    category: RecipeCategory.Other,
    tags: [],
    source: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with parsed data
  useEffect(() => {
    if (parsedRecipe) {
      setFormData(prev => ({
        ...prev,
        title: parsedRecipe.title || '',
        description: parsedRecipe.description || '',
        ingredients: parsedRecipe.ingredients.map((text, index) => ({
          id: `ingredient-${index}`,
          text,
          amount: '',
          unit: '',
          name: '',
        })),
        instructions: parsedRecipe.instructions || [],
        prepTime: parsedRecipe.prepTime?.toString() || '',
        cookTime: parsedRecipe.cookTime?.toString() || '',
        servings: parsedRecipe.servings?.toString() || '',
        source: 'OCR Import',
      }));
    }
  }, [parsedRecipe]);

  // Handle form field changes
  const handleFieldChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle ingredient changes
  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      ),
    }));
  };

  // Add new ingredient
  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          id: `ingredient-${Date.now()}`,
          text: '',
          amount: '',
          unit: '',
          name: '',
        },
      ],
    }));
  };

  // Remove ingredient
  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  // Handle instruction changes
  const handleInstructionChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => 
        i === index ? value : inst
      ),
    }));
  };

  // Add new instruction
  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, ''],
    }));
  };

  // Remove instruction
  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.ingredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required';
    }

    if (formData.instructions.length === 0) {
      newErrors.instructions = 'At least one instruction is required';
    }

    if (formData.prepTime && isNaN(Number(formData.prepTime))) {
      newErrors.prepTime = 'Prep time must be a number';
    }

    if (formData.cookTime && isNaN(Number(formData.cookTime))) {
      newErrors.cookTime = 'Cook time must be a number';
    }

    if (formData.servings && isNaN(Number(formData.servings))) {
      newErrors.servings = 'Servings must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    setIsLoading(true);

    try {
      // Create recipe data
      const recipeData: CreateRecipeDto = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        prepTime: formData.prepTime ? createTimeRangeDto(Number(formData.prepTime)) : null,
        cookTime: formData.cookTime ? createTimeRangeDto(Number(formData.cookTime)) : null,
        servings: formData.servings ? createServingSizeDto(Number(formData.servings)) : null,
        source: formData.source || null,
        imagePath: imageUri || null,
        ingredients: formData.ingredients
          .filter(ing => ing.text.trim())
          .map((ing, index) => createIngredientDto(ing, index)),
        directions: formData.instructions
          .filter(inst => inst.trim())
          .map((inst, index) => createDirectionDto(inst, index)),
        tags: formData.tags.map((tag, index) => createTagDto(tag, index)),
      };

      // Create recipe using use case
      const result = await createRecipeUseCase.execute(recipeData);

      if (result.isSuccess) {
        Alert.alert(
          'Success',
          'Recipe created successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('RecipeDetail', { recipeId: result.value.id.value }),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to create recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    Alert.alert(
      'Cancel',
      'Are you sure you want to cancel? Your changes will be lost.',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard Changes', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  // Helper functions for creating DTOs
  const createTimeRangeDto = (minutes: number): TimeRangeDto => ({
    minMinutes: minutes,
    maxMinutes: null,
    displayText: `${minutes} min`,
  });

  const createServingSizeDto = (count: number): ServingSizeDto => ({
    minServings: count,
    maxServings: null,
    displayText: `${count} servings`,
  });

  const createIngredientDto = (ingredient: Ingredient, index: number): IngredientDto => ({
    id: ingredient.id,
    name: ingredient.text,
    amount: ingredient.amount ? {
      quantity: 1, // Default quantity
      unit: ingredient.unit || '',
      displayText: `${ingredient.amount} ${ingredient.unit || ''}`.trim(),
    } : null,
    notes: null,
    order: index,
  });

  const createDirectionDto = (instruction: string, index: number): DirectionDto => ({
    id: `direction-${index}`,
    instruction,
    order: index,
    notes: null,
  });

  const createTagDto = (tag: string, index: number) => ({
    id: `tag-${index}`,
    name: tag,
    color: null,
  });

  // Render ingredient input
  const renderIngredient = (ingredient: Ingredient, index: number) => (
    <View key={ingredient.id} style={[styles.ingredientRow, { borderColor: theme.colors.border }]}>
      <TextInput
        style={[styles.ingredientInput, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
        value={ingredient.text}
        onChangeText={(value) => handleIngredientChange(index, 'text', value)}
        placeholder="Ingredient name and amount"
        placeholderTextColor={theme.colors.textSecondary}
      />
      <TouchableOpacity
        onPress={() => removeIngredient(index)}
        style={[styles.removeButton, { backgroundColor: theme.colors.error }]}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  // Render instruction input
  const renderInstruction = (instruction: string, index: number) => (
    <View key={index} style={[styles.instructionRow, { borderColor: theme.colors.border }]}>
      <Text style={[styles.instructionNumber, { color: theme.colors.textSecondary }]}>
        {index + 1}.
      </Text>
      <TextInput
        style={[styles.instructionInput, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
        value={instruction}
        onChangeText={(value) => handleInstructionChange(index, value)}
        placeholder="Instruction step"
        placeholderTextColor={theme.colors.textSecondary}
        multiline
      />
      <TouchableOpacity
        onPress={() => removeInstruction(index)}
        style={[styles.removeButton, { backgroundColor: theme.colors.error }]}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            {parsedRecipe ? 'Review Recipe' : 'Create Recipe'}
          </Text>
          <TouchableOpacity 
            onPress={handleSubmit} 
            style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Image Preview */}
        {imageUri && (
          <View style={styles.imageSection}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          </View>
        )}

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Title */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>
              Title *
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { 
                  color: theme.colors.textPrimary, 
                  borderColor: errors.title ? theme.colors.error : theme.colors.border,
                  backgroundColor: theme.colors.surface,
                }
              ]}
              value={formData.title}
              onChangeText={(value) => handleFieldChange('title', value)}
              placeholder="Recipe title"
              placeholderTextColor={theme.colors.textSecondary}
            />
            {errors.title && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.title}
              </Text>
            )}
          </View>

          {/* Description */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.textArea,
                { 
                  color: theme.colors.textPrimary, 
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                }
              ]}
              value={formData.description}
              onChangeText={(value) => handleFieldChange('description', value)}
              placeholder="Recipe description"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Category */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>
              Category
            </Text>
            <View style={styles.categoryContainer}>
              {CATEGORY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleFieldChange('category', option.value)}
                  style={[
                    styles.categoryOption,
                    {
                      backgroundColor: formData.category === option.value 
                        ? theme.colors.primary 
                        : theme.colors.surface,
                      borderColor: theme.colors.border,
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      {
                        color: formData.category === option.value 
                          ? 'white' 
                          : theme.colors.textPrimary,
                      }
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Timing Information */}
          <View style={styles.timingContainer}>
            <View style={[styles.timingField, { flex: 1 }]}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>
                Prep Time (min)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    color: theme.colors.textPrimary, 
                    borderColor: errors.prepTime ? theme.colors.error : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  }
                ]}
                value={formData.prepTime}
                onChangeText={(value) => handleFieldChange('prepTime', value)}
                placeholder="0"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
              {errors.prepTime && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.prepTime}
                </Text>
              )}
            </View>

            <View style={[styles.timingField, { flex: 1 }]}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>
                Cook Time (min)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    color: theme.colors.textPrimary, 
                    borderColor: errors.cookTime ? theme.colors.error : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  }
                ]}
                value={formData.cookTime}
                onChangeText={(value) => handleFieldChange('cookTime', value)}
                placeholder="0"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
              {errors.cookTime && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.cookTime}
                </Text>
              )}
            </View>

            <View style={[styles.timingField, { flex: 1 }]}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>
                Servings
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    color: theme.colors.textPrimary, 
                    borderColor: errors.servings ? theme.colors.error : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  }
                ]}
                value={formData.servings}
                onChangeText={(value) => handleFieldChange('servings', value)}
                placeholder="0"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
              {errors.servings && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.servings}
                </Text>
              )}
            </View>
          </View>

          {/* Ingredients */}
          <View style={styles.fieldContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>
                Ingredients *
              </Text>
              <TouchableOpacity onPress={addIngredient} style={styles.addButton}>
                <Text style={[styles.addButtonText, { color: theme.colors.primary }]}>
                  + Add
                </Text>
              </TouchableOpacity>
            </View>
            {formData.ingredients.map(renderIngredient)}
            {errors.ingredients && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.ingredients}
              </Text>
            )}
          </View>

          {/* Instructions */}
          <View style={styles.fieldContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>
                Instructions *
              </Text>
              <TouchableOpacity onPress={addInstruction} style={styles.addButton}>
                <Text style={[styles.addButtonText, { color: theme.colors.primary }]}>
                  + Add
                </Text>
              </TouchableOpacity>
            </View>
            {formData.instructions.map(renderInstruction)}
            {errors.instructions && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.instructions}
              </Text>
            )}
          </View>

          {/* Source */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>
              Source
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { 
                  color: theme.colors.textPrimary, 
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                }
              ]}
              value={formData.source}
              onChangeText={(value) => handleFieldChange('source', value)}
              placeholder="Recipe source (optional)"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  },
  cancelButton: {
    marginRight: 16,
  },
  cancelButtonText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
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
  formSection: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timingContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timingField: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ingredientInput: {
    flex: 1,
    fontSize: 16,
    marginRight: 8,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    marginTop: 2,
  },
  instructionInput: {
    flex: 1,
    fontSize: 16,
    marginRight: 8,
    minHeight: 40,
    textAlignVertical: 'top',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
