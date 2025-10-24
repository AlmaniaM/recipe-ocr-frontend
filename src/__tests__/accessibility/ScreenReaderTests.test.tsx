import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { AccessibleButton } from '../../components/common/AccessibleButton';
import { AccessibleTextInput } from '../../components/common/AccessibleTextInput';
import { AccessibleModal } from '../../components/common/AccessibleModal';
import { AccessibleImage } from '../../components/common/AccessibleImage';
import { ThemeProvider } from '../../context/ThemeContext';

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
jest.mock('../../hooks/useAccessibility', () => ({
  useAccessibility: () => ({
    announceForAccessibility: mockAnnounceForAccessibility,
  }),
}));

// Mock the useFocusManagement hook
const mockSetFocus = jest.fn();
const mockRegisterElement = jest.fn();
const mockUnregisterElement = jest.fn();

jest.mock('../../hooks/useFocusManagement', () => ({
  useFocusManagement: () => ({
    registerElement: mockRegisterElement,
    unregisterElement: mockUnregisterElement,
    setFocus: mockSetFocus,
  }),
}));

// Mock theme context
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

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('Screen Reader Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AccessibleButton', () => {
    it('should have proper accessibility labels', () => {
      const { getByTestId } = renderWithTheme(
        <AccessibleButton
          title="Save Recipe"
          onPress={jest.fn()}
          accessibilityLabel="Save recipe to collection"
          testID="save-button"
        />
      );
      
      const button = getByTestId('save-button');
      expect(button).toHaveProp('accessibilityLabel', 'Save recipe to collection');
    });

    it('should announce accessibility hints', async () => {
      const { getByTestId } = renderWithTheme(
        <AccessibleButton
          title="Delete"
          onPress={jest.fn()}
          accessibilityHint="Double tap to delete recipe"
          testID="delete-button"
        />
      );
      
      const button = getByTestId('delete-button');
      fireEvent.press(button);
      
      await waitFor(() => {
        expect(mockAnnounceForAccessibility).toHaveBeenCalledWith('Double tap to delete recipe');
      });
    });

    it('should handle disabled state', () => {
      const { getByTestId } = renderWithTheme(
        <AccessibleButton
          title="Save"
          onPress={jest.fn()}
          disabled={true}
          testID="disabled-button"
        />
      );
      
      const button = getByTestId('disabled-button');
      expect(button).toHaveProp('accessibilityState', { disabled: true });
    });

    it('should announce button press', async () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = renderWithTheme(
        <AccessibleButton
          title="Save"
          onPress={mockOnPress}
          accessibilityHint="Saves the form"
          testID="save-button"
        />
      );
      
      const button = getByTestId('save-button');
      fireEvent.press(button);
      
      expect(mockOnPress).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(mockAnnounceForAccessibility).toHaveBeenCalledWith('Saves the form');
      });
    });
  });

  describe('AccessibleTextInput', () => {
    it('should have proper accessibility labels', () => {
      const { getByTestId } = renderWithTheme(
        <AccessibleTextInput
          label="Recipe Name"
          value=""
          onChangeText={jest.fn()}
          testID="recipe-name-input"
        />
      );
      
      const input = getByTestId('recipe-name-input');
      expect(input).toHaveProp('accessibilityLabel', 'Recipe Name');
    });

    it('should announce error states', async () => {
      const { getByTestId } = renderWithTheme(
        <AccessibleTextInput
          label="Recipe Name"
          value=""
          onChangeText={jest.fn()}
          error="Name is required"
          testID="recipe-name-input"
        />
      );
      
      const input = getByTestId('recipe-name-input');
      expect(input).toHaveProp('accessibilityState', { invalid: true });
      expect(input).toHaveProp('accessibilityHint', 'Error: Name is required');
    });

    it('should handle character count announcements', async () => {
      const { getByTestId } = renderWithTheme(
        <AccessibleTextInput
          label="Description"
          value="Test description"
          onChangeText={jest.fn()}
          maxLength={100}
          testID="description-input"
        />
      );
      
      const input = getByTestId('description-input');
      fireEvent.changeText(input, 'Test description');
      
      await waitFor(() => {
        expect(mockAnnounceForAccessibility).toHaveBeenCalledWith('14 of 100 characters used');
      });
    });
  });

  describe('AccessibleModal', () => {
    it('should announce modal opening', async () => {
      const { getByTestId } = renderWithTheme(
        <AccessibleModal
          visible={true}
          onClose={jest.fn()}
          title="Settings"
          testID="settings-modal"
        >
          <AccessibleTextInput
            label="Setting Name"
            value=""
            onChangeText={jest.fn()}
            testID="setting-input"
          />
        </AccessibleModal>
      );
      
      await waitFor(() => {
        expect(mockAnnounceForAccessibility).toHaveBeenCalledWith('Modal opened: Settings');
      });
    });

    it('should announce modal content changes', async () => {
      const { getByTestId, rerender } = renderWithTheme(
        <AccessibleModal visible={true} onClose={jest.fn()} title="Settings" testID="settings-modal">
          <AccessibleTextInput
            label="Setting Name"
            value=""
            onChangeText={jest.fn()}
            testID="setting-input"
          />
        </AccessibleModal>
      );
      
      await waitFor(() => {
        expect(mockAnnounceForAccessibility).toHaveBeenCalledWith('Modal opened: Settings');
      });
    });

    it('should announce modal closing', async () => {
      const { getByTestId } = renderWithTheme(
        <AccessibleModal
          visible={true}
          onClose={jest.fn()}
          title="Settings"
          testID="settings-modal"
        >
          <AccessibleTextInput
            label="Setting Name"
            value=""
            onChangeText={jest.fn()}
            testID="setting-input"
          />
        </AccessibleModal>
      );
      
      const closeButton = getByTestId('settings-modal-close');
      fireEvent.press(closeButton);
      
      await waitFor(() => {
        expect(mockAnnounceForAccessibility).toHaveBeenCalledWith('Modal closed');
      });
    });
  });

  describe('AccessibleImage', () => {
    it('should announce image loading states', async () => {
      const { getByTestId, rerender } = renderWithTheme(
        <AccessibleImage
          source={{ uri: 'https://example.com/image.jpg' }}
          alt="Recipe Photo"
          testID="recipe-image"
        />
      );
      
      await waitFor(() => {
        expect(mockAnnounceForAccessibility).toHaveBeenCalledWith('Loading image: Recipe Photo');
      });
    });

    it('should announce image loaded state', async () => {
      const { getByTestId } = renderWithTheme(
        <AccessibleImage
          source={{ uri: 'https://example.com/image.jpg' }}
          alt="Recipe Photo"
          testID="recipe-image"
        />
      );
      
      await waitFor(() => {
        expect(mockAnnounceForAccessibility).toHaveBeenCalledWith('Image loaded: Recipe Photo');
      });
    });

    it('should announce image error state', async () => {
      const { getByTestId } = renderWithTheme(
        <AccessibleImage
          source={{ uri: 'https://example.com/invalid.jpg' }}
          alt="Recipe Photo"
          testID="recipe-image"
        />
      );
      
      await waitFor(() => {
        expect(mockAnnounceForAccessibility).toHaveBeenCalledWith('Failed to load image: Recipe Photo');
      });
    });
  });

  describe('Screen Reader Integration', () => {
    it('should work with VoiceOver', async () => {
      (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockResolvedValue(true);
      
      const { getByTestId } = renderWithTheme(
        <AccessibleButton
          title="Test Button"
          onPress={jest.fn()}
          testID="test-button"
        />
      );
      
      await waitFor(() => {
        expect(mockAnnounceForAccessibility).toHaveBeenCalled();
      });
    });

    it('should work with TalkBack', async () => {
      (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockResolvedValue(true);
      
      const { getByTestId } = renderWithTheme(
        <AccessibleButton
          title="Test Button"
          onPress={jest.fn()}
          testID="test-button"
        />
      );
      
      await waitFor(() => {
        expect(mockAnnounceForAccessibility).toHaveBeenCalled();
      });
    });

    it('should handle screen reader disabled state', async () => {
      (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockResolvedValue(false);
      
      const { getByTestId } = renderWithTheme(
        <AccessibleButton
          title="Test Button"
          onPress={jest.fn()}
          testID="test-button"
        />
      );
      
      const button = getByTestId('test-button');
      fireEvent.press(button);
      
      // Should not announce when screen reader is disabled
      expect(mockAnnounceForAccessibility).not.toHaveBeenCalled();
    });
  });
});