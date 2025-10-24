import React, { useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  AccessibilityRole,
  AccessibilityState,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';
import { useAccessibility } from '../../hooks/useAccessibility';
import { useFocusManagement } from '../../hooks/useFocusManagement';

export interface AccessibleModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: ViewStyle;
  testID?: string;
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
  closeOnEscape?: boolean;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  position?: 'center' | 'top' | 'bottom';
}

/**
 * Accessible modal component with comprehensive accessibility support
 * Provides proper focus management, screen reader support, and keyboard navigation
 */
export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  visible,
  onClose,
  title,
  children,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID = 'accessible-modal',
  showCloseButton = true,
  closeOnBackdropPress = true,
  closeOnEscape = true,
  size = 'medium',
  position = 'center',
}) => {
  const { theme } = useTheme();
  const { announceForAccessibility } = useAccessibility();
  const { registerElement, unregisterElement, setFocus } = useFocusManagement();
  const modalRef = useRef<View>(null);
  const closeButtonRef = useRef<TouchableOpacity>(null);

  const effectiveAccessibilityLabel = accessibilityLabel || title;
  const effectiveAccessibilityHint = accessibilityHint || 'Modal dialog';

  useEffect(() => {
    if (visible) {
      // Register modal elements for focus management
      if (modalRef.current) {
        registerElement('modal-content', modalRef);
      }
      if (closeButtonRef.current) {
        registerElement('modal-close', closeButtonRef);
      }

      // Announce modal opening
      announceForAccessibility(`Modal opened: ${title}`);

      // Focus the modal content
      setTimeout(() => {
        setFocus('modal-content');
      }, 100);
    } else {
      // Unregister modal elements
      unregisterElement('modal-content');
      unregisterElement('modal-close');
    }
  }, [visible, title, announceForAccessibility, registerElement, unregisterElement, setFocus]);

  const handleClose = useCallback(() => {
    announceForAccessibility('Modal closed');
    onClose();
  }, [announceForAccessibility, onClose]);

  const handleBackdropPress = useCallback(() => {
    if (closeOnBackdropPress) {
      handleClose();
    }
  }, [closeOnBackdropPress, handleClose]);

  const handleCloseButtonPress = useCallback(() => {
    handleClose();
  }, [handleClose]);

  const getModalStyle = () => {
    const baseStyle = [styles.modal];
    
    switch (position) {
      case 'top':
        baseStyle.push(styles.modalTop);
        break;
      case 'bottom':
        baseStyle.push(styles.modalBottom);
        break;
      case 'center':
      default:
        baseStyle.push(styles.modalCenter);
        break;
    }

    return baseStyle;
  };

  const getContentStyle = () => {
    const baseStyle = [styles.content, { backgroundColor: theme.colors.surface }];
    
    switch (size) {
      case 'small':
        baseStyle.push(styles.contentSmall);
        break;
      case 'medium':
        baseStyle.push(styles.contentMedium);
        break;
      case 'large':
        baseStyle.push(styles.contentLarge);
        break;
      case 'fullscreen':
        baseStyle.push(styles.contentFullscreen);
        break;
    }

    return baseStyle;
  };

  const getTitleStyle = () => {
    return [styles.title, { color: theme.colors.textPrimary }];
  };

  const getCloseButtonStyle = () => {
    return [styles.closeButton, { backgroundColor: theme.colors.background }];
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={closeOnEscape ? handleClose : undefined}
      testID={testID}
      accessible={true}
      accessibilityLabel={effectiveAccessibilityLabel}
      accessibilityHint={effectiveAccessibilityHint}
      accessibilityRole="dialog"
    >
      <View style={getModalStyle()}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={handleBackdropPress}
          testID={`${testID}-backdrop`}
          accessible={true}
          accessibilityLabel="Close modal"
          accessibilityRole="button"
        />
        
        <View
          ref={modalRef}
          style={[getContentStyle(), style]}
          testID={`${testID}-content`}
          accessible={true}
          accessibilityLabel={effectiveAccessibilityLabel}
          accessibilityHint={effectiveAccessibilityHint}
          accessibilityRole="dialog"
        >
          <View style={styles.header}>
            <Text
              style={getTitleStyle()}
              testID={`${testID}-title`}
              accessible={true}
              accessibilityRole="header"
            >
              {title}
            </Text>
            
            {showCloseButton && (
              <TouchableOpacity
                ref={closeButtonRef}
                style={getCloseButtonStyle()}
                onPress={handleCloseButtonPress}
                testID={`${testID}-close`}
                accessible={true}
                accessibilityLabel="Close modal"
                accessibilityHint="Double tap to close this modal"
                accessibilityRole="button"
              >
                <Icon name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.body}>
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTop: {
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  modalCenter: {
    justifyContent: 'center',
  },
  modalBottom: {
    justifyContent: 'flex-end',
    paddingBottom: 50,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    borderRadius: 12,
    margin: 20,
    maxHeight: screenHeight * 0.9,
    minWidth: 300,
  },
  contentSmall: {
    maxWidth: 400,
  },
  contentMedium: {
    maxWidth: 600,
  },
  contentLarge: {
    maxWidth: 800,
  },
  contentFullscreen: {
    width: screenWidth,
    height: screenHeight,
    margin: 0,
    borderRadius: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 20,
  },
});

export default AccessibleModal;
