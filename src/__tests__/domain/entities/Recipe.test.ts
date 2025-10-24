import { Recipe } from '../../domain/entities/Recipe';
import { RecipeCategory } from '../../domain/enums/RecipeCategory';
import { Ingredient } from '../../domain/entities/Ingredient';
import { Direction } from '../../domain/entities/Direction';
import { Tag } from '../../domain/entities/Tag';
import { TimeRange } from '../../domain/valueObjects/TimeRange';
import { ServingSize } from '../../domain/valueObjects/ServingSize';

describe('Recipe', () => {
  describe('create', () => {
    it('should create a recipe with valid data', () => {
      const result = Recipe.create('Test Recipe', 'A delicious test recipe', RecipeCategory.MainCourse);
      
      expect(result.isSuccess).toBe(true);
      const recipe = result.value;
      
      expect(recipe.title).toBe('Test Recipe');
      expect(recipe.description).toBe('A delicious test recipe');
      expect(recipe.category).toBe(RecipeCategory.MainCourse);
      expect(recipe.isLocal).toBe(true);
      expect(recipe.isArchived).toBe(false);
      expect(recipe.ingredients).toHaveLength(0);
      expect(recipe.directions).toHaveLength(0);
      expect(recipe.tags).toHaveLength(0);
    });

    it('should create a recipe with minimal data', () => {
      const result = Recipe.create('Simple Recipe');
      
      expect(result.isSuccess).toBe(true);
      const recipe = result.value;
      
      expect(recipe.title).toBe('Simple Recipe');
      expect(recipe.description).toBeNull();
      expect(recipe.category).toBe(RecipeCategory.Other);
    });

    it('should fail with empty title', () => {
      const result = Recipe.create('');
      
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Recipe title cannot be null or empty');
    });

    it('should fail with title too long', () => {
      const longTitle = 'a'.repeat(201);
      const result = Recipe.create(longTitle);
      
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Recipe title cannot exceed 200 characters');
    });

    it('should fail with description too long', () => {
      const longDescription = 'a'.repeat(1001);
      const result = Recipe.create('Test Recipe', longDescription);
      
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Recipe description cannot exceed 1000 characters');
    });
  });

  describe('addIngredient', () => {
    it('should add ingredient to recipe', async () => {
      const recipeResult = Recipe.create('Test Recipe');
      expect(recipeResult.isSuccess).toBe(true);
      const recipe = recipeResult.value;

      const ingredientResult = Ingredient.create('2 cups flour');
      expect(ingredientResult.isSuccess).toBe(true);
      const ingredient = ingredientResult.value;

      const addResult = recipe.addIngredient(ingredient);
      
      expect(addResult.isSuccess).toBe(true);
      const updatedRecipe = addResult.value;
      
      expect(updatedRecipe.ingredients).toHaveLength(1);
      expect(updatedRecipe.ingredients[0]).toBe(ingredient);
    });

    it('should fail to add duplicate ingredient', async () => {
      const recipeResult = Recipe.create('Test Recipe');
      expect(recipeResult.isSuccess).toBe(true);
      const recipe = recipeResult.value;

      const ingredientResult = Ingredient.create('2 cups flour');
      expect(ingredientResult.isSuccess).toBe(true);
      const ingredient = ingredientResult.value;

      const addResult1 = recipe.addIngredient(ingredient);
      expect(addResult1.isSuccess).toBe(true);
      
      const addResult2 = addResult1.value.addIngredient(ingredient);
      expect(addResult2.isFailure).toBe(true);
      expect(addResult2.error).toBe('Ingredient already exists in recipe');
    });
  });

  describe('addDirection', () => {
    it('should add direction to recipe', async () => {
      const recipeResult = Recipe.create('Test Recipe');
      expect(recipeResult.isSuccess).toBe(true);
      const recipe = recipeResult.value;

      const directionResult = Direction.create('Mix ingredients together');
      expect(directionResult.isSuccess).toBe(true);
      const direction = directionResult.value;

      const addResult = recipe.addDirection(direction);
      
      expect(addResult.isSuccess).toBe(true);
      const updatedRecipe = addResult.value;
      
      expect(updatedRecipe.directions).toHaveLength(1);
      expect(updatedRecipe.directions[0]).toBe(direction);
    });
  });

  describe('addTag', () => {
    it('should add tag to recipe', async () => {
      const recipeResult = Recipe.create('Test Recipe');
      expect(recipeResult.isSuccess).toBe(true);
      const recipe = recipeResult.value;

      const tagResult = Tag.create('dessert');
      expect(tagResult.isSuccess).toBe(true);
      const tag = tagResult.value;

      const addResult = recipe.addTag(tag);
      
      expect(addResult.isSuccess).toBe(true);
      const updatedRecipe = addResult.value;
      
      expect(updatedRecipe.tags).toHaveLength(1);
      expect(updatedRecipe.tags[0]).toBe(tag);
    });
  });

  describe('updateTitle', () => {
    it('should update recipe title', () => {
      const recipeResult = Recipe.create('Old Title');
      expect(recipeResult.isSuccess).toBe(true);
      const recipe = recipeResult.value;

      const updateResult = recipe.updateTitle('New Title');
      
      expect(updateResult.isSuccess).toBe(true);
      const updatedRecipe = updateResult.value;
      
      expect(updatedRecipe.title).toBe('New Title');
    });

    it('should fail with empty title', () => {
      const recipeResult = Recipe.create('Test Recipe');
      expect(recipeResult.isSuccess).toBe(true);
      const recipe = recipeResult.value;

      const updateResult = recipe.updateTitle('');
      
      expect(updateResult.isFailure).toBe(true);
      expect(updateResult.error).toBe('Recipe title cannot be null or empty');
    });
  });

  describe('updateCategory', () => {
    it('should update recipe category', () => {
      const recipeResult = Recipe.create('Test Recipe');
      expect(recipeResult.isSuccess).toBe(true);
      const recipe = recipeResult.value;

      const updateResult = recipe.updateCategory(RecipeCategory.Dessert);
      
      expect(updateResult.isSuccess).toBe(true);
      const updatedRecipe = updateResult.value;
      
      expect(updatedRecipe.category).toBe(RecipeCategory.Dessert);
    });
  });

  describe('archive', () => {
    it('should archive recipe', () => {
      const recipeResult = Recipe.create('Test Recipe');
      expect(recipeResult.isSuccess).toBe(true);
      const recipe = recipeResult.value;

      const archiveResult = recipe.archive();
      
      expect(archiveResult.isSuccess).toBe(true);
      const archivedRecipe = archiveResult.value;
      
      expect(archivedRecipe.isArchived).toBe(true);
    });

    it('should fail to archive already archived recipe', () => {
      const recipeResult = Recipe.create('Test Recipe');
      expect(recipeResult.isSuccess).toBe(true);
      const recipe = recipeResult.value;

      const archiveResult1 = recipe.archive();
      expect(archiveResult1.isSuccess).toBe(true);
      
      const archiveResult2 = archiveResult1.value.archive();
      expect(archiveResult2.isFailure).toBe(true);
      expect(archiveResult2.error).toBe('Recipe is already archived');
    });
  });

  describe('unarchive', () => {
    it('should unarchive recipe', () => {
      const recipeResult = Recipe.create('Test Recipe');
      expect(recipeResult.isSuccess).toBe(true);
      const recipe = recipeResult.value;

      const archiveResult = recipe.archive();
      expect(archiveResult.isSuccess).toBe(true);
      
      const unarchiveResult = archiveResult.value.unarchive();
      
      expect(unarchiveResult.isSuccess).toBe(true);
      const unarchivedRecipe = unarchiveResult.value;
      
      expect(unarchivedRecipe.isArchived).toBe(false);
    });

    it('should fail to unarchive non-archived recipe', () => {
      const recipeResult = Recipe.create('Test Recipe');
      expect(recipeResult.isSuccess).toBe(true);
      const recipe = recipeResult.value;

      const unarchiveResult = recipe.unarchive();
      
      expect(unarchiveResult.isFailure).toBe(true);
      expect(unarchiveResult.error).toBe('Recipe is not archived');
    });
  });

  describe('properties', () => {
    it('should have correct initial values', () => {
      const recipeResult = Recipe.create('Test Recipe');
      expect(recipeResult.isSuccess).toBe(true);
      const recipe = recipeResult.value;

      expect(recipe.ingredientCount).toBe(0);
      expect(recipe.directionCount).toBe(0);
      expect(recipe.tagCount).toBe(0);
      expect(recipe.hasIngredients).toBe(false);
      expect(recipe.hasDirections).toBe(false);
      expect(recipe.hasTags).toBe(false);
    });
  });
});
