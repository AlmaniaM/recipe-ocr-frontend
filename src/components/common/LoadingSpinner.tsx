import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/**
 * Configurable loading spinner component with optional message display
 * Supports different sizes and theme-aware colors
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color,
  message,
  style,
  testID = 'loading-spinner',
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { theme } = useTheme();

  const getSpinnerSize = (): number => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 30;
      case 'large':
        return 40;
      default:
        return 30;
    }
  };

  const spinnerColor = color || theme.colors.primary;

  return (
    <View 
      style={[styles.container, style]} 
      testID={testID}
      accessibilityLabel={accessibilityLabel || (message ? `Loading: ${message}` : 'Loading')}
      accessibilityHint={accessibilityHint || 'Please wait while content loads'}
      accessibilityRole="progressbar"
    >
      <ActivityIndicator
        size={getSpinnerSize()}
        color={spinnerColor}
        testID={`${testID}-indicator`}
        accessibilityLabel="Loading indicator"
      />
      {message && (
        <Text
          style={[styles.message, { color: theme.colors.textSecondary }]}
          testID={`${testID}-message`}
          accessibilityLabel={message}
        >
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});

export default LoadingSpinner;
