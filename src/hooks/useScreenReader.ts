import { useState, useEffect, useCallback } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

export interface UseScreenReaderReturn {
  isScreenReaderEnabled: boolean;
  isVoiceOverEnabled: boolean;
  isTalkBackEnabled: boolean;
  announceForAccessibility: (message: string) => void;
  announceScreenChange: (screenName: string) => void;
  announceError: (errorMessage: string) => void;
  announceSuccess: (message: string) => void;
  announceLoading: (message: string) => void;
  announceComplete: (message: string) => void;
}

/**
 * Hook for screen reader detection and announcements
 * Provides platform-specific screen reader support
 */
export function useScreenReader(): UseScreenReaderReturn {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isVoiceOverEnabled, setIsVoiceOverEnabled] = useState(false);
  const [isTalkBackEnabled, setIsTalkBackEnabled] = useState(false);

  useEffect(() => {
    const checkScreenReader = async () => {
      try {
        const enabled = await AccessibilityInfo.isScreenReaderEnabled();
        setIsScreenReaderEnabled(enabled);
        
        // Platform-specific detection
        if (Platform.OS === 'ios') {
          setIsVoiceOverEnabled(enabled);
        } else if (Platform.OS === 'android') {
          setIsTalkBackEnabled(enabled);
        }
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
        if (Platform.OS === 'ios') {
          setIsVoiceOverEnabled(enabled);
        } else if (Platform.OS === 'android') {
          setIsTalkBackEnabled(enabled);
        }
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

  const announceScreenChange = useCallback((screenName: string) => {
    announceForAccessibility(`Navigated to ${screenName} screen`);
  }, [announceForAccessibility]);

  const announceError = useCallback((errorMessage: string) => {
    announceForAccessibility(`Error: ${errorMessage}`);
  }, [announceForAccessibility]);

  const announceSuccess = useCallback((message: string) => {
    announceForAccessibility(`Success: ${message}`);
  }, [announceForAccessibility]);

  const announceLoading = useCallback((message: string) => {
    announceForAccessibility(`Loading: ${message}`);
  }, [announceForAccessibility]);

  const announceComplete = useCallback((message: string) => {
    announceForAccessibility(`Complete: ${message}`);
  }, [announceForAccessibility]);

  return {
    isScreenReaderEnabled,
    isVoiceOverEnabled,
    isTalkBackEnabled,
    announceForAccessibility,
    announceScreenChange,
    announceError,
    announceSuccess,
    announceLoading,
    announceComplete,
  };
}

export default useScreenReader;
