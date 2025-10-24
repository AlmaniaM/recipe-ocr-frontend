import { Entity } from './Entity';
import { RecipeId } from '../valueObjects/RecipeId';
import { TimeRange } from '../valueObjects/TimeRange';
import { ServingSize } from '../valueObjects/ServingSize';
import { Ingredient } from './Ingredient';
import { Direction } from './Direction';
import { Tag } from './Tag';
import { RecipeCategory } from '../enums/RecipeCategory';
import { Result } from '../common/Result';
import { 
  RecipeCreatedEvent, 
  RecipeUpdatedEvent, 
  RecipeDeletedEvent, 
  RecipeArchivedEvent 
} from '../events/DomainEvent';

/**
 * Recipe entity representing a complete recipe
 */
export class Recipe extends Entity<RecipeId> {
  private readonly _ingredients: Ingredient[] = [];
  private readonly _directions: Direction[] = [];
  private readonly _tags: Tag[] = [];

  private constructor(
    id: RecipeId,
    public title: string,
    public description: string | null,
    public category: RecipeCategory,
    public prepTime: TimeRange | null,
    public cookTime: TimeRange | null,
    public servings: ServingSize | null,
    public source: string | null,
    public imagePath: string | null,
    public imageUrl: string | null,
    public isLocal: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public isArchived: boolean
  ) {
    super(id);
  }

  /**
   * Creates a new recipe
   */
  static create(
    title: string,
    description: string | null = null,
    category: RecipeCategory = RecipeCategory.Other
  ): Result<Recipe> {
    if (!title || title.trim().length === 0) {
      return Result.failure('Recipe title cannot be null or empty');
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length > 200) {
      return Result.failure('Recipe title cannot exceed 200 characters');
    }

    if (description && description.length > 1000) {
      return Result.failure('Recipe description cannot exceed 1000 characters');
    }

    const id = RecipeId.newId();
    const now = new Date();
    
    const recipe = new Recipe(
      id,
      trimmedTitle,
      description?.trim() || null,
      category,
      null, // prepTime
      null, // cookTime
      null, // servings
      null, // source
      null, // imagePath
      null, // imageUrl
      true, // isLocal
      now,
      now,
      false // isArchived
    );

    recipe.addDomainEvent(new RecipeCreatedEvent(id.value, trimmedTitle));
    
    return Result.success(recipe);
  }

  /**
   * Gets the ingredients as a read-only array
   */
  get ingredients(): readonly Ingredient[] {
    return [...this._ingredients];
  }

  /**
   * Gets the directions as a read-only array
   */
  get directions(): readonly Direction[] {
    return [...this._directions];
  }

  /**
   * Gets the tags as a read-only array
   */
  get tags(): readonly Tag[] {
    return [...this._tags];
  }

  /**
   * Adds an ingredient to the recipe
   */
  addIngredient(ingredient: Ingredient): Result<Recipe> {
    if (this._ingredients.some(i => i.id === ingredient.id)) {
      return Result.failure('Ingredient already exists in recipe');
    }

    const newRecipe = this.clone();
    newRecipe._ingredients.push(ingredient);
    newRecipe.updateTimestamp();
    
    return Result.success(newRecipe);
  }

  /**
   * Removes an ingredient from the recipe
   */
  removeIngredient(ingredientId: string): Result<Recipe> {
    const index = this._ingredients.findIndex(i => i.id === ingredientId);
    if (index === -1) {
      return Result.failure('Ingredient not found in recipe');
    }

    const newRecipe = this.clone();
    newRecipe._ingredients.splice(index, 1);
    newRecipe.updateTimestamp();
    
    return Result.success(newRecipe);
  }

  /**
   * Adds a direction to the recipe
   */
  addDirection(direction: Direction): Result<Recipe> {
    if (this._directions.some(d => d.id === direction.id)) {
      return Result.failure('Direction already exists in recipe');
    }

    const newRecipe = this.clone();
    newRecipe._directions.push(direction);
    newRecipe.updateTimestamp();
    
    return Result.success(newRecipe);
  }

  /**
   * Removes a direction from the recipe
   */
  removeDirection(directionId: string): Result<Recipe> {
    const index = this._directions.findIndex(d => d.id === directionId);
    if (index === -1) {
      return Result.failure('Direction not found in recipe');
    }

    const newRecipe = this.clone();
    newRecipe._directions.splice(index, 1);
    newRecipe.updateTimestamp();
    
    return Result.success(newRecipe);
  }

  /**
   * Adds a tag to the recipe
   */
  addTag(tag: Tag): Result<Recipe> {
    if (this._tags.some(t => t.id === tag.id)) {
      return Result.failure('Tag already exists in recipe');
    }

    const newRecipe = this.clone();
    newRecipe._tags.push(tag);
    newRecipe.updateTimestamp();
    
    return Result.success(newRecipe);
  }

  /**
   * Removes a tag from the recipe
   */
  removeTag(tagId: string): Result<Recipe> {
    const index = this._tags.findIndex(t => t.id === tagId);
    if (index === -1) {
      return Result.failure('Tag not found in recipe');
    }

    const newRecipe = this.clone();
    newRecipe._tags.splice(index, 1);
    newRecipe.updateTimestamp();
    
    return Result.success(newRecipe);
  }

  /**
   * Updates the recipe title
   */
  updateTitle(newTitle: string): Result<Recipe> {
    if (!newTitle || newTitle.trim().length === 0) {
      return Result.failure('Recipe title cannot be null or empty');
    }

    const trimmedTitle = newTitle.trim();
    if (trimmedTitle.length > 200) {
      return Result.failure('Recipe title cannot exceed 200 characters');
    }

    const newRecipe = this.clone();
    newRecipe.title = trimmedTitle;
    newRecipe.updateTimestamp();
    newRecipe.addDomainEvent(new RecipeUpdatedEvent(this.id.value, trimmedTitle));
    
    return Result.success(newRecipe);
  }

  /**
   * Updates the recipe description
   */
  updateDescription(newDescription: string | null): Result<Recipe> {
    if (newDescription && newDescription.length > 1000) {
      return Result.failure('Recipe description cannot exceed 1000 characters');
    }

    const newRecipe = this.clone();
    newRecipe.description = newDescription?.trim() || null;
    newRecipe.updateTimestamp();
    
    return Result.success(newRecipe);
  }

  /**
   * Updates the recipe category
   */
  updateCategory(newCategory: RecipeCategory): Result<Recipe> {
    const newRecipe = this.clone();
    newRecipe.category = newCategory;
    newRecipe.updateTimestamp();
    
    return Result.success(newRecipe);
  }

  /**
   * Updates the prep time
   */
  updatePrepTime(prepTime: TimeRange | null): Result<Recipe> {
    const newRecipe = this.clone();
    newRecipe.prepTime = prepTime;
    newRecipe.updateTimestamp();
    
    return Result.success(newRecipe);
  }

  /**
   * Updates the cook time
   */
  updateCookTime(cookTime: TimeRange | null): Result<Recipe> {
    const newRecipe = this.clone();
    newRecipe.cookTime = cookTime;
    newRecipe.updateTimestamp();
    
    return Result.success(newRecipe);
  }

  /**
   * Updates the servings
   */
  updateServings(servings: ServingSize | null): Result<Recipe> {
    const newRecipe = this.clone();
    newRecipe.servings = servings;
    newRecipe.updateTimestamp();
    
    return Result.success(newRecipe);
  }

  /**
   * Updates the source
   */
  updateSource(source: string | null): Result<Recipe> {
    if (source && source.length > 200) {
      return Result.failure('Recipe source cannot exceed 200 characters');
    }

    const newRecipe = this.clone();
    newRecipe.source = source?.trim() || null;
    newRecipe.updateTimestamp();
    
    return Result.success(newRecipe);
  }

  /**
   * Updates the image path
   */
  updateImagePath(imagePath: string | null): Result<Recipe> {
    const newRecipe = this.clone();
    newRecipe.imagePath = imagePath;
    newRecipe.updateTimestamp();
    
    return Result.success(newRecipe);
  }

  /**
   * Updates the image URL
   */
  updateImageUrl(imageUrl: string | null): Result<Recipe> {
    const newRecipe = this.clone();
    newRecipe.imageUrl = imageUrl;
    newRecipe.updateTimestamp();
    
    return Result.success(newRecipe);
  }

  /**
   * Archives the recipe
   */
  archive(): Result<Recipe> {
    if (this.isArchived) {
      return Result.failure('Recipe is already archived');
    }

    const newRecipe = this.clone();
    newRecipe.isArchived = true;
    newRecipe.updateTimestamp();
    newRecipe.addDomainEvent(new RecipeArchivedEvent(this.id.value, this.title));
    
    return Result.success(newRecipe);
  }

  /**
   * Unarchives the recipe
   */
  unarchive(): Result<Recipe> {
    if (!this.isArchived) {
      return Result.failure('Recipe is not archived');
    }

    const newRecipe = this.clone();
    newRecipe.isArchived = false;
    newRecipe.updateTimestamp();
    
    return Result.success(newRecipe);
  }

  /**
   * Gets the total time (prep + cook)
   */
  get totalTime(): TimeRange | null {
    if (!this.prepTime && !this.cookTime) {
      return null;
    }

    if (!this.prepTime) {
      return this.cookTime;
    }

    if (!this.cookTime) {
      return this.prepTime;
    }

    const totalMin = this.prepTime.minMinutes + this.cookTime.minMinutes;
    const totalMax = (this.prepTime.maxMinutes || this.prepTime.minMinutes) + 
                    (this.cookTime.maxMinutes || this.cookTime.minMinutes);

    return TimeRange.createRange(totalMin, totalMax).value;
  }

  /**
   * Gets the total number of ingredients
   */
  get ingredientCount(): number {
    return this._ingredients.length;
  }

  /**
   * Gets the total number of directions
   */
  get directionCount(): number {
    return this._directions.length;
  }

  /**
   * Gets the total number of tags
   */
  get tagCount(): number {
    return this._tags.length;
  }

  /**
   * Checks if the recipe has ingredients
   */
  get hasIngredients(): boolean {
    return this._ingredients.length > 0;
  }

  /**
   * Checks if the recipe has directions
   */
  get hasDirections(): boolean {
    return this._directions.length > 0;
  }

  /**
   * Checks if the recipe has tags
   */
  get hasTags(): boolean {
    return this._tags.length > 0;
  }

  /**
   * Clones the recipe for updates
   */
  private clone(): Recipe {
    const cloned = new Recipe(
      this.id,
      this.title,
      this.description,
      this.category,
      this.prepTime,
      this.cookTime,
      this.servings,
      this.source,
      this.imagePath,
      this.imageUrl,
      this.isLocal,
      this.createdAt,
      this.updatedAt,
      this.isArchived
    );

    // Copy arrays
    cloned._ingredients.push(...this._ingredients);
    cloned._directions.push(...this._directions);
    cloned._tags.push(...this._tags);

    return cloned;
  }

  /**
   * Updates the timestamp
   */
  private updateTimestamp(): void {
    (this as any).updatedAt = new Date();
  }
}
