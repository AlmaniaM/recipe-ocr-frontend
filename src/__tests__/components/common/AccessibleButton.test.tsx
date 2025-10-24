import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AccessibleButton } from '../../../components/common/AccessibleButton';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock the theme context
const mockTheme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    surface: '#FFFFFF',
    background: '#F2F2F7',
    textPrimary: '#000000',
    textSecondary: '#8E8E93',
    border: '#C6C6C8',
    error: '#FF3B30',
  },
  typography: {
    headerFont: 'Inter-SemiBold',
    bodyFont: 'Inter-Regular',
    captionFont: 'Inter-Medium',
  },
};

// Mock the useTheme hook
jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({ theme: mockTheme }),
}));

// Mock the useAccessibility hook
const mockAnnounceForAccessibility = jest.fn();
jest.mock('../../../hooks/useAccessibility', () => ({
  useAccessibility: () => ({
    announceForAccessibility: mockAnnounceForAccessibility,
  }),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('AccessibleButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with title', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <AccessibleButton
        title="Test Button"
        onPress={mockOnPress}
        testID="test-button"
      />
    );

    expect(getByTestId('test-button')).toBeTruthy();
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleButton
        title="Test Button"
        onPress={mockOnPress}
        testID="test-button"
      />
    );

    const button = getByTestId('test-button');
    fireEvent.press(button);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('applies custom accessibility label', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleButton
        title="Test Button"
        onPress={mockOnPress}
        accessibilityLabel="Custom button label"
        testID="test-button"
      />
    );

    const button = getByTestId('test-button');
    expect(button).toHaveProp('accessibilityLabel', 'Custom button label');
  });

  it('applies custom accessibility hint', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleButton
        title="Test Button"
        onPress={mockOnPress}
        accessibilityHint="Custom button hint"
        testID="test-button"
      />
    );

    const button = getByTestId('test-button');
    expect(button).toHaveProp('accessibilityHint', 'Custom button hint');
  });

  it('has proper accessibility role', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleButton
        title="Test Button"
        onPress={mockOnPress}
        testID="test-button"
      />
    );

    const button = getByTestId('test-button');
    expect(button).toHaveProp('accessibilityRole', 'button');
  });

  it('handles disabled state', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleButton
        title="Test Button"
        onPress={mockOnPress}
        disabled={true}
        testID="test-button"
      />
    );

    const button = getByTestId('test-button');
    expect(button).toHaveProp('accessibilityState', { disabled: true });
  });

  it('handles loading state', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleButton
        title="Test Button"
        onPress={mockOnPress}
        loading={true}
        testID="test-button"
      />
    );

    const button = getByTestId('test-button');
    expect(button).toHaveProp('accessibilityState', { busy: true });
  });

  it('handles custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = renderWithTheme(
      <AccessibleButton
        title="Test Button"
        onPress={mockOnPress}
        style={customStyle}
        testID="test-button"
      />
    );

    const button = getByTestId('test-button');
    expect(button).toHaveStyle(customStyle);
  });

  it('handles custom testID', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleButton
        title="Test Button"
        onPress={mockOnPress}
        testID="custom-button"
      />
    );

    expect(getByTestId('custom-button')).toBeTruthy();
  });

  it('handles button without title', () => {
    const { getByTestId, queryByText } = renderWithTheme(
      <AccessibleButton
        onPress={mockOnPress}
        testID="test-button"
      />
    );

    expect(getByTestId('test-button')).toBeTruthy();
    expect(queryByText('Test Button')).toBeNull();
  });

  it('handles button with custom title', () => {
    const { getByText } = renderWithTheme(
      <AccessibleButton
        title="Custom Title"
        onPress={mockOnPress}
        testID="test-button"
      />
    );

    expect(getByText('Custom Title')).toBeTruthy();
  });

  it('handles button with custom onPress', () => {
    const customOnPress = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleButton
        title="Test Button"
        onPress={customOnPress}
        testID="test-button"
      />
    );

    const button = getByTestId('test-button');
    fireEvent.press(button);

    expect(customOnPress).toHaveBeenCalledTimes(1);
  });

  it('handles button with custom onPress and disabled', () => {
    const customOnPress = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleButton
        title="Test Button"
        onPress={customOnPress}
        disabled={true}
        testID="test-button"
      />
    );

    const button = getByTestId('test-button');
    fireEvent.press(button);

    expect(customOnPress).not.toHaveBeenCalled();
  });

  it('handles button with custom onPress and loading', () => {
    const customOnPress = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleButton
        title="Test Button"
        onPress={customOnPress}
        loading={true}
        testID="test-button"
      />
    );

    const button = getByTestId('test-button');
    fireEvent.press(button);

    expect(customOnPress).not.toHaveBeenCalled();
  });

  it('handles button with custom onPress and disabled and loading', () => {
    const customOnPress = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleButton
        title="Test Button"
        onPress={customOnPress}
        disabled={true}
        loading={true}
        testID="test-button"
      />
    );

    const button = getByTestId('test-button');
    fireEvent.press(button);

    expect(customOnPress).not.toHaveBeenCalled();
  });

  it('handles button with custom onPress and disabled and loading and custom style', () => {
    const customOnPress = jest.fn();
    const customStyle = { backgroundColor: 'blue' };
    const { getByTestId } = renderWithTheme(
      <AccessibleButton
        title="Test Button"
        onPress={customOnPress}
        disabled={true}
        loading={true}
        style={customStyle}
        testID="test-button"
      />
    );

    const button = getByTestId('test-button');
    fireEvent.press(button);

    expect(customOnPress).not.toHaveBeenCalled();
    expect(button).toHaveStyle(customStyle);
  });

  it('handles button with custom onPress and disabled and loading and custom style and custom testID', () => {
    const customOnPress = jest.fn();
    const customStyle = { backgroundColor: 'green' };
    const { getByTestId } = renderWithTheme(
      <AccessibleButton
        title="Test Button"
        onPress={customOnPress}
        disabled={true}
        loading={true}
        style={customStyle}
        testID="custom-button"
      />
    );

    const button = getByTestId('custom-button');
    fireEvent.press(button);

    expect(customOnPress).not.toHaveBeenCalled();
    expect(button).toHaveStyle(customStyle);
  });
});