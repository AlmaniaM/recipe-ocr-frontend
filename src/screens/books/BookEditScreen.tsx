import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BooksStackParamList } from '../../types/navigation';
import { useGetRecipeBook, useUpdateRecipeBook } from '../../presentation/hooks/useRecipeBookUseCase';
import { useRecipeUseCase } from '../../presentation/hooks/useRecipeUseCase';
import { RecipeBook } from '../../domain/entities/RecipeBook';
import { Recipe } from '../../domain/entities/Recipe';

type BookEditScreenRouteProp = RouteProp<BooksStackParamList, 'BookEdit'>;
type BookEditScreenNavigationProp = StackNavigationProp<BooksStackParamList, 'BookEdit'>;

export default function BookEditScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<BookEditScreenNavigationProp>();
  const route = useRoute<BookEditScreenRouteProp>();
  const { bookId } = route.params;
  
  const [book, setBook] = useState<RecipeBook | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);
  const [showRecipeSelection, setShowRecipeSelection] = useState(false);

  const { getRecipeBook } = useGetRecipeBook();
  const { updateRecipeBook } = useUpdateRecipeBook();
  const { listRecipes } = useRecipeUseCase();

  useEffect(() => {
    loadBookDetails();
    loadAvailableRecipes();
  }, [bookId]);

  const loadBookDetails = async () => {
    try {
      setIsInitialLoading(true);
      
      const result = await getRecipeBook(bookId);
      if (!result.isSuccess) {
        Alert.alert('Error', result.error);
        navigation.goBack();
        return;
      }
      
      const bookData = result.value;
      if (bookData) {
        setBook(bookData);
        setTitle(bookData.title);
        setDescription(bookData.description || '');
        setSelectedRecipes(bookData.recipeIds.map(id => id.value));
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load book details');
      navigation.goBack();
    } finally {
      setIsInitialLoading(false);
    }
  };

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

  const handleUpdateBook = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the recipe book');
      return;
    }

    if (!book) return;

    try {
      setIsLoading(true);
      
      const result = await updateRecipeBook(book.id.value, {
        id: book.id.value,
        title: title.trim(),
        description: description.trim() || null,
        recipeIds: selectedRecipes,
      });

      if (result.isSuccess) {
        Alert.alert(
          'Success',
          'Recipe book updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('BookDetail', { bookId: book.id.value })
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update recipe book');
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

  const handleRemoveRecipe = (recipeId: string) => {
    setSelectedRecipes(prev => prev.filter(id => id !== recipeId));
  };

  const renderSelectedRecipeItem = (recipeId: string) => {
    const recipe = availableRecipes.find(r => r.id.value === recipeId);
    if (!recipe) return null;

    return (
      <View key={recipeId} style={[styles.selectedRecipeItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.selectedRecipeContent}>
          <Text style={[styles.selectedRecipeTitle, { color: theme.colors.textPrimary }]}>
            {recipe.title}
          </Text>
          <Text style={[styles.selectedRecipeDescription, { color: theme.colors.textSecondary }]}>
            {recipe.description || 'No description'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: theme.colors.error }]}
          onPress={() => handleRemoveRecipe(recipeId)}
        >
          <Icon name="close" size={16} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderAvailableRecipeItem = (recipe: Recipe) => {
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

  if (isInitialLoading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading book details...
        </Text>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <Icon name="error" size={64} color={theme.colors.error} />
        <Text style={[styles.errorTitle, { color: theme.colors.textPrimary }]}>
          Book Not Found
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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

        {/* Selected Recipes Section */}
        {selectedRecipes.length > 0 && (
          <View style={styles.selectedRecipesSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Selected Recipes ({selectedRecipes.length})
            </Text>
            <FlatList
              data={selectedRecipes}
              renderItem={({ item }) => renderSelectedRecipeItem(item)}
              keyExtractor={(item) => item}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Recipe Selection Section */}
        <View style={styles.recipeSection}>
          <View style={styles.recipeSectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Add More Recipes
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
                availableRecipes.map(renderAvailableRecipeItem)
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
            styles.updateButton, 
            { 
              backgroundColor: isLoading ? theme.colors.textSecondary : theme.colors.primary 
            }
          ]}
          onPress={handleUpdateBook}
          disabled={isLoading || !title.trim()}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.updateButtonText}>Update Book</Text>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
  selectedRecipesSection: {
    padding: 16,
    paddingTop: 0,
  },
  selectedRecipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectedRecipeContent: {
    flex: 1,
    marginRight: 12,
  },
  selectedRecipeTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  selectedRecipeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
  updateButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginTop: 16,
    marginBottom: 8,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});
