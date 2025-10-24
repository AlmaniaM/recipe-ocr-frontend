import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAccessibility } from '../../hooks/useAccessibility';
import { useFocusManagement } from '../../hooks/useFocusManagement';

export interface AccessibleFormProps {
  children: React.ReactNode;
  onSubmit?: () => void;
  onReset?: () => void;
  style?: ViewStyle;
  testID?: string;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  showSubmitButton?: boolean;
  showResetButton?: boolean;
  submitButtonText?: string;
  resetButtonText?: string;
  onValidationChange?: (isValid: boolean) => void;
}

/**
 * Accessible form component with comprehensive accessibility support
 * Provides proper form structure, validation announcements, and keyboard navigation
 */
export const AccessibleForm: React.FC<AccessibleFormProps> = ({
  children,
  onSubmit,
  onReset,
  style,
  testID = 'accessible-form',
  scrollable = true,
  keyboardAvoiding = true,
  accessibilityLabel = 'Form',
  accessibilityHint = 'Fill out the form fields below',
  showSubmitButton = false,
  showResetButton = false,
  submitButtonText = 'Submit',
  resetButtonText = 'Reset',
  onValidationChange,
}) => {
  const { theme } = useTheme();
  const { announceForAccessibility } = useAccessibility();
  const { registerElement, unregisterElement, setFocus } = useFocusManagement();
  const formRef = useRef<View>(null);
  const submitButtonRef = useRef<any>(null);
  const resetButtonRef = useRef<any>(null);

  useEffect(() => {
    // Register form elements for focus management
    if (formRef.current) {
      registerElement('form', formRef);
    }
    if (submitButtonRef.current) {
      registerElement('form-submit', submitButtonRef);
    }
    if (resetButtonRef.current) {
      registerElement('form-reset', resetButtonRef);
    }

    return () => {
      unregisterElement('form');
      unregisterElement('form-submit');
      unregisterElement('form-reset');
    };
  }, [registerElement, unregisterElement]);

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      announceForAccessibility('Form submitted');
      onSubmit();
    }
  }, [onSubmit, announceForAccessibility]);

  const handleReset = useCallback(() => {
    if (onReset) {
      announceForAccessibility('Form reset');
      onReset();
    }
  }, [onReset, announceForAccessibility]);

  const handleValidationChange = useCallback((isValid: boolean) => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
    
    if (isValid) {
      announceForAccessibility('Form is valid and ready to submit');
    } else {
      announceForAccessibility('Form has validation errors');
    }
  }, [onValidationChange, announceForAccessibility]);

  const getFormStyle = () => {
    return [styles.form, { backgroundColor: theme.colors.surface }, style];
  };

  const getButtonContainerStyle = () => {
    return [styles.buttonContainer, { borderTopColor: theme.colors.border }];
  };

  const FormContent = scrollable ? ScrollView : View;
  const FormWrapper = keyboardAvoiding ? KeyboardAvoidingView : View;

  const keyboardAvoidingProps = keyboardAvoiding ? {
    behavior: Platform.OS === 'ios' ? 'padding' : 'height',
    keyboardVerticalOffset: Platform.OS === 'ios' ? 100 : 0,
  } : {};

  return (
    <FormWrapper
      style={styles.wrapper}
      {...keyboardAvoidingProps}
    >
      <FormContent
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          ref={formRef}
          style={getFormStyle()}
          testID={testID}
          accessible={true}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityRole="form"
        >
          {children}
          
          {(showSubmitButton || showResetButton) && (
            <View style={getButtonContainerStyle()}>
              {showResetButton && (
                <View style={styles.buttonWrapper}>
                  {/* Reset button would be implemented here */}
                </View>
              )}
              {showSubmitButton && (
                <View style={styles.buttonWrapper}>
                  {/* Submit button would be implemented here */}
                </View>
              )}
            </View>
          )}
        </View>
      </FormContent>
    </FormWrapper>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    flex: 1,
    padding: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    marginTop: 20,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default AccessibleForm;
