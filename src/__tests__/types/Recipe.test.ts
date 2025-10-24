import { Recipe, Ingredient, RecipeBook, Category, Tag, OCRResult, TextBlock, BoundingBox, ParsedRecipe } from '../../types/Recipe';

describe('Recipe Types', () => {
  describe('Recipe interface', () => {
    const mockRecipe: Recipe = {
      id: 'recipe-1',
      title: 'Chocolate Chip Cookies',
      description: 'Classic homemade chocolate chip cookies',
      ingredients: [
        {
          id: 'ingredient-1',
          text: '2 cups all-purpose flour',
          amount: '2 cups',
          unit: 'cups',
          name: 'all-purpose flour'
        }
      ],
      instructions: [
        'Preheat oven to 375°F',
        'Mix dry ingredients in a bowl',
        'Cream butter and sugars together',
        'Combine wet and dry ingredients',
        'Fold in chocolate chips',
        'Bake for 9-11 minutes'
      ],
      prepTime: 15,
      cookTime: 11,
      servings: 24,
      source: 'Grandma\'s Recipe Book',
      category: 'Desserts',
      tags: ['cookies', 'dessert', 'baking'],
      imagePath: '/images/chocolate-chip-cookies.jpg',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      isLocal: true
    };

    it('should have all required properties', () => {
      expect(mockRecipe.id).toBeDefined();
      expect(mockRecipe.title).toBeDefined();
      expect(mockRecipe.ingredients).toBeDefined();
      expect(mockRecipe.instructions).toBeDefined();
      expect(mockRecipe.category).toBeDefined();
      expect(mockRecipe.tags).toBeDefined();
      expect(mockRecipe.createdAt).toBeDefined();
      expect(mockRecipe.updatedAt).toBeDefined();
      expect(mockRecipe.isLocal).toBeDefined();
    });

    it('should allow optional properties to be undefined', () => {
      const minimalRecipe: Recipe = {
        id: 'recipe-2',
        title: 'Simple Recipe',
        ingredients: [],
        instructions: 'Mix and serve',
        category: 'Other',
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isLocal: true
      };

      expect(minimalRecipe.description).toBeUndefined();
      expect(minimalRecipe.prepTime).toBeUndefined();
      expect(minimalRecipe.cookTime).toBeUndefined();
      expect(minimalRecipe.servings).toBeUndefined();
      expect(minimalRecipe.source).toBeUndefined();
      expect(minimalRecipe.imagePath).toBeUndefined();
      expect(minimalRecipe.imageUrl).toBeUndefined();
    });

    it('should support both string and array instructions', () => {
      const recipeWithStringInstructions: Recipe = {
        ...mockRecipe,
        instructions: 'Mix all ingredients and bake at 350°F for 20 minutes'
      };

      const recipeWithArrayInstructions: Recipe = {
        ...mockRecipe,
        instructions: ['Step 1: Mix ingredients', 'Step 2: Bake']
      };

      expect(typeof recipeWithStringInstructions.instructions).toBe('string');
      expect(Array.isArray(recipeWithArrayInstructions.instructions)).toBe(true);
    });
  });

  describe('Ingredient interface', () => {
    const mockIngredient: Ingredient = {
      id: 'ingredient-1',
      text: '2 cups all-purpose flour',
      amount: '2 cups',
      unit: 'cups',
      name: 'all-purpose flour'
    };

    it('should have required properties', () => {
      expect(mockIngredient.id).toBeDefined();
      expect(mockIngredient.text).toBeDefined();
    });

    it('should allow optional properties to be undefined', () => {
      const minimalIngredient: Ingredient = {
        id: 'ingredient-2',
        text: 'Salt to taste'
      };

      expect(minimalIngredient.amount).toBeUndefined();
      expect(minimalIngredient.unit).toBeUndefined();
      expect(minimalIngredient.name).toBeUndefined();
    });
  });

  describe('RecipeBook interface', () => {
    const mockRecipeBook: RecipeBook = {
      id: 'book-1',
      title: 'Family Favorites',
      description: 'A collection of our family\'s favorite recipes',
      recipeIds: ['recipe-1', 'recipe-2', 'recipe-3'],
      categorySortOrder: ['Appetizers', 'Main Courses', 'Desserts'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
      isLocal: true
    };

    it('should have all required properties', () => {
      expect(mockRecipeBook.id).toBeDefined();
      expect(mockRecipeBook.title).toBeDefined();
      expect(mockRecipeBook.recipeIds).toBeDefined();
      expect(mockRecipeBook.categorySortOrder).toBeDefined();
      expect(mockRecipeBook.createdAt).toBeDefined();
      expect(mockRecipeBook.updatedAt).toBeDefined();
      expect(mockRecipeBook.isLocal).toBeDefined();
    });

    it('should allow description to be undefined', () => {
      const minimalBook: RecipeBook = {
        id: 'book-2',
        title: 'Simple Book',
        recipeIds: [],
        categorySortOrder: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isLocal: true
      };

      expect(minimalBook.description).toBeUndefined();
    });
  });

  describe('Category interface', () => {
    const mockCategory: Category = {
      id: 'category-1',
      name: 'Desserts',
      color: '#FF6B35',
      createdAt: new Date('2024-01-01')
    };

    it('should have required properties', () => {
      expect(mockCategory.id).toBeDefined();
      expect(mockCategory.name).toBeDefined();
      expect(mockCategory.createdAt).toBeDefined();
    });

    it('should allow color to be undefined', () => {
      const categoryWithoutColor: Category = {
        id: 'category-2',
        name: 'Main Courses',
        createdAt: new Date()
      };

      expect(categoryWithoutColor.color).toBeUndefined();
    });
  });

  describe('Tag interface', () => {
    const mockTag: Tag = {
      id: 'tag-1',
      name: 'vegetarian',
      color: '#4CAF50',
      createdAt: new Date('2024-01-01')
    };

    it('should have required properties', () => {
      expect(mockTag.id).toBeDefined();
      expect(mockTag.name).toBeDefined();
      expect(mockTag.createdAt).toBeDefined();
    });

    it('should allow color to be undefined', () => {
      const tagWithoutColor: Tag = {
        id: 'tag-2',
        name: 'quick',
        createdAt: new Date()
      };

      expect(tagWithoutColor.color).toBeUndefined();
    });
  });

  describe('OCRResult interface', () => {
    const mockOCRResult: OCRResult = {
      text: 'Chocolate Chip Cookies\n2 cups flour\n1 cup sugar',
      confidence: 0.95,
      language: 'en',
      blocks: [
        {
          text: 'Chocolate Chip Cookies',
          boundingBox: { x: 10, y: 20, width: 200, height: 30 },
          confidence: 0.98
        }
      ]
    };

    it('should have required properties', () => {
      expect(mockOCRResult.text).toBeDefined();
      expect(mockOCRResult.confidence).toBeDefined();
      expect(mockOCRResult.language).toBeDefined();
    });

    it('should allow blocks to be undefined', () => {
      const simpleOCRResult: OCRResult = {
        text: 'Simple text',
        confidence: 0.85,
        language: 'en'
      };

      expect(simpleOCRResult.blocks).toBeUndefined();
    });

    it('should validate confidence is between 0 and 1', () => {
      expect(mockOCRResult.confidence).toBeGreaterThanOrEqual(0);
      expect(mockOCRResult.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('TextBlock interface', () => {
    const mockTextBlock: TextBlock = {
      text: 'Chocolate Chip Cookies',
      boundingBox: { x: 10, y: 20, width: 200, height: 30 },
      confidence: 0.98
    };

    it('should have all required properties', () => {
      expect(mockTextBlock.text).toBeDefined();
      expect(mockTextBlock.boundingBox).toBeDefined();
      expect(mockTextBlock.confidence).toBeDefined();
    });

    it('should validate confidence is between 0 and 1', () => {
      expect(mockTextBlock.confidence).toBeGreaterThanOrEqual(0);
      expect(mockTextBlock.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('BoundingBox interface', () => {
    const mockBoundingBox: BoundingBox = {
      x: 10,
      y: 20,
      width: 200,
      height: 30
    };

    it('should have all required properties', () => {
      expect(mockBoundingBox.x).toBeDefined();
      expect(mockBoundingBox.y).toBeDefined();
      expect(mockBoundingBox.width).toBeDefined();
      expect(mockBoundingBox.height).toBeDefined();
    });

    it('should have non-negative values', () => {
      expect(mockBoundingBox.x).toBeGreaterThanOrEqual(0);
      expect(mockBoundingBox.y).toBeGreaterThanOrEqual(0);
      expect(mockBoundingBox.width).toBeGreaterThan(0);
      expect(mockBoundingBox.height).toBeGreaterThan(0);
    });
  });

  describe('ParsedRecipe interface', () => {
    const mockParsedRecipe: ParsedRecipe = {
      title: 'Chocolate Chip Cookies',
      description: 'Classic homemade cookies',
      ingredients: ['2 cups flour', '1 cup sugar', '1/2 cup butter'],
      instructions: [
        'Preheat oven to 375°F',
        'Mix ingredients',
        'Bake for 10 minutes'
      ],
      prepTime: 15,
      cookTime: 10,
      servings: 24,
      confidence: 0.92
    };

    it('should have required properties', () => {
      expect(mockParsedRecipe.title).toBeDefined();
      expect(mockParsedRecipe.ingredients).toBeDefined();
      expect(mockParsedRecipe.instructions).toBeDefined();
      expect(mockParsedRecipe.confidence).toBeDefined();
    });

    it('should allow optional properties to be undefined', () => {
      const minimalParsedRecipe: ParsedRecipe = {
        title: 'Simple Recipe',
        ingredients: ['flour', 'water'],
        instructions: ['Mix and bake'],
        confidence: 0.8
      };

      expect(minimalParsedRecipe.description).toBeUndefined();
      expect(minimalParsedRecipe.prepTime).toBeUndefined();
      expect(minimalParsedRecipe.cookTime).toBeUndefined();
      expect(minimalParsedRecipe.servings).toBeUndefined();
    });

    it('should validate confidence is between 0 and 1', () => {
      expect(mockParsedRecipe.confidence).toBeGreaterThanOrEqual(0);
      expect(mockParsedRecipe.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Type validation helpers', () => {
    it('should validate Recipe arrays', () => {
      const recipes: Recipe[] = [
        {
          id: '1',
          title: 'Recipe 1',
          ingredients: [],
          instructions: 'Mix',
          category: 'Other',
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isLocal: true
        }
      ];

      expect(Array.isArray(recipes)).toBe(true);
      expect(recipes[0]).toHaveProperty('id');
      expect(recipes[0]).toHaveProperty('title');
    });

    it('should validate Ingredient arrays', () => {
      const ingredients: Ingredient[] = [
        {
          id: '1',
          text: 'Flour'
        }
      ];

      expect(Array.isArray(ingredients)).toBe(true);
      expect(ingredients[0]).toHaveProperty('id');
      expect(ingredients[0]).toHaveProperty('text');
    });
  });
});
