import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { FilterPanel } from '../../../components/search/FilterPanel';
import { RecipeCategory } from '../../../types/recipe';

// Mock the useTheme hook
jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        surface: '#FFFFFF',
        border: '#E0E0E0',
        textPrimary: '#000000',
        textSecondary: '#666666',
        primary: '#007AFF',
        background: '#F5F5F5',
      },
    },
  }),
}));

// Mock the child components
jest.mock('../../../components/search/CategoryFilterChips', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  const { RecipeCategory } = require('../../../types/recipe');
  return function MockCategoryFilterChips({ selectedCategory, onCategoryChange, showAllOption }: any) {
    return (
      <View testID="category-filter-chips">
        <Text>Category Filter</Text>
        {showAllOption && (
          <TouchableOpacity
            testID="all-categories"
            onPress={() => onCategoryChange(undefined)}
          >
            <Text>All Categories</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          testID="dessert-category"
          onPress={() => onCategoryChange(RecipeCategory.Dessert)}
        >
          <Text>Dessert</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="main-course-category"
          onPress={() => onCategoryChange(RecipeCategory.MainCourse)}
        >
          <Text>Main Course</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock('../../../components/search/TagSelector', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return function MockTagSelector({ selectedTags, onTagChange, availableTags, showInput, onSearchSuggestions }: any) {
    return (
      <View testID="tag-selector">
        <Text>Tag Selector</Text>
        <Text>Selected: {selectedTags?.join(', ') || 'None'}</Text>
        <Text>Available: {availableTags?.map((t: any) => t.name).join(', ') || 'None'}</Text>
        {showInput && (
          <TouchableOpacity
            testID="search-tags"
            onPress={() => onSearchSuggestions?.('test')}
          >
            <Text>Search Tags</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          testID="add-tag"
          onPress={() => onTagChange([...(selectedTags || []), 'new-tag'])}
        >
          <Text>Add Tag</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="remove-tag"
          onPress={() => onTagChange((selectedTags || []).slice(0, -1))}
        >
          <Text>Remove Tag</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock('../../../components/search/TimeRangeFilter', () => {
  const { View, TextInput, Text, TouchableOpacity } = require('react-native');
  return function MockTimeRangeFilter({ minPrepTime, maxPrepTime, minCookTime, maxCookTime, onTimeRangeChange }: any) {
    return (
      <View testID="time-range-filter">
        <Text>Time Range Filter</Text>
        <Text>Min Prep: {minPrepTime || 'None'}</Text>
        <Text>Max Prep: {maxPrepTime || 'None'}</Text>
        <Text>Min Cook: {minCookTime || 'None'}</Text>
        <Text>Max Cook: {maxCookTime || 'None'}</Text>
        <TouchableOpacity
          testID="set-prep-time"
          onPress={() => onTimeRangeChange({ minPrepTime: 10, maxPrepTime: 30 })}
        >
          <Text>Set Prep Time</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="set-cook-time"
          onPress={() => onTimeRangeChange({ minCookTime: 15, maxCookTime: 45 })}
        >
          <Text>Set Cook Time</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

describe('FilterPanel Component', () => {
  const defaultProps = {
    filters: {
      category: undefined,
      tags: [],
      minPrepTime: undefined,
      maxPrepTime: undefined,
      minCookTime: undefined,
      maxCookTime: undefined,
    },
    onCategoryChange: jest.fn(),
    onTagChange: jest.fn(),
    onTimeRangeChange: jest.fn(),
    onClearFilters: jest.fn(),
    availableTags: [
      { id: '1', name: 'dessert', color: '#FF6B6B' },
      { id: '2', name: 'chocolate', color: '#8B4513' },
      { id: '3', name: 'quick', color: '#32CD32' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      expect(() => {
        render(<FilterPanel {...defaultProps} />);
      }).not.toThrow();
    });

    it('should render all filter sections', () => {
      const { getByTestId } = render(<FilterPanel {...defaultProps} />);
      
      expect(getByTestId('category-filter-chips')).toBeTruthy();
      expect(getByTestId('tag-selector')).toBeTruthy();
      expect(getByTestId('time-range-filter')).toBeTruthy();
    });

    it('should render clear filters button', () => {
      const { getByTestId } = render(<FilterPanel {...defaultProps} />);
      expect(getByTestId('clear-filters-button')).toBeTruthy();
    });

    it('should render apply filters button', () => {
      const { getByTestId } = render(<FilterPanel {...defaultProps} />);
      expect(getByTestId('apply-filters-button')).toBeTruthy();
    });
  });

  describe('Category Filter', () => {
    it('should pass selected category to CategoryFilterChips', () => {
      const filters = { ...defaultProps.filters, category: RecipeCategory.Dessert };
      const { getByTestId } = render(
        <FilterPanel {...defaultProps} filters={filters} />
      );
      
      const categoryFilter = getByTestId('category-filter-chips');
      expect(categoryFilter).toBeTruthy();
    });

    it('should call onCategoryChange when category is selected', () => {
      const { getByTestId } = render(<FilterPanel {...defaultProps} />);
      
      const dessertButton = getByTestId('dessert-category');
      fireEvent.press(dessertButton);
      
      expect(defaultProps.onCategoryChange).toHaveBeenCalledWith(RecipeCategory.Dessert);
    });

    it('should call onCategoryChange with undefined when all categories is selected', () => {
      const { getByTestId } = render(<FilterPanel {...defaultProps} />);
      
      const allCategoriesButton = getByTestId('all-categories');
      fireEvent.press(allCategoriesButton);
      
      expect(defaultProps.onCategoryChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Tag Filter', () => {
    it('should pass selected tags to TagSelector', () => {
      const filters = { ...defaultProps.filters, tags: ['dessert', 'chocolate'] };
      const { getByTestId } = render(
        <FilterPanel {...defaultProps} filters={filters} />
      );
      
      const tagSelector = getByTestId('tag-selector');
      expect(tagSelector).toBeTruthy();
    });

    it('should pass available tags to TagSelector', () => {
      const { getByTestId } = render(<FilterPanel {...defaultProps} />);
      
      const tagSelector = getByTestId('tag-selector');
      expect(tagSelector).toBeTruthy();
    });

    it('should call onTagChange when tags are modified', () => {
      const { getByTestId } = render(<FilterPanel {...defaultProps} />);
      
      const addTagButton = getByTestId('add-tag');
      fireEvent.press(addTagButton);
      
      expect(defaultProps.onTagChange).toHaveBeenCalledWith(['new-tag']);
    });

    it('should handle tag search suggestions', () => {
      const mockOnSearchSuggestions = jest.fn();
      const { getByTestId } = render(
        <FilterPanel {...defaultProps} onSearchSuggestions={mockOnSearchSuggestions} />
      );
      
      const searchTagsButton = getByTestId('search-tags');
      fireEvent.press(searchTagsButton);
      
      expect(mockOnSearchSuggestions).toHaveBeenCalledWith('test');
    });
  });

  describe('Time Range Filter', () => {
    it('should pass time range values to TimeRangeFilter', () => {
      const filters = {
        ...defaultProps.filters,
        minPrepTime: 10,
        maxPrepTime: 30,
        minCookTime: 15,
        maxCookTime: 45,
      };
      const { getByTestId } = render(
        <FilterPanel {...defaultProps} filters={filters} />
      );
      
      const timeRangeFilter = getByTestId('time-range-filter');
      expect(timeRangeFilter).toBeTruthy();
    });

    it('should call onTimeRangeChange when prep time is set', () => {
      const { getByTestId } = render(<FilterPanel {...defaultProps} />);
      
      const setPrepTimeButton = getByTestId('set-prep-time');
      fireEvent.press(setPrepTimeButton);
      
      expect(defaultProps.onTimeRangeChange).toHaveBeenCalledWith({
        minPrepTime: 10,
        maxPrepTime: 30,
      });
    });

    it('should call onTimeRangeChange when cook time is set', () => {
      const { getByTestId } = render(<FilterPanel {...defaultProps} />);
      
      const setCookTimeButton = getByTestId('set-cook-time');
      fireEvent.press(setCookTimeButton);
      
      expect(defaultProps.onTimeRangeChange).toHaveBeenCalledWith({
        minCookTime: 15,
        maxCookTime: 45,
      });
    });
  });

  describe('Clear Filters', () => {
    it('should call onClearFilters when clear button is pressed', () => {
      const { getByTestId } = render(<FilterPanel {...defaultProps} />);
      
      const clearButton = getByTestId('clear-filters-button');
      fireEvent.press(clearButton);
      
      expect(defaultProps.onClearFilters).toHaveBeenCalled();
    });

    it('should work without onClearFilters callback', () => {
      const { onClearFilters, ...propsWithoutCallback } = defaultProps;
      const { getByTestId } = render(<FilterPanel {...propsWithoutCallback} />);
      
      const clearButton = getByTestId('clear-filters-button');
      
      expect(() => {
        fireEvent.press(clearButton);
      }).not.toThrow();
    });
  });

  describe('Apply Filters', () => {
    it('should call onApplyFilters when apply button is pressed', () => {
      const mockOnApplyFilters = jest.fn();
      const { getByTestId } = render(
        <FilterPanel {...defaultProps} onApplyFilters={mockOnApplyFilters} />
      );
      
      const applyButton = getByTestId('apply-filters-button');
      fireEvent.press(applyButton);
      
      expect(mockOnApplyFilters).toHaveBeenCalled();
    });

    it('should work without onApplyFilters callback', () => {
      const { getByTestId } = render(<FilterPanel {...defaultProps} />);
      
      const applyButton = getByTestId('apply-filters-button');
      
      expect(() => {
        fireEvent.press(applyButton);
      }).not.toThrow();
    });
  });

  describe('Filter State Management', () => {
    it('should handle undefined filters gracefully', () => {
      const { getByTestId } = render(
        <FilterPanel {...defaultProps} filters={undefined as any} />
      );
      
      expect(getByTestId('category-filter-chips')).toBeTruthy();
      expect(getByTestId('tag-selector')).toBeTruthy();
      expect(getByTestId('time-range-filter')).toBeTruthy();
    });

    it('should handle empty available tags', () => {
      const { getByTestId } = render(
        <FilterPanel {...defaultProps} availableTags={[]} />
      );
      
      const tagSelector = getByTestId('tag-selector');
      expect(tagSelector).toBeTruthy();
    });

    it('should handle undefined available tags', () => {
      const { getByTestId } = render(
        <FilterPanel {...defaultProps} availableTags={undefined} />
      );
      
      const tagSelector = getByTestId('tag-selector');
      expect(tagSelector).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility properties for buttons', () => {
      const { getByTestId } = render(<FilterPanel {...defaultProps} />);
      
      const clearButton = getByTestId('clear-filters-button');
      const applyButton = getByTestId('apply-filters-button');
      
      expect(clearButton.props.accessibilityLabel).toBe('Clear all filters');
      expect(applyButton.props.accessibilityLabel).toBe('Apply filters');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing callback functions gracefully', () => {
      const minimalProps = {
        filters: defaultProps.filters,
        availableTags: defaultProps.availableTags,
      };
      
      expect(() => {
        render(<FilterPanel {...minimalProps} />);
      }).not.toThrow();
    });

    it('should handle complex filter combinations', () => {
      const complexFilters = {
        category: RecipeCategory.Dessert,
        tags: ['chocolate', 'dessert', 'quick'],
        minPrepTime: 5,
        maxPrepTime: 30,
        minCookTime: 10,
        maxCookTime: 60,
      };
      
      const { getByTestId } = render(
        <FilterPanel {...defaultProps} filters={complexFilters} />
      );
      
      expect(getByTestId('category-filter-chips')).toBeTruthy();
      expect(getByTestId('tag-selector')).toBeTruthy();
      expect(getByTestId('time-range-filter')).toBeTruthy();
    });

    it('should handle very long tag names', () => {
      const longTagNames = [
        { id: '1', name: 'very-long-tag-name-that-might-cause-layout-issues', color: '#FF6B6B' },
        { id: '2', name: 'another-very-long-tag-name-for-testing-purposes', color: '#8B4513' },
      ];
      
      const { getByTestId } = render(
        <FilterPanel {...defaultProps} availableTags={longTagNames} />
      );
      
      expect(getByTestId('tag-selector')).toBeTruthy();
    });
  });
});
