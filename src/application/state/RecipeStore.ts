import { create } from 'zustand';
import { Recipe } from '../../domain/entities/Recipe';
import { RecipeCategory } from '../../domain/enums/RecipeCategory';

/**
 * Recipe Store Interface
 * 
 * Defines the state and actions for recipe management.
 * This follows the state management pattern with Zustand.
 */
interface RecipeStore {
  // State
  recipes: Recipe[];
  filteredRecipes: Recipe[];
  selectedRecipe: Recipe | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: RecipeCategory | null;
  selectedTags: string[];
  sortBy: 'title' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  totalCount: number;

  // Actions
  setRecipes: (recipes: Recipe[]) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipe: Recipe) => void;
  removeRecipe: (recipeId: string) => void;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: RecipeCategory | null) => void;
  setSelectedTags: (tags: string[]) => void;
  setSortBy: (sortBy: 'title' | 'createdAt' | 'updatedAt') => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setPagination: (page: number, pageSize: number, hasNextPage: boolean, totalCount: number) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  reset: () => void;
}

/**
 * Recipe Store
 * 
 * Zustand store for managing recipe state.
 * This provides a centralized state management solution.
 */
export const useRecipeStore = create<RecipeStore>((set, get) => ({
  // Initial state
  recipes: [],
  filteredRecipes: [],
  selectedRecipe: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedCategory: null,
  selectedTags: [],
  sortBy: 'createdAt',
  sortOrder: 'desc',
  currentPage: 1,
  pageSize: 20,
  hasNextPage: false,
  totalCount: 0,

  // Actions
  setRecipes: (recipes) => {
    set({ recipes });
    get().applyFilters();
  },

  addRecipe: (recipe) => {
    set((state) => ({
      recipes: [recipe, ...state.recipes],
      totalCount: state.totalCount + 1,
    }));
    get().applyFilters();
  },

  updateRecipe: (recipe) => {
    set((state) => ({
      recipes: state.recipes.map((r) => (r.id.value === recipe.id.value ? recipe : r)),
      selectedRecipe: state.selectedRecipe?.id.value === recipe.id.value ? recipe : state.selectedRecipe,
    }));
    get().applyFilters();
  },

  removeRecipe: (recipeId) => {
    set((state) => ({
      recipes: state.recipes.filter((r) => r.id.value !== recipeId),
      selectedRecipe: state.selectedRecipe?.id.value === recipeId ? null : state.selectedRecipe,
      totalCount: Math.max(0, state.totalCount - 1),
    }));
    get().applyFilters();
  },

  setSelectedRecipe: (recipe) => {
    set({ selectedRecipe: recipe });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
    get().applyFilters();
  },

  setSelectedTags: (tags) => {
    set({ selectedTags: tags });
    get().applyFilters();
  },

  setSortBy: (sortBy) => {
    set({ sortBy });
    get().applyFilters();
  },

  setSortOrder: (sortOrder) => {
    set({ sortOrder });
    get().applyFilters();
  },

  setCurrentPage: (page) => {
    set({ currentPage: page });
  },

  setPageSize: (pageSize) => {
    set({ currentPage: 1, pageSize });
    get().applyFilters();
  },

  setPagination: (page, pageSize, hasNextPage, totalCount) => {
    set({
      currentPage: page,
      pageSize,
      hasNextPage,
      totalCount,
    });
  },

  clearFilters: () => {
    set({
      searchQuery: '',
      selectedCategory: null,
      selectedTags: [],
      sortBy: 'createdAt',
      sortOrder: 'desc',
      currentPage: 1,
    });
    get().applyFilters();
  },

  applyFilters: () => {
    const { recipes, searchQuery, selectedCategory, selectedTags, sortBy, sortOrder } = get();

    let filtered = [...recipes];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((recipe) =>
        recipe.title.toLowerCase().includes(query) ||
        (recipe.description && recipe.description.toLowerCase().includes(query)) ||
        recipe.ingredients.some((ingredient) =>
          ingredient.text.value.toLowerCase().includes(query)
        )
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((recipe) => recipe.category === selectedCategory);
    }

    // Apply tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((recipe) =>
        selectedTags.every((tagId) =>
          recipe.tags.some((tag) => tag.id === tagId)
        )
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updatedAt':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    set({ filteredRecipes: filtered });
  },

  reset: () => {
    set({
      recipes: [],
      filteredRecipes: [],
      selectedRecipe: null,
      isLoading: false,
      error: null,
      searchQuery: '',
      selectedCategory: null,
      selectedTags: [],
      sortBy: 'createdAt',
      sortOrder: 'desc',
      currentPage: 1,
      pageSize: 20,
      hasNextPage: false,
      totalCount: 0,
    });
  },
}));
