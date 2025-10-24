import { renderHook, act } from '@testing-library/react-native';
import { useScreenReader } from '../../hooks/useScreenReader';

// The react-native mock is now handled globally in jest.config.js
describe('useScreenReader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with screen reader disabled', async () => {
    const { AccessibilityInfo } = require('react-native');
    AccessibilityInfo.isScreenReaderEnabled.mockResolvedValue(false);
    
    const { result } = renderHook(() => useScreenReader());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isScreenReaderEnabled).toBe(false);
    expect(AccessibilityInfo.isScreenReaderEnabled).toHaveBeenCalledTimes(1);
  });

  it('should update when screen reader status changes', async () => {
    const { AccessibilityInfo } = require('react-native');
    AccessibilityInfo.isScreenReaderEnabled.mockResolvedValue(false);
    
    const { result } = renderHook(() => useScreenReader());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(result.current.isScreenReaderEnabled).toBe(false);

    // Simulate screen reader becoming enabled
    const listener = AccessibilityInfo.addEventListener.mock.calls[0][1];
    act(() => {
      listener(true);
    });

    expect(result.current.isScreenReaderEnabled).toBe(true);
  });

  it('should announce for accessibility when screen reader is enabled', async () => {
    const { AccessibilityInfo } = require('react-native');
    AccessibilityInfo.isScreenReaderEnabled.mockResolvedValue(true);
    
    const { result } = renderHook(() => useScreenReader());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.announceForAccessibility('Hello world');
    });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Hello world');
  });

  it('should not announce for accessibility when screen reader is disabled', async () => {
    const { AccessibilityInfo } = require('react-native');
    AccessibilityInfo.isScreenReaderEnabled.mockResolvedValue(false);
    
    const { result } = renderHook(() => useScreenReader());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.announceForAccessibility('Hello world');
    });

    expect(AccessibilityInfo.announceForAccessibility).not.toHaveBeenCalled();
  });
});