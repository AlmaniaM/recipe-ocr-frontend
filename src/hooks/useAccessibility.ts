import { useState, useEffect, useCallback } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

export interface UseAccessibilityReturn {
  isScreenReaderEnabled: boolean;
  announceForAccessibility: (message: string) => void;
  setAccessibilityFocus: (ref: React.RefObject<any>) => void;
  isAccessibilityEnabled: () => boolean;
  announceScreenChange: (screenName: string) => void;
  announceError: (errorMessage: string) => void;
  announceSuccess: (message: string) => void;
}

/**
 * Hook for accessibility utilities and screen reader support
 * Provides screen reader detection, announcements, and focus management
 */
export function useAccessibility(): UseAccessibilityReturn {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);

  useEffect(() => {
    const checkScreenReader = async () => {
      try {
        const enabled = await AccessibilityInfo.isScreenReaderEnabled();
        setIsScreenReaderEnabled(enabled);
      } catch (error) {
        console.warn('Failed to check screen reader status:', error);
        setIsScreenReaderEnabled(false);
      }
    };

    checkScreenReader();

    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled) => {
        setIsScreenReaderEnabled(enabled);
      }
    );

    return () => subscription?.remove();
  }, []);

  const announceForAccessibility = useCallback((message: string) => {
    if (isScreenReaderEnabled && message) {
      try {
        AccessibilityInfo.announceForAccessibility(message);
      } catch (error) {
        console.warn('Failed to announce for accessibility:', error);
      }
    }
  }, [isScreenReaderEnabled]);

  const setAccessibilityFocus = useCallback((ref: React.RefObject<any>) => {
    if (ref?.current && isScreenReaderEnabled) {
      try {
        ref.current.focus();
      } catch (error) {
        console.warn('Failed to set accessibility focus:', error);
      }
    }
  }, [isScreenReaderEnabled]);

  const isAccessibilityEnabled = useCallback(() => {
    return isScreenReaderEnabled;
  }, [isScreenReaderEnabled]);

  const announceScreenChange = useCallback((screenName: string) => {
    announceForAccessibility(`Navigated to ${screenName} screen`);
  }, [announceForAccessibility]);

  const announceError = useCallback((errorMessage: string) => {
    announceForAccessibility(`Error: ${errorMessage}`);
  }, [announceForAccessibility]);

  const announceSuccess = useCallback((message: string) => {
    announceForAccessibility(`Success: ${message}`);
  }, [announceForAccessibility]);

  return {
    isScreenReaderEnabled,
    announceForAccessibility,
    setAccessibilityFocus,
    isAccessibilityEnabled,
    announceScreenChange,
    announceError,
    announceSuccess,
  };
}

export default useAccessibility;
