import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  RefreshControl
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

type AddRecipeToBookScreenRouteProp = RouteProp<BooksStackParamList, 'AddRecipeToBook'>;
type AddRecipeToBookScreenNavigationProp = StackNavigationProp<BooksStackParamList, 'AddRecipeToBook'>;

export default function AddRecipeToBookScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<AddRecipeToBookScreenNavigationProp>();
  const route = useRoute<AddRecipeToBookScreenRouteProp>();
  const { bookId } = route.params;
  
  const [book, setBook] = useState<RecipeBook | null>(null);
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { getRecipeBook } = useGetRecipeBook();
  const { updateRecipeBook } = useUpdateRecipeBook();
  const { listRecipes } = useRecipeUseCase();

  useEffect(() => {
    loadData();
  }, [bookId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load book details
      const bookResult = await getRecipeBook(bookId);
      if (!bookResult.isSuccess) {
        setError(bookResult.error);
        return;
      }
      
      setBook(bookResult.value);
      
      // Load available recipes
      const recipesResult = await listRecipes();
      if (!recipesResult.isSuccess) {
        setError(recipesResult.error);
        return;
      }
      
      // Filter out recipes that are already in the book
      const bookRecipeIds = bookResult.value?.recipeIds.map(id => id.value) || [];
      const availableRecipes = recipesResult.value.filter(recipe => 
        !bookRecipeIds.includes(recipe.id.value)
      );
      
      setAvailableRecipes(availableRecipes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleRecipeToggle = (recipeId: string) => {
    setSelectedRecipes(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const handleAddRecipes = async () => {
    if (!book || selectedRecipes.length === 0) return;

    try {
      setIsSaving(true);
      
      // Get current recipe IDs and add new ones
      const currentRecipeIds = book.recipeIds.map(id => id.value);
      const updatedRecipeIds = [...currentRecipeIds, ...selectedRecipes];
      
      const result = await updateRecipeBook(book.id.value, {
        id: book.id.value,
        title: book.title,
        description: book.description,
        recipeIds: updatedRecipeIds,
      });

      if (result.isSuccess) {
        Alert.alert(
          'Success',
          `${selectedRecipes.length} recipe${selectedRecipes.length !== 1 ? 's' : ''} added to "${book.title}"`,
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
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add recipes');
    } finally {
      setIsSaving(false);
    }
  };

  const renderRecipeItem = ({ item }: { item: Recipe }) => {
    const isSelected = selectedRecipes.includes(item.id.value);
    
    return (
      <TouchableOpacity
        style={[
          styles.recipeCard,
          { 
            backgroundColor: theme.colors.surface, 
            borderColor: isSelected ? theme.colors.primary : theme.colors.border 
          }
        ]}
        onPress={() => handleRecipeToggle(item.id.value)}
      >
        <View style={styles.recipeContent}>
          <Text style={[styles.recipeTitle, { color: theme.colors.textPrimary }]}>
            {item.title}
          </Text>
          <Text style={[styles.recipeDescription, { color: theme.colors.textSecondary }]}>
            {item.description || 'No description'}
          </Text>
          <View style={styles.recipeMeta}>
            <Text style={[styles.recipeMetaText, { color: theme.colors.textSecondary }]}>
              {item.servings ? `${item.servings.value} servings` : 'N/A servings'}
            </Text>
            <Text style={[styles.recipeMetaText, { color: theme.colors.textSecondary }]}>
              {item.prepTime ? `${item.prepTime.value} min prep` : 'N/A min prep'}
            </Text>
          </View>
        </View>
        <Icon 
          name={isSelected ? 'check-circle' : 'radio-button-unchecked'} 
          size={24} 
          color={isSelected ? theme.colors.primary : theme.colors.textSecondary} 
        />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="restaurant" size={64} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
        No Available Recipes
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        All recipes are already in this book
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Icon name="error" size={64} color={theme.colors.error} />
      <Text style={[styles.errorTitle, { color: theme.colors.textPrimary }]}>
        Failed to Load Data
      </Text>
      <Text style={[styles.errorSubtitle, { color: theme.colors.textSecondary }]}>
        {error}
      </Text>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
        onPress={loadData}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading available recipes...
        </Text>
      </View>
    );
  }

  if (error || !book) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        {renderErrorState()}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            Add Recipes to "{book.title}"
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Select recipes to add to this book
          </Text>
        </View>
        {selectedRecipes.length > 0 && (
          <View style={[styles.selectedCount, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.selectedCountText}>
              {selectedRecipes.length} selected
            </Text>
          </View>
        )}
      </View>

      {/* Recipe List */}
      {availableRecipes.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={availableRecipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id.value}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Action Buttons */}
      {selectedRecipes.length > 0 && (
        <View style={[styles.actionButtons, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: theme.colors.border }]}
            onPress={() => navigation.goBack()}
            disabled={isSaving}
          >
            <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.addButton, 
              { 
                backgroundColor: isSaving ? theme.colors.textSecondary : theme.colors.primary 
              }
            ]}
            onPress={handleAddRecipes}
            disabled={isSaving || selectedRecipes.length === 0}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.addButtonText}>
                Add {selectedRecipes.length} Recipe{selectedRecipes.length !== 1 ? 's' : ''}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  selectedCount: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedCountText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  recipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  recipeContent: {
    flex: 1,
    marginRight: 12,
  },
  recipeTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
    lineHeight: 20,
  },
  recipeMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  recipeMetaText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 16,
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
  addButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});
