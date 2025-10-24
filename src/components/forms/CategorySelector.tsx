import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { RecipeCategory, getRecipeCategoryDisplayName, getRecipeCategoryColor } from '../../domain/enums/RecipeCategory';

interface CategorySelectorProps {
  selectedCategory: RecipeCategory | null;
  onCategoryChange: (category: RecipeCategory | null) => void;
  showAllOption?: boolean;
  showColorChips?: boolean;
  grouped?: boolean;
}

export function CategorySelector({ 
  selectedCategory, 
  onCategoryChange, 
  showAllOption = true,
  showColorChips = true,
  grouped = false
}: CategorySelectorProps) {
  const { theme } = useTheme();

  if (grouped) {
    return (
      <GroupedCategorySelector
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        showAllOption={showAllOption}
        showColorChips={showColorChips}
      />
    );
  }

  return (
    <SimpleCategorySelector
      selectedCategory={selectedCategory}
      onCategoryChange={onCategoryChange}
      showAllOption={showAllOption}
      showColorChips={showColorChips}
    />
  );
}

function SimpleCategorySelector({
  selectedCategory,
  onCategoryChange,
  showAllOption,
  showColorChips,
}: CategorySelectorProps) {
  const { theme } = useTheme();
  const categories = Object.values(RecipeCategory).filter(cat => cat !== RecipeCategory.Other);

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {showAllOption && (
          <TouchableOpacity
            style={[
              styles.chip,
              { borderColor: theme.colors.border },
              selectedCategory === null && styles.chipActive
            ]}
            onPress={() => onCategoryChange(null)}
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
              selectedCategory === category && styles.chipActive,
              showColorChips && selectedCategory === category && {
                backgroundColor: getRecipeCategoryColor(category),
                borderColor: getRecipeCategoryColor(category),
              }
            ]}
            onPress={() => onCategoryChange(category)}
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
    </View>
  );
}

function GroupedCategorySelector({
  selectedCategory,
  onCategoryChange,
  showAllOption,
  showColorChips,
}: CategorySelectorProps) {
  const { theme } = useTheme();
  const { getFoodTypeCategories, getMealTimeCategories, getDietaryCategories, getCuisineCategories } = require('../../domain/enums/RecipeCategory');

  const foodTypes = getFoodTypeCategories();
  const mealTimes = getMealTimeCategories();
  const dietary = getDietaryCategories();
  const cuisines = getCuisineCategories();

  const renderCategoryGroup = (title: string, categories: RecipeCategory[]) => (
    <View style={styles.group}>
      <Text style={[styles.groupTitle, { color: theme.colors.textPrimary }]}>
        {title}
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.groupScroll}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.chip,
              { borderColor: theme.colors.border },
              selectedCategory === category && styles.chipActive,
              showColorChips && selectedCategory === category && {
                backgroundColor: getRecipeCategoryColor(category),
                borderColor: getRecipeCategoryColor(category),
              }
            ]}
            onPress={() => onCategoryChange(category)}
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
    </View>
  );

  return (
    <View style={styles.container}>
      {showAllOption && (
        <TouchableOpacity
          style={[
            styles.chip,
            { borderColor: theme.colors.border },
            selectedCategory === null && styles.chipActive
          ]}
          onPress={() => onCategoryChange(null)}
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
      
      {renderCategoryGroup('Food Types', foodTypes)}
      {renderCategoryGroup('Meal Times', mealTimes)}
      {renderCategoryGroup('Dietary', dietary)}
      {renderCategoryGroup('Cuisines', cuisines)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
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
  group: {
    marginBottom: 16,
  },
  groupTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  groupScroll: {
    paddingRight: 16,
  },
});
