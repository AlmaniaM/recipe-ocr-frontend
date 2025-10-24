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

export interface AccessibleTabBarProps {
  tabs: Array<{
    id: string;
    label: string;
    icon: string;
    onPress: () => void;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    badge?: string | number;
    disabled?: boolean;
  }>;
  activeTabId: string;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  showLabels?: boolean;
  showIcons?: boolean;
  size?: 'small' | 'medium' | 'large';
  position?: 'top' | 'bottom';
}

/**
 * Accessible tab bar component with comprehensive accessibility support
 * Provides proper navigation, focus management, and screen reader support
 */
export const AccessibleTabBar: React.FC<AccessibleTabBarProps> = ({
  tabs,
  activeTabId,
  style,
  testID = 'accessible-tab-bar',
  accessibilityLabel = 'Tab navigation',
  accessibilityHint = 'Use tabs to navigate between sections',
  showLabels = true,
  showIcons = true,
  size = 'medium',
  position = 'bottom',
}) => {
  const { theme } = useTheme();
  const { announceForAccessibility } = useAccessibility();
  const { registerElement, unregisterElement, setFocus } = useFocusManagement();
  const tabRefs = useRef<Map<string, React.RefObject<any>>>(new Map());

  useEffect(() => {
    // Register tab elements for focus management
    tabs.forEach(tab => {
      const ref = { current: null };
      tabRefs.current.set(tab.id, ref);
      registerElement(`tab-${tab.id}`, ref);
    });

    return () => {
      tabs.forEach(tab => {
        unregisterElement(`tab-${tab.id}`);
      });
      tabRefs.current.clear();
    };
  }, [tabs, registerElement, unregisterElement]);

  const handleTabPress = useCallback((tab: typeof tabs[0]) => {
    if (!tab.disabled) {
      announceForAccessibility(`Selected ${tab.label} tab`);
      tab.onPress();
    }
  }, [announceForAccessibility]);

  const handleTabFocus = useCallback((tab: typeof tabs[0]) => {
    setFocus(`tab-${tab.id}`);
  }, [setFocus]);

  const getTabBarStyle = () => {
    const baseStyle: any[] = [styles.tabBar, styles[position]];
    
    switch (size) {
      case 'small':
        baseStyle.push(styles.tabBarSmall);
        break;
      case 'medium':
        baseStyle.push(styles.tabBarMedium);
        break;
      case 'large':
        baseStyle.push(styles.tabBarLarge);
        break;
    }

    return baseStyle;
  };

  const getTabStyle = (tab: typeof tabs[0]) => {
    const baseStyle: any[] = [styles.tab, styles[`${size}Tab`]];
    
    if (tab.id === activeTabId) {
      baseStyle.push(styles.tabActive);
    }

    if (tab.disabled) {
      baseStyle.push(styles.tabDisabled);
    }

    return baseStyle;
  };

  const getTabTextStyle = (tab: typeof tabs[0]) => {
    const baseStyle: any[] = [styles.tabText, styles[`${size}TabText`]];
    
    if (tab.id === activeTabId) {
      baseStyle.push({ color: theme.colors.primary });
    } else {
      baseStyle.push({ color: theme.colors.textSecondary });
    }

    if (tab.disabled) {
      baseStyle.push({ opacity: 0.5 });
    }

    return baseStyle;
  };

  const getIconStyle = (tab: typeof tabs[0]) => {
    const baseStyle: any[] = [styles.tabIcon];
    
    if (tab.id === activeTabId) {
      baseStyle.push({ color: theme.colors.primary });
    } else {
      baseStyle.push({ color: theme.colors.textSecondary });
    }

    if (tab.disabled) {
      baseStyle.push({ opacity: 0.5 });
    }

    return baseStyle;
  };

  const getBadgeStyle = () => {
    return [styles.badge, { backgroundColor: theme.colors.error }] as any[];
  };

  const getBadgeTextStyle = () => {
    return [styles.badgeText, { color: theme.colors.surface }] as any[];
  };

  return (
    <View
      style={[getTabBarStyle(), { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }, style]}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="tablist"
    >
      {tabs.map((tab) => {
        const ref = tabRefs.current.get(tab.id);
        const isActive = tab.id === activeTabId;
        
        return (
          <TouchableOpacity
            key={tab.id}
            ref={ref}
            style={getTabStyle(tab)}
            onPress={() => handleTabPress(tab)}
            onFocus={() => handleTabFocus(tab)}
            disabled={tab.disabled}
            testID={`${testID}-tab-${tab.id}`}
            accessible={true}
            accessibilityLabel={tab.accessibilityLabel || tab.label}
            accessibilityHint={tab.accessibilityHint || `Navigate to ${tab.label} section`}
            accessibilityRole="tab"
            accessibilityState={{
              selected: isActive,
              disabled: tab.disabled,
            } as AccessibilityState}
          >
            {showIcons && (
              <View style={styles.iconContainer}>
                <Icon
                  name={tab.icon}
                  size={size === 'small' ? 20 : size === 'medium' ? 24 : 28}
                  style={getIconStyle(tab)}
                />
                {tab.badge && (
                  <View style={getBadgeStyle()}>
                    <Text style={getBadgeTextStyle()}>
                      {tab.badge}
                    </Text>
                  </View>
                )}
              </View>
            )}
            
            {showLabels && (
              <Text
                style={getTabTextStyle(tab)}
                testID={`${testID}-tab-${tab.id}-label`}
                accessible={true}
                accessibilityRole="text"
              >
                {tab.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
  },
  top: {
    borderTopWidth: 0,
    borderBottomWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
  },
  bottom: {
    borderTopWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabBarSmall: {
    height: 60,
  },
  tabBarMedium: {
    height: 70,
  },
  tabBarLarge: {
    height: 80,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 44, // Minimum touch target size
  },
  smallTab: {
    paddingVertical: 4,
  },
  mediumTab: {
    paddingVertical: 8,
  },
  largeTab: {
    paddingVertical: 12,
  },
  tabActive: {
    // Active state styling handled by text/icon colors
  },
  tabDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  tabIcon: {
    // Icon styling handled by color prop
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  smallTabText: {
    fontSize: 10,
  },
  mediumTabText: {
    fontSize: 12,
  },
  largeTabText: {
    fontSize: 14,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
});

export default AccessibleTabBar;
