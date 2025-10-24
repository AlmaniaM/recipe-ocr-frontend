import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera } from 'expo-camera';
import type { CameraType, FlashMode } from 'expo-camera';
import { Alert } from 'react-native';
import { CameraService, PhotoResult, PhotoCaptureOptions } from '../infrastructure/camera/CameraService';

export interface UseCameraState {
  hasPermission: boolean | null;
  cameraType: CameraType;
  flashMode: FlashMode;
  isCapturing: boolean;
  isReady: boolean;
  error: string | null;
}

export interface UseCameraActions {
  takePicture: (options?: PhotoCaptureOptions) => Promise<PhotoResult | null>;
  switchCamera: () => void;
  toggleFlash: () => void;
  requestPermissions: () => Promise<boolean>;
  clearError: () => void;
  setCameraReady: (ready: boolean) => void;
}

export interface UseCameraReturn extends UseCameraState, UseCameraActions {
  cameraRef: React.RefObject<Camera>;
  cameraService: CameraService;
}

export const useCamera = (): UseCameraReturn => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cameraRef = useRef<Camera>(null);
  const cameraService = useRef(new CameraService(cameraRef)).current;

  // Update camera service reference when ref changes
  useEffect(() => {
    cameraService.setCameraRef(cameraRef);
  }, [cameraService]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const result = await cameraService.requestPermissions();
      setHasPermission(result.granted);
      
      if (!result.granted) {
        setError('Camera permission is required to capture recipes');
      }
      
      return result.granted;
    } catch (err) {
      console.error('Error requesting camera permission:', err);
      setError('Failed to request camera permission');
      setHasPermission(false);
      return false;
    }
  }, [cameraService]);

  const takePicture = useCallback(async (options?: PhotoCaptureOptions): Promise<PhotoResult | null> => {
    if (!cameraRef.current || isCapturing || !isReady) {
      return null;
    }

    try {
      setIsCapturing(true);
      setError(null);

      const result = await cameraService.takePicture(options);
      
      if (!cameraService.validatePhotoResult(result)) {
        throw new Error('Invalid photo result');
      }

      return result;
    } catch (error) {
      console.error('Camera error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to take picture. Please try again.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, isReady, cameraService]);

  const switchCamera = useCallback(() => {
    setCameraType(current => cameraService.switchCamera(current));
  }, [cameraService]);

  const toggleFlash = useCallback(() => {
    setFlashMode(current => cameraService.toggleFlash(current));
  }, [cameraService]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setCameraReady = useCallback((ready: boolean) => {
    setIsReady(ready);
    if (ready) {
      setError(null);
    }
  }, []);

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  return {
    // State
    hasPermission,
    cameraType,
    flashMode,
    isCapturing,
    isReady,
    error,
    
    // Actions
    takePicture,
    switchCamera,
    toggleFlash,
    requestPermissions,
    clearError,
    setCameraReady,
    
    // Refs and services
    cameraRef,
    cameraService,
  };
};

// Hook for camera UI helpers
export const useCameraUI = (flashMode: FlashMode, theme: any) => {
  const cameraService = useRef(new CameraService()).current;

  const getFlashIcon = useCallback(() => {
    return cameraService.getFlashIcon(flashMode);
  }, [cameraService, flashMode]);

  const getFlashColor = useCallback(() => {
    return cameraService.getFlashColor(flashMode, theme);
  }, [cameraService, flashMode, theme]);

  return {
    getFlashIcon,
    getFlashColor,
  };
};

// Hook for camera permissions
export const useCameraPermissions = () => {
  const [permissionState, setPermissionState] = useState<{
    granted: boolean;
    canAskAgain: boolean;
    status: 'granted' | 'denied' | 'undetermined';
  } | null>(null);

  const cameraService = useRef(new CameraService()).current;

  const checkPermissions = useCallback(async () => {
    try {
      const result = await cameraService.checkPermissions();
      setPermissionState(result);
      return result;
    } catch (error) {
      console.error('Error checking camera permissions:', error);
      return null;
    }
  }, [cameraService]);

  const requestPermissions = useCallback(async () => {
    try {
      const result = await cameraService.requestPermissions();
      setPermissionState(result);
      return result;
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return null;
    }
  }, [cameraService]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return {
    permissionState,
    checkPermissions,
    requestPermissions,
  };
};
