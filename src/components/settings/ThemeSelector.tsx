/**
 * Theme Selector Component
 * 
 * Allows users to select from available themes with visual previews.
 * Integrates with the settings context for persistence.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';
import { useSetting } from '../../context/SettingsContext';
import { THEME_OPTIONS, ThemeOption } from '../../domain/entities/AppSettings';

interface ThemeSelectorProps {
  onThemeChange?: (theme: string) => void;
}

export function ThemeSelector({ onThemeChange }: ThemeSelectorProps) {
  const { theme } = useTheme();
  const { value: selectedTheme, update, isLoading, error } = useSetting('theme');

  const handleThemeChange = async (themeId: string) => {
    const result = await update(themeId as any);
    if (result.isSuccess) {
      onThemeChange?.(themeId);
    }
  };

  const renderThemeOption = (themeOption: ThemeOption) => {
    const isSelected = selectedTheme === themeOption.id;
    
    return (
      <TouchableOpacity
        key={themeOption.id}
        style={[
          styles.themeOption,
          { 
            backgroundColor: theme.colors.surface,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
            borderWidth: isSelected ? 2 : 1,
          }
        ]}
        onPress={() => handleThemeChange(themeOption.id)}
        disabled={isLoading}
      >
        <View style={styles.colorPreview}>
          {themeOption.colors.map((color, index) => (
            <View
              key={index}
              style={[
                styles.colorSwatch,
                { backgroundColor: color }
              ]}
            />
          ))}
        </View>
        
        <View style={styles.themeInfo}>
          <Text style={[
            styles.themeName,
            { color: theme.colors.textPrimary }
          ]}>
            {themeOption.name}
          </Text>
          <Text style={[
            styles.themeDescription,
            { color: theme.colors.textSecondary }
          ]}>
            {themeOption.description}
          </Text>
        </View>
        
        {isSelected && (
          <Icon 
            name="check" 
            size={24} 
            color={theme.colors.primary} 
          />
        )}
      </TouchableOpacity>
    );
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Failed to load theme options: {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
        Theme
      </Text>
      <View style={styles.themeGrid}>
        {THEME_OPTIONS.map(renderThemeOption)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    minWidth: 120,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  colorPreview: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 4,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  themeInfo: {
    alignItems: 'center',
    flex: 1,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  themeDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#ffebee',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
