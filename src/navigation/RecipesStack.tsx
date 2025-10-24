import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import { RecipesStackParamList } from '../types/navigation';

// Import screens
import RecipesListScreen from '../screens/recipes/RecipesListScreen';
import RecipeDetailScreen from '../screens/recipes/RecipeDetailScreen';
import RecipeEditScreen from '../screens/recipes/RecipeEditScreen';
import RecipeCreateScreen from '../screens/recipes/RecipeCreateScreen';
import CameraScreen from '../screens/recipes/CameraScreen';
import ImageCropScreen from '../screens/recipes/ImageCropScreen';
import RecipeReviewScreen from '../screens/recipes/RecipeReviewScreen';

const Stack = createStackNavigator<RecipesStackParamList>();

export default function RecipesStack() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
        },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontFamily: theme.typography.headerFont,
        },
        cardStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen 
        name="RecipesList" 
        component={RecipesListScreen}
        options={{
          title: 'Recipes',
        }}
      />
      <Stack.Screen 
        name="RecipeDetail" 
        component={RecipeDetailScreen}
        options={({ route }) => ({
          title: route.params?.recipe?.title || 'Recipe',
        })}
      />
      <Stack.Screen 
        name="RecipeEdit" 
        component={RecipeEditScreen}
        options={{
          title: 'Edit Recipe',
        }}
      />
      <Stack.Screen 
        name="RecipeCreate" 
        component={RecipeCreateScreen}
        options={{
          title: 'Create Recipe',
        }}
      />
      <Stack.Screen 
        name="Camera" 
        component={CameraScreen}
        options={{
          title: 'Capture Recipe',
          headerShown: false, // Full screen camera
        }}
      />
      <Stack.Screen 
        name="ImageCrop" 
        component={ImageCropScreen}
        options={{
          title: 'Crop Image',
        }}
      />
      <Stack.Screen 
        name="RecipeReview" 
        component={RecipeReviewScreen}
        options={{
          title: 'Review Recipe',
        }}
      />
    </Stack.Navigator>
  );
}
