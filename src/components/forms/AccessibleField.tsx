import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  AccessibilityRole,
  AccessibilityState,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAccessibility } from '../../hooks/useAccessibility';
import AccessibleTextInput from '../common/AccessibleTextInput';

export interface AccessibleFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: ViewStyle;
  testID?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  maxLength?: number;
  showCharacterCount?: boolean;
  validation?: (value: string) => string | null;
  onValidationChange?: (isValid: boolean) => void;
  helperText?: string;
  showHelperText?: boolean;
}

/**
 * Accessible form field component with comprehensive accessibility support
 * Provides proper labeling, validation, error handling, and screen reader support
 */
export const AccessibleField: React.FC<AccessibleFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  required = false,
  multiline = false,
  numberOfLines = 1,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID = 'accessible-field',
  disabled = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  returnKeyType = 'done',
  onSubmitEditing,
  onFocus,
  onBlur,
  maxLength,
  showCharacterCount = false,
  validation,
  onValidationChange,
  helperText,
  showHelperText = false,
}) => {
  const { theme } = useTheme();
  const { announceForAccessibility } = useAccessibility();
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);
  const fieldRef = useRef<View>(null);

  const effectiveError = error || internalError;
  const effectiveAccessibilityLabel = accessibilityLabel || label;
  const effectiveAccessibilityHint = accessibilityHint || 
    (required ? 'Required field' : 'Optional field') +
    (effectiveError ? `. Error: ${effectiveError}` : '') +
    (placeholder ? `. ${placeholder}` : '') +
    (helperText ? `. ${helperText}` : '');

  const validateField = useCallback((text: string) => {
    if (validation) {
      const validationError = validation(text);
      setInternalError(validationError);
      const fieldIsValid = !validationError;
      setIsValid(fieldIsValid);
      
      if (onValidationChange) {
        onValidationChange(fieldIsValid);
      }
      
      return fieldIsValid;
    }
    return true;
  }, [validation, onValidationChange]);

  const handleChangeText = useCallback((text: string) => {
    onChangeText(text);
    validateField(text);
  }, [onChangeText, validateField]);

  const handleFocus = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    onBlur?.();
    // Validate on blur
    validateField(value);
  }, [onBlur, validateField, value]);

  const handleSubmitEditing = useCallback(() => {
    onSubmitEditing?.();
  }, [onSubmitEditing]);

  // Validate on mount and when validation function changes
  useEffect(() => {
    validateField(value);
  }, [validateField, value]);

  // Announce error changes
  useEffect(() => {
    if (effectiveError) {
      announceForAccessibility(`Error in ${label}: ${effectiveError}`);
    }
  }, [effectiveError, label, announceForAccessibility]);

  const getContainerStyle = () => {
    const baseStyle = [styles.container];
    
    if (effectiveError) {
      baseStyle.push(styles.containerError);
    }

    return baseStyle;
  };

  const getHelperTextStyle = () => {
    return [styles.helperText, { color: theme.colors.textSecondary }];
  };

  const getErrorStyle = () => {
    return [styles.errorText, { color: theme.colors.error }];
  };

  return (
    <View
      ref={fieldRef}
      style={[getContainerStyle(), style]}
      testID={testID}
      accessible={true}
      accessibilityLabel={effectiveAccessibilityLabel}
      accessibilityHint={effectiveAccessibilityHint}
      accessibilityRole="text"
      accessibilityState={{
        disabled,
        invalid: !!effectiveError,
      } as AccessibilityState}
    >
      <AccessibleTextInput
        label={label}
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        error={effectiveError}
        required={required}
        multiline={multiline}
        numberOfLines={numberOfLines}
        accessibilityLabel={effectiveAccessibilityLabel}
        accessibilityHint={effectiveAccessibilityHint}
        testID={`${testID}-input`}
        disabled={disabled}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        returnKeyType={returnKeyType}
        onSubmitEditing={handleSubmitEditing}
        onFocus={handleFocus}
        onBlur={handleBlur}
        maxLength={maxLength}
        showCharacterCount={showCharacterCount}
      />
      
      {showHelperText && helperText && !effectiveError && (
        <Text
          style={getHelperTextStyle()}
          testID={`${testID}-helper`}
          accessible={true}
          accessibilityRole="text"
        >
          {helperText}
        </Text>
      )}
      
      {effectiveError && (
        <Text
          style={getErrorStyle()}
          testID={`${testID}-error`}
          accessible={true}
          accessibilityRole="text"
          accessibilityLiveRegion="assertive"
        >
          {effectiveError}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  containerError: {
    marginBottom: 20,
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
    marginLeft: 4,
  },
});

export default AccessibleField;
