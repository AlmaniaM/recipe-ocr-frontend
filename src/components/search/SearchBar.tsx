import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onFilterPress?: () => void;
  showFilterButton?: boolean;
  isFilterActive?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search recipes...',
  onClear,
  onFilterPress,
  showFilterButton = true,
  isFilterActive = false,
}: SearchBarProps) {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState(value);

  // Debounce the input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== value) {
        onChangeText(inputValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, onChangeText, value]);

  // Update input when value prop changes externally
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleClear = useCallback(() => {
    setInputValue('');
    onChangeText('');
    onClear?.();
  }, [onChangeText, onClear]);

  const handleFilterPress = useCallback(() => {
    onFilterPress?.();
  }, [onFilterPress]);

  return (
    <View 
      style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      testID="search-bar"
    >
      <Icon name="search" size={20} color={theme.colors.textSecondary} />
      
      <TextInput
        style={[styles.input, { color: theme.colors.textPrimary }]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        value={inputValue}
        onChangeText={setInputValue}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        testID="search-input"
      />
      
      {inputValue.length > 0 && (
        <TouchableOpacity 
          onPress={handleClear} 
          style={styles.clearButton}
          testID="search-clear"
        >
          <Icon name="clear" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      )}
      
      {showFilterButton && (
        <TouchableOpacity
          onPress={handleFilterPress}
          style={[
            styles.filterButton,
            isFilterActive && { backgroundColor: theme.colors.primary }
          ]}
          testID="filter-button"
        >
          <Icon
            name="tune"
            size={20}
            color={isFilterActive ? 'white' : theme.colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  clearButton: {
    padding: 4,
    marginRight: 4,
  },
  filterButton: {
    padding: 4,
    borderRadius: 4,
  },
});
