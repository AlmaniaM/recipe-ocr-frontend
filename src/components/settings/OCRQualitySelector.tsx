/**
 * OCR Quality Selector Component
 * 
 * Allows users to select OCR quality settings with detailed descriptions.
 * Integrates with the settings context for persistence.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';
import { useSetting } from '../../context/SettingsContext';
import { OCR_QUALITY_OPTIONS, OCRQualityOption } from '../../domain/entities/AppSettings';

interface OCRQualitySelectorProps {
  onQualityChange?: (quality: string) => void;
}

export function OCRQualitySelector({ onQualityChange }: OCRQualitySelectorProps) {
  const { theme } = useTheme();
  const { value: selectedQuality, update, isLoading, error } = useSetting('ocrQuality');

  const handleQualityChange = async (quality: string) => {
    const result = await update(quality as any);
    if (result.isSuccess) {
      onQualityChange?.(quality);
    }
  };

  const renderQualityOption = (option: OCRQualityOption) => {
    const isSelected = selectedQuality === option.id;
    
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
        onPress={() => handleQualityChange(option.id)}
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
          Failed to load OCR quality options: {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
        OCR Quality
      </Text>
      <View style={styles.optionsList}>
        {OCR_QUALITY_OPTIONS.map(renderQualityOption)}
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
