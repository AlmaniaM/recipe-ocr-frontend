import { Recipe } from '../../types/Recipe';

/**
 * Performance test data generator for comprehensive testing
 */

export interface PerformanceTestConfig {
  recipeCount: number;
  includeImages: boolean;
  includeLongDescriptions: boolean;
  includeComplexInstructions: boolean;
}

export const defaultPerformanceConfig: PerformanceTestConfig = {
  recipeCount: 1000,
  includeImages: true,
  includeLongDescriptions: true,
  includeComplexInstructions: true,
};

/**
 * Generate a large dataset of test recipes for performance testing
 */
export function generateTestRecipes(count: number = 1000): Recipe[] {
  const recipes: Recipe[] = [];
  const categories = ['MainCourse', 'Dessert', 'Appetizer', 'SideDish', 'Beverage'];
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const tags = [
    'Italian', 'Mexican', 'Asian', 'Mediterranean', 'American',
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto',
    'Quick', 'Comfort Food', 'Healthy', 'Spicy', 'Sweet'
  ];

  for (let i = 0; i < count; i++) {
    const recipe: Recipe = {
      id: `test-recipe-${i}`,
      title: `Test Recipe ${i + 1}`,
      description: generateDescription(i),
      category: categories[i % categories.length],
      prepTimeMinutes: Math.floor(Math.random() * 60) + 5,
      cookTimeMinutes: Math.floor(Math.random() * 120) + 10,
      servings: Math.floor(Math.random() * 8) + 1,
      difficulty: difficulties[i % difficulties.length],
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
      ingredients: generateIngredients(i),
      instructions: generateInstructions(i),
      tags: generateTags(tags, i),
      imagePath: `images/recipe-${i}.jpg`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    recipes.push(recipe);
  }

  return recipes;
}

/**
 * Generate a description based on the recipe index
 */
function generateDescription(index: number): string {
  const descriptions = [
    'A delicious and easy-to-make recipe that will impress your family and friends.',
    'This classic recipe has been passed down through generations and never fails to satisfy.',
    'Perfect for a weeknight dinner or special occasion, this dish is sure to please.',
    'A healthy and nutritious meal that doesn\'t compromise on flavor or satisfaction.',
    'Quick and simple preparation makes this recipe ideal for busy weeknights.',
    'An elegant dish that\'s perfect for entertaining guests or romantic dinners.',
    'This comfort food classic will warm your heart and fill your belly.',
    'A fresh and vibrant recipe that celebrates seasonal ingredients and bold flavors.',
    'Simple ingredients come together to create something truly extraordinary.',
    'This recipe strikes the perfect balance between simplicity and sophistication.',
  ];
  
  const baseDescription = descriptions[index % descriptions.length];
  
  if (index % 3 === 0) {
    return baseDescription + ' ' + generateLongDescription();
  }
  
  return baseDescription;
}

/**
 * Generate a long description for stress testing
 */
function generateLongDescription(): string {
  return 'This recipe has been carefully crafted to deliver exceptional flavor and texture. ' +
    'The combination of carefully selected ingredients creates a harmonious balance that will ' +
    'delight your taste buds. Whether you\'re cooking for one or feeding a crowd, this recipe ' +
    'scales beautifully and maintains its integrity. The cooking techniques used have been ' +
    'refined over years of experimentation to ensure consistent results every time.';
}

/**
 * Generate ingredients list based on the recipe index
 */
function generateIngredients(index: number): string[] {
  const baseIngredients = [
    '2 cups all-purpose flour',
    '1 tsp salt',
    '1 tsp baking powder',
    '1/2 cup butter, softened',
    '1 cup sugar',
    '2 large eggs',
    '1 tsp vanilla extract',
    '1/2 cup milk',
    '1 lb ground beef',
    '1 onion, diced',
    '2 cloves garlic, minced',
    '1 can diced tomatoes',
    '1 tsp oregano',
    '1 tsp basil',
    'Salt and pepper to taste',
    '2 tbsp olive oil',
    '1 bell pepper, sliced',
    '1 zucchini, sliced',
    '1 cup cheese, grated',
    '1/4 cup fresh herbs'
  ];

  const ingredientCount = Math.floor(Math.random() * 10) + 5; // 5-15 ingredients
  const ingredients: string[] = [];
  
  for (let i = 0; i < ingredientCount; i++) {
    const ingredient = baseIngredients[i % baseIngredients.length];
    const quantity = Math.floor(Math.random() * 4) + 1;
    ingredients.push(`${quantity} ${ingredient}`);
  }
  
  return ingredients;
}

/**
 * Generate instructions based on the recipe index
 */
function generateInstructions(index: number): string[] {
  const baseInstructions = [
    'Preheat oven to 350°F',
    'Prepare all ingredients and equipment',
    'Mix dry ingredients in a large bowl',
    'In a separate bowl, cream butter and sugar',
    'Add eggs one at a time, beating well after each',
    'Gradually add dry ingredients to wet ingredients',
    'Mix until just combined, do not overmix',
    'Pour batter into prepared pan',
    'Bake for 25-30 minutes or until golden brown',
    'Cool in pan for 10 minutes before removing',
    'Heat oil in a large skillet over medium heat',
    'Add onions and cook until softened',
    'Add garlic and cook for 1 minute',
    'Add meat and cook until browned',
    'Season with salt and pepper',
    'Add vegetables and cook until tender',
    'Stir in sauce and simmer for 10 minutes',
    'Garnish with fresh herbs and serve'
  ];

  const instructionCount = Math.floor(Math.random() * 8) + 5; // 5-13 instructions
  const instructions: string[] = [];
  
  for (let i = 0; i < instructionCount; i++) {
    instructions.push(baseInstructions[i % baseInstructions.length]);
  }
  
  return instructions;
}

/**
 * Generate tags based on the recipe index
 */
function generateTags(availableTags: string[], index: number): string[] {
  const tagCount = Math.floor(Math.random() * 4) + 2; // 2-6 tags
  const tags: string[] = [];
  
  for (let i = 0; i < tagCount; i++) {
    const tag = availableTags[(index + i) % availableTags.length];
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }
  
  return tags;
}

/**
 * Generate a small dataset for quick testing
 */
export function generateSmallTestRecipes(count: number = 10): Recipe[] {
  return generateTestRecipes(count);
}

/**
 * Generate a medium dataset for balanced testing
 */
export function generateMediumTestRecipes(count: number = 100): Recipe[] {
  return generateTestRecipes(count);
}

/**
 * Generate a large dataset for stress testing
 */
export function generateLargeTestRecipes(count: number = 1000): Recipe[] {
  return generateTestRecipes(count);
}

/**
 * Generate a very large dataset for extreme stress testing
 */
export function generateVeryLargeTestRecipes(count: number = 5000): Recipe[] {
  return generateTestRecipes(count);
}

/**
 * Generate test data with specific characteristics for targeted testing
 */
export function generateTargetedTestRecipes(config: Partial<PerformanceTestConfig> = {}): Recipe[] {
  const finalConfig = { ...defaultPerformanceConfig, ...config };
  return generateTestRecipes(finalConfig.recipeCount);
}

/**
 * Generate test data for memory usage testing
 */
export function generateMemoryTestRecipes(): Recipe[] {
  return generateTestRecipes(1000);
}

/**
 * Generate test data for scroll performance testing
 */
export function generateScrollTestRecipes(): Recipe[] {
  return generateTestRecipes(500);
}

/**
 * Generate test data for render performance testing
 */
export function generateRenderTestRecipes(): Recipe[] {
  return generateTestRecipes(200);
}
