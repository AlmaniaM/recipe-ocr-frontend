import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AccessibleTabBar } from '../../../components/navigation/AccessibleTabBar';
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

describe('AccessibleTabBar', () => {
  const mockOnTabPress = jest.fn();
  const mockTabs = [
    { key: 'tab1', title: 'Tab 1', icon: 'home' },
    { key: 'tab2', title: 'Tab 2', icon: 'search' },
    { key: 'tab3', title: 'Tab 3', icon: 'profile' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with tabs', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <AccessibleTabBar
        tabs={mockTabs}
        activeTab="tab1"
        onTabPress={mockOnTabPress}
        testID="test-tab-bar"
      />
    );

    expect(getByTestId('test-tab-bar')).toBeTruthy();
    expect(getByText('Tab 1')).toBeTruthy();
    expect(getByText('Tab 2')).toBeTruthy();
    expect(getByText('Tab 3')).toBeTruthy();
  });

  it('calls onTabPress when tab is pressed', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTabBar
        tabs={mockTabs}
        activeTab="tab1"
        onTabPress={mockOnTabPress}
        testID="test-tab-bar"
      />
    );

    const tab2 = getByTestId('test-tab-bar-tab-tab2');
    fireEvent.press(tab2);

    expect(mockOnTabPress).toHaveBeenCalledWith('tab2');
  });

  it('applies custom accessibility label', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTabBar
        tabs={mockTabs}
        activeTab="tab1"
        onTabPress={mockOnTabPress}
        accessibilityLabel="Custom tab bar label"
        testID="test-tab-bar"
      />
    );

    const tabBar = getByTestId('test-tab-bar');
    expect(tabBar).toHaveProp('accessibilityLabel', 'Custom tab bar label');
  });

  it('applies custom accessibility hint', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTabBar
        tabs={mockTabs}
        activeTab="tab1"
        onTabPress={mockOnTabPress}
        accessibilityHint="Custom tab bar hint"
        testID="test-tab-bar"
      />
    );

    const tabBar = getByTestId('test-tab-bar');
    expect(tabBar).toHaveProp('accessibilityHint', 'Custom tab bar hint');
  });

  it('has proper accessibility role', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTabBar
        tabs={mockTabs}
        activeTab="tab1"
        onTabPress={mockOnTabPress}
        testID="test-tab-bar"
      />
    );

    const tabBar = getByTestId('test-tab-bar');
    expect(tabBar).toHaveProp('accessibilityRole', 'tablist');
  });

  it('handles custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = renderWithTheme(
      <AccessibleTabBar
        tabs={mockTabs}
        activeTab="tab1"
        onTabPress={mockOnTabPress}
        style={customStyle}
        testID="test-tab-bar"
      />
    );

    const tabBar = getByTestId('test-tab-bar');
    expect(tabBar).toHaveStyle(customStyle);
  });

  it('handles custom testID', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTabBar
        tabs={mockTabs}
        activeTab="tab1"
        onTabPress={mockOnTabPress}
        testID="custom-tab-bar"
      />
    );

    expect(getByTestId('custom-tab-bar')).toBeTruthy();
  });

  it('handles tab bar without tabs', () => {
    const { getByTestId, queryByText } = renderWithTheme(
      <AccessibleTabBar
        tabs={[]}
        activeTab=""
        onTabPress={mockOnTabPress}
        testID="test-tab-bar"
      />
    );

    expect(getByTestId('test-tab-bar')).toBeTruthy();
    expect(queryByText('Tab 1')).toBeNull();
  });

  it('handles tab bar without activeTab', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTabBar
        tabs={mockTabs}
        activeTab=""
        onTabPress={mockOnTabPress}
        testID="test-tab-bar"
      />
    );

    expect(getByTestId('test-tab-bar')).toBeTruthy();
  });

  it('handles tab bar without onTabPress', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTabBar
        tabs={mockTabs}
        activeTab="tab1"
        testID="test-tab-bar"
      />
    );

    const tab2 = getByTestId('test-tab-bar-tab-tab2');
    fireEvent.press(tab2);

    expect(mockOnTabPress).not.toHaveBeenCalled();
  });

  it('handles tab bar with custom tabs', () => {
    const customTabs = [
      { key: 'custom1', title: 'Custom 1', icon: 'star' },
      { key: 'custom2', title: 'Custom 2', icon: 'heart' },
    ];
    const { getByText } = renderWithTheme(
      <AccessibleTabBar
        tabs={customTabs}
        activeTab="custom1"
        onTabPress={mockOnTabPress}
        testID="test-tab-bar"
      />
    );

    expect(getByText('Custom 1')).toBeTruthy();
    expect(getByText('Custom 2')).toBeTruthy();
  });

  it('handles tab bar with custom activeTab', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTabBar
        tabs={mockTabs}
        activeTab="tab2"
        onTabPress={mockOnTabPress}
        testID="test-tab-bar"
      />
    );

    const tab2 = getByTestId('test-tab-bar-tab-tab2');
    expect(tab2).toHaveProp('accessibilityState', { selected: true });
  });

  it('handles tab bar with custom onTabPress', () => {
    const customOnTabPress = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleTabBar
        tabs={mockTabs}
        activeTab="tab1"
        onTabPress={customOnTabPress}
        testID="test-tab-bar"
      />
    );

    const tab2 = getByTestId('test-tab-bar-tab-tab2');
    fireEvent.press(tab2);

    expect(customOnTabPress).toHaveBeenCalledWith('tab2');
  });

  it('handles tab bar with custom onTabPress and custom style', () => {
    const customOnTabPress = jest.fn();
    const customStyle = { backgroundColor: 'blue' };
    const { getByTestId } = renderWithTheme(
      <AccessibleTabBar
        tabs={mockTabs}
        activeTab="tab1"
        onTabPress={customOnTabPress}
        style={customStyle}
        testID="test-tab-bar"
      />
    );

    const tabBar = getByTestId('test-tab-bar');
    const tab2 = getByTestId('test-tab-bar-tab-tab2');
    
    fireEvent.press(tab2);

    expect(customOnTabPress).toHaveBeenCalledWith('tab2');
    expect(tabBar).toHaveStyle(customStyle);
  });

  it('handles tab bar with custom onTabPress and custom style and custom testID', () => {
    const customOnTabPress = jest.fn();
    const customStyle = { backgroundColor: 'green' };
    const { getByTestId } = renderWithTheme(
      <AccessibleTabBar
        tabs={mockTabs}
        activeTab="tab1"
        onTabPress={customOnTabPress}
        style={customStyle}
        testID="custom-tab-bar"
      />
    );

    const tabBar = getByTestId('custom-tab-bar');
    const tab2 = getByTestId('custom-tab-bar-tab-tab2');
    
    fireEvent.press(tab2);

    expect(customOnTabPress).toHaveBeenCalledWith('tab2');
    expect(tabBar).toHaveStyle(customStyle);
  });
});