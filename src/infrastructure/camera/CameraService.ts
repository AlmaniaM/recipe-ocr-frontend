import { Camera } from 'expo-camera';
import type { CameraType, FlashMode } from 'expo-camera';
import { ImagePickerResult } from 'expo-image-picker';

export interface CameraPermissionResult {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined';
}

export interface PhotoCaptureOptions {
  quality?: number;
  base64?: boolean;
  skipProcessing?: boolean;
  exif?: boolean;
}

export interface PhotoResult {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

export interface CameraServiceInterface {
  requestPermissions(): Promise<CameraPermissionResult>;
  checkPermissions(): Promise<CameraPermissionResult>;
  takePicture(options?: PhotoCaptureOptions): Promise<PhotoResult>;
  switchCamera(currentType: CameraType): CameraType;
  toggleFlash(currentMode: FlashMode): FlashMode;
  getFlashIcon(mode: FlashMode): string;
  getFlashColor(mode: FlashMode, theme: any): string;
}

export class CameraService implements CameraServiceInterface {
  private cameraRef: React.RefObject<Camera> | null = null;

  constructor(cameraRef?: React.RefObject<Camera>) {
    this.cameraRef = cameraRef || null;
  }

  setCameraRef(ref: React.RefObject<Camera>) {
    this.cameraRef = ref;
  }

  async requestPermissions(): Promise<CameraPermissionResult> {
    try {
      const { status, canAskAgain } = await Camera.requestCameraPermissionsAsync();
      return {
        granted: status === 'granted',
        canAskAgain,
        status: status as 'granted' | 'denied' | 'undetermined',
      };
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied',
      };
    }
  }

  async checkPermissions(): Promise<CameraPermissionResult> {
    try {
      const { status, canAskAgain } = await Camera.getCameraPermissionsAsync();
      return {
        granted: status === 'granted',
        canAskAgain,
        status: status as 'granted' | 'denied' | 'undetermined',
      };
    } catch (error) {
      console.error('Error checking camera permissions:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied',
      };
    }
  }

  async takePicture(options: PhotoCaptureOptions = {}): Promise<PhotoResult> {
    if (!this.cameraRef?.current) {
      throw new Error('Camera reference not available');
    }

    const defaultOptions: PhotoCaptureOptions = {
      quality: 0.8,
      base64: false,
      skipProcessing: false,
      exif: false,
    };

    const captureOptions = { ...defaultOptions, ...options };

    try {
      const result = await this.cameraRef.current.takePictureAsync(captureOptions);
      
      if (!result?.uri) {
        throw new Error('Failed to capture photo');
      }

      return {
        uri: result.uri,
        width: result.width || 0,
        height: result.height || 0,
        base64: result.base64,
      };
    } catch (error) {
      console.error('Error taking picture:', error);
      throw new Error(`Failed to take picture: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  switchCamera(currentType: CameraType): CameraType {
    return currentType === 'back' ? 'front' : 'back';
  }

  toggleFlash(currentMode: FlashMode): FlashMode {
    switch (currentMode) {
      case 'off':
        return 'on';
      case 'on':
        return 'auto';
      case 'auto':
        return 'off';
      default:
        return 'off';
    }
  }

  getFlashIcon(mode: FlashMode): string {
    switch (mode) {
      case 'on':
        return 'flash-on';
      case 'auto':
        return 'flash-auto';
      case 'off':
      default:
        return 'flash-off';
    }
  }

  getFlashColor(mode: FlashMode, theme: any): string {
    switch (mode) {
      case 'on':
        return theme?.colors?.warning || '#FF9800';
      case 'auto':
        return theme?.colors?.primary || '#FF6B35';
      case 'off':
      default:
        return 'white';
    }
  }

  // Utility method to validate photo result
  validatePhotoResult(result: any): result is PhotoResult {
    return (
      result != null &&
      typeof result.uri === 'string' &&
      result.uri.length > 0 &&
      typeof result.width === 'number' &&
      typeof result.height === 'number'
    );
  }

  // Utility method to get optimal photo quality based on device capabilities
  getOptimalQuality(): number {
    // This could be enhanced to check device capabilities
    return 0.8;
  }

  // Utility method to get recommended photo dimensions
  getRecommendedDimensions(): { width: number; height: number } {
    // 4:3 aspect ratio for recipe photos
    return { width: 1200, height: 1600 };
  }
}

// Singleton instance for global use
export const cameraService = new CameraService();
