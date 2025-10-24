import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useCamera, useCameraUI, useCameraPermissions } from '../../hooks/useCamera';
import { CameraService } from '../../infrastructure/camera/CameraService';

// Mock expo-camera
const mockRequestCameraPermissionsAsync = jest.fn();
const mockGetCameraPermissionsAsync = jest.fn();
const mockTakePictureAsync = jest.fn();

jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: mockRequestCameraPermissionsAsync,
    getCameraPermissionsAsync: mockGetCameraPermissionsAsync,
  },
  CameraType: {
    back: 'back',
    front: 'front',
  },
  FlashMode: {
    off: 'off',
    on: 'on',
    auto: 'auto',
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock CameraService
jest.mock('../../infrastructure/camera/CameraService');

describe('useCamera', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useCamera());

    expect(result.current.hasPermission).toBeNull();
    expect(result.current.cameraType).toBe('back');
    expect(result.current.flashMode).toBe('off');
    expect(result.current.isCapturing).toBe(false);
    expect(result.current.isReady).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.cameraRef).toBeDefined();
    expect(result.current.cameraService).toBeInstanceOf(CameraService);
  });

  it('should request permissions on mount', async () => {
    mockRequestCameraPermissionsAsync.mockResolvedValue({
      status: 'granted',
      canAskAgain: true,
    });

    renderHook(() => useCamera());

    await act(async () => {
      // Wait for permission request to complete
    });

    expect(mockRequestCameraPermissionsAsync).toHaveBeenCalled();
  });

  it('should handle permission granted', async () => {
    mockRequestCameraPermissionsAsync.mockResolvedValue({
      status: 'granted',
      canAskAgain: true,
    });

    const { result } = renderHook(() => useCamera());

    await act(async () => {
      // Wait for permission request to complete
    });

    expect(result.current.hasPermission).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle permission denied', async () => {
    mockRequestCameraPermissionsAsync.mockResolvedValue({
      status: 'denied',
      canAskAgain: false,
    });

    const { result } = renderHook(() => useCamera());

    await act(async () => {
      // Wait for permission request to complete
    });

    expect(result.current.hasPermission).toBe(false);
    expect(result.current.error).toBe('Camera permission is required to capture recipes');
  });

  it('should switch camera type', () => {
    const { result } = renderHook(() => useCamera());

    act(() => {
      result.current.switchCamera();
    });

    expect(result.current.cameraType).toBe('front');

    act(() => {
      result.current.switchCamera();
    });

    expect(result.current.cameraType).toBe('back');
  });

  it('should toggle flash mode', () => {
    const { result } = renderHook(() => useCamera());

    act(() => {
      result.current.toggleFlash();
    });

    expect(result.current.flashMode).toBe('on');

    act(() => {
      result.current.toggleFlash();
    });

    expect(result.current.flashMode).toBe('auto');

    act(() => {
      result.current.toggleFlash();
    });

    expect(result.current.flashMode).toBe('off');
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useCamera());

    // Set an error first
    act(() => {
      result.current.setCameraReady(false);
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should set camera ready state', () => {
    const { result } = renderHook(() => useCamera());

    act(() => {
      result.current.setCameraReady(true);
    });

    expect(result.current.isReady).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle take picture when camera is not ready', async () => {
    const { result } = renderHook(() => useCamera());

    const photo = await act(async () => {
      return await result.current.takePicture();
    });

    expect(photo).toBeNull();
  });

  it('should handle take picture when already capturing', async () => {
    const { result } = renderHook(() => useCamera());

    // Set camera as ready but capturing
    act(() => {
      result.current.setCameraReady(true);
    });

    // Mock the camera service to simulate capturing state
    const mockCameraService = result.current.cameraService;
    jest.spyOn(mockCameraService, 'takePicture').mockResolvedValue({
      uri: 'file://test.jpg',
      width: 1200,
      height: 1600,
    });

    const photo = await act(async () => {
      return await result.current.takePicture();
    });

    expect(photo).toBeNull();
  });
});

describe('useCameraUI', () => {
  it('should return correct flash icon and color', () => {
    const theme = {
      colors: {
        primary: '#FF6B35',
        warning: '#FF9800',
      },
    };

    const { result } = renderHook(() => useCameraUI('off', theme));

    expect(result.current.getFlashIcon()).toBe('flash-off');
    expect(result.current.getFlashColor()).toBe('white');
  });

  it('should update when flash mode changes', () => {
    const theme = {
      colors: {
        primary: '#FF6B35',
        warning: '#FF9800',
      },
    };

    const { result, rerender } = renderHook(
      ({ flashMode }) => useCameraUI(flashMode, theme),
      { initialProps: { flashMode: 'off' } }
    );

    expect(result.current.getFlashIcon()).toBe('flash-off');

    rerender({ flashMode: 'on' });

    expect(result.current.getFlashIcon()).toBe('flash-on');
    expect(result.current.getFlashColor()).toBe('#FF9800');
  });
});

describe('useCameraPermissions', () => {
  it('should initialize with null permission state', () => {
    const { result } = renderHook(() => useCameraPermissions());

    expect(result.current.permissionState).toBeNull();
  });

  it('should check permissions on mount', async () => {
    mockGetCameraPermissionsAsync.mockResolvedValue({
      status: 'granted',
      canAskAgain: true,
    });

    const { result } = renderHook(() => useCameraPermissions());

    await act(async () => {
      // Wait for permission check to complete
    });

    expect(mockGetCameraPermissionsAsync).toHaveBeenCalled();
    expect(result.current.permissionState).toEqual({
      granted: true,
      canAskAgain: true,
      status: 'granted',
    });
  });

  it('should handle permission check error', async () => {
    mockGetCameraPermissionsAsync.mockRejectedValue(new Error('Permission check failed'));

    const { result } = renderHook(() => useCameraPermissions());

    await act(async () => {
      // Wait for permission check to complete
    });

    expect(result.current.permissionState).toBeNull();
  });

  it('should request permissions', async () => {
    mockRequestCameraPermissionsAsync.mockResolvedValue({
      status: 'denied',
      canAskAgain: false,
    });

    const { result } = renderHook(() => useCameraPermissions());

    let permissionResult;
    await act(async () => {
      permissionResult = await result.current.requestPermissions();
    });

    expect(permissionResult).toEqual({
      granted: false,
      canAskAgain: false,
      status: 'denied',
    });
    expect(mockRequestCameraPermissionsAsync).toHaveBeenCalled();
  });

  it('should handle permission request error', async () => {
    mockRequestCameraPermissionsAsync.mockRejectedValue(new Error('Permission request failed'));

    const { result } = renderHook(() => useCameraPermissions());

    let permissionResult;
    await act(async () => {
      permissionResult = await result.current.requestPermissions();
    });

    expect(permissionResult).toBeNull();
  });
});
