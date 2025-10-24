import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BooksStackParamList } from '../../types/navigation';
import { useCreateRecipeBook } from '../../presentation/hooks/useRecipeBookUseCase';
import { useRecipeUseCase } from '../../presentation/hooks/useRecipeUseCase';
import { Recipe } from '../../domain/entities/Recipe';

type CreateBookScreenNavigationProp = StackNavigationProp<BooksStackParamList, 'CreateBook'>;

export default function CreateBookScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<CreateBookScreenNavigationProp>();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);
  const [showRecipeSelection, setShowRecipeSelection] = useState(false);

  const { createRecipeBook } = useCreateRecipeBook();
  const { listRecipes } = useRecipeUseCase();

  React.useEffect(() => {
    loadAvailableRecipes();
  }, []);

  const loadAvailableRecipes = async () => {
    try {
      const result = await listRecipes();
      if (result.isSuccess) {
        setAvailableRecipes(result.value);
      }
    } catch (error) {
      console.error('Failed to load recipes:', error);
    }
  };

  const handleCreateBook = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the recipe book');
      return;
    }

    try {
      setIsLoading(true);
      
      const result = await createRecipeBook({
        title: title.trim(),
        description: description.trim() || null,
        recipeIds: selectedRecipes,
      });

      if (result.isSuccess) {
        Alert.alert(
          'Success',
          'Recipe book created successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('BookDetail', { bookId: result.value.id.value })
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create recipe book');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecipeToggle = (recipeId: string) => {
    setSelectedRecipes(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const renderRecipeItem = (recipe: Recipe) => {
    const isSelected = selectedRecipes.includes(recipe.id.value);
    
    return (
      <TouchableOpacity
        key={recipe.id.value}
        style={[
          styles.recipeItem,
          { 
            backgroundColor: theme.colors.surface, 
            borderColor: isSelected ? theme.colors.primary : theme.colors.border 
          }
        ]}
        onPress={() => handleRecipeToggle(recipe.id.value)}
      >
        <View style={styles.recipeContent}>
          <Text style={[styles.recipeTitle, { color: theme.colors.textPrimary }]}>
            {recipe.title}
          </Text>
          <Text style={[styles.recipeDescription, { color: theme.colors.textSecondary }]}>
            {recipe.description || 'No description'}
          </Text>
        </View>
        <Icon 
          name={isSelected ? 'check-circle' : 'radio-button-unchecked'} 
          size={24} 
          color={isSelected ? theme.colors.primary : theme.colors.textSecondary} 
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Book Details
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
              Title *
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.colors.surface, 
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary 
                }
              ]}
              placeholder="Enter recipe book title"
              placeholderTextColor={theme.colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={200}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.textArea,
                { 
                  backgroundColor: theme.colors.surface, 
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary 
                }
              ]}
              placeholder="Enter recipe book description (optional)"
              placeholderTextColor={theme.colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={1000}
            />
          </View>
        </View>

        {/* Recipe Selection Section */}
        <View style={styles.recipeSection}>
          <View style={styles.recipeSectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Add Recipes
            </Text>
            <TouchableOpacity
              style={[styles.toggleButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setShowRecipeSelection(!showRecipeSelection)}
            >
              <Text style={styles.toggleButtonText}>
                {showRecipeSelection ? 'Hide' : 'Select'} Recipes
              </Text>
            </TouchableOpacity>
          </View>

          {selectedRecipes.length > 0 && (
            <Text style={[styles.selectedCount, { color: theme.colors.textSecondary }]}>
              {selectedRecipes.length} recipe{selectedRecipes.length !== 1 ? 's' : ''} selected
            </Text>
          )}

          {showRecipeSelection && (
            <View style={styles.recipeList}>
              {availableRecipes.length === 0 ? (
                <View style={styles.emptyRecipes}>
                  <Icon name="restaurant" size={48} color={theme.colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    No recipes available
                  </Text>
                </View>
              ) : (
                availableRecipes.map(renderRecipeItem)
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionButtons, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: theme.colors.border }]}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.createButton, 
            { 
              backgroundColor: isLoading ? theme.colors.textSecondary : theme.colors.primary 
            }
          ]}
          onPress={handleCreateBook}
          disabled={isLoading || !title.trim()}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.createButtonText}>Create Book</Text>
          )}
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
  formSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  recipeSection: {
    padding: 16,
  },
  recipeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  selectedCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  recipeList: {
    maxHeight: 300,
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  recipeContent: {
    flex: 1,
    marginRight: 12,
  },
  recipeTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  emptyRecipes: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  createButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});
