import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AccessibleTextInput } from '../../../components/common/AccessibleTextInput';
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

describe('AccessibleTextInput', () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with label', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        testID="test-input"
      />
    );

    expect(getByTestId('test-input')).toBeTruthy();
    expect(getByText('Test Input')).toBeTruthy();
  });

  it('renders with required indicator when required', () => {
    const { getByText } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        required={true}
        testID="test-input"
      />
    );

    expect(getByText('*')).toBeTruthy();
  });

  it('renders with error message when error is provided', () => {
    const { getByText } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        error="Input is required"
        testID="test-input"
      />
    );

    expect(getByText('Input is required')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    fireEvent.changeText(input, 'New text');

    expect(mockOnChangeText).toHaveBeenCalledWith('New text');
  });

  it('applies custom accessibility label', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        accessibilityLabel="Custom input label"
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('accessibilityLabel', 'Custom input label');
  });

  it('applies custom accessibility hint', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        accessibilityHint="Custom input hint"
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('accessibilityHint', 'Custom input hint');
  });

  it('has proper accessibility role', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('accessibilityRole', 'textbox');
  });

  it('announces validation errors', async () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        error="Input is required"
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    fireEvent.changeText(input, 'New text');

    await waitFor(() => {
      expect(mockAnnounceForAccessibility).toHaveBeenCalledWith('Error in Test Input: Input is required');
    });
  });

  it('announces validation success', async () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        isValid={true}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    fireEvent.changeText(input, 'New text');

    await waitFor(() => {
      expect(mockAnnounceForAccessibility).toHaveBeenCalledWith('Test Input is valid');
    });
  });

  it('handles disabled state', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        disabled={true}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('accessibilityState', { disabled: true });
  });

  it('handles loading state', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        loading={true}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('accessibilityState', { busy: true });
  });

  it('handles error state', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        error="Input is required"
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('accessibilityState', { invalid: true });
  });

  it('handles success state', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        isValid={true}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('accessibilityState', { invalid: false });
  });

  it('handles custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        style={customStyle}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveStyle(customStyle);
  });

  it('handles custom testID', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        testID="custom-input"
      />
    );

    expect(getByTestId('custom-input')).toBeTruthy();
  });

  it('handles input without label', () => {
    const { getByTestId, queryByText } = renderWithTheme(
      <AccessibleTextInput
        value=""
        onChangeText={mockOnChangeText}
        testID="test-input"
      />
    );

    expect(getByTestId('test-input')).toBeTruthy();
    expect(queryByText('Test Input')).toBeNull();
  });

  it('handles input without error', () => {
    const { queryByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        testID="test-input"
      />
    );

    expect(queryByTestId('test-input-error')).toBeNull();
  });

  it('handles input with custom placeholder', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Enter your text"
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('placeholder', 'Enter your text');
  });

  it('handles input with custom placeholder text color', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Enter your text"
        placeholderTextColor="gray"
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('placeholderTextColor', 'gray');
  });

  it('handles input with custom keyboard type', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        keyboardType="numeric"
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('keyboardType', 'numeric');
  });

  it('handles input with custom return key type', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        returnKeyType="done"
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('returnKeyType', 'done');
  });

  it('handles input with custom secure text entry', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        secureTextEntry={true}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('secureTextEntry', true);
  });

  it('handles input with custom multiline', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        multiline={true}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('multiline', true);
  });

  it('handles input with custom max length', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        maxLength={100}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('maxLength', 100);
  });

  it('handles input with custom auto capitalize', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        autoCapitalize="words"
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('autoCapitalize', 'words');
  });

  it('handles input with custom auto correct', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        autoCorrect={false}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('autoCorrect', false);
  });

  it('handles input with custom auto focus', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        autoFocus={true}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('autoFocus', true);
  });

  it('handles input with custom blur on submit', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        blurOnSubmit={true}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('blurOnSubmit', true);
  });

  it('handles input with custom clear button mode', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        clearButtonMode="while-editing"
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('clearButtonMode', 'while-editing');
  });

  it('handles input with custom context menu hidden', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        contextMenuHidden={true}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('contextMenuHidden', true);
  });

  it('handles input with custom data detector types', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        dataDetectorTypes={['phoneNumber', 'link']}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('dataDetectorTypes', ['phoneNumber', 'link']);
  });

  it('handles input with custom enables return key automatically', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        enablesReturnKeyAutomatically={true}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('enablesReturnKeyAutomatically', true);
  });

  it('handles input with custom keyboard appearance', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        keyboardAppearance="dark"
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('keyboardAppearance', 'dark');
  });

  it('handles input with custom keyboard dismiss mode', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        keyboardDismissMode="on-drag"
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('keyboardDismissMode', 'on-drag');
  });

  it('handles input with custom selection color', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        selectionColor="blue"
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('selectionColor', 'blue');
  });

  it('handles input with custom spell check', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        spellCheck={false}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('spellCheck', false);
  });

  it('handles input with custom text align', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        textAlign="center"
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('textAlign', 'center');
  });

  it('handles input with custom text content type', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        textContentType="emailAddress"
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('textContentType', 'emailAddress');
  });

  it('handles input with custom underline color Android', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        underlineColorAndroid="blue"
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('underlineColorAndroid', 'blue');
  });

  it('handles input with custom value', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value="Initial value"
        onChangeText={mockOnChangeText}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('value', 'Initial value');
  });

  it('handles input with custom default value', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        defaultValue="Default value"
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('defaultValue', 'Default value');
  });

  it('handles input with custom editable', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        editable={false}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('editable', false);
  });

  it('handles input with custom select text on focus', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        selectTextOnFocus={true}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('selectTextOnFocus', true);
  });

  it('handles input with custom selection', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        selection={{ start: 0, end: 5 }}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    expect(input).toHaveProp('selection', { start: 0, end: 5 });
  });

  it('handles input with custom submit editing', () => {
    const mockOnSubmitEditing = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        onSubmitEditing={mockOnSubmitEditing}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    fireEvent(input, 'submitEditing');

    expect(mockOnSubmitEditing).toHaveBeenCalledTimes(1);
  });

  it('handles input with custom on focus', () => {
    const mockOnFocus = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        onFocus={mockOnFocus}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    fireEvent(input, 'focus');

    expect(mockOnFocus).toHaveBeenCalledTimes(1);
  });

  it('handles input with custom on blur', () => {
    const mockOnBlur = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        onBlur={mockOnBlur}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    fireEvent(input, 'blur');

    expect(mockOnBlur).toHaveBeenCalledTimes(1);
  });

  it('handles input with custom on selection change', () => {
    const mockOnSelectionChange = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        onSelectionChange={mockOnSelectionChange}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    fireEvent(input, 'selectionChange');

    expect(mockOnSelectionChange).toHaveBeenCalledTimes(1);
  });

  it('handles input with custom on key press', () => {
    const mockOnKeyPress = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        onKeyPress={mockOnKeyPress}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    fireEvent(input, 'keyPress');

    expect(mockOnKeyPress).toHaveBeenCalledTimes(1);
  });

  it('handles input with custom on layout', () => {
    const mockOnLayout = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        onLayout={mockOnLayout}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    fireEvent(input, 'layout');

    expect(mockOnLayout).toHaveBeenCalledTimes(1);
  });

  it('handles input with custom on scroll', () => {
    const mockOnScroll = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        onScroll={mockOnScroll}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    fireEvent(input, 'scroll');

    expect(mockOnScroll).toHaveBeenCalledTimes(1);
  });

  it('handles input with custom on content size change', () => {
    const mockOnContentSizeChange = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        onContentSizeChange={mockOnContentSizeChange}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    fireEvent(input, 'contentSizeChange');

    expect(mockOnContentSizeChange).toHaveBeenCalledTimes(1);
  });

  it('handles input with custom on text input', () => {
    const mockOnTextInput = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        onTextInput={mockOnTextInput}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    fireEvent(input, 'textInput');

    expect(mockOnTextInput).toHaveBeenCalledTimes(1);
  });

  it('handles input with custom on end editing', () => {
    const mockOnEndEditing = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        onEndEditing={mockOnEndEditing}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    fireEvent(input, 'endEditing');

    expect(mockOnEndEditing).toHaveBeenCalledTimes(1);
  });

  it('handles input with custom on change', () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeText}
        onChange={mockOnChange}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    fireEvent(input, 'change');

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('handles input with custom on change text', () => {
    const mockOnChangeTextCustom = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeTextCustom}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    fireEvent.changeText(input, 'New text');

    expect(mockOnChangeTextCustom).toHaveBeenCalledWith('New text');
  });

  it('handles input with custom on change text and onChangeText prop', () => {
    const mockOnChangeTextCustom = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeTextCustom}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    fireEvent.changeText(input, 'New text');

    expect(mockOnChangeTextCustom).toHaveBeenCalledWith('New text');
  });

  it('handles input with custom on change text and onChangeText prop with different function', () => {
    const mockOnChangeTextCustom = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleTextInput
        label="Test Input"
        value=""
        onChangeText={mockOnChangeTextCustom}
        testID="test-input"
      />
    );

    const input = getByTestId('test-input');
    fireEvent.changeText(input, 'New text');

    expect(mockOnChangeTextCustom).toHaveBeenCalledWith('New text');
  });
});