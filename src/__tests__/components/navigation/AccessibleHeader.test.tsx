import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AccessibleHeader } from '../../../components/navigation/AccessibleHeader';
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

describe('AccessibleHeader', () => {
  const mockOnBackPress = jest.fn();
  const mockOnMenuPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with title', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <AccessibleHeader
        title="Test Header"
        testID="test-header"
      />
    );

    expect(getByTestId('test-header')).toBeTruthy();
    expect(getByText('Test Header')).toBeTruthy();
  });

  it('renders with subtitle when provided', () => {
    const { getByText } = renderWithTheme(
      <AccessibleHeader
        title="Test Header"
        subtitle="Test Subtitle"
        testID="test-header"
      />
    );

    expect(getByText('Test Subtitle')).toBeTruthy();
  });

  it('renders with back button when onBackPress is provided', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleHeader
        title="Test Header"
        onBackPress={mockOnBackPress}
        testID="test-header"
      />
    );

    expect(getByTestId('test-header-back')).toBeTruthy();
  });

  it('renders with menu button when onMenuPress is provided', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleHeader
        title="Test Header"
        onMenuPress={mockOnMenuPress}
        testID="test-header"
      />
    );

    expect(getByTestId('test-header-menu')).toBeTruthy();
  });

  it('calls onBackPress when back button is pressed', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleHeader
        title="Test Header"
        onBackPress={mockOnBackPress}
        testID="test-header"
      />
    );

    const backButton = getByTestId('test-header-back');
    fireEvent.press(backButton);

    expect(mockOnBackPress).toHaveBeenCalledTimes(1);
  });

  it('calls onMenuPress when menu button is pressed', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleHeader
        title="Test Header"
        onMenuPress={mockOnMenuPress}
        testID="test-header"
      />
    );

    const menuButton = getByTestId('test-header-menu');
    fireEvent.press(menuButton);

    expect(mockOnMenuPress).toHaveBeenCalledTimes(1);
  });

  it('applies custom accessibility label', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleHeader
        title="Test Header"
        accessibilityLabel="Custom header label"
        testID="test-header"
      />
    );

    const header = getByTestId('test-header');
    expect(header).toHaveProp('accessibilityLabel', 'Custom header label');
  });

  it('applies custom accessibility hint', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleHeader
        title="Test Header"
        accessibilityHint="Custom header hint"
        testID="test-header"
      />
    );

    const header = getByTestId('test-header');
    expect(header).toHaveProp('accessibilityHint', 'Custom header hint');
  });

  it('has proper accessibility role', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleHeader
        title="Test Header"
        testID="test-header"
      />
    );

    const header = getByTestId('test-header');
    expect(header).toHaveProp('accessibilityRole', 'header');
  });

  it('handles custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = renderWithTheme(
      <AccessibleHeader
        title="Test Header"
        style={customStyle}
        testID="test-header"
      />
    );

    const header = getByTestId('test-header');
    expect(header).toHaveStyle(customStyle);
  });

  it('handles custom testID', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleHeader
        title="Test Header"
        testID="custom-header"
      />
    );

    expect(getByTestId('custom-header')).toBeTruthy();
  });

  it('handles header without title', () => {
    const { getByTestId, queryByText } = renderWithTheme(
      <AccessibleHeader
        testID="test-header"
      />
    );

    expect(getByTestId('test-header')).toBeTruthy();
    expect(queryByText('Test Header')).toBeNull();
  });

  it('handles header without subtitle', () => {
    const { queryByText } = renderWithTheme(
      <AccessibleHeader
        title="Test Header"
        testID="test-header"
      />
    );

    expect(queryByText('Test Subtitle')).toBeNull();
  });

  it('handles header without back button', () => {
    const { queryByTestId } = renderWithTheme(
      <AccessibleHeader
        title="Test Header"
        testID="test-header"
      />
    );

    expect(queryByTestId('test-header-back')).toBeNull();
  });

  it('handles header without menu button', () => {
    const { queryByTestId } = renderWithTheme(
      <AccessibleHeader
        title="Test Header"
        testID="test-header"
      />
    );

    expect(queryByTestId('test-header-menu')).toBeNull();
  });

  it('handles header with custom title', () => {
    const { getByText } = renderWithTheme(
      <AccessibleHeader
        title="Custom Title"
        testID="test-header"
      />
    );

    expect(getByText('Custom Title')).toBeTruthy();
  });

  it('handles header with custom subtitle', () => {
    const { getByText } = renderWithTheme(
      <AccessibleHeader
        title="Test Header"
        subtitle="Custom Subtitle"
        testID="test-header"
      />
    );

    expect(getByText('Custom Subtitle')).toBeTruthy();
  });

  it('handles header with custom onBackPress', () => {
    const customOnBackPress = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleHeader
        title="Test Header"
        onBackPress={customOnBackPress}
        testID="test-header"
      />
    );

    const backButton = getByTestId('test-header-back');
    fireEvent.press(backButton);

    expect(customOnBackPress).toHaveBeenCalledTimes(1);
  });

  it('handles header with custom onMenuPress', () => {
    const customOnMenuPress = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleHeader
        title="Test Header"
        onMenuPress={customOnMenuPress}
        testID="test-header"
      />
    );

    const menuButton = getByTestId('test-header-menu');
    fireEvent.press(menuButton);

    expect(customOnMenuPress).toHaveBeenCalledTimes(1);
  });

  it('handles header with custom onBackPress and onMenuPress', () => {
    const customOnBackPress = jest.fn();
    const customOnMenuPress = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleHeader
        title="Test Header"
        onBackPress={customOnBackPress}
        onMenuPress={customOnMenuPress}
        testID="test-header"
      />
    );

    const backButton = getByTestId('test-header-back');
    const menuButton = getByTestId('test-header-menu');
    
    fireEvent.press(backButton);
    fireEvent.press(menuButton);

    expect(customOnBackPress).toHaveBeenCalledTimes(1);
    expect(customOnMenuPress).toHaveBeenCalledTimes(1);
  });

  it('handles header with custom onBackPress and onMenuPress and custom style', () => {
    const customOnBackPress = jest.fn();
    const customOnMenuPress = jest.fn();
    const customStyle = { backgroundColor: 'blue' };
    const { getByTestId } = renderWithTheme(
      <AccessibleHeader
        title="Test Header"
        onBackPress={customOnBackPress}
        onMenuPress={customOnMenuPress}
        style={customStyle}
        testID="test-header"
      />
    );

    const header = getByTestId('test-header');
    const backButton = getByTestId('test-header-back');
    const menuButton = getByTestId('test-header-menu');
    
    fireEvent.press(backButton);
    fireEvent.press(menuButton);

    expect(customOnBackPress).toHaveBeenCalledTimes(1);
    expect(customOnMenuPress).toHaveBeenCalledTimes(1);
    expect(header).toHaveStyle(customStyle);
  });

  it('handles header with custom onBackPress and onMenuPress and custom style and custom testID', () => {
    const customOnBackPress = jest.fn();
    const customOnMenuPress = jest.fn();
    const customStyle = { backgroundColor: 'green' };
    const { getByTestId } = renderWithTheme(
      <AccessibleHeader
        title="Test Header"
        onBackPress={customOnBackPress}
        onMenuPress={customOnMenuPress}
        style={customStyle}
        testID="custom-header"
      />
    );

    const header = getByTestId('custom-header');
    const backButton = getByTestId('custom-header-back');
    const menuButton = getByTestId('custom-header-menu');
    
    fireEvent.press(backButton);
    fireEvent.press(menuButton);

    expect(customOnBackPress).toHaveBeenCalledTimes(1);
    expect(customOnMenuPress).toHaveBeenCalledTimes(1);
    expect(header).toHaveStyle(customStyle);
  });
});