/**
 * Settings Section Component
 * 
 * A container component for organizing related settings with consistent styling.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function SettingsSection({ 
  title, 
  description, 
  children, 
  collapsible = false,
  defaultCollapsed = false 
}: SettingsSectionProps) {
  const { theme } = useTheme();
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const toggleCollapsed = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      }
    ]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[
            styles.title,
            { color: theme.colors.textPrimary }
          ]}>
            {title}
          </Text>
          {description && (
            <Text style={[
              styles.description,
              { color: theme.colors.textSecondary }
            ]}>
              {description}
            </Text>
          )}
        </View>
        
        {collapsible && (
          <Text style={[
            styles.collapseIcon,
            { color: theme.colors.textSecondary }
          ]}>
            {isCollapsed ? '▼' : '▲'}
          </Text>
        )}
      </View>
      
      {!isCollapsed && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  collapseIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
