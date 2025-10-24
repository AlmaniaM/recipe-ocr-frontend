import { useTheme } from '../../context/ThemeContext';
import { Alert } from 'react-native';

/**
 * A utility hook for handling RecipeBook-specific errors and displaying theme-aware alerts.
 */
export const useRecipeBookThemeAwareErrorHandler = () => {
  const { theme } = useTheme();

  const handleError = (error: Error | string, title: string = 'Recipe Book Error', customMessage?: string) => {
    const message = customMessage || (error instanceof Error ? error.message : error);
    console.error(`${title}: ${message}`); // Log error for debugging

    // Map error messages to user-friendly theme-aware messages
    const userFriendlyMessage = mapRecipeBookErrorToUserMessage(message, theme.name);

    Alert.alert(
      title,
      userFriendlyMessage,
      [{ text: 'OK', style: 'cancel' }],
      { cancelable: true }
    );
  };

  const showSuccess = (title: string, message: string) => {
    const themeAwareMessage = getThemeAwareSuccessMessage(message, theme.name);
    
    Alert.alert(
      title,
      themeAwareMessage,
      [{ text: 'OK', style: 'default' }],
      { cancelable: true }
    );
  };

  const showWarning = (title: string, message: string) => {
    const themeAwareMessage = getThemeAwareWarningMessage(message, theme.name);
    
    Alert.alert(
      title,
      themeAwareMessage,
      [{ text: 'OK', style: 'default' }],
      { cancelable: true }
    );
  };

  return { 
    handleError, 
    showSuccess, 
    showWarning, 
    themeColors: theme.colors 
  };
};

/**
 * Maps RecipeBook-specific error messages to user-friendly theme-aware messages
 */
const mapRecipeBookErrorToUserMessage = (error: string, themeName: string): string => {
  const errorMappings: Record<string, Record<string, string>> = {
    'warmInviting': {
      'Recipe book title is required': '🍽️ Please give your recipe book a name!',
      'Recipe book title cannot exceed 200 characters': '📝 Recipe book names should be shorter and sweeter!',
      'Recipe book description cannot exceed 1000 characters': '📖 Keep your description cozy and concise!',
      'Recipe book cannot contain more than 100 recipes': '📚 This book is getting too full! Try creating another one.',
      'Recipe book with ID': '🔍 We couldn\'t find that recipe book in your collection.',
      'Recipe book is already archived': '📦 This recipe book is already tucked away!',
      'Recipe book is not archived': '📖 This recipe book is already out and about!',
      'Invalid recipe ID': '🥘 Oops! One of those recipe IDs doesn\'t look right.',
      'Database error': '💾 Something went wrong saving your recipe book. Please try again.',
      'Failed to create recipe book': '😔 We couldn\'t create your recipe book right now.',
      'Failed to update recipe book': '😔 We couldn\'t update your recipe book right now.',
      'Failed to delete recipe book': '😔 We couldn\'t delete your recipe book right now.',
      'Failed to get recipe book': '😔 We couldn\'t find your recipe book right now.',
      'Failed to get recipe books': '😔 We couldn\'t load your recipe books right now.',
    },
    'cleanModern': {
      'Recipe book title is required': 'Recipe book title is required',
      'Recipe book title cannot exceed 200 characters': 'Recipe book title must be 200 characters or less',
      'Recipe book description cannot exceed 1000 characters': 'Recipe book description must be 1000 characters or less',
      'Recipe book cannot contain more than 100 recipes': 'Recipe books are limited to 100 recipes maximum',
      'Recipe book with ID': 'Recipe book not found',
      'Recipe book is already archived': 'Recipe book is already archived',
      'Recipe book is not archived': 'Recipe book is not archived',
      'Invalid recipe ID': 'Invalid recipe ID provided',
      'Database error': 'Database operation failed. Please try again.',
      'Failed to create recipe book': 'Failed to create recipe book',
      'Failed to update recipe book': 'Failed to update recipe book',
      'Failed to delete recipe book': 'Failed to delete recipe book',
      'Failed to get recipe book': 'Failed to retrieve recipe book',
      'Failed to get recipe books': 'Failed to retrieve recipe books',
    },
    'earthyNatural': {
      'Recipe book title is required': '🌱 Every recipe book needs a name to grow!',
      'Recipe book title cannot exceed 200 characters': '🌿 Keep your recipe book name natural and simple!',
      'Recipe book description cannot exceed 1000 characters': '🌾 Your description should be as natural as your ingredients!',
      'Recipe book cannot contain more than 100 recipes': '🌳 This recipe book is full! Plant a new one for more recipes.',
      'Recipe book with ID': '🌱 We couldn\'t find that recipe book in your garden.',
      'Recipe book is already archived': '🌿 This recipe book is already resting in the earth!',
      'Recipe book is not archived': '🌱 This recipe book is already growing in your collection!',
      'Invalid recipe ID': '🌾 One of those recipe IDs doesn\'t look natural.',
      'Database error': '🌱 Something went wrong in the garden. Please try again.',
      'Failed to create recipe book': '🌿 We couldn\'t plant your recipe book right now.',
      'Failed to update recipe book': '🌿 We couldn\'t tend to your recipe book right now.',
      'Failed to delete recipe book': '🌿 We couldn\'t harvest your recipe book right now.',
      'Failed to get recipe book': '🌱 We couldn\'t find your recipe book in the garden right now.',
      'Failed to get recipe books': '🌱 We couldn\'t gather your recipe books right now.',
    }
  };

  const themeMappings = errorMappings[themeName] || errorMappings['cleanModern'];
  
  // Find the best matching error message
  for (const [key, value] of Object.entries(themeMappings)) {
    if (error.includes(key)) {
      return value;
    }
  }
  
  // Fallback to original error if no mapping found
  return error;
};

/**
 * Gets theme-aware success messages for RecipeBook operations
 */
const getThemeAwareSuccessMessage = (message: string, themeName: string): string => {
  const successMappings: Record<string, Record<string, string>> = {
    'warmInviting': {
      'Recipe book created': '🍽️ Your recipe book is ready to be filled with delicious memories!',
      'Recipe book updated': '📖 Your recipe book has been refreshed and is ready to use!',
      'Recipe book archived': '📦 Your recipe book is safely tucked away!',
      'Recipe book unarchived': '📚 Your recipe book is back in your collection!',
      'Recipe book deleted': '🗑️ Your recipe book has been removed from your collection.',
    },
    'cleanModern': {
      'Recipe book created': 'Recipe book created successfully',
      'Recipe book updated': 'Recipe book updated successfully',
      'Recipe book archived': 'Recipe book archived successfully',
      'Recipe book unarchived': 'Recipe book unarchived successfully',
      'Recipe book deleted': 'Recipe book deleted successfully',
    },
    'earthyNatural': {
      'Recipe book created': '🌱 Your recipe book has been planted and is ready to grow!',
      'Recipe book updated': '🌿 Your recipe book has been tended to and is flourishing!',
      'Recipe book archived': '🌾 Your recipe book is resting in the earth!',
      'Recipe book unarchived': '🌱 Your recipe book is growing again in your collection!',
      'Recipe book deleted': '🌿 Your recipe book has been harvested from your collection.',
    }
  };

  const themeMappings = successMappings[themeName] || successMappings['cleanModern'];
  return themeMappings[message] || message;
};

/**
 * Gets theme-aware warning messages for RecipeBook operations
 */
const getThemeAwareWarningMessage = (message: string, themeName: string): string => {
  const warningMappings: Record<string, Record<string, string>> = {
    'warmInviting': {
      'Recipe book not found': '🔍 We couldn\'t find that recipe book in your collection.',
      'Recipe book already exists': '📚 You already have a recipe book with that name!',
      'Recipe book is empty': '📖 This recipe book is empty. Add some recipes to make it special!',
    },
    'cleanModern': {
      'Recipe book not found': 'Recipe book not found',
      'Recipe book already exists': 'Recipe book already exists',
      'Recipe book is empty': 'Recipe book is empty',
    },
    'earthyNatural': {
      'Recipe book not found': '🌱 We couldn\'t find that recipe book in your garden.',
      'Recipe book already exists': '🌿 You already have a recipe book with that name growing!',
      'Recipe book is empty': '🌾 This recipe book is empty. Plant some recipes to make it flourish!',
    }
  };

  const themeMappings = warningMappings[themeName] || warningMappings['cleanModern'];
  return themeMappings[message] || message;
};
