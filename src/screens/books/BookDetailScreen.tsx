import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  RefreshControl
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BooksStackParamList } from '../../types/navigation';
import { useGetRecipeBook, useDeleteRecipeBook } from '../../presentation/hooks/useRecipeBookUseCase';
import { useRecipeUseCase } from '../../presentation/hooks/useRecipeUseCase';
import { RecipeBook } from '../../domain/entities/RecipeBook';
import { Recipe } from '../../domain/entities/Recipe';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common';
import { useLoadingState } from '../../hooks/useLoadingState';

type BookDetailScreenRouteProp = RouteProp<BooksStackParamList, 'BookDetail'>;
type BookDetailScreenNavigationProp = StackNavigationProp<BooksStackParamList, 'BookDetail'>;

export default function BookDetailScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<BookDetailScreenNavigationProp>();
  const route = useRoute<BookDetailScreenRouteProp>();
  const { bookId } = route.params;
  
  const [book, setBook] = useState<RecipeBook | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { getRecipeBook } = useGetRecipeBook();
  const { deleteRecipeBook } = useDeleteRecipeBook();
  const { listRecipes } = useRecipeUseCase();
  const { isLoading, error, executeWithLoading, clearError } = useLoadingState();

  useEffect(() => {
    loadBookDetails();
  }, [bookId]);

  const loadBookDetails = async () => {
    const result = await executeWithLoading(
      async () => {
        const bookResult = await getRecipeBook(bookId);
        if (!bookResult.isSuccess) {
          throw new Error(bookResult.error);
        }
        
        setBook(bookResult.value);
        
        // Load recipes in the book
        if (bookResult.value && bookResult.value.recipeIds.length > 0) {
          const recipesResult = await listRecipes();
          if (recipesResult.isSuccess) {
            const bookRecipes = recipesResult.value.filter(recipe => 
              bookResult.value!.recipeIds.some(id => id.value === recipe.id.value)
            );
            setRecipes(bookRecipes);
          }
        }
        
        return bookResult.value;
      },
      'Failed to load book details'
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadBookDetails();
    setIsRefreshing(false);
  };

  const handleEditBook = () => {
    if (book) {
      navigation.navigate('BookEdit', { bookId: book.id.value });
    }
  };

  const handleDeleteBook = () => {
    if (!book) return;
    
    Alert.alert(
      'Delete Recipe Book',
      `Are you sure you want to delete "${book.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteRecipeBook(book.id.value);
              if (result.isSuccess) {
                navigation.goBack();
              } else {
                Alert.alert('Error', result.error);
              }
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete book');
            }
          }
        }
      ]
    );
  };

  const handleRecipePress = (recipe: Recipe) => {
    // Navigate to recipe detail - this would need to be handled by the parent navigator
    // For now, we'll just log it
    console.log('Navigate to recipe:', recipe.id.value);
  };

  const handleAddRecipe = () => {
    navigation.navigate('AddRecipeToBook', { bookId });
  };

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={[styles.recipeCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={() => handleRecipePress(item)}
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
      <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <EmptyState
      message="No Recipes Yet"
      icon="🍽️"
      action={{
        title: "Add Recipe",
        onPress: handleAddRecipe
      }}
      testID="book-empty-state"
    />
  );

  if (isLoading) {
    return (
      <LoadingSpinner
        size="large"
        message="Loading book details..."
        testID="book-loading"
      />
    );
  }

  if (error || !book) {
    return (
      <ErrorState
        message={error || 'Book not found'}
        onRetry={loadBookDetails}
        testID="book-error-state"
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Book Header */}
      <View style={[styles.bookHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <View style={styles.bookInfo}>
          <Text style={[styles.bookTitle, { color: theme.colors.textPrimary }]}>
            {book.title}
          </Text>
          {book.description && (
            <Text style={[styles.bookDescription, { color: theme.colors.textSecondary }]}>
              {book.description}
            </Text>
          )}
          <Text style={[styles.bookMeta, { color: theme.colors.textSecondary }]}>
            {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.bookActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleEditBook}
          >
            <Icon name="edit" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
            onPress={handleDeleteBook}
          >
            <Icon name="delete" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Recipes List */}
      <FlatList
        data={recipes}
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

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddRecipe}
      >
        <Icon name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bookHeader: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookInfo: {
    flex: 1,
    marginRight: 16,
  },
  bookTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  bookDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
    lineHeight: 22,
  },
  bookMeta: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  bookActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
