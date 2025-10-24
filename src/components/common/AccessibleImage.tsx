import React, { useState, useCallback } from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  ImageStyle,
  AccessibilityRole,
  AccessibilityState,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAccessibility } from '../../hooks/useAccessibility';

export interface AccessibleImageProps {
  source: { uri: string } | number;
  alt: string;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  onLoad?: () => void;
  onError?: (error: any) => void;
  showErrorState?: boolean;
  errorMessage?: string;
  loadingIndicator?: React.ReactNode;
  showLoadingState?: boolean;
  isLoaded?: boolean;
  isError?: boolean;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  shape?: 'square' | 'circle' | 'rounded';
}

/**
 * Accessible image component with comprehensive accessibility support
 * Provides proper alt text, loading states, error handling, and screen reader support
 */
export const AccessibleImage: React.FC<AccessibleImageProps> = ({
  source,
  alt,
  style,
  containerStyle,
  testID = 'accessible-image',
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'image',
  onLoad,
  onError,
  showErrorState = true,
  errorMessage = 'Failed to load image',
  loadingIndicator,
  showLoadingState = true,
  isLoaded = false,
  isError = false,
  size = 'medium',
  shape = 'rounded',
}) => {
  const { theme } = useTheme();
  const { announceForAccessibility } = useAccessibility();
  const [loading, setLoading] = useState(!isLoaded);
  const [error, setError] = useState(isError);

  const effectiveAccessibilityLabel = accessibilityLabel || alt;
  const effectiveAccessibilityHint = accessibilityHint || 'Image';

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((error: any) => {
    setLoading(false);
    setError(true);
    onError?.(error);
    
    // Announce error to screen readers
    announceForAccessibility(`Image failed to load: ${alt}`);
  }, [onError, announceForAccessibility, alt]);

  const getImageStyle = () => {
    const baseStyle = [styles.image, styles[size]];
    
    switch (shape) {
      case 'circle':
        baseStyle.push(styles.circle);
        break;
      case 'rounded':
        baseStyle.push(styles.rounded);
        break;
      case 'square':
      default:
        baseStyle.push(styles.square);
        break;
    }

    return baseStyle;
  };

  const getContainerStyle = () => {
    const baseStyle = [styles.container];
    
    if (error && showErrorState) {
      baseStyle.push({
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.error,
        borderWidth: 1,
      });
    }

    return baseStyle;
  };

  const getErrorStyle = () => {
    return [styles.errorText, { color: theme.colors.error }];
  };

  const getLoadingStyle = () => {
    return [styles.loadingText, { color: theme.colors.textSecondary }];
  };

  if (error && showErrorState) {
    return (
      <View
        style={[getContainerStyle(), containerStyle]}
        testID={`${testID}-error`}
        accessible={true}
        accessibilityLabel={`${effectiveAccessibilityLabel} - ${errorMessage}`}
        accessibilityHint={effectiveAccessibilityHint}
        accessibilityRole="image"
        accessibilityState={{ disabled: true } as AccessibilityState}
      >
        <Text style={getErrorStyle()}>
          {errorMessage}
        </Text>
      </View>
    );
  }

  if (loading && showLoadingState) {
    return (
      <View
        style={[getContainerStyle(), containerStyle]}
        testID={`${testID}-loading`}
        accessible={true}
        accessibilityLabel={`${effectiveAccessibilityLabel} - Loading`}
        accessibilityHint={effectiveAccessibilityHint}
        accessibilityRole="image"
        accessibilityState={{ busy: true } as AccessibilityState}
      >
        {loadingIndicator || (
          <Text style={getLoadingStyle()}>
            Loading image...
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[getContainerStyle(), containerStyle]} testID={testID}>
      <Image
        source={source}
        style={[getImageStyle(), style]}
        onLoad={handleLoad}
        onError={handleError}
        testID={`${testID}-image`}
        accessible={true}
        accessibilityLabel={effectiveAccessibilityLabel}
        accessibilityHint={effectiveAccessibilityHint}
        accessibilityRole={accessibilityRole}
        accessibilityState={{ disabled: false } as AccessibilityState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  small: {
    width: 60,
    height: 60,
  },
  medium: {
    width: 120,
    height: 120,
  },
  large: {
    width: 200,
    height: 200,
  },
  xlarge: {
    width: 300,
    height: 300,
  },
  square: {
    borderRadius: 4,
  },
  rounded: {
    borderRadius: 8,
  },
  circle: {
    borderRadius: 9999,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    padding: 16,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    padding: 16,
  },
});

export default AccessibleImage;
