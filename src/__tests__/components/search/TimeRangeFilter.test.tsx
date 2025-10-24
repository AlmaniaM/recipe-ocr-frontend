import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TimeRangeFilter } from '../../../components/search/TimeRangeFilter';

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

describe('TimeRangeFilter Component', () => {
  const defaultProps = {
    minPrepTime: undefined,
    maxPrepTime: undefined,
    minCookTime: undefined,
    maxCookTime: undefined,
    onTimeRangeChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      expect(() => {
        render(<TimeRangeFilter {...defaultProps} />);
      }).not.toThrow();
    });

    it('should render prep time input fields', () => {
      const { getByPlaceholderText } = render(<TimeRangeFilter {...defaultProps} />);
      
      expect(getByPlaceholderText('Min prep time (min)')).toBeTruthy();
      expect(getByPlaceholderText('Max prep time (min)')).toBeTruthy();
    });

    it('should render cook time input fields', () => {
      const { getByPlaceholderText } = render(<TimeRangeFilter {...defaultProps} />);
      
      expect(getByPlaceholderText('Min cook time (min)')).toBeTruthy();
      expect(getByPlaceholderText('Max cook time (min)')).toBeTruthy();
    });

    it('should display current values in input fields', () => {
      const props = {
        ...defaultProps,
        minPrepTime: 10,
        maxPrepTime: 30,
        minCookTime: 15,
        maxCookTime: 45,
      };
      const { getByDisplayValue } = render(<TimeRangeFilter {...props} />);
      
      expect(getByDisplayValue('10')).toBeTruthy();
      expect(getByDisplayValue('30')).toBeTruthy();
      expect(getByDisplayValue('15')).toBeTruthy();
      expect(getByDisplayValue('45')).toBeTruthy();
    });

    it('should show empty values when no time ranges are set', () => {
      const { getByPlaceholderText } = render(<TimeRangeFilter {...defaultProps} />);
      
      const minPrepInput = getByPlaceholderText('Min prep time (min)');
      const maxPrepInput = getByPlaceholderText('Max prep time (min)');
      const minCookInput = getByPlaceholderText('Min cook time (min)');
      const maxCookInput = getByPlaceholderText('Max cook time (min)');
      
      expect(minPrepInput.props.value).toBe('');
      expect(maxPrepInput.props.value).toBe('');
      expect(minCookInput.props.value).toBe('');
      expect(maxCookInput.props.value).toBe('');
    });
  });

  describe('Input Handling', () => {
    it('should call onTimeRangeChange when prep time values change', async () => {
      const { getByPlaceholderText } = render(<TimeRangeFilter {...defaultProps} />);
      
      const minPrepInput = getByPlaceholderText('Min prep time (min)');
      const maxPrepInput = getByPlaceholderText('Max prep time (min)');
      
      fireEvent.changeText(minPrepInput, '10');
      fireEvent.changeText(maxPrepInput, '30');
      
      await waitFor(() => {
        expect(defaultProps.onTimeRangeChange).toHaveBeenCalledWith({
          minPrepTime: 10,
          maxPrepTime: 30,
        });
      });
    });

    it('should call onTimeRangeChange when cook time values change', async () => {
      const { getByPlaceholderText } = render(<TimeRangeFilter {...defaultProps} />);
      
      const minCookInput = getByPlaceholderText('Min cook time (min)');
      const maxCookInput = getByPlaceholderText('Max cook time (min)');
      
      fireEvent.changeText(minCookInput, '15');
      fireEvent.changeText(maxCookInput, '45');
      
      await waitFor(() => {
        expect(defaultProps.onTimeRangeChange).toHaveBeenCalledWith({
          minCookTime: 15,
          maxCookTime: 45,
        });
      });
    });

    it('should call onTimeRangeChange when both prep and cook times change', async () => {
      const { getByPlaceholderText } = render(<TimeRangeFilter {...defaultProps} />);
      
      const minPrepInput = getByPlaceholderText('Min prep time (min)');
      const maxPrepInput = getByPlaceholderText('Max prep time (min)');
      const minCookInput = getByPlaceholderText('Min cook time (min)');
      const maxCookInput = getByPlaceholderText('Max cook time (min)');
      
      fireEvent.changeText(minPrepInput, '5');
      fireEvent.changeText(maxPrepInput, '20');
      fireEvent.changeText(minCookInput, '10');
      fireEvent.changeText(maxCookInput, '30');
      
      await waitFor(() => {
        expect(defaultProps.onTimeRangeChange).toHaveBeenCalledWith({
          minPrepTime: 5,
          maxPrepTime: 20,
          minCookTime: 10,
          maxCookTime: 30,
        });
      });
    });

    it('should handle empty input values', async () => {
      const { getByPlaceholderText } = render(<TimeRangeFilter {...defaultProps} />);
      
      const minPrepInput = getByPlaceholderText('Min prep time (min)');
      fireEvent.changeText(minPrepInput, '');
      
      await waitFor(() => {
        expect(defaultProps.onTimeRangeChange).toHaveBeenCalledWith({
          minPrepTime: undefined,
        });
      });
    });
  });

  describe('Clear Buttons', () => {
    it('should render clear buttons for each input field', () => {
      const { getByTestId } = render(<TimeRangeFilter {...defaultProps} />);
      
      expect(getByTestId('clear-min-prep')).toBeTruthy();
      expect(getByTestId('clear-max-prep')).toBeTruthy();
      expect(getByTestId('clear-min-cook')).toBeTruthy();
      expect(getByTestId('clear-max-cook')).toBeTruthy();
    });

    it('should clear min prep time when clear button is pressed', async () => {
      const { getByTestId } = render(
        <TimeRangeFilter {...defaultProps} minPrepTime={10} />
      );
      
      const clearButton = getByTestId('clear-min-prep');
      fireEvent.press(clearButton);
      
      await waitFor(() => {
        expect(defaultProps.onTimeRangeChange).toHaveBeenCalledWith({
          minPrepTime: undefined,
        });
      });
    });

    it('should clear max prep time when clear button is pressed', async () => {
      const { getByTestId } = render(
        <TimeRangeFilter {...defaultProps} maxPrepTime={30} />
      );
      
      const clearButton = getByTestId('clear-max-prep');
      fireEvent.press(clearButton);
      
      await waitFor(() => {
        expect(defaultProps.onTimeRangeChange).toHaveBeenCalledWith({
          maxPrepTime: undefined,
        });
      });
    });

    it('should clear min cook time when clear button is pressed', async () => {
      const { getByTestId } = render(
        <TimeRangeFilter {...defaultProps} minCookTime={15} />
      );
      
      const clearButton = getByTestId('clear-min-cook');
      fireEvent.press(clearButton);
      
      await waitFor(() => {
        expect(defaultProps.onTimeRangeChange).toHaveBeenCalledWith({
          minCookTime: undefined,
        });
      });
    });

    it('should clear max cook time when clear button is pressed', async () => {
      const { getByTestId } = render(
        <TimeRangeFilter {...defaultProps} maxCookTime={45} />
      );
      
      const clearButton = getByTestId('clear-max-cook');
      fireEvent.press(clearButton);
      
      await waitFor(() => {
        expect(defaultProps.onTimeRangeChange).toHaveBeenCalledWith({
          maxCookTime: undefined,
        });
      });
    });
  });

  describe('Input Validation', () => {
    it('should only accept numeric input for time fields', () => {
      const { getByPlaceholderText } = render(<TimeRangeFilter {...defaultProps} />);
      
      const minPrepInput = getByPlaceholderText('Min prep time (min)');
      
      // Test non-numeric input
      fireEvent.changeText(minPrepInput, 'abc');
      expect(minPrepInput.props.value).toBe('');
      
      // Test numeric input
      fireEvent.changeText(minPrepInput, '123');
      expect(minPrepInput.props.value).toBe('123');
    });

    it('should handle negative numbers', () => {
      const { getByPlaceholderText } = render(<TimeRangeFilter {...defaultProps} />);
      
      const minPrepInput = getByPlaceholderText('Min prep time (min)');
      fireEvent.changeText(minPrepInput, '-10');
      
      // Should accept negative numbers (validation would be handled by parent)
      expect(minPrepInput.props.value).toBe('-10');
    });

    it('should handle decimal numbers', () => {
      const { getByPlaceholderText } = render(<TimeRangeFilter {...defaultProps} />);
      
      const minPrepInput = getByPlaceholderText('Min prep time (min)');
      fireEvent.changeText(minPrepInput, '10.5');
      
      expect(minPrepInput.props.value).toBe('10.5');
    });

    it('should handle very large numbers', () => {
      const { getByPlaceholderText } = render(<TimeRangeFilter {...defaultProps} />);
      
      const minPrepInput = getByPlaceholderText('Min prep time (min)');
      fireEvent.changeText(minPrepInput, '999999');
      
      expect(minPrepInput.props.value).toBe('999999');
    });
  });

  describe('Keyboard Type', () => {
    it('should use numeric keyboard for all input fields', () => {
      const { getByPlaceholderText } = render(<TimeRangeFilter {...defaultProps} />);
      
      const minPrepInput = getByPlaceholderText('Min prep time (min)');
      const maxPrepInput = getByPlaceholderText('Max prep time (min)');
      const minCookInput = getByPlaceholderText('Min cook time (min)');
      const maxCookInput = getByPlaceholderText('Max cook time (min)');
      
      expect(minPrepInput.props.keyboardType).toBe('numeric');
      expect(maxPrepInput.props.keyboardType).toBe('numeric');
      expect(minCookInput.props.keyboardType).toBe('numeric');
      expect(maxCookInput.props.keyboardType).toBe('numeric');
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility properties for input fields', () => {
      const { getByPlaceholderText } = render(<TimeRangeFilter {...defaultProps} />);
      
      const minPrepInput = getByPlaceholderText('Min prep time (min)');
      const maxPrepInput = getByPlaceholderText('Max prep time (min)');
      const minCookInput = getByPlaceholderText('Min cook time (min)');
      const maxCookInput = getByPlaceholderText('Max cook time (min)');
      
      expect(minPrepInput.props.accessibilityLabel).toBe('Minimum prep time in minutes');
      expect(maxPrepInput.props.accessibilityLabel).toBe('Maximum prep time in minutes');
      expect(minCookInput.props.accessibilityLabel).toBe('Minimum cook time in minutes');
      expect(maxCookInput.props.accessibilityLabel).toBe('Maximum cook time in minutes');
    });

    it('should have proper accessibility properties for clear buttons', () => {
      const { getByTestId } = render(<TimeRangeFilter {...defaultProps} />);
      
      const clearMinPrep = getByTestId('clear-min-prep');
      const clearMaxPrep = getByTestId('clear-max-prep');
      const clearMinCook = getByTestId('clear-min-cook');
      const clearMaxCook = getByTestId('clear-max-cook');
      
      expect(clearMinPrep.props.accessibilityLabel).toBe('Clear minimum prep time');
      expect(clearMaxPrep.props.accessibilityLabel).toBe('Clear maximum prep time');
      expect(clearMinCook.props.accessibilityLabel).toBe('Clear minimum cook time');
      expect(clearMaxCook.props.accessibilityLabel).toBe('Clear maximum cook time');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined onTimeRangeChange gracefully', () => {
      const { getByPlaceholderText } = render(
        <TimeRangeFilter 
          {...defaultProps} 
          onTimeRangeChange={undefined as any} 
        />
      );
      
      const minPrepInput = getByPlaceholderText('Min prep time (min)');
      
      expect(() => {
        fireEvent.changeText(minPrepInput, '10');
      }).not.toThrow();
    });

    it('should handle rapid input changes', async () => {
      const { getByPlaceholderText } = render(<TimeRangeFilter {...defaultProps} />);
      
      const minPrepInput = getByPlaceholderText('Min prep time (min)');
      
      // Rapidly change input
      fireEvent.changeText(minPrepInput, '1');
      fireEvent.changeText(minPrepInput, '12');
      fireEvent.changeText(minPrepInput, '123');
      
      await waitFor(() => {
        expect(defaultProps.onTimeRangeChange).toHaveBeenCalled();
      });
    });

    it('should handle very long input strings', () => {
      const { getByPlaceholderText } = render(<TimeRangeFilter {...defaultProps} />);
      
      const minPrepInput = getByPlaceholderText('Min prep time (min)');
      const longNumber = '12345678901234567890';
      
      fireEvent.changeText(minPrepInput, longNumber);
      expect(minPrepInput.props.value).toBe(longNumber);
    });

    it('should handle special characters in input', () => {
      const { getByPlaceholderText } = render(<TimeRangeFilter {...defaultProps} />);
      
      const minPrepInput = getByPlaceholderText('Min prep time (min)');
      
      // Test various special characters
      fireEvent.changeText(minPrepInput, '10@#$%');
      expect(minPrepInput.props.value).toBe('10@#$%');
    });
  });

  describe('Performance', () => {
    it('should render efficiently', () => {
      const startTime = Date.now();
      render(<TimeRangeFilter {...defaultProps} />);
      const endTime = Date.now();
      
      // Should render quickly (less than 50ms)
      expect(endTime - startTime).toBeLessThan(50);
    });

    it('should handle re-renders efficiently', () => {
      const { rerender } = render(<TimeRangeFilter {...defaultProps} />);
      
      const startTime = Date.now();
      rerender(<TimeRangeFilter {...defaultProps} minPrepTime={10} />);
      const endTime = Date.now();
      
      // Should re-render quickly
      expect(endTime - startTime).toBeLessThan(30);
    });
  });

  describe('Component Integration', () => {
    it('should work with all time values set', () => {
      const props = {
        ...defaultProps,
        minPrepTime: 5,
        maxPrepTime: 20,
        minCookTime: 10,
        maxCookTime: 30,
      };
      
      const { getByDisplayValue } = render(<TimeRangeFilter {...props} />);
      
      expect(getByDisplayValue('5')).toBeTruthy();
      expect(getByDisplayValue('20')).toBeTruthy();
      expect(getByDisplayValue('10')).toBeTruthy();
      expect(getByDisplayValue('30')).toBeTruthy();
    });

    it('should work with partial time values set', () => {
      const props = {
        ...defaultProps,
        minPrepTime: 10,
        maxCookTime: 45,
      };
      
      const { getByDisplayValue, getByPlaceholderText } = render(<TimeRangeFilter {...props} />);
      
      expect(getByDisplayValue('10')).toBeTruthy();
      expect(getByDisplayValue('45')).toBeTruthy();
      expect(getByPlaceholderText('Max prep time (min)').props.value).toBe('');
      expect(getByPlaceholderText('Min cook time (min)').props.value).toBe('');
    });
  });
});
