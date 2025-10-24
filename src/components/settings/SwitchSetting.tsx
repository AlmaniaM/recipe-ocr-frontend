/**
 * Switch Setting Component
 * 
 * A reusable component for boolean settings with toggle switches.
 * Integrates with the settings context for persistence.
 */

import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';
import { useSetting } from '../../context/SettingsContext';
import { SettingsKey } from '../../domain/entities/AppSettings';

interface SwitchSettingProps {
  settingKey: SettingsKey;
  title: string;
  description?: string;
  icon?: string;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
}

export function SwitchSetting({ 
  settingKey, 
  title, 
  description, 
  icon,
  onValueChange,
  disabled = false 
}: SwitchSettingProps) {
  const { theme } = useTheme();
  const { value, update, isLoading, error } = useSetting(settingKey);

  const handleValueChange = async (newValue: boolean) => {
    const result = await update(newValue as any);
    if (result.isSuccess) {
      onValueChange?.(newValue);
    }
  };

  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: isDisabled ? 0.6 : 1,
        }
      ]}
      onPress={() => !isDisabled && handleValueChange(!value)}
      disabled={isDisabled}
    >
      <View style={styles.content}>
        {icon && (
          <Icon 
            name={icon} 
            size={24} 
            color={theme.colors.textSecondary}
            style={styles.icon}
          />
        )}
        
        <View style={styles.textContainer}>
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
          {error && (
            <Text style={[
              styles.errorText,
              { color: theme.colors.error }
            ]}>
              {error}
            </Text>
          )}
        </View>
        
        <Switch
          value={value as boolean}
          onValueChange={handleValueChange}
          disabled={isDisabled}
          trackColor={{
            false: theme.colors.border,
            true: theme.colors.primary + '40',
          }}
          thumbColor={value ? theme.colors.primary : theme.colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    marginRight: 4,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
