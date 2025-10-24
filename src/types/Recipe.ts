export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: Ingredient[];
  instructions: string | string[]; // Can be paragraph or list
  prepTime?: number; // minutes
  cookTime?: number; // minutes
  servings?: number;
  source?: string;
  category: string;
  tags: string[];
  imagePath?: string; // Local file path
  imageUrl?: string; // Remote URL
  createdAt: Date;
  updatedAt: Date;
  isLocal: boolean; // true if stored locally only
}

export interface Ingredient {
  id: string;
  text: string;
  amount?: string;
  unit?: string;
  name?: string;
}

export interface RecipeBook {
  id: string;
  title: string;
  description?: string;
  recipeIds: string[];
  categorySortOrder: string[]; // Custom category ordering
  createdAt: Date;
  updatedAt: Date;
  isLocal: boolean;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: Date;
}

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  blocks?: TextBlock[];
}

export interface TextBlock {
  text: string;
  boundingBox: BoundingBox;
  confidence: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ParsedRecipe {
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  confidence: number;
}
