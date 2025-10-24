import { Entity } from './Entity';
import { RecipeBookId } from '../valueObjects/RecipeBookId';
import { RecipeId } from '../valueObjects/RecipeId';
import { Result } from '../common/Result';
import { 
  RecipeBookCreatedEvent, 
  RecipeBookUpdatedEvent, 
  RecipeBookDeletedEvent 
} from '../events/DomainEvent';

/**
 * RecipeBook entity representing a collection of recipes
 */
export class RecipeBook extends Entity<RecipeBookId> {
  private readonly _recipeIds: RecipeId[] = [];

  private constructor(
    id: RecipeBookId,
    public title: string,
    public description: string | null,
    public categorySortOrder: string[],
    public isLocal: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public isArchived: boolean
  ) {
    super(id);
  }

  /**
   * Creates a new recipe book
   */
  static create(
    title: string,
    description: string | null = null
  ): Result<RecipeBook> {
    if (!title || title.trim().length === 0) {
      return Result.failure('Recipe book title cannot be null or empty');
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length > 200) {
      return Result.failure('Recipe book title cannot exceed 200 characters');
    }

    if (description && description.length > 1000) {
      return Result.failure('Recipe book description cannot exceed 1000 characters');
    }

    const id = RecipeBookId.newId();
    const now = new Date();
    
    const recipeBook = new RecipeBook(
      id,
      trimmedTitle,
      description?.trim() || null,
      [], // categorySortOrder
      true, // isLocal
      now,
      now,
      false // isArchived
    );

    recipeBook.addDomainEvent(new RecipeBookCreatedEvent(id.value, trimmedTitle));
    
    return Result.success(recipeBook);
  }

  /**
   * Gets the recipe IDs as a read-only array
   */
  get recipeIds(): readonly RecipeId[] {
    return [...this._recipeIds];
  }

  /**
   * Gets the number of recipes in the book
   */
  get recipeCount(): number {
    return this._recipeIds.length;
  }

  /**
   * Checks if the recipe book has recipes
   */
  get hasRecipes(): boolean {
    return this._recipeIds.length > 0;
  }

  /**
   * Adds a recipe to the book
   */
  addRecipe(recipeId: RecipeId): Result<RecipeBook> {
    if (this._recipeIds.some(id => id.equals(recipeId))) {
      return Result.failure('Recipe already exists in book');
    }

    const newRecipeBook = this.clone();
    newRecipeBook._recipeIds.push(recipeId);
    newRecipeBook.updateTimestamp();
    
    return Result.success(newRecipeBook);
  }

  /**
   * Removes a recipe from the book
   */
  removeRecipe(recipeId: RecipeId): Result<RecipeBook> {
    const index = this._recipeIds.findIndex(id => id.equals(recipeId));
    if (index === -1) {
      return Result.failure('Recipe not found in book');
    }

    const newRecipeBook = this.clone();
    newRecipeBook._recipeIds.splice(index, 1);
    newRecipeBook.updateTimestamp();
    
    return Result.success(newRecipeBook);
  }

  /**
   * Checks if the book contains a specific recipe
   */
  containsRecipe(recipeId: RecipeId): boolean {
    return this._recipeIds.some(id => id.equals(recipeId));
  }

  /**
   * Updates the recipe book title
   */
  updateTitle(newTitle: string): Result<RecipeBook> {
    if (!newTitle || newTitle.trim().length === 0) {
      return Result.failure('Recipe book title cannot be null or empty');
    }

    const trimmedTitle = newTitle.trim();
    if (trimmedTitle.length > 200) {
      return Result.failure('Recipe book title cannot exceed 200 characters');
    }

    const newRecipeBook = this.clone();
    newRecipeBook.title = trimmedTitle;
    newRecipeBook.updateTimestamp();
    newRecipeBook.addDomainEvent(new RecipeBookUpdatedEvent(this.id.value, trimmedTitle));
    
    return Result.success(newRecipeBook);
  }

  /**
   * Updates the recipe book description
   */
  updateDescription(newDescription: string | null): Result<RecipeBook> {
    if (newDescription && newDescription.length > 1000) {
      return Result.failure('Recipe book description cannot exceed 1000 characters');
    }

    const newRecipeBook = this.clone();
    newRecipeBook.description = newDescription?.trim() || null;
    newRecipeBook.updateTimestamp();
    
    return Result.success(newRecipeBook);
  }

  /**
   * Updates the category sort order
   */
  updateCategorySortOrder(newOrder: string[]): Result<RecipeBook> {
    if (newOrder.length > 50) {
      return Result.failure('Category sort order cannot exceed 50 items');
    }

    const newRecipeBook = this.clone();
    newRecipeBook.categorySortOrder = [...newOrder];
    newRecipeBook.updateTimestamp();
    
    return Result.success(newRecipeBook);
  }

  /**
   * Adds a category to the sort order
   */
  addCategoryToSortOrder(category: string): Result<RecipeBook> {
    if (this.categorySortOrder.includes(category)) {
      return Result.failure('Category already exists in sort order');
    }

    const newRecipeBook = this.clone();
    newRecipeBook.categorySortOrder.push(category);
    newRecipeBook.updateTimestamp();
    
    return Result.success(newRecipeBook);
  }

  /**
   * Removes a category from the sort order
   */
  removeCategoryFromSortOrder(category: string): Result<RecipeBook> {
    const index = this.categorySortOrder.indexOf(category);
    if (index === -1) {
      return Result.failure('Category not found in sort order');
    }

    const newRecipeBook = this.clone();
    newRecipeBook.categorySortOrder.splice(index, 1);
    newRecipeBook.updateTimestamp();
    
    return Result.success(newRecipeBook);
  }

  /**
   * Reorders the categories in the sort order
   */
  reorderCategories(fromIndex: number, toIndex: number): Result<RecipeBook> {
    if (fromIndex < 0 || fromIndex >= this.categorySortOrder.length) {
      return Result.failure('Invalid from index');
    }

    if (toIndex < 0 || toIndex >= this.categorySortOrder.length) {
      return Result.failure('Invalid to index');
    }

    const newRecipeBook = this.clone();
    const [movedCategory] = newRecipeBook.categorySortOrder.splice(fromIndex, 1);
    newRecipeBook.categorySortOrder.splice(toIndex, 0, movedCategory);
    newRecipeBook.updateTimestamp();
    
    return Result.success(newRecipeBook);
  }

  /**
   * Archives the recipe book
   */
  archive(): Result<RecipeBook> {
    if (this.isArchived) {
      return Result.failure('Recipe book is already archived');
    }

    const newRecipeBook = this.clone();
    newRecipeBook.isArchived = true;
    newRecipeBook.updateTimestamp();
    
    return Result.success(newRecipeBook);
  }

  /**
   * Unarchives the recipe book
   */
  unarchive(): Result<RecipeBook> {
    if (!this.isArchived) {
      return Result.failure('Recipe book is not archived');
    }

    const newRecipeBook = this.clone();
    newRecipeBook.isArchived = false;
    newRecipeBook.updateTimestamp();
    
    return Result.success(newRecipeBook);
  }

  /**
   * Clears all recipes from the book
   */
  clearRecipes(): Result<RecipeBook> {
    const newRecipeBook = this.clone();
    newRecipeBook._recipeIds.length = 0;
    newRecipeBook.updateTimestamp();
    
    return Result.success(newRecipeBook);
  }

  /**
   * Clones the recipe book for updates
   */
  private clone(): RecipeBook {
    const cloned = new RecipeBook(
      this.id,
      this.title,
      this.description,
      [...this.categorySortOrder],
      this.isLocal,
      this.createdAt,
      this.updatedAt,
      this.isArchived
    );

    // Copy recipe IDs
    cloned._recipeIds.push(...this._recipeIds);

    return cloned;
  }

  /**
   * Updates the timestamp
   */
  private updateTimestamp(): void {
    (this as any).updatedAt = new Date();
  }
}
