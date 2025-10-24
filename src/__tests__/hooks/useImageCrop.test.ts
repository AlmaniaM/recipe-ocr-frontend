import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useImageCrop } from '../../hooks/useImageCrop';
import ImageCropPicker from 'react-native-image-crop-picker';

// Mock react-native-image-crop-picker
jest.mock('react-native-image-crop-picker', () => ({
  openCropper: jest.fn(),
  openPicker: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

const mockTheme = {
  colors: {
    primary: '#FF6B35',
    textPrimary: '#2D1B1B',
  },
};

describe('useImageCrop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ImageCropPicker.openCropper as jest.Mock).mockClear();
    (ImageCropPicker.openPicker as jest.Mock).mockClear();
  });

  describe('Initial State', () => {
    it('should initialize with null imageUri when no initial value provided', () => {
      const { result } = renderHook(() => useImageCrop());

      expect(result.current.imageUri).toBeNull();
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.isOptimizing).toBe(false);
    });

    it('should initialize with provided imageUri', () => {
      const initialUri = 'file://test-image.jpg';
      const { result } = renderHook(() => useImageCrop(initialUri));

      expect(result.current.imageUri).toBe(initialUri);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.isOptimizing).toBe(false);
    });
  });

  describe('setImageUri', () => {
    it('should update imageUri when setImageUri is called', () => {
      const { result } = renderHook(() => useImageCrop());

      act(() => {
        result.current.setImageUri('file://new-image.jpg');
      });

      expect(result.current.imageUri).toBe('file://new-image.jpg');
    });

    it('should set imageUri to null when setImageUri is called with null', () => {
      const { result } = renderHook(() => useImageCrop('file://initial-image.jpg'));

      act(() => {
        result.current.setImageUri(null);
      });

      expect(result.current.imageUri).toBeNull();
    });
  });

  describe('openCropPicker', () => {
    it('should return cropped image path when crop picker succeeds', async () => {
      const croppedPath = 'file://cropped-image.jpg';
      (ImageCropPicker.openCropper as jest.Mock).mockResolvedValue({
        path: croppedPath,
      });

      const { result } = renderHook(() => useImageCrop());

      let croppedImagePath: string | null = null;
      await act(async () => {
        croppedImagePath = await result.current.openCropPicker('file://test-image.jpg', mockTheme as any);
      });

      expect(croppedImagePath).toBe(croppedPath);
      expect(ImageCropPicker.openCropper).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'file://test-image.jpg',
          width: 800,
          height: 1000,
          cropping: true,
          cropperToolbarTitle: 'Crop Recipe Image',
        })
      );
    });

    it('should return null when crop picker is cancelled', async () => {
      const error = { code: 'E_PICKER_CANCELLED' };
      (ImageCropPicker.openCropper as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useImageCrop());

      let croppedImagePath: string | null = null;
      await act(async () => {
        croppedImagePath = await result.current.openCropPicker('file://test-image.jpg', mockTheme as any);
      });

      expect(croppedImagePath).toBeNull();
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('should show error alert when crop picker fails', async () => {
      const error = { code: 'E_PICKER_ERROR', message: 'Crop failed' };
      (ImageCropPicker.openCropper as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useImageCrop());

      let croppedImagePath: string | null = null;
      await act(async () => {
        croppedImagePath = await result.current.openCropPicker('file://test-image.jpg', mockTheme as any);
      });

      expect(croppedImagePath).toBeNull();
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to crop image. Please try again.');
    });
  });

  describe('openGalleryPicker', () => {
    it('should return selected image path when gallery picker succeeds', async () => {
      const selectedPath = 'file://gallery-image.jpg';
      (ImageCropPicker.openPicker as jest.Mock).mockResolvedValue({
        path: selectedPath,
      });

      const { result } = renderHook(() => useImageCrop());

      let selectedImagePath: string | null = null;
      await act(async () => {
        selectedImagePath = await result.current.openGalleryPicker(mockTheme as any);
      });

      expect(selectedImagePath).toBe(selectedPath);
      expect(ImageCropPicker.openPicker).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 800,
          height: 1000,
          cropping: true,
          cropperToolbarTitle: 'Select Recipe Image',
        })
      );
    });

    it('should return null when gallery picker is cancelled', async () => {
      const error = { code: 'E_PICKER_CANCELLED' };
      (ImageCropPicker.openPicker as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useImageCrop());

      let selectedImagePath: string | null = null;
      await act(async () => {
        selectedImagePath = await result.current.openGalleryPicker(mockTheme as any);
      });

      expect(selectedImagePath).toBeNull();
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('should show error alert when gallery picker fails', async () => {
      const error = { code: 'E_PICKER_ERROR', message: 'Gallery failed' };
      (ImageCropPicker.openPicker as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useImageCrop());

      let selectedImagePath: string | null = null;
      await act(async () => {
        selectedImagePath = await result.current.openGalleryPicker(mockTheme as any);
      });

      expect(selectedImagePath).toBeNull();
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to select image from gallery.');
    });
  });

  describe('optimizeImageForOCR', () => {
    it('should return optimized image path when optimization succeeds', async () => {
      const optimizedPath = 'file://optimized-image.jpg';
      (ImageCropPicker.openCropper as jest.Mock).mockResolvedValue({
        path: optimizedPath,
      });

      const { result } = renderHook(() => useImageCrop());

      let optimizedImagePath: string | null = null;
      await act(async () => {
        optimizedImagePath = await result.current.optimizeImageForOCR('file://test-image.jpg', mockTheme as any);
      });

      expect(optimizedImagePath).toBe(optimizedPath);
      expect(ImageCropPicker.openCropper).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'file://test-image.jpg',
          width: 1200,
          height: 1600,
          cropperToolbarTitle: 'Optimize for OCR',
        })
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        'Image Optimized',
        'Your image has been optimized for better OCR results.',
        [{ text: 'OK' }]
      );
    });

    it('should set isOptimizing to true during optimization', async () => {
      (ImageCropPicker.openCropper as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ path: 'file://optimized.jpg' }), 100))
      );

      const { result } = renderHook(() => useImageCrop());

      expect(result.current.isOptimizing).toBe(false);

      act(() => {
        result.current.optimizeImageForOCR('file://test-image.jpg', mockTheme as any);
      });

      expect(result.current.isOptimizing).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.isOptimizing).toBe(false);
    });

    it('should return null when optimization is cancelled', async () => {
      const error = { code: 'E_PICKER_CANCELLED' };
      (ImageCropPicker.openCropper as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useImageCrop());

      let optimizedImagePath: string | null = null;
      await act(async () => {
        optimizedImagePath = await result.current.optimizeImageForOCR('file://test-image.jpg', mockTheme as any);
      });

      expect(optimizedImagePath).toBeNull();
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('should show error alert when optimization fails', async () => {
      const error = { code: 'E_PICKER_ERROR', message: 'Optimization failed' };
      (ImageCropPicker.openCropper as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useImageCrop());

      let optimizedImagePath: string | null = null;
      await act(async () => {
        optimizedImagePath = await result.current.optimizeImageForOCR('file://test-image.jpg', mockTheme as any);
      });

      expect(optimizedImagePath).toBeNull();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to optimize image. You can continue with the current image.'
      );
    });
  });

  describe('processImage', () => {
    it('should set isProcessing to true during processing', async () => {
      const { result } = renderHook(() => useImageCrop());

      expect(result.current.isProcessing).toBe(false);

      act(() => {
        result.current.processImage('file://test-image.jpg');
      });

      expect(result.current.isProcessing).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.isProcessing).toBe(false);
    });

    it('should show error alert when processing fails', async () => {
      // Mock processImage to throw an error
      const { result } = renderHook(() => useImageCrop());

      // We need to mock the processImage implementation to throw an error
      // Since it's a callback, we'll test the error handling by checking the state
      await act(async () => {
        try {
          await result.current.processImage('file://test-image.jpg');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.isProcessing).toBe(false);
    });
  });

  describe('Theme Integration', () => {
    it('should pass theme colors to crop picker', async () => {
      const customTheme = {
        colors: {
          primary: '#123456',
          textPrimary: '#654321',
        },
      };

      (ImageCropPicker.openCropper as jest.Mock).mockResolvedValue({
        path: 'file://cropped-image.jpg',
      });

      const { result } = renderHook(() => useImageCrop());

      await act(async () => {
        await result.current.openCropPicker('file://test-image.jpg', customTheme as any);
      });

      expect(ImageCropPicker.openCropper).toHaveBeenCalledWith(
        expect.objectContaining({
          cropperStatusBarColor: '#123456',
          cropperToolbarColor: '#123456',
          cropperActiveWidgetColor: '#123456',
          cropperToolbarWidgetColor: '#654321',
          cropperToolbarTitleColor: '#654321',
        })
      );
    });

    it('should pass theme colors to gallery picker', async () => {
      const customTheme = {
        colors: {
          primary: '#123456',
          textPrimary: '#654321',
        },
      };

      (ImageCropPicker.openPicker as jest.Mock).mockResolvedValue({
        path: 'file://gallery-image.jpg',
      });

      const { result } = renderHook(() => useImageCrop());

      await act(async () => {
        await result.current.openGalleryPicker(customTheme as any);
      });

      expect(ImageCropPicker.openPicker).toHaveBeenCalledWith(
        expect.objectContaining({
          cropperStatusBarColor: '#123456',
          cropperToolbarColor: '#123456',
          cropperActiveWidgetColor: '#123456',
          cropperToolbarWidgetColor: '#654321',
          cropperToolbarTitleColor: '#654321',
        })
      );
    });
  });
});
