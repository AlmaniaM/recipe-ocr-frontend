import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  AccessibilityRole,
  AccessibilityState,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';
import { useAccessibility } from '../../hooks/useAccessibility';
import { useFocusManagement } from '../../hooks/useFocusManagement';

export interface AccessibleHeaderProps {
  title: string;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  onMorePress?: () => void;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showSearchButton?: boolean;
  showMoreButton?: boolean;
  backButtonAccessibilityLabel?: string;
  menuButtonAccessibilityLabel?: string;
  searchButtonAccessibilityLabel?: string;
  moreButtonAccessibilityLabel?: string;
  size?: 'small' | 'medium' | 'large';
  centerTitle?: boolean;
  subtitle?: string;
  showSubtitle?: boolean;
}

/**
 * Accessible header component with comprehensive accessibility support
 * Provides proper navigation, focus management, and screen reader support
 */
export const AccessibleHeader: React.FC<AccessibleHeaderProps> = ({
  title,
  onBackPress,
  onMenuPress,
  onSearchPress,
  onMorePress,
  style,
  testID = 'accessible-header',
  accessibilityLabel,
  accessibilityHint,
  showBackButton = false,
  showMenuButton = false,
  showSearchButton = false,
  showMoreButton = false,
  backButtonAccessibilityLabel = 'Go back',
  menuButtonAccessibilityLabel = 'Open menu',
  searchButtonAccessibilityLabel = 'Search',
  moreButtonAccessibilityLabel = 'More options',
  size = 'medium',
  centerTitle = true,
  subtitle,
  showSubtitle = false,
}) => {
  const { theme } = useTheme();
  const { announceForAccessibility } = useAccessibility();
  const { registerElement, unregisterElement, setFocus } = useFocusManagement();
  const headerRef = useRef<View>(null);
  const backButtonRef = useRef<TouchableOpacity>(null);
  const menuButtonRef = useRef<TouchableOpacity>(null);
  const searchButtonRef = useRef<TouchableOpacity>(null);
  const moreButtonRef = useRef<TouchableOpacity>(null);

  useEffect(() => {
    // Register header elements for focus management
    if (headerRef.current) {
      registerElement('header', headerRef);
    }
    if (backButtonRef.current) {
      registerElement('header-back', backButtonRef);
    }
    if (menuButtonRef.current) {
      registerElement('header-menu', menuButtonRef);
    }
    if (searchButtonRef.current) {
      registerElement('header-search', searchButtonRef);
    }
    if (moreButtonRef.current) {
      registerElement('header-more', moreButtonRef);
    }

    return () => {
      unregisterElement('header');
      unregisterElement('header-back');
      unregisterElement('header-menu');
      unregisterElement('header-search');
      unregisterElement('header-more');
    };
  }, [registerElement, unregisterElement]);

  const handleBackPress = useCallback(() => {
    if (onBackPress) {
      announceForAccessibility('Navigating back');
      onBackPress();
    }
  }, [onBackPress, announceForAccessibility]);

  const handleMenuPress = useCallback(() => {
    if (onMenuPress) {
      announceForAccessibility('Opening menu');
      onMenuPress();
    }
  }, [onMenuPress, announceForAccessibility]);

  const handleSearchPress = useCallback(() => {
    if (onSearchPress) {
      announceForAccessibility('Opening search');
      onSearchPress();
    }
  }, [onSearchPress, announceForAccessibility]);

  const handleMorePress = useCallback(() => {
    if (onMorePress) {
      announceForAccessibility('Opening more options');
      onMorePress();
    }
  }, [onMorePress, announceForAccessibility]);

  const getHeaderStyle = () => {
    const baseStyle = [styles.header, styles[`${size}Header`]];
    
    return baseStyle;
  };

  const getTitleStyle = () => {
    const baseStyle = [styles.title, styles[`${size}Title`], { color: theme.colors.textPrimary }];
    
    if (centerTitle) {
      baseStyle.push(styles.titleCenter);
    }

    return baseStyle;
  };

  const getSubtitleStyle = () => {
    return [styles.subtitle, styles[`${size}Subtitle`], { color: theme.colors.textSecondary }];
  };

  const getButtonStyle = () => {
    return [styles.button, styles[`${size}Button`]];
  };

  const getButtonTextStyle = () => {
    return [styles.buttonText, { color: theme.colors.primary }];
  };

  const renderButton = (
    iconName: string,
    onPress: () => void,
    accessibilityLabel: string,
    ref: React.RefObject<TouchableOpacity>,
    testID: string
  ) => (
    <TouchableOpacity
      ref={ref}
      style={getButtonStyle()}
      onPress={onPress}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: false } as AccessibilityState}
    >
      <Icon
        name={iconName}
        size={size === 'small' ? 20 : size === 'medium' ? 24 : 28}
        color={theme.colors.primary}
      />
    </TouchableOpacity>
  );

  return (
    <View
      ref={headerRef}
      style={[getHeaderStyle(), { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }, style]}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint || 'Header with navigation options'}
      accessibilityRole="banner"
    >
      <View style={styles.leftSection}>
        {showBackButton && renderButton(
          'arrow-back',
          handleBackPress,
          backButtonAccessibilityLabel,
          backButtonRef,
          `${testID}-back`
        )}
        
        {showMenuButton && renderButton(
          'menu',
          handleMenuPress,
          menuButtonAccessibilityLabel,
          menuButtonRef,
          `${testID}-menu`
        )}
      </View>

      <View style={styles.centerSection}>
        <Text
          style={getTitleStyle()}
          testID={`${testID}-title`}
          accessible={true}
          accessibilityRole="header"
        >
          {title}
        </Text>
        
        {showSubtitle && subtitle && (
          <Text
            style={getSubtitleStyle()}
            testID={`${testID}-subtitle`}
            accessible={true}
            accessibilityRole="text"
          >
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.rightSection}>
        {showSearchButton && renderButton(
          'search',
          handleSearchPress,
          searchButtonAccessibilityLabel,
          searchButtonRef,
          `${testID}-search`
        )}
        
        {showMoreButton && renderButton(
          'more-vert',
          handleMorePress,
          moreButtonAccessibilityLabel,
          moreButtonRef,
          `${testID}-more`
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  smallHeader: {
    height: 56,
    paddingVertical: 8,
  },
  mediumHeader: {
    height: 64,
    paddingVertical: 12,
  },
  largeHeader: {
    height: 72,
    paddingVertical: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  titleCenter: {
    textAlign: 'center',
  },
  smallTitle: {
    fontSize: 18,
  },
  mediumTitle: {
    fontSize: 20,
  },
  largeTitle: {
    fontSize: 24,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 2,
  },
  smallSubtitle: {
    fontSize: 12,
  },
  mediumSubtitle: {
    fontSize: 14,
  },
  largeSubtitle: {
    fontSize: 16,
  },
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    marginHorizontal: 4,
  },
  smallButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  mediumButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  largeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});

export default AccessibleHeader;
