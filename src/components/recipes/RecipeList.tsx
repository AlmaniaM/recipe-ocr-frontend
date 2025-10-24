import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  ListRenderItem,
  RefreshControl,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Recipe } from '../../domain/entities/Recipe';
import { RecipeCard } from './RecipeCard';
import { useTheme } from '../../context/ThemeContext';

export interface RecipeListProps {
  recipes: Recipe[];
  onRecipePress: (recipe: Recipe) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
  testID?: string;
}

/**
 * Optimized RecipeList component with advanced FlatList performance features
 * 
 * Performance Features:
 * - getItemLayout for fixed height optimization
 * - removeClippedSubviews for memory optimization
 * - maxToRenderPerBatch for render batching
 * - windowSize for viewport management
 * - onEndReachedThreshold for infinite scroll
 * - RefreshControl for pull-to-refresh
 */
export const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  onRecipePress,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  onRefresh,
  refreshing = false,
  testID = 'recipe-list',
}) => {
  const { theme } = useTheme();

  // Memoized key extractor for optimal performance
  const keyExtractor = useCallback((item: Recipe) => item.id.value, []);

  // Memoized render item to prevent unnecessary re-renders
  const renderItem: ListRenderItem<Recipe> = useCallback(
    ({ item, index }) => (
      <RecipeCard
        recipe={item}
        onPress={() => onRecipePress(item)}
        index={index}
        testID={`recipe-card-${index}`}
      />
    ),
    [onRecipePress]
  );

  // Fixed height layout for optimal performance
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  // Memoized refresh control
  const refreshControl = useMemo(
    () =>
      onRefresh ? (
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      ) : undefined,
    [refreshing, onRefresh, theme.colors.primary]
  );

  // Memoized footer component for loading indicator
  const ListFooterComponent = useMemo(
    () =>
      isLoading && hasMore ? (
        <View style={styles.footerContainer}>
          <ActivityIndicator
            size="small"
            color={theme.colors.primary}
            testID="recipe-list-loading"
          />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading more recipes...
          </Text>
        </View>
      ) : null,
    [isLoading, hasMore, theme.colors.primary, theme.colors.textSecondary]
  );

  // Memoized empty state component
  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer} testID="recipe-list-empty">
        <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
          No Recipes Yet
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
          Click the + button to create or capture a recipe
        </Text>
      </View>
    ),
    [theme.colors.textPrimary, theme.colors.textSecondary]
  );

  // Handle end reached for infinite scroll
  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <FlatList
      data={recipes}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={refreshControl}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={[
        styles.listContainer,
        recipes.length === 0 && styles.emptyListContainer,
      ]}
      style={styles.list}
      testID={testID}
      // Performance optimizations
      updateCellsBatchingPeriod={50}
      disableVirtualization={false}
      legacyImplementation={false}
    />
  );
};

// Constants for performance optimization
const ITEM_HEIGHT = 120; // Fixed height for recipe cards

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
