import { useState, useCallback, useRef, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

export interface UseFocusManagementReturn {
  focusedElement: string | null;
  setFocus: (elementId: string) => void;
  clearFocus: () => void;
  isFocused: (elementId: string) => boolean;
  focusNext: () => void;
  focusPrevious: () => void;
  registerElement: (elementId: string, ref: React.RefObject<any>) => void;
  unregisterElement: (elementId: string) => void;
  getFocusableElements: () => string[];
}

/**
 * Hook for managing focus and keyboard navigation
 * Provides focus management utilities for accessible navigation
 */
export function useFocusManagement(): UseFocusManagementReturn {
  const [focusedElement, setFocusedElement] = useState<string | null>(null);
  const [focusableElements, setFocusableElements] = useState<string[]>([]);
  const elementRefs = useRef<Map<string, React.RefObject<any>>>(new Map());

  const registerElement = useCallback((elementId: string, ref: React.RefObject<any>) => {
    elementRefs.current.set(elementId, ref);
    setFocusableElements(prev => {
      if (!prev.includes(elementId)) {
        return [...prev, elementId];
      }
      return prev;
    });
  }, []);

  const unregisterElement = useCallback((elementId: string) => {
    elementRefs.current.delete(elementId);
    setFocusableElements(prev => prev.filter(id => id !== elementId));
    if (focusedElement === elementId) {
      setFocusedElement(null);
    }
  }, [focusedElement]);

  const setFocus = useCallback((elementId: string) => {
    const ref = elementRefs.current.get(elementId);
    if (ref?.current) {
      try {
        ref.current.focus();
        setFocusedElement(elementId);
      } catch (error) {
        console.warn(`Failed to focus element ${elementId}:`, error);
      }
    }
  }, []);

  const clearFocus = useCallback(() => {
    setFocusedElement(null);
  }, []);

  const isFocused = useCallback((elementId: string) => {
    return focusedElement === elementId;
  }, [focusedElement]);

  const focusNext = useCallback(() => {
    const currentIndex = focusableElements.indexOf(focusedElement || '');
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    if (focusableElements[nextIndex]) {
      setFocus(focusableElements[nextIndex]);
    }
  }, [focusableElements, focusedElement, setFocus]);

  const focusPrevious = useCallback(() => {
    const currentIndex = focusableElements.indexOf(focusedElement || '');
    const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
    if (focusableElements[prevIndex]) {
      setFocus(focusableElements[prevIndex]);
    }
  }, [focusableElements, focusedElement, setFocus]);

  const getFocusableElements = useCallback(() => {
    return [...focusableElements];
  }, [focusableElements]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      elementRefs.current.clear();
      setFocusableElements([]);
      setFocusedElement(null);
    };
  }, []);

  return {
    focusedElement,
    setFocus,
    clearFocus,
    isFocused,
    focusNext,
    focusPrevious,
    registerElement,
    unregisterElement,
    getFocusableElements,
  };
}

export default useFocusManagement;
