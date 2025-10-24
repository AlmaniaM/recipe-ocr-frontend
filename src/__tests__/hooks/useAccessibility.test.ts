import { renderHook, act } from '@testing-library/react-native';
import { useAccessibility } from '../../hooks/useAccessibility';

// The react-native mock is now handled globally in jest.config.js
describe('useAccessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with screen reader disabled', async () => {
    const { result } = renderHook(() => useAccessibility());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.isScreenReaderEnabled).toBe(false);
  });

  it('should detect screen reader enabled', async () => {
    // Mock the screen reader as enabled
    const { AccessibilityInfo } = require('react-native');
    AccessibilityInfo.isScreenReaderEnabled.mockResolvedValue(true);
    
    const { result } = renderHook(() => useAccessibility());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.isScreenReaderEnabled).toBe(true);
  });

  it('should announce for accessibility when screen reader is enabled', async () => {
    const { AccessibilityInfo } = require('react-native');
    AccessibilityInfo.isScreenReaderEnabled.mockResolvedValue(true);
    
    const { result } = renderHook(() => useAccessibility());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    act(() => {
      result.current.announceForAccessibility('Test message');
    });
    
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Test message');
  });

  it('should not announce when screen reader is disabled', async () => {
    const { AccessibilityInfo } = require('react-native');
    AccessibilityInfo.isScreenReaderEnabled.mockResolvedValue(false);
    
    const { result } = renderHook(() => useAccessibility());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    act(() => {
      result.current.announceForAccessibility('Test message');
    });
    
    expect(AccessibilityInfo.announceForAccessibility).not.toHaveBeenCalled();
  });

  it('should set accessibility focus', async () => {
    const { AccessibilityInfo } = require('react-native');
    AccessibilityInfo.isScreenReaderEnabled.mockResolvedValue(true);
    
    const mockRef = { current: { focus: jest.fn() } };
    const { result } = renderHook(() => useAccessibility());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.setAccessibilityFocus(mockRef);
    });

    expect(mockRef.current.focus).toHaveBeenCalled();
  });

  it('should return current accessibility enabled status', async () => {
    const { AccessibilityInfo } = require('react-native');
    AccessibilityInfo.isScreenReaderEnabled.mockResolvedValue(true);
    const { result } = renderHook(() => useAccessibility());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const isEnabled = await act(() => result.current.isAccessibilityEnabled());

    expect(isEnabled).toBe(true);
  });

  it('should handle screen reader state changes', async () => {
    const { AccessibilityInfo } = require('react-native');
    let screenReaderChangedCallback = null;
    
    AccessibilityInfo.addEventListener.mockImplementation((event, callback) => {
      if (event === 'screenReaderChanged') {
        screenReaderChangedCallback = callback;
      }
      return { remove: jest.fn() };
    });
    
    AccessibilityInfo.isScreenReaderEnabled.mockResolvedValue(false);
    
    const { result } = renderHook(() => useAccessibility());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.isScreenReaderEnabled).toBe(false);
    
    // Simulate screen reader being enabled
    act(() => {
      if (screenReaderChangedCallback) {
        screenReaderChangedCallback(true);
      }
    });
    
    expect(result.current.isScreenReaderEnabled).toBe(true);
  });

  it('should cleanup event listener on unmount', async () => {
    const { AccessibilityInfo } = require('react-native');
    const removeMock = jest.fn();
    AccessibilityInfo.addEventListener.mockReturnValue({ remove: removeMock });
    AccessibilityInfo.isScreenReaderEnabled.mockResolvedValue(false);
    
    const { unmount } = renderHook(() => useAccessibility());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    unmount();
    
    expect(removeMock).toHaveBeenCalled();
  });
});