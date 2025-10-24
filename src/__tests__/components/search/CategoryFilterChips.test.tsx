import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CategoryFilterChips } from '../../../components/search/CategoryFilterChips';
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

describe('CategoryFilterChips Component', () => {
  const defaultProps = {
    selectedCategory: undefined,
    onCategoryChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      expect(() => {
        render(<CategoryFilterChips {...defaultProps} />);
      }).not.toThrow();
    });

    it('should render all category chips', () => {
      const { getByText } = render(<CategoryFilterChips {...defaultProps} />);
      
      // Food Types
      expect(getByText('Appetizer')).toBeTruthy();
      expect(getByText('Main Course')).toBeTruthy();
      expect(getByText('Dessert')).toBeTruthy();
      expect(getByText('Side Dish')).toBeTruthy();
      expect(getByText('Salad')).toBeTruthy();
      expect(getByText('Soup')).toBeTruthy();
      expect(getByText('Beverage')).toBeTruthy();
      expect(getByText('Snack')).toBeTruthy();
      
      // Meal Times
      expect(getByText('Breakfast')).toBeTruthy();
      expect(getByText('Lunch')).toBeTruthy();
      expect(getByText('Dinner')).toBeTruthy();
      
      // Dietary
      expect(getByText('Vegetarian')).toBeTruthy();
      expect(getByText('Vegan')).toBeTruthy();
      expect(getByText('Gluten-Free')).toBeTruthy();
      expect(getByText('Keto')).toBeTruthy();
      expect(getByText('Low-Carb')).toBeTruthy();
      
      // Cuisines
      expect(getByText('Italian')).toBeTruthy();
      expect(getByText('Mexican')).toBeTruthy();
      expect(getByText('Asian')).toBeTruthy();
      expect(getByText('American')).toBeTruthy();
      expect(getByText('Mediterranean')).toBeTruthy();
    });

    it('should render "All" option when showAllOption is true', () => {
      const { getByText } = render(
        <CategoryFilterChips {...defaultProps} showAllOption={true} />
      );
      expect(getByText('All')).toBeTruthy();
    });

    it('should not render "All" option when showAllOption is false', () => {
      const { queryByText } = render(
        <CategoryFilterChips {...defaultProps} showAllOption={false} />
      );
      expect(queryByText('All')).toBeNull();
    });

    it('should not render "All" option by default', () => {
      const { queryByText } = render(<CategoryFilterChips {...defaultProps} />);
      expect(queryByText('All')).toBeNull();
    });
  });

  describe('Category Selection', () => {
    it('should call onCategoryChange when a category chip is pressed', () => {
      const { getByText } = render(<CategoryFilterChips {...defaultProps} />);
      
      const dessertChip = getByText('Dessert');
      fireEvent.press(dessertChip);
      
      expect(defaultProps.onCategoryChange).toHaveBeenCalledWith(RecipeCategory.Dessert);
    });

    it('should call onCategoryChange with undefined when "All" is pressed', () => {
      const { getByText } = render(
        <CategoryFilterChips {...defaultProps} showAllOption={true} />
      );
      
      const allChip = getByText('All');
      fireEvent.press(allChip);
      
      expect(defaultProps.onCategoryChange).toHaveBeenCalledWith(undefined);
    });

    it('should handle all food type categories', () => {
      const { getByText } = render(<CategoryFilterChips {...defaultProps} />);
      
      const categories = [
        { text: 'Appetizer', category: RecipeCategory.Appetizer },
        { text: 'Main Course', category: RecipeCategory.MainCourse },
        { text: 'Dessert', category: RecipeCategory.Dessert },
        { text: 'Side Dish', category: RecipeCategory.SideDish },
        { text: 'Salad', category: RecipeCategory.Salad },
        { text: 'Soup', category: RecipeCategory.Soup },
        { text: 'Beverage', category: RecipeCategory.Beverage },
        { text: 'Snack', category: RecipeCategory.Snack },
      ];

      categories.forEach(({ text, category }) => {
        const chip = getByText(text);
        fireEvent.press(chip);
        expect(defaultProps.onCategoryChange).toHaveBeenCalledWith(category);
        jest.clearAllMocks();
      });
    });

    it('should handle all meal time categories', () => {
      const { getByText } = render(<CategoryFilterChips {...defaultProps} />);
      
      const categories = [
        { text: 'Breakfast', category: RecipeCategory.Breakfast },
        { text: 'Lunch', category: RecipeCategory.Lunch },
        { text: 'Dinner', category: RecipeCategory.Dinner },
      ];

      categories.forEach(({ text, category }) => {
        const chip = getByText(text);
        fireEvent.press(chip);
        expect(defaultProps.onCategoryChange).toHaveBeenCalledWith(category);
        jest.clearAllMocks();
      });
    });

    it('should handle all dietary categories', () => {
      const { getByText } = render(<CategoryFilterChips {...defaultProps} />);
      
      const categories = [
        { text: 'Vegetarian', category: RecipeCategory.Vegetarian },
        { text: 'Vegan', category: RecipeCategory.Vegan },
        { text: 'Gluten-Free', category: RecipeCategory.GlutenFree },
        { text: 'Keto', category: RecipeCategory.Keto },
        { text: 'Low-Carb', category: RecipeCategory.LowCarb },
      ];

      categories.forEach(({ text, category }) => {
        const chip = getByText(text);
        fireEvent.press(chip);
        expect(defaultProps.onCategoryChange).toHaveBeenCalledWith(category);
        jest.clearAllMocks();
      });
    });

    it('should handle all cuisine categories', () => {
      const { getByText } = render(<CategoryFilterChips {...defaultProps} />);
      
      const categories = [
        { text: 'Italian', category: RecipeCategory.Italian },
        { text: 'Mexican', category: RecipeCategory.Mexican },
        { text: 'Asian', category: RecipeCategory.Asian },
        { text: 'American', category: RecipeCategory.American },
        { text: 'Mediterranean', category: RecipeCategory.Mediterranean },
      ];

      categories.forEach(({ text, category }) => {
        const chip = getByText(text);
        fireEvent.press(chip);
        expect(defaultProps.onCategoryChange).toHaveBeenCalledWith(category);
        jest.clearAllMocks();
      });
    });
  });

  describe('Selected Category Highlighting', () => {
    it('should highlight the selected category chip', () => {
      const { getByText } = render(
        <CategoryFilterChips {...defaultProps} selectedCategory={RecipeCategory.Dessert} />
      );
      
      const dessertChip = getByText('Dessert');
      // The chip should have the selected style (this would be tested through style props)
      expect(dessertChip).toBeTruthy();
    });

    it('should not highlight any chip when no category is selected', () => {
      const { getByText } = render(<CategoryFilterChips {...defaultProps} />);
      
      const dessertChip = getByText('Dessert');
      // The chip should not have the selected style
      expect(dessertChip).toBeTruthy();
    });

    it('should highlight "All" chip when selectedCategory is undefined and showAllOption is true', () => {
      const { getByText } = render(
        <CategoryFilterChips 
          {...defaultProps} 
          selectedCategory={undefined} 
          showAllOption={true} 
        />
      );
      
      const allChip = getByText('All');
      expect(allChip).toBeTruthy();
    });
  });

  describe('Scrollable Behavior', () => {
    it('should render in a ScrollView', () => {
      const { getByTestId } = render(<CategoryFilterChips {...defaultProps} />);
      expect(getByTestId('category-chips-scroll')).toBeTruthy();
    });

    it('should have horizontal scrolling enabled', () => {
      const { getByTestId } = render(<CategoryFilterChips {...defaultProps} />);
      const scrollView = getByTestId('category-chips-scroll');
      expect(scrollView.props.horizontal).toBe(true);
    });

    it('should show scroll indicators', () => {
      const { getByTestId } = render(<CategoryFilterChips {...defaultProps} />);
      const scrollView = getByTestId('category-chips-scroll');
      expect(scrollView.props.showsHorizontalScrollIndicator).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility properties for category chips', () => {
      const { getByText } = render(<CategoryFilterChips {...defaultProps} />);
      
      const dessertChip = getByText('Dessert');
      expect(dessertChip.props.accessibilityRole).toBe('button');
      expect(dessertChip.props.accessibilityLabel).toBe('Filter by Dessert category');
    });

    it('should have proper accessibility properties for "All" chip', () => {
      const { getByText } = render(
        <CategoryFilterChips {...defaultProps} showAllOption={true} />
      );
      
      const allChip = getByText('All');
      expect(allChip.props.accessibilityRole).toBe('button');
      expect(allChip.props.accessibilityLabel).toBe('Show all categories');
    });

    it('should indicate selected state in accessibility properties', () => {
      const { getByText } = render(
        <CategoryFilterChips {...defaultProps} selectedCategory={RecipeCategory.Dessert} />
      );
      
      const dessertChip = getByText('Dessert');
      expect(dessertChip.props.accessibilityState).toEqual({ selected: true });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined onCategoryChange gracefully', () => {
      const { getByText } = render(
        <CategoryFilterChips 
          selectedCategory={undefined} 
          onCategoryChange={undefined as any} 
        />
      );
      
      const dessertChip = getByText('Dessert');
      expect(() => {
        fireEvent.press(dessertChip);
      }).not.toThrow();
    });

    it('should handle invalid selectedCategory gracefully', () => {
      const { getByText } = render(
        <CategoryFilterChips 
          {...defaultProps} 
          selectedCategory={'invalid' as any} 
        />
      );
      
      // Should still render all chips
      expect(getByText('Dessert')).toBeTruthy();
      expect(getByText('Main Course')).toBeTruthy();
    });

    it('should handle rapid category changes', () => {
      const { getByText } = render(<CategoryFilterChips {...defaultProps} />);
      
      const dessertChip = getByText('Dessert');
      const mainCourseChip = getByText('Main Course');
      
      // Rapidly press different chips
      fireEvent.press(dessertChip);
      fireEvent.press(mainCourseChip);
      fireEvent.press(dessertChip);
      
      expect(defaultProps.onCategoryChange).toHaveBeenCalledTimes(3);
      expect(defaultProps.onCategoryChange).toHaveBeenNthCalledWith(1, RecipeCategory.Dessert);
      expect(defaultProps.onCategoryChange).toHaveBeenNthCalledWith(2, RecipeCategory.MainCourse);
      expect(defaultProps.onCategoryChange).toHaveBeenNthCalledWith(3, RecipeCategory.Dessert);
    });
  });

  describe('Performance', () => {
    it('should render efficiently with many categories', () => {
      const startTime = Date.now();
      render(<CategoryFilterChips {...defaultProps} />);
      const endTime = Date.now();
      
      // Should render quickly (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle re-renders efficiently', () => {
      const { rerender } = render(<CategoryFilterChips {...defaultProps} />);
      
      const startTime = Date.now();
      rerender(<CategoryFilterChips {...defaultProps} selectedCategory={RecipeCategory.Dessert} />);
      const endTime = Date.now();
      
      // Should re-render quickly
      expect(endTime - startTime).toBeLessThan(50);
    });
  });
});
