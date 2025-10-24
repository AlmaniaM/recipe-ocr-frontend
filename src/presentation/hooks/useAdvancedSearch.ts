import { useState, useCallback, useEffect } from 'react';
import { Recipe } from '../../types/Recipe';
import { RecipeCategory } from '../../domain/enums/RecipeCategory';
import { SearchFilters } from '../../components/search/FilterPanel';
import { RecipeService } from '../../services/RecipeService';
import { ApiServiceFactory } from '../../services/api';

interface AdvancedSearchResult {
  recipes: Recipe[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UseAdvancedSearchReturn {
  // State
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  filters: SearchFilters;
  showFilters: boolean;
  searchResult: AdvancedSearchResult | null;
  
  // Actions
  setSearchText: (text: string) => void;
  setCategory: (category: RecipeCategory | null) => void;
  toggleTag: (tag: string) => void;
  setTimeRange: (field: keyof SearchFilters, value: number | null) => void;
  toggleFilters: () => void;
  clearFilters: () => void;
  search: () => Promise<void>;
  loadMore: () => Promise<void>;
  clearError: () => void;
}

const DEFAULT_FILTERS: SearchFilters = {
  searchText: '',
  category: null,
  tags: [],
  minPrepTime: null,
  maxPrepTime: null,
  minCookTime: null,
  maxCookTime: null,
};

export function useAdvancedSearch(): UseAdvancedSearchReturn {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [searchResult, setSearchResult] = useState<AdvancedSearchResult | null>(null);
  
  // Initialize recipe service
  const recipeService = new RecipeService(ApiServiceFactory.getRecipeApiClient());

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.searchText || hasActiveFilters()) {
        search();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  const hasActiveFilters = useCallback(() => {
    return (
      filters.category !== null ||
      filters.tags.length > 0 ||
      filters.minPrepTime !== null ||
      filters.maxPrepTime !== null ||
      filters.minCookTime !== null ||
      filters.maxCookTime !== null
    );
  }, [filters]);

  const setSearchText = useCallback((text: string) => {
    setFilters(prev => ({ ...prev, searchText: text }));
  }, []);

  const setCategory = useCallback((category: RecipeCategory | null) => {
    setFilters(prev => ({ ...prev, category }));
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  }, []);

  const setTimeRange = useCallback((field: keyof SearchFilters, value: number | null) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setRecipes([]);
    setSearchResult(null);
  }, []);

  const search = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Call the real API
      const result = await recipeService.advancedSearch(filters, 0, 50);
      
      setRecipes(result.recipes);
      setSearchResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters, recipeService]);

  const loadMore = useCallback(async () => {
    if (!searchResult?.hasNextPage || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load next page
      const result = await recipeService.advancedSearch(filters, searchResult.page + 1, searchResult.pageSize);
      
      setRecipes(prev => [...prev, ...result.recipes]);
      setSearchResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Load more failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [searchResult, filters, isLoading, recipeService]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    recipes,
    isLoading,
    error,
    filters,
    showFilters,
    searchResult,
    
    // Actions
    setSearchText,
    setCategory,
    toggleTag,
    setTimeRange,
    toggleFilters,
    clearFilters,
    search,
    loadMore,
    clearError,
  };
}
