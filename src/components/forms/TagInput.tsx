import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';

interface TagInputProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  suggestions?: string[];
  onSearchSuggestions?: (query: string) => Promise<string[]>;
  disabled?: boolean;
}

export function TagInput({
  selectedTags,
  onTagsChange,
  placeholder = 'Add tags...',
  maxTags = 10,
  suggestions = [],
  onSearchSuggestions,
  disabled = false,
}: TagInputProps) {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Filter suggestions based on input and selected tags
  useEffect(() => {
    if (inputValue.length === 0) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = suggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedTags.includes(suggestion)
      )
      .slice(0, 10); // Limit to 10 suggestions

    setFilteredSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [inputValue, suggestions, selectedTags]);

  // Search for suggestions if callback provided
  useEffect(() => {
    if (onSearchSuggestions && inputValue.length > 0) {
      const searchSuggestions = async () => {
        setIsLoading(true);
        try {
          const results = await onSearchSuggestions(inputValue);
          const filtered = results
            .filter(suggestion => !selectedTags.includes(suggestion))
            .slice(0, 10);
          setFilteredSuggestions(filtered);
          setShowSuggestions(filtered.length > 0);
        } catch (error) {
          console.error('Error searching suggestions:', error);
        } finally {
          setIsLoading(false);
        }
      };

      const timer = setTimeout(searchSuggestions, 300); // Debounce
      return () => clearTimeout(timer);
    }
  }, [inputValue, onSearchSuggestions, selectedTags]);

  const handleInputChange = useCallback((text: string) => {
    setInputValue(text);
  }, []);

  const handleAddTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag) && selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, trimmedTag]);
    }
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.blur();
  }, [selectedTags, onTagsChange, maxTags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  }, [selectedTags, onTagsChange]);

  const handleSubmitEditing = useCallback(() => {
    if (inputValue.trim()) {
      handleAddTag(inputValue);
    }
  }, [inputValue, handleAddTag]);

  const handleSuggestionPress = useCallback((suggestion: string) => {
    handleAddTag(suggestion);
  }, [handleAddTag]);

  const handleInputFocus = useCallback(() => {
    if (inputValue.length > 0) {
      setShowSuggestions(true);
    }
  }, [inputValue]);

  const handleInputBlur = useCallback(() => {
    // Delay hiding suggestions to allow for suggestion press
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  }, []);

  const renderTag = useCallback(({ item: tag }: { item: string }) => (
    <TouchableOpacity
      key={tag}
      style={[styles.tagChip, { backgroundColor: theme.colors.primary }]}
      onPress={() => handleRemoveTag(tag)}
      disabled={disabled}
    >
      <Text style={styles.tagText}>{tag}</Text>
      <Icon name="close" size={16} color="white" />
    </TouchableOpacity>
  ), [theme.colors.primary, handleRemoveTag, disabled]);

  const renderSuggestion = useCallback(({ item: suggestion }: { item: string }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, { borderBottomColor: theme.colors.border }]}
      onPress={() => handleSuggestionPress(suggestion)}
    >
      <Icon name="tag" size={16} color={theme.colors.textSecondary} />
      <Text style={[styles.suggestionText, { color: theme.colors.textPrimary }]}>
        {suggestion}
      </Text>
    </TouchableOpacity>
  ), [theme.colors.border, theme.colors.textSecondary, theme.colors.textPrimary, handleSuggestionPress]);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
        Tags {selectedTags.length > 0 && `(${selectedTags.length}/${maxTags})`}
      </Text>
      
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <View style={styles.selectedTagsContainer}>
          <FlatList
            data={selectedTags}
            renderItem={renderTag}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedTags}
          />
        </View>
      )}
      
      {/* Input */}
      <View style={[styles.inputContainer, { borderColor: theme.colors.border }]}>
        <Icon name="tag" size={20} color={theme.colors.textSecondary} />
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: theme.colors.textPrimary }]}
          value={inputValue}
          onChangeText={handleInputChange}
          onSubmitEditing={handleSubmitEditing}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          returnKeyType="done"
          autoCorrect={false}
          autoCapitalize="none"
          editable={!disabled}
        />
        {isLoading && (
          <Icon name="refresh" size={16} color={theme.colors.textSecondary} />
        )}
      </View>
      
      {/* Suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <View style={[styles.suggestionsContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <FlatList
            data={filteredSuggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  selectedTagsContainer: {
    marginBottom: 8,
  },
  selectedTags: {
    paddingRight: 16,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginRight: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 200,
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    zIndex: 1000,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
  },
});
