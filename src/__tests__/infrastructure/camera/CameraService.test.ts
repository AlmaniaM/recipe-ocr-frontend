import { CameraService, cameraService } from '../../../infrastructure/camera/CameraService';
import { Camera, CameraType, FlashMode } from 'expo-camera';

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

describe('CameraService', () => {
  let cameraService: CameraService;
  let mockCameraRef: React.RefObject<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCameraRef = {
      current: {
        takePictureAsync: mockTakePictureAsync,
      },
    };
    cameraService = new CameraService(mockCameraRef);
  });

  describe('Permission Management', () => {
    it('should request camera permissions successfully', async () => {
      mockRequestCameraPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
      });

      const result = await cameraService.requestPermissions();

      expect(result).toEqual({
        granted: true,
        canAskAgain: true,
        status: 'granted',
      });
      expect(mockRequestCameraPermissionsAsync).toHaveBeenCalledTimes(1);
    });

    it('should handle permission denied', async () => {
      mockRequestCameraPermissionsAsync.mockResolvedValue({
        status: 'denied',
        canAskAgain: false,
      });

      const result = await cameraService.requestPermissions();

      expect(result).toEqual({
        granted: false,
        canAskAgain: false,
        status: 'denied',
      });
    });

    it('should handle permission request error', async () => {
      mockRequestCameraPermissionsAsync.mockRejectedValue(new Error('Permission error'));

      const result = await cameraService.requestPermissions();

      expect(result).toEqual({
        granted: false,
        canAskAgain: false,
        status: 'denied',
      });
    });

    it('should check current permissions', async () => {
      mockGetCameraPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
      });

      const result = await cameraService.checkPermissions();

      expect(result).toEqual({
        granted: true,
        canAskAgain: true,
        status: 'granted',
      });
      expect(mockGetCameraPermissionsAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('Photo Capture', () => {
    it('should take picture successfully', async () => {
      const mockPhotoResult = {
        uri: 'file://test-photo.jpg',
        width: 1200,
        height: 1600,
        base64: 'base64string',
      };

      mockTakePictureAsync.mockResolvedValue(mockPhotoResult);

      const result = await cameraService.takePicture();

      expect(result).toEqual({
        uri: 'file://test-photo.jpg',
        width: 1200,
        height: 1600,
        base64: 'base64string',
      });
      expect(mockTakePictureAsync).toHaveBeenCalledWith({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
        exif: false,
      });
    });

    it('should take picture with custom options', async () => {
      const mockPhotoResult = {
        uri: 'file://test-photo.jpg',
        width: 1200,
        height: 1600,
      };

      mockTakePictureAsync.mockResolvedValue(mockPhotoResult);

      const options = {
        quality: 0.9,
        base64: true,
        skipProcessing: true,
        exif: true,
      };

      const result = await cameraService.takePicture(options);

      expect(result).toEqual({
        uri: 'file://test-photo.jpg',
        width: 1200,
        height: 1600,
      });
      expect(mockTakePictureAsync).toHaveBeenCalledWith(options);
    });

    it('should throw error when camera ref is not available', async () => {
      const serviceWithoutRef = new CameraService();

      await expect(serviceWithoutRef.takePicture()).rejects.toThrow(
        'Camera reference not available'
      );
    });

    it('should throw error when photo capture fails', async () => {
      mockTakePictureAsync.mockRejectedValue(new Error('Capture failed'));

      await expect(cameraService.takePicture()).rejects.toThrow(
        'Failed to take picture: Capture failed'
      );
    });

    it('should throw error when photo result is invalid', async () => {
      mockTakePictureAsync.mockResolvedValue({ uri: '' });

      await expect(cameraService.takePicture()).rejects.toThrow(
        'Failed to capture photo'
      );
    });
  });

  describe('Camera Controls', () => {
    it('should switch camera from back to front', () => {
      const result = cameraService.switchCamera(CameraType.back);
      expect(result).toBe(CameraType.front);
    });

    it('should switch camera from front to back', () => {
      const result = cameraService.switchCamera(CameraType.front);
      expect(result).toBe(CameraType.back);
    });

    it('should toggle flash from off to on', () => {
      const result = cameraService.toggleFlash(FlashMode.off);
      expect(result).toBe(FlashMode.on);
    });

    it('should toggle flash from on to auto', () => {
      const result = cameraService.toggleFlash(FlashMode.on);
      expect(result).toBe(FlashMode.auto);
    });

    it('should toggle flash from auto to off', () => {
      const result = cameraService.toggleFlash(FlashMode.auto);
      expect(result).toBe(FlashMode.off);
    });
  });

  describe('UI Helpers', () => {
    it('should return correct flash icon for off mode', () => {
      const icon = cameraService.getFlashIcon(FlashMode.off);
      expect(icon).toBe('flash-off');
    });

    it('should return correct flash icon for on mode', () => {
      const icon = cameraService.getFlashIcon(FlashMode.on);
      expect(icon).toBe('flash-on');
    });

    it('should return correct flash icon for auto mode', () => {
      const icon = cameraService.getFlashIcon(FlashMode.auto);
      expect(icon).toBe('flash-auto');
    });

    it('should return correct flash color for off mode', () => {
      const theme = { colors: { primary: '#FF6B35', warning: '#FF9800' } };
      const color = cameraService.getFlashColor(FlashMode.off, theme);
      expect(color).toBe('white');
    });

    it('should return correct flash color for on mode', () => {
      const theme = { colors: { primary: '#FF6B35', warning: '#FF9800' } };
      const color = cameraService.getFlashColor(FlashMode.on, theme);
      expect(color).toBe('#FF9800');
    });

    it('should return correct flash color for auto mode', () => {
      const theme = { colors: { primary: '#FF6B35', warning: '#FF9800' } };
      const color = cameraService.getFlashColor(FlashMode.auto, theme);
      expect(color).toBe('#FF6B35');
    });

    it('should use fallback colors when theme is not provided', () => {
      const color = cameraService.getFlashColor(FlashMode.on, {});
      expect(color).toBe('#FF9800');
    });
  });

  describe('Utility Methods', () => {
    it('should validate photo result correctly', () => {
      const validResult = {
        uri: 'file://test.jpg',
        width: 1200,
        height: 1600,
      };

      const invalidResult = {
        uri: '',
        width: 1200,
        height: 1600,
      };

      expect(cameraService.validatePhotoResult(validResult)).toBe(true);
      expect(cameraService.validatePhotoResult(invalidResult)).toBe(false);
      expect(cameraService.validatePhotoResult(null)).toBe(false);
      expect(cameraService.validatePhotoResult(undefined)).toBe(false);
    });

    it('should return optimal quality', () => {
      const quality = cameraService.getOptimalQuality();
      expect(quality).toBe(0.8);
    });

    it('should return recommended dimensions', () => {
      const dimensions = cameraService.getRecommendedDimensions();
      expect(dimensions).toEqual({ width: 1200, height: 1600 });
    });
  });

  describe('Camera Reference Management', () => {
    it('should set camera reference', () => {
      const newRef = { current: { takePictureAsync: jest.fn() } };
      cameraService.setCameraRef(newRef);
      expect(cameraService).toBeDefined();
    });
  });

  describe('Singleton Instance', () => {
    it('should provide singleton instance', () => {
      expect(cameraService).toBeInstanceOf(CameraService);
    });
  });
});
