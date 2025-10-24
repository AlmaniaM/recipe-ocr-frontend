/**
 * Tag Management Hook
 * 
 * Provides tag management functionality including fetching, creating, and searching tags.
 */

import { useState, useCallback } from 'react';
import { TagDto, CreateTagRequest, CreateTagResponse } from '../../services/api/types';
import { RecipeService } from '../../services/RecipeService';
import { ApiServiceFactory } from '../../services/api';

interface UseTagManagementReturn {
  // State
  tags: TagDto[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getTags: (search?: string) => Promise<void>;
  createTag: (name: string, color?: string) => Promise<CreateTagResponse | null>;
  clearError: () => void;
}

export function useTagManagement(): UseTagManagementReturn {
  const [tags, setTags] = useState<TagDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize recipe service
  const recipeService = new RecipeService(ApiServiceFactory.getRecipeApiClient());

  const getTags = useCallback(async (search?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const fetchedTags = await recipeService.getTags(search);
      setTags(fetchedTags);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tags';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [recipeService]);

  const createTag = useCallback(async (name: string, color?: string): Promise<CreateTagResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await recipeService.createTag(name, color);
      
      // Refresh tags list to include the new tag
      await getTags();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create tag';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [recipeService, getTags]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    tags,
    isLoading,
    error,
    
    // Actions
    getTags,
    createTag,
    clearError,
  };
}