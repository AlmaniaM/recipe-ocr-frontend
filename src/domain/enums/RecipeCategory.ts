/**
 * Recipe categories enum
 * Defines the available categories for recipes
 * Synced with backend RecipeCategory enum
 */
export enum RecipeCategory {
  Appetizer = 'Appetizer',
  MainCourse = 'MainCourse',
  SideDish = 'SideDish',
  Dessert = 'Dessert',
  Beverage = 'Beverage',
  Soup = 'Soup',
  Salad = 'Salad',
  Breakfast = 'Breakfast',
  Lunch = 'Lunch',
  Dinner = 'Dinner',
  Snack = 'Snack',
  Sauce = 'Sauce',
  Marinade = 'Marinade',
  Dressing = 'Dressing',
  Dip = 'Dip',
  Bread = 'Bread',
  Pasta = 'Pasta',
  Rice = 'Rice',
  Vegetable = 'Vegetable',
  Meat = 'Meat',
  Seafood = 'Seafood',
  Poultry = 'Poultry',
  Vegetarian = 'Vegetarian',
  Vegan = 'Vegan',
  GlutenFree = 'GlutenFree',
  DairyFree = 'DairyFree',
  LowCarb = 'LowCarb',
  Keto = 'Keto',
  Paleo = 'Paleo',
  Mediterranean = 'Mediterranean',
  Asian = 'Asian',
  Italian = 'Italian',
  Mexican = 'Mexican',
  Indian = 'Indian',
  Chinese = 'Chinese',
  Japanese = 'Japanese',
  Thai = 'Thai',
  French = 'French',
  American = 'American',
  Other = 'Other'
}

/**
 * Gets all available recipe categories
 */
export function getAllRecipeCategories(): RecipeCategory[] {
  return Object.values(RecipeCategory);
}

/**
 * Gets the display name for a recipe category
 */
export function getRecipeCategoryDisplayName(category: RecipeCategory): string {
  switch (category) {
    case RecipeCategory.MainCourse:
      return 'Main Course';
    case RecipeCategory.SideDish:
      return 'Side Dish';
    case RecipeCategory.GlutenFree:
      return 'Gluten-Free';
    case RecipeCategory.DairyFree:
      return 'Dairy-Free';
    case RecipeCategory.LowCarb:
      return 'Low Carb';
    default:
      return category;
  }
}

/**
 * Gets the color associated with a recipe category
 */
export function getRecipeCategoryColor(category: RecipeCategory): string {
  const colors: Record<RecipeCategory, string> = {
    // Food Types
    [RecipeCategory.Appetizer]: '#FF6B6B',
    [RecipeCategory.MainCourse]: '#4ECDC4',
    [RecipeCategory.SideDish]: '#45B7D1',
    [RecipeCategory.Dessert]: '#96CEB4',
    [RecipeCategory.Beverage]: '#FFEAA7',
    [RecipeCategory.Soup]: '#DDA0DD',
    [RecipeCategory.Salad]: '#98D8C8',
    [RecipeCategory.Snack]: '#F8C471',
    [RecipeCategory.Sauce]: '#FF9F43',
    [RecipeCategory.Marinade]: '#FF6348',
    [RecipeCategory.Dressing]: '#FFA502',
    [RecipeCategory.Dip]: '#FF7675',
    [RecipeCategory.Bread]: '#FDCB6E',
    [RecipeCategory.Pasta]: '#E17055',
    [RecipeCategory.Rice]: '#F39C12',
    [RecipeCategory.Vegetable]: '#00B894',
    [RecipeCategory.Meat]: '#E84393',
    [RecipeCategory.Seafood]: '#0984e3',
    [RecipeCategory.Poultry]: '#6C5CE7',
    
    // Meal Times
    [RecipeCategory.Breakfast]: '#F7DC6F',
    [RecipeCategory.Lunch]: '#BB8FCE',
    [RecipeCategory.Dinner]: '#85C1E9',
    
    // Dietary Restrictions
    [RecipeCategory.Vegetarian]: '#00B894',
    [RecipeCategory.Vegan]: '#00CEC9',
    [RecipeCategory.GlutenFree]: '#A29BFE',
    [RecipeCategory.DairyFree]: '#FD79A8',
    [RecipeCategory.LowCarb]: '#FDCB6E',
    [RecipeCategory.Keto]: '#E17055',
    [RecipeCategory.Paleo]: '#6C5CE7',
    
    // Cuisines
    [RecipeCategory.Mediterranean]: '#00B894',
    [RecipeCategory.Asian]: '#E17055',
    [RecipeCategory.Italian]: '#00CEC9',
    [RecipeCategory.Mexican]: '#FDCB6E',
    [RecipeCategory.Indian]: '#FF7675',
    [RecipeCategory.Chinese]: '#A29BFE',
    [RecipeCategory.Japanese]: '#FD79A8',
    [RecipeCategory.Thai]: '#6C5CE7',
    [RecipeCategory.French]: '#0984e3',
    [RecipeCategory.American]: '#E84393',
    
    [RecipeCategory.Other]: '#AAB7B8'
  };
  
  return colors[category];
}

/**
 * Gets food type categories (appetizer, main course, etc.)
 */
export function getFoodTypeCategories(): RecipeCategory[] {
  return [
    RecipeCategory.Appetizer,
    RecipeCategory.MainCourse,
    RecipeCategory.SideDish,
    RecipeCategory.Dessert,
    RecipeCategory.Beverage,
    RecipeCategory.Soup,
    RecipeCategory.Salad,
    RecipeCategory.Snack,
    RecipeCategory.Sauce,
    RecipeCategory.Marinade,
    RecipeCategory.Dressing,
    RecipeCategory.Dip,
    RecipeCategory.Bread,
    RecipeCategory.Pasta,
    RecipeCategory.Rice,
    RecipeCategory.Vegetable,
    RecipeCategory.Meat,
    RecipeCategory.Seafood,
    RecipeCategory.Poultry,
  ];
}

/**
 * Gets meal time categories (breakfast, lunch, dinner)
 */
export function getMealTimeCategories(): RecipeCategory[] {
  return [
    RecipeCategory.Breakfast,
    RecipeCategory.Lunch,
    RecipeCategory.Dinner,
  ];
}

/**
 * Gets dietary restriction categories
 */
export function getDietaryCategories(): RecipeCategory[] {
  return [
    RecipeCategory.Vegetarian,
    RecipeCategory.Vegan,
    RecipeCategory.GlutenFree,
    RecipeCategory.DairyFree,
    RecipeCategory.LowCarb,
    RecipeCategory.Keto,
    RecipeCategory.Paleo,
  ];
}

/**
 * Gets cuisine categories
 */
export function getCuisineCategories(): RecipeCategory[] {
  return [
    RecipeCategory.Mediterranean,
    RecipeCategory.Asian,
    RecipeCategory.Italian,
    RecipeCategory.Mexican,
    RecipeCategory.Indian,
    RecipeCategory.Chinese,
    RecipeCategory.Japanese,
    RecipeCategory.Thai,
    RecipeCategory.French,
    RecipeCategory.American,
  ];
}
