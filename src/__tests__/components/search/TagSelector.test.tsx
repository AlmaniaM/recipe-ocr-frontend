import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TagSelector } from '../../../components/search/TagSelector';

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
        error: '#FF3B30',
      },
    },
  }),
}));

// Mock the TagInput component (if it exists)
jest.mock('../../../components/search/TagInput', () => {
  const { View, TextInput, TouchableOpacity, Text } = require('react-native');
  return function MockTagInput({ 
    onAddTag, 
    onSearchSuggestions, 
    placeholder, 
    maxLength 
  }: any) {
    return (
      <View testID="tag-input">
        <TextInput
          testID="tag-input-field"
          placeholder={placeholder}
          maxLength={maxLength}
          onChangeText={(text: string) => {
            if (text.includes('add:')) {
              onAddTag?.(text.replace('add:', ''));
            }
            if (text.includes('search:')) {
              onSearchSuggestions?.(text.replace('search:', ''));
            }
          }}
        />
        <TouchableOpacity
          testID="add-tag-button"
          onPress={() => onAddTag?.('test-tag')}
        >
          <Text>Add Tag</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="search-tags-button"
          onPress={() => onSearchSuggestions?.('search-query')}
        >
          <Text>Search Tags</Text>
        </TouchableOpacity>
      </View>
    );
  };
}, { virtual: true });

describe('TagSelector Component', () => {
  const mockAvailableTags = [
    { id: '1', name: 'dessert', color: '#FF6B6B' },
    { id: '2', name: 'chocolate', color: '#8B4513' },
    { id: '3', name: 'quick', color: '#32CD32' },
    { id: '4', name: 'healthy', color: '#4CAF50' },
    { id: '5', name: 'vegetarian', color: '#8BC34A' },
  ];

  const defaultProps = {
    selectedTags: [],
    onTagChange: jest.fn(),
    availableTags: mockAvailableTags,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      expect(() => {
        render(<TagSelector {...defaultProps} />);
      }).not.toThrow();
    });

    it('should render selected tags', () => {
      const selectedTags = ['dessert', 'chocolate'];
      const { getByText } = render(
        <TagSelector {...defaultProps} selectedTags={selectedTags} />
      );
      
      expect(getByText('dessert')).toBeTruthy();
      expect(getByText('chocolate')).toBeTruthy();
    });

    it('should render available tags for selection', () => {
      const { getByText } = render(<TagSelector {...defaultProps} />);
      
      mockAvailableTags.forEach(tag => {
        expect(getByText(tag.name)).toBeTruthy();
      });
    });

    it('should render tag input when showInput is true', () => {
      const { getByTestId } = render(
        <TagSelector {...defaultProps} showInput={true} />
      );
      expect(getByTestId('tag-input')).toBeTruthy();
    });

    it('should not render tag input when showInput is false', () => {
      const { queryByTestId } = render(
        <TagSelector {...defaultProps} showInput={false} />
      );
      expect(queryByTestId('tag-input')).toBeNull();
    });

    it('should not render tag input by default', () => {
      const { queryByTestId } = render(<TagSelector {...defaultProps} />);
      expect(queryByTestId('tag-input')).toBeNull();
    });
  });

  describe('Tag Selection', () => {
    it('should call onTagChange when a tag is selected', () => {
      const { getByText } = render(<TagSelector {...defaultProps} />);
      
      const dessertTag = getByText('dessert');
      fireEvent.press(dessertTag);
      
      expect(defaultProps.onTagChange).toHaveBeenCalledWith(['dessert']);
    });

    it('should add tag to existing selection', () => {
      const selectedTags = ['chocolate'];
      const { getByText } = render(
        <TagSelector {...defaultProps} selectedTags={selectedTags} />
      );
      
      const dessertTag = getByText('dessert');
      fireEvent.press(dessertTag);
      
      expect(defaultProps.onTagChange).toHaveBeenCalledWith(['chocolate', 'dessert']);
    });

    it('should remove tag from selection when already selected', () => {
      const selectedTags = ['dessert', 'chocolate'];
      const { getByText } = render(
        <TagSelector {...defaultProps} selectedTags={selectedTags} />
      );
      
      const dessertTag = getByText('dessert');
      fireEvent.press(dessertTag);
      
      expect(defaultProps.onTagChange).toHaveBeenCalledWith(['chocolate']);
    });

    it('should handle multiple tag selections', () => {
      const { getByText } = render(<TagSelector {...defaultProps} />);
      
      // Select first tag
      fireEvent.press(getByText('dessert'));
      expect(defaultProps.onTagChange).toHaveBeenCalledWith(['dessert']);
      
      // Select second tag
      fireEvent.press(getByText('chocolate'));
      expect(defaultProps.onTagChange).toHaveBeenCalledWith(['dessert', 'chocolate']);
      
      // Select third tag
      fireEvent.press(getByText('quick'));
      expect(defaultProps.onTagChange).toHaveBeenCalledWith(['dessert', 'chocolate', 'quick']);
    });
  });

  describe('Tag Input Integration', () => {
    it('should pass onAddTag to TagInput', () => {
      const mockOnAddTag = jest.fn();
      const { getByTestId } = render(
        <TagSelector {...defaultProps} showInput={true} onAddTag={mockOnAddTag} />
      );
      
      const addButton = getByTestId('add-tag-button');
      fireEvent.press(addButton);
      
      expect(mockOnAddTag).toHaveBeenCalledWith('test-tag');
    });

    it('should pass onSearchSuggestions to TagInput', () => {
      const mockOnSearchSuggestions = jest.fn();
      const { getByTestId } = render(
        <TagSelector {...defaultProps} showInput={true} onSearchSuggestions={mockOnSearchSuggestions} />
      );
      
      const searchButton = getByTestId('search-tags-button');
      fireEvent.press(searchButton);
      
      expect(mockOnSearchSuggestions).toHaveBeenCalledWith('search-query');
    });

    it('should add new tag when TagInput calls onAddTag', () => {
      const { getByTestId } = render(
        <TagSelector {...defaultProps} showInput={true} />
      );
      
      const inputField = getByTestId('tag-input-field');
      fireEvent.changeText(inputField, 'add:new-tag');
      
      expect(defaultProps.onTagChange).toHaveBeenCalledWith(['new-tag']);
    });

    it('should search suggestions when TagInput calls onSearchSuggestions', () => {
      const mockOnSearchSuggestions = jest.fn();
      const { getByTestId } = render(
        <TagSelector 
          {...defaultProps} 
          showInput={true} 
          onSearchSuggestions={mockOnSearchSuggestions} 
        />
      );
      
      const inputField = getByTestId('tag-input-field');
      fireEvent.changeText(inputField, 'search:chocolate');
      
      expect(mockOnSearchSuggestions).toHaveBeenCalledWith('chocolate');
    });
  });

  describe('Max Display Tags', () => {
    it('should show all selected tags when under maxDisplayTags limit', () => {
      const selectedTags = ['dessert', 'chocolate'];
      const { getByText } = render(
        <TagSelector {...defaultProps} selectedTags={selectedTags} maxDisplayTags={5} />
      );
      
      expect(getByText('dessert')).toBeTruthy();
      expect(getByText('chocolate')).toBeTruthy();
    });

    it('should show count indicator when over maxDisplayTags limit', () => {
      const selectedTags = ['dessert', 'chocolate', 'quick', 'healthy', 'vegetarian', 'spicy'];
      const { getByText, queryByText } = render(
        <TagSelector {...defaultProps} selectedTags={selectedTags} maxDisplayTags={3} />
      );
      
      // Should show first 3 tags
      expect(getByText('dessert')).toBeTruthy();
      expect(getByText('chocolate')).toBeTruthy();
      expect(getByText('quick')).toBeTruthy();
      
      // Should not show remaining tags
      expect(queryByText('healthy')).toBeNull();
      expect(queryByText('vegetarian')).toBeNull();
      expect(queryByText('spicy')).toBeNull();
      
      // Should show count indicator
      expect(getByText('+3 more')).toBeTruthy();
    });

    it('should use default maxDisplayTags when not specified', () => {
      const selectedTags = Array.from({ length: 10 }, (_, i) => `tag${i}`);
      const { getByText } = render(
        <TagSelector {...defaultProps} selectedTags={selectedTags} />
      );
      
      // Should show count indicator for overflow
      expect(getByText(/\+.*more/)).toBeTruthy();
    });
  });

  describe('Empty States', () => {
    it('should handle empty selectedTags array', () => {
      const { queryByText } = render(
        <TagSelector {...defaultProps} selectedTags={[]} />
      );
      
      // Should not show any selected tags
      expect(queryByText('dessert')).toBeNull();
      expect(queryByText('chocolate')).toBeNull();
    });

    it('should handle empty availableTags array', () => {
      const { getByText } = render(
        <TagSelector {...defaultProps} availableTags={[]} />
      );
      
      // Should still render the component
      expect(getByText('No tags available')).toBeTruthy();
    });

    it('should handle undefined availableTags', () => {
      const { getByText } = render(
        <TagSelector {...defaultProps} availableTags={undefined} />
      );
      
      // Should still render the component
      expect(getByText('No tags available')).toBeTruthy();
    });
  });

  describe('Tag Colors', () => {
    it('should display tags with their assigned colors', () => {
      const { getByText } = render(<TagSelector {...defaultProps} />);
      
      const dessertTag = getByText('dessert');
      const chocolateTag = getByText('chocolate');
      
      // Tags should be rendered (color testing would require style inspection)
      expect(dessertTag).toBeTruthy();
      expect(chocolateTag).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility properties for tag buttons', () => {
      const { getByText } = render(<TagSelector {...defaultProps} />);
      
      const dessertTag = getByText('dessert');
      expect(dessertTag.props.accessibilityRole).toBe('button');
      expect(dessertTag.props.accessibilityLabel).toBe('Select dessert tag');
    });

    it('should indicate selected state in accessibility properties', () => {
      const { getByText } = render(
        <TagSelector {...defaultProps} selectedTags={['dessert']} />
      );
      
      const dessertTag = getByText('dessert');
      expect(dessertTag.props.accessibilityState).toEqual({ selected: true });
    });

    it('should have proper accessibility properties for count indicator', () => {
      const selectedTags = ['dessert', 'chocolate', 'quick', 'healthy', 'vegetarian'];
      const { getByText } = render(
        <TagSelector {...defaultProps} selectedTags={selectedTags} maxDisplayTags={3} />
      );
      
      const countIndicator = getByText('+2 more');
      expect(countIndicator.props.accessibilityLabel).toBe('2 more tags selected');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined onTagChange gracefully', () => {
      const { getByText } = render(
        <TagSelector 
          {...defaultProps} 
          onTagChange={undefined as any} 
        />
      );
      
      const dessertTag = getByText('dessert');
      expect(() => {
        fireEvent.press(dessertTag);
      }).not.toThrow();
    });

    it('should handle duplicate tags in selectedTags', () => {
      const selectedTags = ['dessert', 'dessert', 'chocolate'];
      const { getByText } = render(
        <TagSelector {...defaultProps} selectedTags={selectedTags} />
      );
      
      // Should handle gracefully
      expect(getByText('dessert')).toBeTruthy();
      expect(getByText('chocolate')).toBeTruthy();
    });

    it('should handle very long tag names', () => {
      const longTagName = 'very-long-tag-name-that-might-cause-layout-issues';
      const longTags = [{ id: '1', name: longTagName, color: '#FF6B6B' }];
      const { getByText } = render(
        <TagSelector {...defaultProps} availableTags={longTags} />
      );
      
      expect(getByText(longTagName)).toBeTruthy();
    });

    it('should handle special characters in tag names', () => {
      const specialTags = [
        { id: '1', name: 'tag-with-hyphens', color: '#FF6B6B' },
        { id: '2', name: 'tag_with_underscores', color: '#8B4513' },
        { id: '3', name: 'tag.with.dots', color: '#32CD32' },
      ];
      const { getByText } = render(
        <TagSelector {...defaultProps} availableTags={specialTags} />
      );
      
      expect(getByText('tag-with-hyphens')).toBeTruthy();
      expect(getByText('tag_with_underscores')).toBeTruthy();
      expect(getByText('tag.with.dots')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should render efficiently with many available tags', () => {
      const manyTags = Array.from({ length: 100 }, (_, i) => ({
        id: i.toString(),
        name: `tag${i}`,
        color: '#FF6B6B',
      }));
      
      const startTime = Date.now();
      render(<TagSelector {...defaultProps} availableTags={manyTags} />);
      const endTime = Date.now();
      
      // Should render quickly (less than 200ms)
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('should handle re-renders efficiently', () => {
      const { rerender } = render(<TagSelector {...defaultProps} />);
      
      const startTime = Date.now();
      rerender(<TagSelector {...defaultProps} selectedTags={['dessert']} />);
      const endTime = Date.now();
      
      // Should re-render quickly
      expect(endTime - startTime).toBeLessThan(50);
    });
  });
});
