import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AccessibleForm } from '../../../components/forms/AccessibleForm';
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

// Mock the useFocusManagement hook
const mockSetFocus = jest.fn();
const mockRegisterElement = jest.fn();
const mockUnregisterElement = jest.fn();
jest.mock('../../../hooks/useFocusManagement', () => ({
  useFocusManagement: () => ({
    setFocus: mockSetFocus,
    registerElement: mockRegisterElement,
    unregisterElement: mockUnregisterElement,
  }),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('AccessibleForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnValidate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with children', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <AccessibleForm onSubmit={mockOnSubmit} testID="test-form">
        <Text>Form Content</Text>
      </AccessibleForm>
    );

    expect(getByTestId('test-form')).toBeTruthy();
    expect(getByText('Form Content')).toBeTruthy();
  });

  it('calls onSubmit when form is submitted', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleForm onSubmit={mockOnSubmit} testID="test-form">
        <Text>Form Content</Text>
      </AccessibleForm>
    );

    const form = getByTestId('test-form');
    fireEvent(form, 'submitEditing');

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onValidate when validation is triggered', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleForm onSubmit={mockOnSubmit} onValidate={mockOnValidate} testID="test-form">
        <Text>Form Content</Text>
      </AccessibleForm>
    );

    const form = getByTestId('test-form');
    fireEvent(form, 'submitEditing');

    expect(mockOnValidate).toHaveBeenCalledTimes(1);
  });

  it('applies custom accessibility label', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleForm onSubmit={mockOnSubmit} accessibilityLabel="Custom form label" testID="test-form">
        <Text>Form Content</Text>
      </AccessibleForm>
    );

    const form = getByTestId('test-form');
    expect(form).toHaveProp('accessibilityLabel', 'Custom form label');
  });

  it('applies custom accessibility hint', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleForm onSubmit={mockOnSubmit} accessibilityHint="Custom form hint" testID="test-form">
        <Text>Form Content</Text>
      </AccessibleForm>
    );

    const form = getByTestId('test-form');
    expect(form).toHaveProp('accessibilityHint', 'Custom form hint');
  });

  it('has proper accessibility role', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleForm onSubmit={mockOnSubmit} testID="test-form">
        <Text>Form Content</Text>
      </AccessibleForm>
    );

    const form = getByTestId('test-form');
    expect(form).toHaveProp('accessibilityRole', 'form');
  });

  it('handles disabled state', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleForm onSubmit={mockOnSubmit} disabled={true} testID="test-form">
        <Text>Form Content</Text>
      </AccessibleForm>
    );

    const form = getByTestId('test-form');
    expect(form).toHaveProp('accessibilityState', { disabled: true });
  });

  it('handles loading state', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleForm onSubmit={mockOnSubmit} loading={true} testID="test-form">
        <Text>Form Content</Text>
      </AccessibleForm>
    );

    const form = getByTestId('test-form');
    expect(form).toHaveProp('accessibilityState', { busy: true });
  });

  it('handles error state', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleForm onSubmit={mockOnSubmit} error="Form has errors" testID="test-form">
        <Text>Form Content</Text>
      </AccessibleForm>
    );

    const form = getByTestId('test-form');
    expect(form).toHaveProp('accessibilityState', { invalid: true });
  });

  it('handles success state', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleForm onSubmit={mockOnSubmit} isValid={true} testID="test-form">
        <Text>Form Content</Text>
      </AccessibleForm>
    );

    const form = getByTestId('test-form');
    expect(form).toHaveProp('accessibilityState', { invalid: false });
  });

  it('handles custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = renderWithTheme(
      <AccessibleForm onSubmit={mockOnSubmit} style={customStyle} testID="test-form">
        <Text>Form Content</Text>
      </AccessibleForm>
    );

    const form = getByTestId('test-form');
    expect(form).toHaveStyle(customStyle);
  });

  it('handles custom testID', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleForm onSubmit={mockOnSubmit} testID="custom-form">
        <Text>Form Content</Text>
      </AccessibleForm>
    );

    expect(getByTestId('custom-form')).toBeTruthy();
  });

  it('handles form without children', () => {
    const { getByTestId, queryByText } = renderWithTheme(
      <AccessibleForm onSubmit={mockOnSubmit} testID="test-form" />
    );

    expect(getByTestId('test-form')).toBeTruthy();
    expect(queryByText('Form Content')).toBeNull();
  });

  it('handles form without onSubmit', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleForm testID="test-form">
        <Text>Form Content</Text>
      </AccessibleForm>
    );

    const form = getByTestId('test-form');
    fireEvent(form, 'submitEditing');

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('handles form without onValidate', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleForm onSubmit={mockOnSubmit} testID="test-form">
        <Text>Form Content</Text>
      </AccessibleForm>
    );

    const form = getByTestId('test-form');
    fireEvent(form, 'submitEditing');

    expect(mockOnValidate).not.toHaveBeenCalled();
  });

  it('handles form with custom onSubmit and onValidate', () => {
    const customOnSubmit = jest.fn();
    const customOnValidate = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleForm onSubmit={customOnSubmit} onValidate={customOnValidate} testID="test-form">
        <Text>Form Content</Text>
      </AccessibleForm>
    );

    const form = getByTestId('test-form');
    fireEvent(form, 'submitEditing');

    expect(customOnSubmit).toHaveBeenCalledTimes(1);
    expect(customOnValidate).toHaveBeenCalledTimes(1);
  });

  it('handles form with custom onSubmit and onValidate and disabled', () => {
    const customOnSubmit = jest.fn();
    const customOnValidate = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleForm onSubmit={customOnSubmit} onValidate={customOnValidate} disabled={true} testID="test-form">
        <Text>Form Content</Text>
      </AccessibleForm>
    );

    const form = getByTestId('test-form');
    fireEvent(form, 'submitEditing');

    expect(customOnSubmit).not.toHaveBeenCalled();
    expect(customOnValidate).not.toHaveBeenCalled();
  });

  it('handles form with custom onSubmit and onValidate and loading', () => {
    const customOnSubmit = jest.fn();
    const customOnValidate = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleForm onSubmit={customOnSubmit} onValidate={customOnValidate} loading={true} testID="test-form">
        <Text>Form Content</Text>
      </AccessibleForm>
    );

    const form = getByTestId('test-form');
    fireEvent(form, 'submitEditing');

    expect(customOnSubmit).not.toHaveBeenCalled();
    expect(customOnValidate).not.toHaveBeenCalled();
  });

  it('handles form with custom onSubmit and onValidate and disabled and loading', () => {
    const customOnSubmit = jest.fn();
    const customOnValidate = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleForm onSubmit={customOnSubmit} onValidate={customOnValidate} disabled={true} loading={true} testID="test-form">
        <Text>Form Content</Text>
      </AccessibleForm>
    );

    const form = getByTestId('test-form');
    fireEvent(form, 'submitEditing');

    expect(customOnSubmit).not.toHaveBeenCalled();
    expect(customOnValidate).not.toHaveBeenCalled();
  });

  it('handles form with custom onSubmit and onValidate and disabled and loading and custom style', () => {
    const customOnSubmit = jest.fn();
    const customOnValidate = jest.fn();
    const customStyle = { backgroundColor: 'blue' };
    const { getByTestId } = renderWithTheme(
      <AccessibleForm onSubmit={customOnSubmit} onValidate={customOnValidate} disabled={true} loading={true} style={customStyle} testID="test-form">
        <Text>Form Content</Text>
      </AccessibleForm>
    );

    const form = getByTestId('test-form');
    fireEvent(form, 'submitEditing');

    expect(customOnSubmit).not.toHaveBeenCalled();
    expect(customOnValidate).not.toHaveBeenCalled();
    expect(form).toHaveStyle(customStyle);
  });

  it('handles form with custom onSubmit and onValidate and disabled and loading and custom style and custom testID', () => {
    const customOnSubmit = jest.fn();
    const customOnValidate = jest.fn();
    const customStyle = { backgroundColor: 'green' };
    const { getByTestId } = renderWithTheme(
      <AccessibleForm onSubmit={customOnSubmit} onValidate={customOnValidate} disabled={true} loading={true} style={customStyle} testID="custom-form">
        <Text>Form Content</Text>
      </AccessibleForm>
    );

    const form = getByTestId('custom-form');
    fireEvent(form, 'submitEditing');

    expect(customOnSubmit).not.toHaveBeenCalled();
    expect(customOnValidate).not.toHaveBeenCalled();
    expect(form).toHaveStyle(customStyle);
  });
});