import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface EmptyStateProps {
  message: string;
  icon?: string;
  action?: {
    title: string;
    onPress: () => void;
  };
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/**
 * Reusable empty data display component with optional action button
 * Used for displaying empty states in lists and screens
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  icon,
  action,
  style,
  testID = 'empty-state',
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { theme } = useTheme();

  return (
    <View 
      style={[styles.container, style]} 
      testID={testID}
      accessibilityLabel={accessibilityLabel || 'Empty state'}
      accessibilityHint={accessibilityHint || 'No content available. Use the action button to add content.'}
    >
      <View style={[styles.content, { backgroundColor: theme.colors.surface }]}>
        {icon && (
          <Text 
            style={[styles.icon, { color: theme.colors.textSecondary }]} 
            testID={`${testID}-icon`}
            accessibilityLabel="Empty state icon"
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

        {action && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={action.onPress}
            testID={`${testID}-action-button`}
            accessibilityLabel={action.title}
            accessibilityHint={`Double tap to ${action.title.toLowerCase()}`}
            accessibilityRole="button"
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.surface }]}>
              {action.title}
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
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
});

export default EmptyState;
