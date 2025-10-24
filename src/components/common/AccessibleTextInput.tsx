import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  AccessibilityRole,
  AccessibilityState,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAccessibility } from '../../hooks/useAccessibility';

export interface AccessibleTextInputProps {
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
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
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
}

/**
 * Accessible text input component with comprehensive accessibility support
 * Provides proper labeling, error announcements, and screen reader support
 */
export const AccessibleTextInput: React.FC<AccessibleTextInputProps> = ({
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
  inputStyle,
  labelStyle,
  testID = 'accessible-text-input',
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
}) => {
  const { theme } = useTheme();
  const { announceForAccessibility } = useAccessibility();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const effectiveAccessibilityLabel = accessibilityLabel || label;
  const effectiveAccessibilityHint = accessibilityHint || 
    (required ? 'Required field' : 'Optional field') +
    (error ? `. Error: ${error}` : '') +
    (placeholder ? `. ${placeholder}` : '');

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const handleChangeText = useCallback((text: string) => {
    onChangeText(text);
  }, [onChangeText]);

  const handleSubmitEditing = useCallback(() => {
    onSubmitEditing?.();
  }, [onSubmitEditing]);

  // Announce error when it changes
  useEffect(() => {
    if (error) {
      announceForAccessibility(`Error in ${label}: ${error}`);
    }
  }, [error, label, announceForAccessibility]);

  const getContainerStyle = () => {
    const baseStyle = [styles.container];
    
    if (error) {
      baseStyle.push({
        borderColor: theme.colors.error,
      });
    } else if (isFocused) {
      baseStyle.push({
        borderColor: theme.colors.primary,
      });
    } else {
      baseStyle.push({
        borderColor: theme.colors.border,
      });
    }

    if (disabled) {
      baseStyle.push({
        backgroundColor: theme.colors.background,
        opacity: 0.6,
      });
    }

    return baseStyle;
  };

  const getInputStyle = () => {
    const baseStyle = [styles.input, { color: theme.colors.textPrimary }];
    
    if (multiline) {
      baseStyle.push(styles.multilineInput);
    }

    return baseStyle;
  };

  const getLabelStyle = () => {
    const baseStyle = [styles.label, { color: theme.colors.textPrimary }];
    
    if (required) {
      baseStyle.push(styles.requiredLabel);
    }

    if (error) {
      baseStyle.push({ color: theme.colors.error });
    }

    return baseStyle;
  };

  const getErrorStyle = () => {
    return [styles.errorText, { color: theme.colors.error }];
  };

  const getCharacterCountStyle = () => {
    return [styles.characterCount, { color: theme.colors.textSecondary }];
  };

  return (
    <View style={[getContainerStyle(), style]} testID={testID}>
      <Text
        style={[getLabelStyle(), labelStyle]}
        testID={`${testID}-label`}
        accessible={true}
        accessibilityRole="text"
      >
        {label}
        {required && <Text style={styles.requiredAsterisk}> *</Text>}
      </Text>
      
      <TextInput
        ref={inputRef}
        style={[getInputStyle(), inputStyle]}
        value={value}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={handleSubmitEditing}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={!disabled}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        returnKeyType={returnKeyType}
        maxLength={maxLength}
        testID={`${testID}-input`}
        accessibilityLabel={effectiveAccessibilityLabel}
        accessibilityHint={effectiveAccessibilityHint}
        accessibilityRole="text"
        accessibilityState={{
          disabled,
          selected: isFocused,
        } as AccessibilityState}
        accessible={true}
      />
      
      {error && (
        <Text
          style={getErrorStyle()}
          testID={`${testID}-error`}
          accessible={true}
          accessibilityRole="text"
          accessibilityLiveRegion="assertive"
        >
          {error}
        </Text>
      )}
      
      {showCharacterCount && maxLength && (
        <Text
          style={getCharacterCountStyle()}
          testID={`${testID}-character-count`}
          accessible={true}
          accessibilityRole="text"
        >
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  requiredLabel: {
    fontWeight: '600',
  },
  requiredAsterisk: {
    color: '#FF0000',
    fontWeight: 'bold',
  },
  input: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 20,
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
    textAlign: 'right',
  },
});

export default AccessibleTextInput;
