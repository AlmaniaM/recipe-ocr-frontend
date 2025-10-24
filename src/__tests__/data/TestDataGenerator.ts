import { Recipe } from '../../types/Recipe';

/**
 * Test data generator for creating various test scenarios
 */

export interface TestScenario {
  name: string;
  recipeCount: number;
  complexity: 'low' | 'medium' | 'high';
  description: string;
}

export const testScenarios: TestScenario[] = [
  {
    name: 'empty',
    recipeCount: 0,
    complexity: 'low',
    description: 'Empty recipe list for testing empty states'
  },
  {
    name: 'small',
    recipeCount: 5,
    complexity: 'low',
    description: 'Small recipe list for basic functionality testing'
  },
  {
    name: 'medium',
    recipeCount: 50,
    complexity: 'medium',
    description: 'Medium recipe list for balanced performance testing'
  },
  {
    name: 'large',
    recipeCount: 500,
    complexity: 'high',
    description: 'Large recipe list for performance stress testing'
  },
  {
    name: 'very-large',
    recipeCount: 2000,
    complexity: 'high',
    description: 'Very large recipe list for extreme performance testing'
  }
];

/**
 * Generate test data for a specific scenario
 */
export function generateTestDataForScenario(scenarioName: string): Recipe[] {
  const scenario = testScenarios.find(s => s.name === scenarioName);
  if (!scenario) {
    throw new Error(`Unknown test scenario: ${scenarioName}`);
  }
  
  return generateTestRecipes(scenario.recipeCount);
}

/**
 * Generate test recipes with specific characteristics
 */
export function generateTestRecipes(count: number): Recipe[] {
  const recipes: Recipe[] = [];
  
  for (let i = 0; i < count; i++) {
    recipes.push(generateSingleRecipe(i));
  }
  
  return recipes;
}

/**
 * Generate a single test recipe
 */
function generateSingleRecipe(index: number): Recipe {
  const categories = ['MainCourse', 'Dessert', 'Appetizer', 'SideDish', 'Beverage'];
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const tags = [
    'Italian', 'Mexican', 'Asian', 'Mediterranean', 'American',
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto',
    'Quick', 'Comfort Food', 'Healthy', 'Spicy', 'Sweet'
  ];

  return {
    id: `test-recipe-${index}`,
    title: `Test Recipe ${index + 1}`,
    description: generateDescription(index),
    category: categories[index % categories.length],
    prepTimeMinutes: Math.floor(Math.random() * 60) + 5,
    cookTimeMinutes: Math.floor(Math.random() * 120) + 10,
    servings: Math.floor(Math.random() * 8) + 1,
    difficulty: difficulties[index % difficulties.length],
    rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
    ingredients: generateIngredients(index),
    instructions: generateInstructions(index),
    tags: generateTags(tags, index),
    imagePath: `images/recipe-${index}.jpg`,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate a description for a test recipe
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
  
  return descriptions[index % descriptions.length];
}

/**
 * Generate ingredients for a test recipe
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

  const ingredientCount = Math.floor(Math.random() * 10) + 5;
  const ingredients: string[] = [];
  
  for (let i = 0; i < ingredientCount; i++) {
    const ingredient = baseIngredients[i % baseIngredients.length];
    const quantity = Math.floor(Math.random() * 4) + 1;
    ingredients.push(`${quantity} ${ingredient}`);
  }
  
  return ingredients;
}

/**
 * Generate instructions for a test recipe
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

  const instructionCount = Math.floor(Math.random() * 8) + 5;
  const instructions: string[] = [];
  
  for (let i = 0; i < instructionCount; i++) {
    instructions.push(baseInstructions[i % baseInstructions.length]);
  }
  
  return instructions;
}

/**
 * Generate tags for a test recipe
 */
function generateTags(availableTags: string[], index: number): string[] {
  const tagCount = Math.floor(Math.random() * 4) + 2;
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
 * Generate test data for specific performance testing scenarios
 */
export const performanceTestData = {
  /**
   * Generate data for render performance testing
   */
  renderPerformance: () => generateTestRecipes(200),
  
  /**
   * Generate data for scroll performance testing
   */
  scrollPerformance: () => generateTestRecipes(500),
  
  /**
   * Generate data for memory usage testing
   */
  memoryUsage: () => generateTestRecipes(1000),
  
  /**
   * Generate data for bundle size testing
   */
  bundleSize: () => generateTestRecipes(100),
  
  /**
   * Generate data for stress testing
   */
  stressTest: () => generateTestRecipes(5000),
};

/**
 * Generate test data for specific UI testing scenarios
 */
export const uiTestData = {
  /**
   * Generate data for empty state testing
   */
  empty: () => [],
  
  /**
   * Generate data for loading state testing
   */
  loading: () => generateTestRecipes(10),
  
  /**
   * Generate data for error state testing
   */
  error: () => generateTestRecipes(5),
  
  /**
   * Generate data for success state testing
   */
  success: () => generateTestRecipes(50),
};
