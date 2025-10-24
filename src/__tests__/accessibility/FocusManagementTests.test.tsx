import React, { useRef } from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useFocusManagement } from '../../hooks/useFocusManagement';

describe('useFocusManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register and unregister elements', () => {
    const { result } = renderHook(() => useFocusManagement());
    const mockRef1 = { current: { focus: jest.fn() } };
    const mockRef2 = { current: { focus: jest.fn() } };

    act(() => {
      result.current.registerElement('element1', mockRef1);
      result.current.registerElement('element2', mockRef2);
    });

    expect(result.current.getFocusableElements()).toEqual(['element1', 'element2']);

    act(() => {
      result.current.unregisterElement('element1');
    });

    expect(result.current.getFocusableElements()).toEqual(['element2']);
  });

  it('should set focus to a registered element', () => {
    const { result } = renderHook(() => useFocusManagement());
    const mockRef = { current: { focus: jest.fn() } };

    act(() => {
      result.current.registerElement('testElement', mockRef);
      result.current.setFocus('testElement');
    });

    expect(mockRef.current.focus).toHaveBeenCalledTimes(1);
    expect(result.current.focusedElement).toBe('testElement');
    expect(result.current.isFocused('testElement')).toBe(true);
  });

  it('should clear focus', () => {
    const { result } = renderHook(() => useFocusManagement());
    const mockRef = { current: { focus: jest.fn() } };

    act(() => {
      result.current.registerElement('testElement', mockRef);
      result.current.setFocus('testElement');
      result.current.clearFocus();
    });

    expect(result.current.focusedElement).toBeNull();
    expect(result.current.isFocused('testElement')).toBe(false);
  });

  it('should move focus to the next element', () => {
    const { result } = renderHook(() => useFocusManagement());
    const mockRef1 = { current: { focus: jest.fn() } };
    const mockRef2 = { current: { focus: jest.fn() } };
    const mockRef3 = { current: { focus: jest.fn() } };

    act(() => {
      result.current.registerElement('el1', mockRef1);
      result.current.registerElement('el2', mockRef2);
      result.current.registerElement('el3', mockRef3);
      result.current.setFocus('el1');
    });

    act(() => {
      result.current.focusNext();
    });
    expect(result.current.focusedElement).toBe('el2');
    expect(mockRef2.current.focus).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.focusNext();
    });
    expect(result.current.focusedElement).toBe('el3');
    expect(mockRef3.current.focus).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.focusNext(); // Wraps around
    });
    expect(result.current.focusedElement).toBe('el1');
    expect(mockRef1.current.focus).toHaveBeenCalledTimes(2);
  });

  it('should move focus to the previous element', () => {
    const { result } = renderHook(() => useFocusManagement());
    const mockRef1 = { current: { focus: jest.fn() } };
    const mockRef2 = { current: { focus: jest.fn() } };
    const mockRef3 = { current: { focus: jest.fn() } };

    act(() => {
      result.current.registerElement('el1', mockRef1);
      result.current.registerElement('el2', mockRef2);
      result.current.registerElement('el3', mockRef3);
      result.current.setFocus('el3'); // Start at the last element
    });

    act(() => {
      result.current.focusPrevious();
    });
    expect(result.current.focusedElement).toBe('el2');
    expect(mockRef2.current.focus).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.focusPrevious();
    });
    expect(result.current.focusedElement).toBe('el1');
    expect(mockRef1.current.focus).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.focusPrevious(); // Wraps around
    });
    expect(result.current.focusedElement).toBe('el3');
    expect(mockRef3.current.focus).toHaveBeenCalledTimes(2);
  });

  it('should cleanup on unmount', () => {
    const { result, unmount } = renderHook(() => useFocusManagement());
    const mockRef = { current: { focus: jest.fn() } };

    act(() => {
      result.current.registerElement('element1', mockRef);
    });
    expect(result.current.getFocusableElements()).toEqual(['element1']);

    unmount();

    expect(result.current.getFocusableElements()).toEqual([]);
  });

  it('should handle focus on non-existent element gracefully', () => {
    const { result } = renderHook(() => useFocusManagement());
    const mockRef = { current: { focus: jest.fn() } };

    act(() => {
      result.current.registerElement('element1', mockRef);
      result.current.setFocus('nonExistentElement');
    });

    expect(result.current.focusedElement).toBeNull();
    expect(mockRef.current.focus).not.toHaveBeenCalled();
  });

  it('should handle focus next when no elements are registered', () => {
    const { result } = renderHook(() => useFocusManagement());

    act(() => {
      result.current.focusNext();
    });

    expect(result.current.focusedElement).toBeNull();
  });

  it('should handle focus previous when no elements are registered', () => {
    const { result } = renderHook(() => useFocusManagement());

    act(() => {
      result.current.focusPrevious();
    });

    expect(result.current.focusedElement).toBeNull();
  });

  it('should handle focus next when only one element is registered', () => {
    const { result } = renderHook(() => useFocusManagement());
    const mockRef = { current: { focus: jest.fn() } };

    act(() => {
      result.current.registerElement('element1', mockRef);
      result.current.setFocus('element1');
      result.current.focusNext();
    });

    expect(result.current.focusedElement).toBe('element1');
    expect(mockRef.current.focus).toHaveBeenCalledTimes(2);
  });

  it('should handle focus previous when only one element is registered', () => {
    const { result } = renderHook(() => useFocusManagement());
    const mockRef = { current: { focus: jest.fn() } };

    act(() => {
      result.current.registerElement('element1', mockRef);
      result.current.setFocus('element1');
      result.current.focusPrevious();
    });

    expect(result.current.focusedElement).toBe('element1');
    expect(mockRef.current.focus).toHaveBeenCalledTimes(2);
  });

  it('should handle unregistering non-existent element gracefully', () => {
    const { result } = renderHook(() => useFocusManagement());
    const mockRef = { current: { focus: jest.fn() } };

    act(() => {
      result.current.registerElement('element1', mockRef);
      result.current.unregisterElement('nonExistentElement');
    });

    expect(result.current.getFocusableElements()).toEqual(['element1']);
  });

  it('should handle multiple registrations of same element', () => {
    const { result } = renderHook(() => useFocusManagement());
    const mockRef1 = { current: { focus: jest.fn() } };
    const mockRef2 = { current: { focus: jest.fn() } };

    act(() => {
      result.current.registerElement('element1', mockRef1);
      result.current.registerElement('element1', mockRef2);
    });

    expect(result.current.getFocusableElements()).toEqual(['element1']);
    expect(result.current.getFocusableElements()).toHaveLength(1);
  });

  it('should handle focus management with empty refs', () => {
    const { result } = renderHook(() => useFocusManagement());
    const mockRef = { current: null };

    act(() => {
      result.current.registerElement('element1', mockRef);
      result.current.setFocus('element1');
    });

    expect(result.current.focusedElement).toBeNull();
  });

  it('should handle focus management with refs without focus method', () => {
    const { result } = renderHook(() => useFocusManagement());
    const mockRef = { current: {} };

    act(() => {
      result.current.registerElement('element1', mockRef);
      result.current.setFocus('element1');
    });

    expect(result.current.focusedElement).toBeNull();
  });
});