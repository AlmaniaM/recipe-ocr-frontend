import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AccessibleField } from '../../../components/forms/AccessibleField';
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

describe('AccessibleField', () => {
  const mockOnChangeText = jest.fn();
  const mockOnValidate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with label', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        testID="test-field"
      />
    );

    expect(getByTestId('test-field')).toBeTruthy();
    expect(getByText('Test Field')).toBeTruthy();
  });

  it('renders with required indicator when required', () => {
    const { getByText } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        required={true}
        testID="test-field"
      />
    );

    expect(getByText('*')).toBeTruthy();
  });

  it('renders with error message when error is provided', () => {
    const { getByText } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        error="Field is required"
        testID="test-field"
      />
    );

    expect(getByText('Field is required')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    fireEvent.changeText(field, 'New text');

    expect(mockOnChangeText).toHaveBeenCalledWith('New text');
  });

  it('calls onValidate when validation is triggered', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        onValidate={mockOnValidate}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    fireEvent.changeText(field, 'New text');

    expect(mockOnValidate).toHaveBeenCalledWith('New text');
  });

  it('applies custom accessibility label', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        accessibilityLabel="Custom field label"
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('accessibilityLabel', 'Custom field label');
  });

  it('applies custom accessibility hint', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        accessibilityHint="Custom field hint"
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('accessibilityHint', 'Custom field hint');
  });

  it('has proper accessibility role', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('accessibilityRole', 'textbox');
  });

  it('handles disabled state', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        disabled={true}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('accessibilityState', { disabled: true });
  });

  it('handles loading state', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        loading={true}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('accessibilityState', { busy: true });
  });

  it('handles error state', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        error="Field is required"
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('accessibilityState', { invalid: true });
  });

  it('handles success state', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        isValid={true}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('accessibilityState', { invalid: false });
  });

  it('handles custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        style={customStyle}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveStyle(customStyle);
  });

  it('handles custom testID', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        testID="custom-field"
      />
    );

    expect(getByTestId('custom-field')).toBeTruthy();
  });

  it('handles field without label', () => {
    const { getByTestId, queryByText } = renderWithTheme(
      <AccessibleField
        value=""
        onChangeText={mockOnChangeText}
        testID="test-field"
      />
    );

    expect(getByTestId('test-field')).toBeTruthy();
    expect(queryByText('Test Field')).toBeNull();
  });

  it('handles field without error', () => {
    const { queryByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        testID="test-field"
      />
    );

    expect(queryByTestId('test-field-error')).toBeNull();
  });

  it('handles field with custom placeholder', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Enter your text"
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('placeholder', 'Enter your text');
  });

  it('handles field with custom placeholder text color', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Enter your text"
        placeholderTextColor="gray"
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('placeholderTextColor', 'gray');
  });

  it('handles field with custom keyboard type', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        keyboardType="numeric"
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('keyboardType', 'numeric');
  });

  it('handles field with custom return key type', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        returnKeyType="done"
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('returnKeyType', 'done');
  });

  it('handles field with custom secure text entry', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        secureTextEntry={true}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('secureTextEntry', true);
  });

  it('handles field with custom multiline', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        multiline={true}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('multiline', true);
  });

  it('handles field with custom max length', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        maxLength={100}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('maxLength', 100);
  });

  it('handles field with custom auto capitalize', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        autoCapitalize="words"
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('autoCapitalize', 'words');
  });

  it('handles field with custom auto correct', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        autoCorrect={false}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('autoCorrect', false);
  });

  it('handles field with custom auto focus', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        autoFocus={true}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('autoFocus', true);
  });

  it('handles field with custom blur on submit', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        blurOnSubmit={true}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('blurOnSubmit', true);
  });

  it('handles field with custom clear button mode', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        clearButtonMode="while-editing"
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('clearButtonMode', 'while-editing');
  });

  it('handles field with custom context menu hidden', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        contextMenuHidden={true}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('contextMenuHidden', true);
  });

  it('handles field with custom data detector types', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        dataDetectorTypes={['phoneNumber', 'link']}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('dataDetectorTypes', ['phoneNumber', 'link']);
  });

  it('handles field with custom enables return key automatically', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        enablesReturnKeyAutomatically={true}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('enablesReturnKeyAutomatically', true);
  });

  it('handles field with custom keyboard appearance', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        keyboardAppearance="dark"
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('keyboardAppearance', 'dark');
  });

  it('handles field with custom keyboard dismiss mode', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        keyboardDismissMode="on-drag"
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('keyboardDismissMode', 'on-drag');
  });

  it('handles field with custom selection color', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        selectionColor="blue"
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('selectionColor', 'blue');
  });

  it('handles field with custom spell check', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        spellCheck={false}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('spellCheck', false);
  });

  it('handles field with custom text align', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        textAlign="center"
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('textAlign', 'center');
  });

  it('handles field with custom text content type', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        textContentType="emailAddress"
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('textContentType', 'emailAddress');
  });

  it('handles field with custom underline color Android', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        underlineColorAndroid="blue"
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('underlineColorAndroid', 'blue');
  });

  it('handles field with custom value', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value="Initial value"
        onChangeText={mockOnChangeText}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('value', 'Initial value');
  });

  it('handles field with custom default value', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        defaultValue="Default value"
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('defaultValue', 'Default value');
  });

  it('handles field with custom editable', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        editable={false}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('editable', false);
  });

  it('handles field with custom select text on focus', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        selectTextOnFocus={true}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('selectTextOnFocus', true);
  });

  it('handles field with custom selection', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        selection={{ start: 0, end: 5 }}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    expect(field).toHaveProp('selection', { start: 0, end: 5 });
  });

  it('handles field with custom submit editing', () => {
    const mockOnSubmitEditing = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        onSubmitEditing={mockOnSubmitEditing}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    fireEvent(field, 'submitEditing');

    expect(mockOnSubmitEditing).toHaveBeenCalledTimes(1);
  });

  it('handles field with custom on focus', () => {
    const mockOnFocus = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        onFocus={mockOnFocus}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    fireEvent(field, 'focus');

    expect(mockOnFocus).toHaveBeenCalledTimes(1);
  });

  it('handles field with custom on blur', () => {
    const mockOnBlur = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        onBlur={mockOnBlur}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    fireEvent(field, 'blur');

    expect(mockOnBlur).toHaveBeenCalledTimes(1);
  });

  it('handles field with custom on selection change', () => {
    const mockOnSelectionChange = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        onSelectionChange={mockOnSelectionChange}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    fireEvent(field, 'selectionChange');

    expect(mockOnSelectionChange).toHaveBeenCalledTimes(1);
  });

  it('handles field with custom on key press', () => {
    const mockOnKeyPress = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        onKeyPress={mockOnKeyPress}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    fireEvent(field, 'keyPress');

    expect(mockOnKeyPress).toHaveBeenCalledTimes(1);
  });

  it('handles field with custom on layout', () => {
    const mockOnLayout = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        onLayout={mockOnLayout}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    fireEvent(field, 'layout');

    expect(mockOnLayout).toHaveBeenCalledTimes(1);
  });

  it('handles field with custom on scroll', () => {
    const mockOnScroll = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        onScroll={mockOnScroll}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    fireEvent(field, 'scroll');

    expect(mockOnScroll).toHaveBeenCalledTimes(1);
  });

  it('handles field with custom on content size change', () => {
    const mockOnContentSizeChange = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        onContentSizeChange={mockOnContentSizeChange}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    fireEvent(field, 'contentSizeChange');

    expect(mockOnContentSizeChange).toHaveBeenCalledTimes(1);
  });

  it('handles field with custom on text input', () => {
    const mockOnTextInput = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        onTextInput={mockOnTextInput}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    fireEvent(field, 'textInput');

    expect(mockOnTextInput).toHaveBeenCalledTimes(1);
  });

  it('handles field with custom on end editing', () => {
    const mockOnEndEditing = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        onEndEditing={mockOnEndEditing}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    fireEvent(field, 'endEditing');

    expect(mockOnEndEditing).toHaveBeenCalledTimes(1);
  });

  it('handles field with custom on change', () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeText}
        onChange={mockOnChange}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    fireEvent(field, 'change');

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('handles field with custom on change text', () => {
    const mockOnChangeTextCustom = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeTextCustom}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    fireEvent.changeText(field, 'New text');

    expect(mockOnChangeTextCustom).toHaveBeenCalledWith('New text');
  });

  it('handles field with custom on change text and onChangeText prop', () => {
    const mockOnChangeTextCustom = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeTextCustom}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    fireEvent.changeText(field, 'New text');

    expect(mockOnChangeTextCustom).toHaveBeenCalledWith('New text');
  });

  it('handles field with custom on change text and onChangeText prop with different function', () => {
    const mockOnChangeTextCustom = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleField
        label="Test Field"
        value=""
        onChangeText={mockOnChangeTextCustom}
        testID="test-field"
      />
    );

    const field = getByTestId('test-field');
    fireEvent.changeText(field, 'New text');

    expect(mockOnChangeTextCustom).toHaveBeenCalledWith('New text');
  });
});