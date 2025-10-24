import React, { useRef, useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  AccessibilityRole,
  AccessibilityState,
  AccessibilityActionInfo,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAccessibility } from '../../hooks/useAccessibility';

export interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
}

/**
 * Accessible button component with comprehensive accessibility support
 * Provides proper accessibility labels, hints, roles, and screen reader support
 */
export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  title,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  disabled = false,
  style,
  textStyle,
  testID = 'accessible-button',
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  loadingText,
}) => {
  const { theme } = useTheme();
  const { announceForAccessibility } = useAccessibility();
  const buttonRef = useRef<TouchableOpacity>(null);

  const isDisabled = disabled || loading;
  const displayText = loading ? (loadingText || 'Loading...') : title;
  const effectiveAccessibilityLabel = accessibilityLabel || title;

  const handlePress = useCallback(() => {
    if (!isDisabled) {
      if (accessibilityHint) {
        announceForAccessibility(accessibilityHint);
      }
      onPress();
    }
  }, [isDisabled, accessibilityHint, announceForAccessibility, onPress]);

  const handleAccessibilityAction = useCallback((event: { nativeEvent: AccessibilityActionInfo }) => {
    if (event.nativeEvent.actionName === 'activate' && !isDisabled) {
      handlePress();
    }
  }, [isDisabled, handlePress]);

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }

    switch (variant) {
      case 'primary':
        baseStyle.push({
          backgroundColor: isDisabled ? theme.colors.border : theme.colors.primary,
        });
        break;
      case 'secondary':
        baseStyle.push({
          backgroundColor: isDisabled ? theme.colors.border : theme.colors.secondary,
        });
        break;
      case 'outline':
        baseStyle.push({
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: isDisabled ? theme.colors.border : theme.colors.primary,
        });
        break;
      case 'ghost':
        baseStyle.push({
          backgroundColor: 'transparent',
        });
        break;
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`${size}Text`]];
    
    switch (variant) {
      case 'primary':
      case 'secondary':
        baseStyle.push({
          color: isDisabled ? theme.colors.textSecondary : theme.colors.surface,
        });
        break;
      case 'outline':
      case 'ghost':
        baseStyle.push({
          color: isDisabled ? theme.colors.textSecondary : theme.colors.primary,
        });
        break;
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      ref={buttonRef}
      style={[getButtonStyle(), style]}
      onPress={handlePress}
      disabled={isDisabled}
      testID={testID}
      accessibilityLabel={effectiveAccessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      } as AccessibilityState}
      accessibilityActions={[
        { name: 'activate', label: 'Activate button' },
      ]}
      onAccessibilityAction={handleAccessibilityAction}
      accessible={true}
    >
      {children || (
        <Text
          style={[getTextStyle(), textStyle]}
          testID={`${testID}-text`}
        >
          {displayText}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    minHeight: 44, // Minimum touch target size for accessibility
  },
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 52,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});

export default AccessibleButton;
