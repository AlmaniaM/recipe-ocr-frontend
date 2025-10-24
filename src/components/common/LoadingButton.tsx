import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface LoadingButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  loadingText?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/**
 * Button component with integrated loading state
 * Shows spinner and loading text when loading
 */
export const LoadingButton: React.FC<LoadingButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  loadingText,
  style,
  textStyle,
  testID = 'loading-button',
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { theme } = useTheme();

  const isDisabled = disabled || isLoading;
  const displayText = isLoading ? (loadingText || 'Loading...') : title;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: isDisabled ? theme.colors.border : theme.colors.primary,
        },
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      accessibilityLabel={accessibilityLabel || displayText}
      accessibilityHint={accessibilityHint || (isLoading ? 'Button is loading' : 'Double tap to activate')}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {isLoading && (
        <ActivityIndicator
          size="small"
          color={theme.colors.surface}
          style={styles.spinner}
          testID={`${testID}-spinner`}
          accessibilityLabel="Loading indicator"
        />
      )}
      
      <Text
        style={[
          styles.text,
          {
            color: theme.colors.surface,
            opacity: isDisabled ? 0.6 : 1,
          },
          textStyle,
        ]}
        testID={`${testID}-text`}
        accessibilityLabel={displayText}
      >
        {displayText}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 48,
  },
  spinner: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
});

export default LoadingButton;
