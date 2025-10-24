import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRecipeUseCase } from '../../presentation/hooks/useRecipeUseCase';
import { useAdvancedSearch } from '../../presentation/hooks/useAdvancedSearch';
import { Recipe } from '../../domain/entities/Recipe';
import { RecipesStackParamList } from '../../types/navigation';
import { SearchBar } from '../../components/search/SearchBar';
import { FilterPanel } from '../../components/search/FilterPanel';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common';
import { useLoadingState } from '../../hooks/useLoadingState';
import { RecipeList, useInfiniteScroll, usePerformance } from '../../components/recipes';
import { Result } from '../../domain/common/Result';

type RecipesListScreenNavigationProp = StackNavigationProp<RecipesStackParamList, 'RecipesList'>;

export default function RecipesListScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<RecipesListScreenNavigationProp>();
  
  // Performance monitoring
  const { measureRender, measureAsync } = usePerformance();
  
  // Use our new loading state hook
  const { isLoading, error, executeWithLoading, clearError } = useLoadingState();
  
  // Use Clean Architecture hook for basic operations
  const {
    recipes: basicRecipes,
    filteredRecipes,
    isLoading: basicLoading,
    error: basicError,
    listRecipes,
    clearError: clearBasicError,
  } = useRecipeUseCase();

  // Use advanced search hook
  const {
    recipes: searchRecipes,
    isLoading: searchLoading,
    error: searchError,
    filters,
    showFilters,
    searchResult,
    setSearchText,
    setCategory,
    toggleTag,
    setTimeRange,
    toggleFilters,
    clearFilters,
    clearError: clearSearchError,
  } = useAdvancedSearch();

  // Infinite scroll for basic recipes
  const {
    data: infiniteRecipes,
    isLoading: infiniteLoading,
    hasMore,
    error: infiniteError,
    loadMore,
    refresh: refreshInfinite,
  } = useInfiniteScroll<Recipe>(
    async (page: number, limit: number) => {
      // Mock pagination - in real app, this would call an API
      const startIndex = page * limit;
      const endIndex = startIndex + limit;
      const paginatedRecipes = basicRecipes.slice(startIndex, endIndex);
      
      return Result.success({
        items: paginatedRecipes,
        totalCount: basicRecipes.length,
        page,
        limit,
        hasMore: endIndex < basicRecipes.length,
      });
    },
    20 // limit
  );

  // Determine which recipes to display
  const displayRecipes = filters.searchText || showFilters ? searchRecipes : infiniteRecipes;
  const isAnyLoading = isLoading || basicLoading || searchLoading || infiniteLoading;
  const anyError = error || basicError || searchError || infiniteError;

  // Load recipes on component mount
  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = useCallback(async () => {
    const result = await measureAsync('loadRecipes', async () => {
      return await executeWithLoading(
        () => listRecipes(),
        'Failed to load recipes'
      );
    });
    
    if (result.isFailure) {
      // Error is already handled by useLoadingState
      console.error('Failed to load recipes:', result.error);
    }
  }, [executeWithLoading, listRecipes, measureAsync]);

  const handleClearError = useCallback(() => {
    clearError();
    clearBasicError();
    clearSearchError();
  }, [clearError, clearBasicError, clearSearchError]);

  const handleRecipePress = useCallback((recipe: Recipe) => {
    measureRender('recipePress', () => {
      navigation.navigate('RecipeDetail', { recipeId: recipe.id.value });
    });
  }, [navigation, measureRender]);

  const handleRefresh = useCallback(async () => {
    await measureAsync('refreshRecipes', async () => {
      await loadRecipes();
      await refreshInfinite();
    });
  }, [loadRecipes, refreshInfinite, measureAsync]);

  const handleLoadMore = useCallback(async () => {
    await measureAsync('loadMoreRecipes', async () => {
      await loadMore();
    });
  }, [loadMore, measureAsync]);

  const renderEmptyState = () => (
    <EmptyState
      message="No recipes found. Start by adding your first recipe!"
      icon="📝"
      action={{
        title: 'Add Recipe',
        onPress: () => navigation.navigate('Camera'),
      }}
      testID="recipes-empty-state"
    />
  );

  return (
    <View 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      testID="recipes-list-screen"
    >
      {/* Advanced Search Bar */}
      <SearchBar
        value={filters.searchText}
        onChangeText={setSearchText}
        onFilterPress={toggleFilters}
        isFilterActive={showFilters}
        placeholder="Search recipes..."
      />

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onCategoryChange={setCategory}
          onTagChange={toggleTag}
          onTimeRangeChange={setTimeRange}
          onClearFilters={clearFilters}
          availableTags={[]} // TODO: Get from API
        />
      )}

      {/* Error Display */}
      {anyError && (
        <ErrorState
          message={anyError}
          onRetry={handleClearError}
          testID="recipes-error-state"
        />
      )}

      {/* Loading Indicator */}
      {isAnyLoading && (
        <LoadingSpinner
          message="Loading recipes..."
          testID="recipes-loading"
        />
      )}

      {/* Optimized Recipe List */}
      <RecipeList
        recipes={displayRecipes || []}
        onRecipePress={handleRecipePress}
        onLoadMore={filters.searchText || showFilters ? undefined : handleLoadMore}
        hasMore={filters.searchText || showFilters ? false : hasMore}
        isLoading={filters.searchText || showFilters ? false : infiniteLoading}
        onRefresh={handleRefresh}
        refreshing={isAnyLoading}
        testID="recipes-list"
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        testID="add-recipe-button"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          // TODO: Show action sheet with options: Camera, Manual Entry
          navigation.navigate('Camera');
        }}
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
