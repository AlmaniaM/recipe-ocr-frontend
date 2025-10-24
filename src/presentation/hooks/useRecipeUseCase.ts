import { useCallback } from 'react';
import { getService } from '../../infrastructure/di/container';
import { TYPES } from '../../infrastructure/di/types';
import { CreateRecipeUseCase } from '../../application/useCases/recipes/CreateRecipeUseCase';
import { GetRecipeUseCase } from '../../application/useCases/recipes/GetRecipeUseCase';
import { ListRecipesUseCase } from '../../application/useCases/recipes/ListRecipesUseCase';
import { CaptureAndProcessRecipeUseCase } from '../../application/useCases/ocr/CaptureAndProcessRecipeUseCase';
import { CreateRecipeDto } from '../../application/dto/RecipeDto';
import { Recipe } from '../../domain/entities/Recipe';
import { RecipeCategory } from '../../domain/enums/RecipeCategory';
import { Result } from '../../domain/common/Result';
import { useRecipeStore } from '../../application/state/RecipeStore';

/**
 * Custom hook for recipe use cases
 * 
 * Provides DI-aware access to recipe use cases and integrates with the recipe store.
 * This follows the Clean Architecture pattern by keeping presentation layer thin.
 */
export function useRecipeUseCase() {
  const {
    setRecipes,
    addRecipe,
    updateRecipe,
    removeRecipe,
    setSelectedRecipe,
    setLoading,
    setError,
    setSearchQuery,
    setSelectedCategory,
    setSelectedTags,
    setSortBy,
    setSortOrder,
    setCurrentPage,
    setPageSize,
    setPagination,
    clearFilters,
    recipes,
    filteredRecipes,
    selectedRecipe,
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    selectedTags,
    sortBy,
    sortOrder,
    currentPage,
    pageSize,
    hasNextPage,
    totalCount,
  } = useRecipeStore();

  // Get use cases from DI container
  const createRecipeUseCase = getService<CreateRecipeUseCase>(TYPES.CreateRecipeUseCase);
  const getRecipeUseCase = getService<GetRecipeUseCase>(TYPES.GetRecipeUseCase);
  const listRecipesUseCase = getService<ListRecipesUseCase>(TYPES.ListRecipesUseCase);
  const captureAndProcessRecipeUseCase = getService<CaptureAndProcessRecipeUseCase>(TYPES.CaptureAndProcessRecipeUseCase);

  // Create recipe
  const createRecipe = useCallback(async (createRecipeDto: CreateRecipeDto): Promise<Result<Recipe>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await createRecipeUseCase.execute(createRecipeDto);
      
      if (result.isSuccess) {
        addRecipe(result.value);
      } else {
        setError(result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = `Failed to create recipe: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      return Result.failure(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [createRecipeUseCase, addRecipe, setLoading, setError]);

  // Get recipe by ID
  const getRecipe = useCallback(async (id: string): Promise<Result<Recipe | null>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await getRecipeUseCase.execute(id);
      
      if (result.isSuccess) {
        setSelectedRecipe(result.value);
      } else {
        setError(result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = `Failed to get recipe: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      return Result.failure(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getRecipeUseCase, setSelectedRecipe, setLoading, setError]);

  // List all recipes
  const listRecipes = useCallback(async (): Promise<Result<Recipe[]>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await listRecipesUseCase.execute();
      
      if (result.isSuccess) {
        setRecipes(result.value);
      } else {
        setError(result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = `Failed to list recipes: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      return Result.failure(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [listRecipesUseCase, setRecipes, setLoading, setError]);

  // List recipes by category
  const listRecipesByCategory = useCallback(async (category: RecipeCategory): Promise<Result<Recipe[]>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await listRecipesUseCase.executeByCategory(category);
      
      if (result.isSuccess) {
        setRecipes(result.value);
        setSelectedCategory(category);
      } else {
        setError(result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = `Failed to list recipes by category: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      return Result.failure(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [listRecipesUseCase, setRecipes, setSelectedCategory, setLoading, setError]);

  // Search recipes
  const searchRecipes = useCallback(async (query: string): Promise<Result<Recipe[]>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await listRecipesUseCase.executeSearch(query);
      
      if (result.isSuccess) {
        setRecipes(result.value);
        setSearchQuery(query);
      } else {
        setError(result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = `Failed to search recipes: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      return Result.failure(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [listRecipesUseCase, setRecipes, setSearchQuery, setLoading, setError]);

  // List recipes with pagination
  const listRecipesWithPagination = useCallback(async (page: number, pageSize: number): Promise<Result<{
    recipes: Recipe[];
    totalCount: number;
    hasNextPage: boolean;
  }>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await listRecipesUseCase.executeWithPagination(page, pageSize);
      
      if (result.isSuccess) {
        setRecipes(result.value.recipes);
        setPagination(page, pageSize, result.value.hasNextPage, result.value.totalCount);
      } else {
        setError(result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = `Failed to list recipes with pagination: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      return Result.failure(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [listRecipesUseCase, setRecipes, setPagination, setLoading, setError]);

  // Capture and process recipe from image
  const captureAndProcessRecipe = useCallback(async (imageUri: string, saveToRepository: boolean = true): Promise<Result<Recipe>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await captureAndProcessRecipeUseCase.execute(imageUri, saveToRepository);
      
      if (result.isSuccess) {
        addRecipe(result.value);
      } else {
        setError(result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = `Failed to capture and process recipe: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      return Result.failure(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [captureAndProcessRecipeUseCase, addRecipe, setLoading, setError]);

  // Update recipe
  const updateRecipeHandler = useCallback((recipe: Recipe) => {
    updateRecipe(recipe);
  }, [updateRecipe]);

  // Remove recipe
  const removeRecipeHandler = useCallback((recipeId: string) => {
    removeRecipe(recipeId);
  }, [removeRecipe]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    // State
    recipes,
    filteredRecipes,
    selectedRecipe,
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    selectedTags,
    sortBy,
    sortOrder,
    currentPage,
    pageSize,
    hasNextPage,
    totalCount,

    // Actions
    createRecipe,
    getRecipe,
    listRecipes,
    listRecipesByCategory,
    searchRecipes,
    listRecipesWithPagination,
    captureAndProcessRecipe,
    updateRecipe: updateRecipeHandler,
    removeRecipe: removeRecipeHandler,
    setSelectedRecipe,
    setSearchQuery,
    setSelectedCategory,
    setSelectedTags,
    setSortBy,
    setSortOrder,
    setCurrentPage,
    setPageSize,
    clearFilters,
    clearError,
  };
}
