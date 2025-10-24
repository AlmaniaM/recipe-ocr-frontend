import { renderHook, act } from '@testing-library/react-native';
import { useFocusManagement } from '../../hooks/useFocusManagement';

// The react-native mock is now handled globally in jest.config.js
describe('useFocusManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with no focused element', () => {
    const { result } = renderHook(() => useFocusManagement());
    expect(result.current.focusedElement).toBeNull();
  });

  it('should set focus to an element by id', () => {
    const mockRef = { current: { focus: jest.fn() } };
    const { result } = renderHook(() => useFocusManagement());

    act(() => {
      result.current.registerElement('test-element-1', mockRef);
      result.current.setFocus('test-element-1');
    });

    expect(result.current.focusedElement).toBe('test-element-1');
    expect(result.current.isFocused('test-element-1')).toBe(true);
    expect(result.current.isFocused('other-element')).toBe(false);
  });

  it('should clear focus', () => {
    const mockRef = { current: { focus: jest.fn() } };
    const { result } = renderHook(() => useFocusManagement());

    act(() => {
      result.current.registerElement('test-element-1', mockRef);
      result.current.setFocus('test-element-1');
    });
    expect(result.current.focusedElement).toBe('test-element-1');

    act(() => {
      result.current.clearFocus();
    });
    expect(result.current.focusedElement).toBeNull();
    expect(result.current.isFocused('test-element-1')).toBe(false);
  });

  it('should register and focus elements', () => {
    const mockRef = { current: { focus: jest.fn() } };
    const { result } = renderHook(() => useFocusManagement());

    act(() => {
      result.current.registerElement('test-element', mockRef);
    });

    expect(result.current.getFocusableElements()).toContain('test-element');

    act(() => {
      result.current.setFocus('test-element');
    });

    expect(result.current.focusedElement).toBe('test-element');
    expect(mockRef.current.focus).toHaveBeenCalled();
  });

  it('should unregister elements', () => {
    const mockRef = { current: { focus: jest.fn() } };
    const { result } = renderHook(() => useFocusManagement());

    act(() => {
      result.current.registerElement('test-element', mockRef);
      result.current.setFocus('test-element');
    });

    expect(result.current.focusedElement).toBe('test-element');

    act(() => {
      result.current.unregisterElement('test-element');
    });

    expect(result.current.getFocusableElements()).not.toContain('test-element');
    expect(result.current.focusedElement).toBeNull();
  });

  it('should navigate focus between elements', () => {
    const mockRef1 = { current: { focus: jest.fn() } };
    const mockRef2 = { current: { focus: jest.fn() } };
    const { result } = renderHook(() => useFocusManagement());

    act(() => {
      result.current.registerElement('element-1', mockRef1);
      result.current.registerElement('element-2', mockRef2);
    });

    act(() => {
      result.current.setFocus('element-1');
    });

    expect(result.current.focusedElement).toBe('element-1');

    act(() => {
      result.current.focusNext();
    });

    expect(result.current.focusedElement).toBe('element-2');
    expect(mockRef2.current.focus).toHaveBeenCalled();
  });

  it('should navigate focus backwards', () => {
    const mockRef1 = { current: { focus: jest.fn() } };
    const mockRef2 = { current: { focus: jest.fn() } };
    const { result } = renderHook(() => useFocusManagement());

    act(() => {
      result.current.registerElement('element-1', mockRef1);
      result.current.registerElement('element-2', mockRef2);
      result.current.setFocus('element-2');
    });

    act(() => {
      result.current.focusPrevious();
    });

    expect(result.current.focusedElement).toBe('element-1');
    expect(mockRef1.current.focus).toHaveBeenCalled();
  });

  it('should handle focus errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    const mockRef = { current: { focus: () => { throw new Error('Focus failed'); } } };
    const { result } = renderHook(() => useFocusManagement());

    act(() => {
      result.current.registerElement('test-element', mockRef);
      result.current.setFocus('test-element');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to focus element test-element:', expect.any(Error));
    expect(result.current.focusedElement).toBeNull();

    consoleSpy.mockRestore();
  });
});