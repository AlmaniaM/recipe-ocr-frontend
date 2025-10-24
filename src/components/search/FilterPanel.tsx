import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';
import { RecipeCategory } from '../../domain/enums/RecipeCategory';
import { CategoryFilterChips } from './CategoryFilterChips';
import { TagSelector } from './TagSelector';
import { TimeRangeFilter } from './TimeRangeFilter';
import { useTagManagement } from '../../presentation/hooks/useTagManagement';

export interface SearchFilters {
  searchText: string;
  category: RecipeCategory | null;
  tags: string[];
  minPrepTime: number | null;
  maxPrepTime: number | null;
  minCookTime: number | null;
  maxCookTime: number | null;
}

interface FilterPanelProps {
  filters: SearchFilters;
  onCategoryChange: (category: RecipeCategory | null) => void;
  onTagChange: (tag: string) => void;
  onTimeRangeChange: (field: keyof SearchFilters, value: number | null) => void;
  onClearFilters: () => void;
  availableTags: string[];
}

export function FilterPanel({
  filters,
  onCategoryChange,
  onTagChange,
  onTimeRangeChange,
  onClearFilters,
  availableTags,
}: FilterPanelProps) {
  const { theme } = useTheme();
  const { tags, getTags, isLoading: tagsLoading } = useTagManagement();

  const hasActiveFilters = 
    filters.category !== null ||
    filters.tags.length > 0 ||
    filters.minPrepTime !== null ||
    filters.maxPrepTime !== null ||
    filters.minCookTime !== null ||
    filters.maxCookTime !== null;

  return (
    <View 
      style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      testID="filter-panel"
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Filters
        </Text>
        {hasActiveFilters && (
          <TouchableOpacity 
            onPress={onClearFilters} 
            style={styles.clearButton}
            testID="clear-filters-button"
          >
            <Icon name="clear" size={16} color={theme.colors.primary} />
            <Text style={[styles.clearText, { color: theme.colors.primary }]}>
              Clear
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Filter */}
        <View style={styles.section} testID="category-filter">
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Category
          </Text>
          <CategoryFilterChips
            selectedCategory={filters.category}
            onCategoryChange={onCategoryChange}
          />
        </View>

        {/* Tags Filter */}
        <View style={styles.section} testID="tag-filter">
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Tags
          </Text>
          <TagSelector
            selectedTags={filters.tags}
            onTagChange={onTagChange}
            availableTags={tags.map(tag => tag.name)}
            showInput={true}
            onSearchSuggestions={async (query: string) => {
              await getTags(query);
              return tags.map(tag => tag.name);
            }}
          />
        </View>

        {/* Time Range Filters */}
        <View style={styles.section} testID="time-range-filter">
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Time Range
          </Text>
          <TimeRangeFilter
            minPrepTime={filters.minPrepTime}
            maxPrepTime={filters.maxPrepTime}
            minCookTime={filters.minCookTime}
            maxCookTime={filters.maxCookTime}
            onTimeRangeChange={(field: string, value: number | null) => {
              // Map TimeRangeFilterProps fields to SearchFilters fields
              const searchField = field as keyof SearchFilters;
              onTimeRangeChange(searchField, value);
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
});
