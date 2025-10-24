import { Result } from '../../domain/common/Result';
import { Theme } from '../../constants/themes';

/**
 * Theme-aware error handling utility
 * 
 * Provides error messages that are contextually appropriate for different themes
 * and user experience patterns.
 */
export class ThemeAwareErrorHandler {
  /**
   * Creates a user-friendly error message based on the theme and error type
   */
  static createUserFriendlyError(
    error: string,
    theme: Theme,
    context?: string
  ): string {
    const baseMessage = this.getBaseErrorMessage(error, context);
    return this.applyThemeStyling(baseMessage, theme);
  }

  /**
   * Wraps a Result with theme-aware error handling
   */
  static wrapWithThemeHandling<T>(
    result: Result<T>,
    theme: Theme,
    context?: string
  ): Result<T> {
    if (result.isSuccess) {
      return result;
    }

    const userFriendlyError = this.createUserFriendlyError(result.error, theme, context);
    return Result.failure(userFriendlyError);
  }

  /**
   * Creates a theme-aware success message
   */
  static createSuccessMessage(
    message: string,
    theme: Theme,
    context?: string
  ): string {
    const baseMessage = this.getBaseSuccessMessage(message, context);
    return this.applyThemeStyling(baseMessage, theme);
  }

  /**
   * Gets base error message without theme styling
   */
  private static getBaseErrorMessage(error: string, context?: string): string {
    // Map technical errors to user-friendly messages
    const errorMappings: Record<string, string> = {
      'Recipe title is required': 'Please enter a recipe title',
      'Recipe title cannot exceed 200 characters': 'Recipe title is too long (max 200 characters)',
      'Recipe description cannot exceed 1000 characters': 'Recipe description is too long (max 1000 characters)',
      'Recipe source cannot exceed 200 characters': 'Recipe source is too long (max 200 characters)',
      'Recipe not found': 'This recipe could not be found',
      'Recipe is already archived': 'This recipe is already archived',
      'Recipe is not archived': 'This recipe is not archived',
      'OCR service is not available': 'Text recognition is currently unavailable',
      'No text could be extracted from the image': 'Could not read text from the image. Please try a clearer photo.',
      'The extracted text does not appear to be a recipe': 'The image doesn\'t seem to contain a recipe. Please try a different image.',
      'Database error': 'Unable to save your changes. Please try again.',
      'Save error': 'Unable to save your changes. Please try again.',
      'Delete error': 'Unable to delete the recipe. Please try again.',
      'Invalid time range': 'Please enter a valid cooking time',
      'Invalid serving size': 'Please enter a valid number of servings',
      'Invalid ingredient': 'Please check your ingredient details',
      'Invalid direction': 'Please check your cooking instructions',
      'Invalid tag': 'Please check your tag details',
    };

    let userMessage = errorMappings[error] || error;

    if (context) {
      userMessage = `${context}: ${userMessage}`;
    }

    return userMessage;
  }

  /**
   * Gets base success message without theme styling
   */
  private static getBaseSuccessMessage(message: string, context?: string): string {
    const successMappings: Record<string, string> = {
      'Recipe created successfully': 'Recipe saved! 🎉',
      'Recipe updated successfully': 'Recipe updated! ✨',
      'Recipe deleted successfully': 'Recipe removed',
      'Recipe restored successfully': 'Recipe restored! 🔄',
      'Recipe processed successfully': 'Recipe processed! 📸',
    };

    let userMessage = successMappings[message] || message;

    if (context) {
      userMessage = `${context}: ${userMessage}`;
    }

    return userMessage;
  }

  /**
   * Applies theme-specific styling to messages
   */
  private static applyThemeStyling(message: string, theme: Theme): string {
    // For now, we return the message as-is since we're dealing with text
    // In a real implementation, this could apply theme-specific formatting
    // or return structured data for UI components to style appropriately
    
    // Add theme-specific prefixes or suffixes based on theme characteristics
    switch (theme.name) {
      case 'Warm & Inviting':
        return `💕 ${message}`;
      case 'Clean & Modern':
        return `✨ ${message}`;
      case 'Earthy & Natural':
        return `🌱 ${message}`;
      default:
        return message;
    }
  }

  /**
   * Creates a comprehensive error result with theme context
   */
  static createErrorResult<T>(
    error: string,
    theme: Theme,
    context?: string,
    originalError?: Error
  ): Result<T> {
    const userFriendlyError = this.createUserFriendlyError(error, theme, context);
    
    // Log the original error for debugging
    if (originalError) {
      console.error(`[${context || 'Unknown'}] ${originalError.message}`, originalError);
    }

    return Result.failure(userFriendlyError);
  }

  /**
   * Creates a comprehensive success result with theme context
   */
  static createSuccessResult<T>(
    value: T,
    message: string,
    theme: Theme,
    context?: string
  ): Result<T> {
    const userFriendlyMessage = this.createSuccessMessage(message, theme, context);
    
    // Log success for analytics
    console.log(`[${context || 'Unknown'}] ${userFriendlyMessage}`);

    return Result.success(value);
  }

  /**
   * Gets error severity level for theme-based styling
   */
  static getErrorSeverity(error: string): 'low' | 'medium' | 'high' {
    const highSeverityErrors = [
      'Database error',
      'OCR service is not available',
      'Recipe not found',
    ];

    const mediumSeverityErrors = [
      'No text could be extracted from the image',
      'The extracted text does not appear to be a recipe',
      'Save error',
      'Delete error',
    ];

    if (highSeverityErrors.some(e => error.includes(e))) {
      return 'high';
    }

    if (mediumSeverityErrors.some(e => error.includes(e))) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Gets theme-appropriate error color
   */
  static getErrorColor(theme: Theme, severity: 'low' | 'medium' | 'high'): string {
    switch (severity) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.textSecondary;
      default:
        return theme.colors.error;
    }
  }

  /**
   * Gets theme-appropriate success color
   */
  static getSuccessColor(theme: Theme): string {
    return theme.colors.success;
  }
}
