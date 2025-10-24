import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { TagInput } from '../forms/TagInput';

interface TagSelectorProps {
  selectedTags: string[];
  onTagChange: (tag: string) => void;
  availableTags: string[];
  maxDisplayTags?: number;
  showInput?: boolean;
  onSearchSuggestions?: (query: string) => Promise<string[]>;
}

export function TagSelector({ 
  selectedTags, 
  onTagChange, 
  availableTags,
  maxDisplayTags = 20,
  showInput = false,
  onSearchSuggestions
}: TagSelectorProps) {
  const { theme } = useTheme();

  // Limit displayed tags to prevent UI overflow
  const displayTags = availableTags.slice(0, maxDisplayTags);
  const hasMoreTags = availableTags.length > maxDisplayTags;

  const handleTagsChange = (tags: string[]) => {
    // For each tag that was added, call onTagChange
    const newTags = tags.filter(tag => !selectedTags.includes(tag));
    newTags.forEach(tag => onTagChange(tag));
  };

  if (showInput) {
    return (
      <View style={styles.container}>
        <TagInput
          selectedTags={selectedTags}
          onTagsChange={handleTagsChange}
          suggestions={availableTags}
          onSearchSuggestions={onSearchSuggestions}
          placeholder="Search or add tags..."
          maxTags={10}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {displayTags.map(tag => {
          const isSelected = selectedTags.includes(tag);
          return (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagChip,
                { borderColor: theme.colors.border },
                isSelected && styles.tagChipActive
              ]}
              onPress={() => onTagChange(tag)}
            >
              <Text style={[
                styles.tagText,
                { color: theme.colors.textPrimary },
                isSelected && styles.tagTextActive
              ]}>
                {tag}
              </Text>
            </TouchableOpacity>
          );
        })}
        
        {hasMoreTags && (
          <View style={[styles.moreTagsChip, { borderColor: theme.colors.border }]}>
            <Text style={[styles.moreTagsText, { color: theme.colors.textSecondary }]}>
              +{availableTags.length - maxDisplayTags} more
            </Text>
          </View>
        )}
      </ScrollView>
      
      {selectedTags.length > 0 && (
        <View style={styles.selectedTagsContainer}>
          <Text style={[styles.selectedTagsTitle, { color: theme.colors.textPrimary }]}>
            Selected ({selectedTags.length}):
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.selectedTagsScroll}
          >
            {selectedTags.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[styles.selectedTag, { backgroundColor: theme.colors.primary }]}
                onPress={() => onTagChange(tag)}
              >
                <Text style={styles.selectedTagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  scrollContainer: {
    paddingRight: 16,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  tagTextActive: {
    color: 'white',
  },
  moreTagsChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  moreTagsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  selectedTagsContainer: {
    marginTop: 12,
  },
  selectedTagsTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginBottom: 6,
  },
  selectedTagsScroll: {
    maxHeight: 32,
  },
  selectedTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    borderRadius: 12,
  },
  selectedTagText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: 'white',
  },
});
