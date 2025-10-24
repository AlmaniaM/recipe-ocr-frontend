import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { RecipeCategory, getFoodTypeCategories, getMealTimeCategories, getDietaryCategories, getCuisineCategories, getRecipeCategoryDisplayName, getRecipeCategoryColor } from '../../domain/enums/RecipeCategory';

interface CategoryFilterChipsProps {
  selectedCategory: RecipeCategory | null;
  onCategoryChange: (category: RecipeCategory | null) => void;
  showAllOption?: boolean;
}

export function CategoryFilterChips({ 
  selectedCategory, 
  onCategoryChange, 
  showAllOption = true 
}: CategoryFilterChipsProps) {
  const { theme } = useTheme();
  
  // Get the most commonly used categories for filtering
  const foodTypes = getFoodTypeCategories();
  const mealTimes = getMealTimeCategories();
  const dietary = getDietaryCategories();
  const cuisines = getCuisineCategories();
  
  // Combine and limit to most relevant categories for filtering
  const categories = [
    ...foodTypes.slice(0, 8), // Top 8 food types
    ...mealTimes, // All meal times
    ...dietary.slice(0, 4), // Top 4 dietary restrictions
    ...cuisines.slice(0, 6), // Top 6 cuisines
  ];

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
      testID="category-filter-chips"
    >
      {showAllOption && (
        <TouchableOpacity
          style={[
            styles.chip,
            { borderColor: theme.colors.border },
            selectedCategory === null && styles.chipActive
          ]}
          onPress={() => onCategoryChange(null)}
          testID="category-option-all"
        >
          <Text style={[
            styles.chipText,
            { color: theme.colors.textPrimary },
            selectedCategory === null && styles.chipTextActive
          ]}>
            All
          </Text>
        </TouchableOpacity>
      )}
      
      {categories.map(category => (
        <TouchableOpacity
          key={category}
          style={[
            styles.chip,
            { borderColor: theme.colors.border },
            selectedCategory === category && styles.chipActive
          ]}
          onPress={() => onCategoryChange(category)}
          testID={`category-option-${category.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <Text style={[
            styles.chipText,
            { color: theme.colors.textPrimary },
            selectedCategory === category && styles.chipTextActive
          ]}>
            {getRecipeCategoryDisplayName(category)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingRight: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  chipTextActive: {
    color: 'white',
  },
});
