import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BooksStackParamList } from '../../types/navigation';
import { useListRecipeBooks } from '../../presentation/hooks/useRecipeBookUseCase';
import { RecipeBook } from '../../domain/entities/RecipeBook';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common';
import { useLoadingState } from '../../hooks/useLoadingState';

type BooksListScreenNavigationProp = StackNavigationProp<BooksStackParamList, 'BooksList'>;

export default function BooksListScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<BooksListScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<RecipeBook[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { listRecipeBooks } = useListRecipeBooks();
  const { isLoading, error, executeWithLoading, clearError } = useLoadingState();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    const result = await executeWithLoading(
      async () => {
        const result = await listRecipeBooks({ search: searchQuery });
        if (result.isSuccess) {
          // Handle both array and paginated result
          const books = Array.isArray(result.value) ? result.value : result.value.recipeBooks;
          setBooks(books);
          return books;
        } else {
          throw new Error(result.error);
        }
      },
      'Failed to load recipe books'
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadBooks();
    setIsRefreshing(false);
  };

  const handleSearch = () => {
    loadBooks();
  };

  const renderBookItem = ({ item }: { item: RecipeBook }) => (
    <TouchableOpacity
      style={[styles.bookCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={() => navigation.navigate('BookDetail', { bookId: item.id.value })}
    >
      <View style={styles.bookContent}>
        <Text style={[styles.bookTitle, { color: theme.colors.textPrimary }]}>
          {item.title}
        </Text>
        <Text style={[styles.bookDescription, { color: theme.colors.textSecondary }]}>
          {item.description || `${item.recipeIds.length} recipe${item.recipeIds.length !== 1 ? 's' : ''}`}
        </Text>
        <View style={styles.bookMeta}>
          <Text style={[styles.bookMetaText, { color: theme.colors.textSecondary }]}>
            {item.recipeIds.length} recipes
          </Text>
          <Text style={[styles.bookMetaText, { color: theme.colors.textSecondary }]}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <EmptyState
      message="No Recipe Books Yet"
      icon="📚"
      action={{
        title: "Create Book",
        onPress: () => navigation.navigate('CreateBook')
      }}
      testID="books-empty-state"
    />
  );

  if (isLoading) {
    return (
      <LoadingSpinner
        size="large"
        message="Loading recipe books..."
        testID="books-loading"
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={loadBooks}
        testID="books-error-state"
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Icon name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.textPrimary }]}
          placeholder="Search books..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="clear" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Book List */}
      <FlatList
        data={books}
        renderItem={renderBookItem}
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
        onPress={() => navigation.navigate('CreateBook')}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  bookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  bookContent: {
    flex: 1,
    marginRight: 12,
  },
  bookTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  bookDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  bookMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  bookMetaText: {
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
