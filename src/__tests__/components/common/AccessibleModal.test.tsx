import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, AccessibilityInfo } from 'react-native';
import { AccessibleModal } from '../../../components/common/AccessibleModal';
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

// Mock AccessibilityInfo
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  AccessibilityInfo: {
    isScreenReaderEnabled: jest.fn().mockResolvedValue(true),
    announceForAccessibility: jest.fn(),
    addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  },
}));

// Mock the useAccessibility hook
const mockAnnounceForAccessibility = jest.fn();
jest.mock('../../../hooks/useAccessibility', () => ({
  useAccessibility: () => ({
    announceForAccessibility: mockAnnounceForAccessibility,
  }),
}));

// Mock the useFocusManagement hook
const mockRegisterElement = jest.fn();
const mockUnregisterElement = jest.fn();
const mockSetFocus = jest.fn();
const mockFocusNext = jest.fn();
const mockFocusPrevious = jest.fn();
const mockClearFocus = jest.fn();
const mockGetFocusableElements = jest.fn().mockReturnValue([]);

jest.mock('../../../hooks/useFocusManagement', () => ({
  useFocusManagement: () => ({
    registerElement: mockRegisterElement,
    unregisterElement: mockUnregisterElement,
    setFocus: mockSetFocus,
    focusNext: mockFocusNext,
    focusPrevious: mockFocusPrevious,
    clearFocus: mockClearFocus,
    getFocusableElements: mockGetFocusableElements,
  }),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('AccessibleModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    expect(getByTestId('test-modal')).toBeTruthy();
    expect(getByText('Test Modal')).toBeTruthy();
    expect(getByText('Modal Content')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByTestId } = renderWithTheme(
      <AccessibleModal visible={false} onClose={mockOnClose} title="Test Modal" testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    expect(queryByTestId('test-modal')).toBeNull();
  });

  it('calls onClose when close button is pressed', async () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" showCloseButton={true} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const closeButton = getByTestId('test-modal-close');
    fireEvent.press(closeButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onClose when backdrop is pressed if closeOnBackdropPress is true', async () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" closeOnBackdropPress={true} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const backdrop = getByTestId('test-modal-backdrop');
    fireEvent.press(backdrop);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call onClose when backdrop is pressed if closeOnBackdropPress is false', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" closeOnBackdropPress={false} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const backdrop = getByTestId('test-modal-backdrop');
    fireEvent.press(backdrop);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('applies custom accessibility label', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" accessibilityLabel="Custom modal label" testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    expect(modal).toHaveProp('accessibilityLabel', 'Custom modal label');
  });

  it('applies custom accessibility hint', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" accessibilityHint="Custom modal hint" testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    expect(modal).toHaveProp('accessibilityHint', 'Custom modal hint');
  });

  it('has proper accessibility role', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    expect(modal).toHaveProp('accessibilityRole', 'dialog');
  });

  it('announces modal opening and closing for accessibility', async () => {
    const { rerender } = renderWithTheme(
      <AccessibleModal visible={false} onClose={mockOnClose} title="Test Modal" testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    rerender(
      <ThemeProvider>
        <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" testID="test-modal">
          <Text>Modal Content</Text>
        </AccessibleModal>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(mockAnnounceForAccessibility).toHaveBeenCalledWith('Modal opened: Test Modal');
    });

    rerender(
      <ThemeProvider>
        <AccessibleModal visible={false} onClose={mockOnClose} title="Test Modal" testID="test-modal">
          <Text>Modal Content</Text>
        </AccessibleModal>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(mockAnnounceForAccessibility).toHaveBeenCalledWith('Modal closed');
    });
  });

  it('registers and unregisters elements for focus management', async () => {
    const { rerender } = renderWithTheme(
      <AccessibleModal visible={false} onClose={mockOnClose} title="Test Modal" testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    rerender(
      <ThemeProvider>
        <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" testID="test-modal">
          <Text>Modal Content</Text>
        </AccessibleModal>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(mockRegisterElement).toHaveBeenCalledWith('modal-content', expect.any(Object));
      expect(mockRegisterElement).toHaveBeenCalledWith('modal-close', expect.any(Object));
      expect(mockSetFocus).toHaveBeenCalledWith('modal-content');
    });

    rerender(
      <ThemeProvider>
        <AccessibleModal visible={false} onClose={mockOnClose} title="Test Modal" testID="test-modal">
          <Text>Modal Content</Text>
        </AccessibleModal>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(mockUnregisterElement).toHaveBeenCalledWith('modal-content');
      expect(mockUnregisterElement).toHaveBeenCalledWith('modal-close');
    });
  });

  it('handles modal without title', () => {
    const { getByTestId, queryByText } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    expect(getByTestId('test-modal')).toBeTruthy();
    expect(queryByText('Test Modal')).toBeNull();
  });

  it('handles modal without close button', () => {
    const { queryByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" showCloseButton={false} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    expect(queryByTestId('test-modal-close')).toBeNull();
  });

  it('handles modal with custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" style={customStyle} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    expect(modal).toHaveStyle(customStyle);
  });

  it('handles modal with custom content styles', () => {
    const customContentStyle = { backgroundColor: 'blue' };
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" contentStyle={customContentStyle} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const content = getByTestId('test-modal-content');
    expect(content).toHaveStyle(customContentStyle);
  });

  it('handles modal with custom backdrop styles', () => {
    const customBackdropStyle = { backgroundColor: 'green' };
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" backdropStyle={customBackdropStyle} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const backdrop = getByTestId('test-modal-backdrop');
    expect(backdrop).toHaveStyle(customBackdropStyle);
  });

  it('handles modal with custom title styles', () => {
    const customTitleStyle = { color: 'purple' };
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" titleStyle={customTitleStyle} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const title = getByTestId('test-modal-title');
    expect(title).toHaveStyle(customTitleStyle);
  });

  it('handles modal with custom close button styles', () => {
    const customCloseButtonStyle = { backgroundColor: 'orange' };
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" showCloseButton={true} closeButtonStyle={customCloseButtonStyle} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const closeButton = getByTestId('test-modal-close');
    expect(closeButton).toHaveStyle(customCloseButtonStyle);
  });

  it('handles modal with custom testID', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" testID="custom-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    expect(getByTestId('custom-modal')).toBeTruthy();
  });

  it('handles modal with custom content testID', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" contentTestID="custom-content" testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    expect(getByTestId('custom-content')).toBeTruthy();
  });

  it('handles modal with custom backdrop testID', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" backdropTestID="custom-backdrop" testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    expect(getByTestId('custom-backdrop')).toBeTruthy();
  });

  it('handles modal with custom title testID', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" titleTestID="custom-title" testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    expect(getByTestId('custom-title')).toBeTruthy();
  });

  it('handles modal with custom close button testID', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" showCloseButton={true} closeButtonTestID="custom-close" testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    expect(getByTestId('custom-close')).toBeTruthy();
  });

  it('handles modal with custom size', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" size="large" testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const content = getByTestId('test-modal-content');
    expect(content).toHaveStyle({ width: '90%', maxWidth: 600 });
  });

  it('handles modal with custom position', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" position="top" testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const content = getByTestId('test-modal-content');
    expect(content).toHaveStyle({ justifyContent: 'flex-start' });
  });

  it('handles modal with custom animation type', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" animationType="slide" testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    expect(modal).toHaveProp('animationType', 'slide');
  });

  it('handles modal with custom transparent', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" transparent={true} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    expect(modal).toHaveProp('transparent', true);
  });

  it('handles modal with custom presentation style', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" presentationStyle="formSheet" testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    expect(modal).toHaveProp('presentationStyle', 'formSheet');
  });

  it('handles modal with custom supported orientations', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" supportedOrientations={['portrait', 'landscape']} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    expect(modal).toHaveProp('supportedOrientations', ['portrait', 'landscape']);
  });

  it('handles modal with custom on orientation change', () => {
    const mockOnOrientationChange = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onOrientationChange={mockOnOrientationChange} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'orientationChange');

    expect(mockOnOrientationChange).toHaveBeenCalledTimes(1);
  });

  it('handles modal with custom on show', () => {
    const mockOnShow = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onShow={mockOnShow} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'show');

    expect(mockOnShow).toHaveBeenCalledTimes(1);
  });

  it('handles modal with custom on dismiss', () => {
    const mockOnDismiss = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onDismiss={mockOnDismiss} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'dismiss');

    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('handles modal with custom on request close', () => {
    const mockOnRequestClose = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onRequestClose={mockOnRequestClose} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'requestClose');

    expect(mockOnRequestClose).toHaveBeenCalledTimes(1);
  });

  it('handles modal with custom on hardware back press', () => {
    const mockOnHardwareBackPress = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onHardwareBackPress={mockOnHardwareBackPress} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'hardwareBackPress');

    expect(mockOnHardwareBackPress).toHaveBeenCalledTimes(1);
  });

  it('handles modal with custom on layout', () => {
    const mockOnLayout = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onLayout={mockOnLayout} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'layout');

    expect(mockOnLayout).toHaveBeenCalledTimes(1);
  });

  it('handles modal with custom on scroll', () => {
    const mockOnScroll = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onScroll={mockOnScroll} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'scroll');

    expect(mockOnScroll).toHaveBeenCalledTimes(1);
  });

  it('handles modal with custom on scroll begin drag', () => {
    const mockOnScrollBeginDrag = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onScrollBeginDrag={mockOnScrollBeginDrag} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'scrollBeginDrag');

    expect(mockOnScrollBeginDrag).toHaveBeenCalledTimes(1);
  });

  it('handles modal with custom on scroll end drag', () => {
    const mockOnScrollEndDrag = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onScrollEndDrag={mockOnScrollEndDrag} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'scrollEndDrag');

    expect(mockOnScrollEndDrag).toHaveBeenCalledTimes(1);
  });

  it('handles modal with custom on scroll to top', () => {
    const mockOnScrollToTop = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onScrollToTop={mockOnScrollToTop} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'scrollToTop');

    expect(mockOnScrollToTop).toHaveBeenCalledTimes(1);
  });

  it('handles modal with custom on momentum scroll begin', () => {
    const mockOnMomentumScrollBegin = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onMomentumScrollBegin={mockOnMomentumScrollBegin} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'momentumScrollBegin');

    expect(mockOnMomentumScrollBegin).toHaveBeenCalledTimes(1);
  });

  it('handles modal with custom on momentum scroll end', () => {
    const mockOnMomentumScrollEnd = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onMomentumScrollEnd={mockOnMomentumScrollEnd} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'momentumScrollEnd');

    expect(mockOnMomentumScrollEnd).toHaveBeenCalledTimes(1);
  });

  it('handles modal with custom on scroll animation end', () => {
    const mockOnScrollAnimationEnd = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onScrollAnimationEnd={mockOnScrollAnimationEnd} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'scrollAnimationEnd');

    expect(mockOnScrollAnimationEnd).toHaveBeenCalledTimes(1);
  });

  it('handles modal with custom on content size change', () => {
    const mockOnContentSizeChange = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onContentSizeChange={mockOnContentSizeChange} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'contentSizeChange');

    expect(mockOnContentSizeChange).toHaveBeenCalledTimes(1);
  });

  it('handles modal with custom on text input', () => {
    const mockOnTextInput = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onTextInput={mockOnTextInput} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'textInput');

    expect(mockOnTextInput).toHaveBeenCalledTimes(1);
  });

  it('handles modal with custom on change', () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onChange={mockOnChange} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'change');

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('handles modal with custom on change text', () => {
    const mockOnChangeText = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onChangeText={mockOnChangeText} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'changeText');

    expect(mockOnChangeText).toHaveBeenCalledTimes(1);
  });

  it('handles modal with custom on selection change', () => {
    const mockOnSelectionChange = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onSelectionChange={mockOnSelectionChange} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'selectionChange');

    expect(mockOnSelectionChange).toHaveBeenCalledTimes(1);
  });

  it('handles modal with custom on key press', () => {
    const mockOnKeyPress = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onKeyPress={mockOnKeyPress} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'keyPress');

    expect(mockOnKeyPress).toHaveBeenCalledTimes(1);
  });

  it('handles modal with custom on focus', () => {
    const mockOnFocus = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onFocus={mockOnFocus} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'focus');

    expect(mockOnFocus).toHaveBeenCalledTimes(1);
  });

  it('handles modal with custom on blur', () => {
    const mockOnBlur = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onBlur={mockOnBlur} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'blur');

    expect(mockOnBlur).toHaveBeenCalledTimes(1);
  });

  it('handles modal with custom on submit editing', () => {
    const mockOnSubmitEditing = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onSubmitEditing={mockOnSubmitEditing} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'submitEditing');

    expect(mockOnSubmitEditing).toHaveBeenCalledTimes(1);
  });

  it('handles modal with custom on end editing', () => {
    const mockOnEndEditing = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onEndEditing={mockOnEndEditing} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'endEditing');

    expect(mockOnEndEditing).toHaveBeenCalledTimes(1);
  });

  it('handles modal with custom on change text', () => {
    const mockOnChangeText = jest.fn();
    const { getByTestId } = renderWithTheme(
      <AccessibleModal visible={true} onClose={mockOnClose} title="Test Modal" onChangeText={mockOnChangeText} testID="test-modal">
        <Text>Modal Content</Text>
      </AccessibleModal>
    );

    const modal = getByTestId('test-modal');
    fireEvent(modal, 'changeText');

    expect(mockOnChangeText).toHaveBeenCalledTimes(1);
  });
});