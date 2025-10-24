import { Recipe } from '../domain/entities/Recipe';
import { RecipeBook } from '../domain/entities/RecipeBook';

// Root Stack Navigator
export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Recipes: undefined;
  Books: undefined;
  Settings: undefined;
};

// Recipes Stack Navigator
export type RecipesStackParamList = {
  RecipesList: undefined;
  RecipeDetail: {
    recipeId: string;
  };
  RecipeEdit: {
    recipeId: string;
  };
  RecipeCreate: undefined;
  Camera: undefined;
  ImageCrop: {
    imageUri: string;
  };
  RecipeReview: {
    recipe?: Recipe;
    imageUri?: string;
    source?: 'camera' | 'gallery';
  };
  AddRecipeToBook: {
    bookId: string;
  };
};

// Books Stack Navigator
export type BooksStackParamList = {
  BooksList: undefined;
  BookDetail: {
    bookId: string;
  };
  BookEdit: {
    bookId: string;
  };
  CreateBook: undefined;
  BookExport: {
    bookId: string;
  };
  AddRecipeToBook: {
    bookId: string;
  };
};

// Settings Stack Navigator
export type SettingsStackParamList = {
  Settings: undefined;
  About: undefined;
  Privacy: undefined;
  Terms: undefined;
};

// Auth Stack Navigator
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Combine all parameter lists
export type AppParamList = RootStackParamList & 
  MainTabParamList & 
  RecipesStackParamList & 
  BooksStackParamList & 
  SettingsStackParamList & 
  AuthStackParamList;

// Navigation prop types
export type NavigationProp<T extends keyof AppParamList> = {
  navigate: <K extends keyof AppParamList>(
    screen: K,
    params?: AppParamList[K]
  ) => void;
  goBack: () => void;
  reset: (state: any) => void;
};

// Route prop types
export type RouteProp<T extends keyof AppParamList> = {
  params: AppParamList[T];
  key: string;
  name: T;
};
