import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SearchBar } from '../../../components/search/SearchBar';

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
      },
    },
  }),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock StyleSheet.create
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    StyleSheet: {
      ...RN.StyleSheet,
      create: jest.fn((styles) => styles),
    },
  };
});

describe('SearchBar Component', () => {
  const defaultProps = {
    value: '',
    onChangeText: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      expect(() => {
        render(<SearchBar {...defaultProps} />);
      }).not.toThrow();
    });

    it('should render with default placeholder', () => {
      const { getByPlaceholderText } = render(<SearchBar {...defaultProps} />);
      expect(getByPlaceholderText('Search recipes...')).toBeTruthy();
    });

    it('should render with custom placeholder', () => {
      const customPlaceholder = 'Custom search placeholder';
      const { getByPlaceholderText } = render(
        <SearchBar {...defaultProps} placeholder={customPlaceholder} />
      );
      expect(getByPlaceholderText(customPlaceholder)).toBeTruthy();
    });

    it('should display the initial value', () => {
      const initialValue = 'chocolate cake';
      const { getByDisplayValue } = render(
        <SearchBar {...defaultProps} value={initialValue} />
      );
      expect(getByDisplayValue(initialValue)).toBeTruthy();
    });
  });

  describe('Text Input Handling', () => {
    it('should call onChangeText when text is entered', async () => {
      const mockOnChangeText = jest.fn();
      const { getByPlaceholderText } = render(
        <SearchBar {...defaultProps} onChangeText={mockOnChangeText} />
      );

      const input = getByPlaceholderText('Search recipes...');
      fireEvent.changeText(input, 'chocolate');

      // Fast-forward timers to trigger debounced onChangeText
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockOnChangeText).toHaveBeenCalledWith('chocolate');
      });
    });

    it('should debounce text input changes', async () => {
      const mockOnChangeText = jest.fn();
      const { getByPlaceholderText } = render(
        <SearchBar {...defaultProps} onChangeText={mockOnChangeText} />
      );

      const input = getByPlaceholderText('Search recipes...');
      
      // Type multiple characters quickly
      fireEvent.changeText(input, 'c');
      fireEvent.changeText(input, 'ch');
      fireEvent.changeText(input, 'cho');
      fireEvent.changeText(input, 'choc');

      // Only advance timer once to trigger debounced call
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockOnChangeText).toHaveBeenCalledTimes(1);
        expect(mockOnChangeText).toHaveBeenCalledWith('choc');
      });
    });

    it('should update input value when value prop changes', () => {
      const { getByDisplayValue, rerender } = render(
        <SearchBar {...defaultProps} value="initial" />
      );

      expect(getByDisplayValue('initial')).toBeTruthy();

      rerender(<SearchBar {...defaultProps} value="updated" />);
      expect(getByDisplayValue('updated')).toBeTruthy();
    });

    it('should handle empty text input', async () => {
      const mockOnChangeText = jest.fn();
      const { getByPlaceholderText } = render(
        <SearchBar {...defaultProps} onChangeText={mockOnChangeText} />
      );

      const input = getByPlaceholderText('Search recipes...');
      fireEvent.changeText(input, '');

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockOnChangeText).toHaveBeenCalledWith('');
      });
    });
  });

  describe('Clear Button', () => {
    it('should show clear button when there is text', () => {
      const { getByTestId } = render(
        <SearchBar {...defaultProps} value="chocolate" />
      );
      expect(getByTestId('clear-button')).toBeTruthy();
    });

    it('should hide clear button when there is no text', () => {
      const { queryByTestId } = render(
        <SearchBar {...defaultProps} value="" />
      );
      expect(queryByTestId('clear-button')).toBeNull();
    });

    it('should clear text when clear button is pressed', async () => {
      const mockOnChangeText = jest.fn();
      const mockOnClear = jest.fn();
      const { getByTestId } = render(
        <SearchBar 
          {...defaultProps} 
          value="chocolate" 
          onChangeText={mockOnChangeText}
          onClear={mockOnClear}
        />
      );

      const clearButton = getByTestId('clear-button');
      fireEvent.press(clearButton);

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockOnChangeText).toHaveBeenCalledWith('');
        expect(mockOnClear).toHaveBeenCalled();
      });
    });

    it('should work without onClear callback', async () => {
      const mockOnChangeText = jest.fn();
      const { getByTestId } = render(
        <SearchBar 
          {...defaultProps} 
          value="chocolate" 
          onChangeText={mockOnChangeText}
        />
      );

      const clearButton = getByTestId('clear-button');
      
      expect(() => {
        fireEvent.press(clearButton);
      }).not.toThrow();

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockOnChangeText).toHaveBeenCalledWith('');
      });
    });
  });

  describe('Filter Button', () => {
    it('should show filter button by default', () => {
      const { getByTestId } = render(<SearchBar {...defaultProps} />);
      expect(getByTestId('filter-button')).toBeTruthy();
    });

    it('should hide filter button when showFilterButton is false', () => {
      const { queryByTestId } = render(
        <SearchBar {...defaultProps} showFilterButton={false} />
      );
      expect(queryByTestId('filter-button')).toBeNull();
    });

    it('should call onFilterPress when filter button is pressed', () => {
      const mockOnFilterPress = jest.fn();
      const { getByTestId } = render(
        <SearchBar {...defaultProps} onFilterPress={mockOnFilterPress} />
      );

      const filterButton = getByTestId('filter-button');
      fireEvent.press(filterButton);

      expect(mockOnFilterPress).toHaveBeenCalled();
    });

    it('should work without onFilterPress callback', () => {
      const { getByTestId } = render(<SearchBar {...defaultProps} />);

      const filterButton = getByTestId('filter-button');
      
      expect(() => {
        fireEvent.press(filterButton);
      }).not.toThrow();
    });

    it('should show active state when isFilterActive is true', () => {
      const { getByTestId } = render(
        <SearchBar {...defaultProps} isFilterActive={true} />
      );

      const filterButton = getByTestId('filter-button');
      expect(filterButton.props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: '#007AFF' })
      );
    });

    it('should show inactive state when isFilterActive is false', () => {
      const { getByTestId } = render(
        <SearchBar {...defaultProps} isFilterActive={false} />
      );

      const filterButton = getByTestId('filter-button');
      expect(filterButton.props.style).not.toContainEqual(
        expect.objectContaining({ backgroundColor: '#007AFF' })
      );
    });
  });

  describe('Input Properties', () => {
    it('should have correct keyboard type', () => {
      const { getByPlaceholderText } = render(<SearchBar {...defaultProps} />);
      const input = getByPlaceholderText('Search recipes...');
      expect(input.props.returnKeyType).toBe('search');
    });

    it('should have correct auto correct settings', () => {
      const { getByPlaceholderText } = render(<SearchBar {...defaultProps} />);
      const input = getByPlaceholderText('Search recipes...');
      expect(input.props.autoCorrect).toBe(false);
      expect(input.props.autoCapitalize).toBe('none');
    });
  });

  describe('Debouncing Behavior', () => {
    it('should cancel previous debounced calls when new input is entered', async () => {
      const mockOnChangeText = jest.fn();
      const { getByPlaceholderText } = render(
        <SearchBar {...defaultProps} onChangeText={mockOnChangeText} />
      );

      const input = getByPlaceholderText('Search recipes...');
      
      // Type first character
      fireEvent.changeText(input, 'c');
      jest.advanceTimersByTime(100);
      
      // Type second character before first debounce completes
      fireEvent.changeText(input, 'ch');
      jest.advanceTimersByTime(100);
      
      // Type third character before second debounce completes
      fireEvent.changeText(input, 'cho');
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockOnChangeText).toHaveBeenCalledTimes(1);
        expect(mockOnChangeText).toHaveBeenCalledWith('cho');
      });
    });

    it('should not call onChangeText if input value matches current value', async () => {
      const mockOnChangeText = jest.fn();
      const { getByPlaceholderText } = render(
        <SearchBar {...defaultProps} value="chocolate" onChangeText={mockOnChangeText} />
      );

      const input = getByPlaceholderText('Search recipes...');
      
      // Set the same value that's already in the input
      fireEvent.changeText(input, 'chocolate');
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockOnChangeText).not.toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility properties', () => {
      const { getByPlaceholderText } = render(<SearchBar {...defaultProps} />);
      const input = getByPlaceholderText('Search recipes...');
      
      expect(input.props.placeholder).toBe('Search recipes...');
      expect(input.props.returnKeyType).toBe('search');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined onChangeText', () => {
      expect(() => {
        render(<SearchBar value="" onChangeText={undefined as any} />);
      }).not.toThrow();
    });

    it('should handle very long text input', async () => {
      const mockOnChangeText = jest.fn();
      const longText = 'a'.repeat(1000);
      const { getByPlaceholderText } = render(
        <SearchBar {...defaultProps} onChangeText={mockOnChangeText} />
      );

      const input = getByPlaceholderText('Search recipes...');
      fireEvent.changeText(input, longText);

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockOnChangeText).toHaveBeenCalledWith(longText);
      });
    });

    it('should handle special characters in input', async () => {
      const mockOnChangeText = jest.fn();
      const specialText = 'chocolate@#$%^&*()_+{}|:"<>?[]\\;\'.,/';
      const { getByPlaceholderText } = render(
        <SearchBar {...defaultProps} onChangeText={mockOnChangeText} />
      );

      const input = getByPlaceholderText('Search recipes...');
      fireEvent.changeText(input, specialText);

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockOnChangeText).toHaveBeenCalledWith(specialText);
      });
    });
  });
});
