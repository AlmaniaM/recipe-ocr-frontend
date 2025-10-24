import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
  icon?: string;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/**
 * Reusable error display component with optional retry functionality
 * Used for displaying error states in screens and components
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  showRetry = true,
  icon,
  style,
  testID = 'error-state',
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { theme } = useTheme();

  return (
    <View 
      style={[styles.container, style]} 
      testID={testID}
      accessibilityLabel={accessibilityLabel || 'Error occurred'}
      accessibilityHint={accessibilityHint || 'An error has occurred. Use the retry button to try again.'}
      accessibilityRole="alert"
    >
      <View style={[styles.content, { backgroundColor: theme.colors.surface }]}>
        {icon && (
          <Text 
            style={[styles.icon, { color: theme.colors.error }]} 
            testID={`${testID}-icon`}
            accessibilityLabel="Error icon"
          >
            {icon}
          </Text>
        )}
        
        <Text 
          style={[styles.message, { color: theme.colors.textPrimary }]} 
          testID={`${testID}-message`}
          accessibilityLabel={message}
        >
          {message}
        </Text>

        {showRetry && onRetry && (
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={onRetry}
            testID={`${testID}-retry-button`}
            accessibilityLabel="Try again"
            accessibilityHint="Double tap to retry the operation"
            accessibilityRole="button"
          >
            <Text style={[styles.retryButtonText, { color: theme.colors.surface }]}>
              Try Again
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    maxWidth: 400,
    width: '100%',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
});

export default ErrorState;
