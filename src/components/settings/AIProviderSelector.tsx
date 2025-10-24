/**
 * AI Provider Selector Component
 * 
 * Allows users to select AI parsing provider with detailed descriptions.
 * Integrates with the settings context for persistence.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';
import { useSetting } from '../../context/SettingsContext';
import { AI_PROVIDER_OPTIONS, AIProviderOption } from '../../domain/entities/AppSettings';

interface AIProviderSelectorProps {
  onProviderChange?: (provider: string) => void;
}

export function AIProviderSelector({ onProviderChange }: AIProviderSelectorProps) {
  const { theme } = useTheme();
  const { value: selectedProvider, update, isLoading, error } = useSetting('aiProvider');

  const handleProviderChange = async (provider: string) => {
    const result = await update(provider as any);
    if (result.isSuccess) {
      onProviderChange?.(provider);
    }
  };

  const renderProviderOption = (option: AIProviderOption) => {
    const isSelected = selectedProvider === option.id;
    
    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.option,
          { 
            backgroundColor: theme.colors.surface,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
            borderWidth: isSelected ? 2 : 1,
          }
        ]}
        onPress={() => handleProviderChange(option.id)}
        disabled={isLoading}
      >
        <View style={styles.optionContent}>
          <Icon 
            name={option.icon} 
            size={24} 
            color={isSelected ? theme.colors.primary : theme.colors.textSecondary} 
          />
          
          <View style={styles.optionText}>
            <Text style={[
              styles.optionTitle,
              { 
                color: isSelected ? theme.colors.primary : theme.colors.textPrimary 
              }
            ]}>
              {option.title}
            </Text>
            <Text style={[
              styles.optionDescription,
              { color: theme.colors.textSecondary }
            ]}>
              {option.description}
            </Text>
            {option.requiresInternet && (
              <View style={styles.internetRequired}>
                <Icon name="wifi" size={12} color={theme.colors.warning} />
                <Text style={[styles.internetText, { color: theme.colors.warning }]}>
                  Requires internet
                </Text>
              </View>
            )}
          </View>
          
          {isSelected && (
            <Icon 
              name="check" 
              size={20} 
              color={theme.colors.primary} 
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Failed to load AI provider options: {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
        AI Parsing Provider
      </Text>
      <View style={styles.optionsList}>
        {AI_PROVIDER_OPTIONS.map(renderProviderOption)}
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
  optionsList: {
    gap: 8,
  },
  option: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  internetRequired: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  internetText: {
    fontSize: 12,
    fontWeight: '500',
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
