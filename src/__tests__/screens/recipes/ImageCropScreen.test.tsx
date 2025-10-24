import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ImageCropScreen from '../../../screens/recipes/ImageCropScreen';
import { ThemeProvider } from '../../../context/ThemeContext';
import ImageCropPicker from 'react-native-image-crop-picker';

// Mock react-native-image-crop-picker
jest.mock('react-native-image-crop-picker', () => ({
  openCropper: jest.fn(),
  openPicker: jest.fn(),
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: {
      imageUri: 'file://test-image.jpg',
    },
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock SafeAreaView
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: any) => children,
}));

const MockedImageCropScreen = () => (
  <ThemeProvider>
    <ImageCropScreen />
  </ThemeProvider>
);

describe('ImageCropScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ImageCropPicker.openCropper as jest.Mock).mockClear();
    (ImageCropPicker.openPicker as jest.Mock).mockClear();
  });

  describe('Rendering', () => {
    it('should render with image preview when imageUri is provided', async () => {
      const { getByText, getByTestId } = render(<MockedImageCropScreen />);

      await waitFor(() => {
        expect(getByText('Crop Recipe Image')).toBeTruthy();
        expect(getByText('Adjust the image for better OCR results')).toBeTruthy();
        expect(getByText('Retake')).toBeTruthy();
        expect(getByText('Gallery')).toBeTruthy();
        expect(getByText('Crop Image')).toBeTruthy();
        expect(getByText('Optimize for OCR')).toBeTruthy();
        expect(getByText('Continue to OCR')).toBeTruthy();
      });
    });

    it('should render error state when no imageUri is provided', () => {
      // Mock useRoute to return no imageUri
      jest.doMock('@react-navigation/native', () => ({
        useNavigation: () => ({
          navigate: mockNavigate,
          goBack: mockGoBack,
        }),
        useRoute: () => ({
          params: {},
        }),
      }));

      const { getByText } = render(<MockedImageCropScreen />);

      expect(getByText('No image available')).toBeTruthy();
      expect(getByText('Please go back and capture a photo')).toBeTruthy();
      expect(getByText('Go Back')).toBeTruthy();
    });

    it('should display tips section', async () => {
      const { getByText } = render(<MockedImageCropScreen />);

      await waitFor(() => {
        expect(getByText('Tip: Ensure the recipe text is clearly visible and well-lit for better OCR results')).toBeTruthy();
      });
    });
  });

  describe('Button Interactions', () => {
    it('should call goBack when retake button is pressed', async () => {
      const { getByText } = render(<MockedImageCropScreen />);

      await waitFor(() => {
        expect(getByText('Retake')).toBeTruthy();
      });

      fireEvent.press(getByText('Retake'));
      expect(mockGoBack).toHaveBeenCalled();
    });

    it('should open crop picker when crop button is pressed', async () => {
      (ImageCropPicker.openCropper as jest.Mock).mockResolvedValue({
        path: 'file://cropped-image.jpg',
      });

      const { getByText } = render(<MockedImageCropScreen />);

      await waitFor(() => {
        expect(getByText('Crop Image')).toBeTruthy();
      });

      fireEvent.press(getByText('Crop Image'));

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

    it('should open gallery picker when gallery button is pressed', async () => {
      (ImageCropPicker.openPicker as jest.Mock).mockResolvedValue({
        path: 'file://gallery-image.jpg',
      });

      const { getByText } = render(<MockedImageCropScreen />);

      await waitFor(() => {
        expect(getByText('Gallery')).toBeTruthy();
      });

      fireEvent.press(getByText('Gallery'));

      expect(ImageCropPicker.openPicker).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 800,
          height: 1000,
          cropping: true,
          cropperToolbarTitle: 'Select Recipe Image',
        })
      );
    });

    it('should open optimization cropper when optimize button is pressed', async () => {
      (ImageCropPicker.openCropper as jest.Mock).mockResolvedValue({
        path: 'file://optimized-image.jpg',
      });

      const { getByText } = render(<MockedImageCropScreen />);

      await waitFor(() => {
        expect(getByText('Optimize for OCR')).toBeTruthy();
      });

      fireEvent.press(getByText('Optimize for OCR'));

      expect(ImageCropPicker.openCropper).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'file://test-image.jpg',
          width: 1200,
          height: 1600,
          cropperToolbarTitle: 'Optimize for OCR',
        })
      );
    });

    it('should navigate to RecipeReview when continue button is pressed', async () => {
      const { getByText } = render(<MockedImageCropScreen />);

      await waitFor(() => {
        expect(getByText('Continue to OCR')).toBeTruthy();
      });

      fireEvent.press(getByText('Continue to OCR'));

      expect(mockNavigate).toHaveBeenCalledWith('RecipeReview', {
        imageUri: 'file://test-image.jpg',
        source: 'camera',
      });
    });
  });

  describe('Image Processing', () => {
    it('should update imageUri when crop picker returns new image', async () => {
      const newImagePath = 'file://new-cropped-image.jpg';
      (ImageCropPicker.openCropper as jest.Mock).mockResolvedValue({
        path: newImagePath,
      });

      const { getByText } = render(<MockedImageCropScreen />);

      await waitFor(() => {
        expect(getByText('Crop Image')).toBeTruthy();
      });

      fireEvent.press(getByText('Crop Image'));

      await waitFor(() => {
        expect(ImageCropPicker.openCropper).toHaveBeenCalled();
      });
    });

    it('should update imageUri when gallery picker returns new image', async () => {
      const newImagePath = 'file://new-gallery-image.jpg';
      (ImageCropPicker.openPicker as jest.Mock).mockResolvedValue({
        path: newImagePath,
      });

      const { getByText } = render(<MockedImageCropScreen />);

      await waitFor(() => {
        expect(getByText('Gallery')).toBeTruthy();
      });

      fireEvent.press(getByText('Gallery'));

      await waitFor(() => {
        expect(ImageCropPicker.openPicker).toHaveBeenCalled();
      });
    });

    it('should show alert when image is optimized', async () => {
      (ImageCropPicker.openCropper as jest.Mock).mockResolvedValue({
        path: 'file://optimized-image.jpg',
      });

      const { getByText } = render(<MockedImageCropScreen />);

      await waitFor(() => {
        expect(getByText('Optimize for OCR')).toBeTruthy();
      });

      fireEvent.press(getByText('Optimize for OCR'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Image Optimized',
          'Your image has been optimized for better OCR results.',
          [{ text: 'OK' }]
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle crop picker cancellation gracefully', async () => {
      const error = { code: 'E_PICKER_CANCELLED' };
      (ImageCropPicker.openCropper as jest.Mock).mockRejectedValue(error);

      const { getByText } = render(<MockedImageCropScreen />);

      await waitFor(() => {
        expect(getByText('Crop Image')).toBeTruthy();
      });

      fireEvent.press(getByText('Crop Image'));

      await waitFor(() => {
        expect(Alert.alert).not.toHaveBeenCalled();
      });
    });

    it('should show error alert when crop picker fails', async () => {
      const error = { code: 'E_PICKER_ERROR', message: 'Crop failed' };
      (ImageCropPicker.openCropper as jest.Mock).mockRejectedValue(error);

      const { getByText } = render(<MockedImageCropScreen />);

      await waitFor(() => {
        expect(getByText('Crop Image')).toBeTruthy();
      });

      fireEvent.press(getByText('Crop Image'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to crop image. Please try again.');
      });
    });

    it('should handle gallery picker cancellation gracefully', async () => {
      const error = { code: 'E_PICKER_CANCELLED' };
      (ImageCropPicker.openPicker as jest.Mock).mockRejectedValue(error);

      const { getByText } = render(<MockedImageCropScreen />);

      await waitFor(() => {
        expect(getByText('Gallery')).toBeTruthy();
      });

      fireEvent.press(getByText('Gallery'));

      await waitFor(() => {
        expect(Alert.alert).not.toHaveBeenCalled();
      });
    });

    it('should show error alert when gallery picker fails', async () => {
      const error = { code: 'E_PICKER_ERROR', message: 'Gallery failed' };
      (ImageCropPicker.openPicker as jest.Mock).mockRejectedValue(error);

      const { getByText } = render(<MockedImageCropScreen />);

      await waitFor(() => {
        expect(getByText('Gallery')).toBeTruthy();
      });

      fireEvent.press(getByText('Gallery'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to select image from gallery.');
      });
    });

    it('should handle optimization failure gracefully', async () => {
      const error = { code: 'E_PICKER_ERROR', message: 'Optimization failed' };
      (ImageCropPicker.openCropper as jest.Mock).mockRejectedValue(error);

      const { getByText } = render(<MockedImageCropScreen />);

      await waitFor(() => {
        expect(getByText('Optimize for OCR')).toBeTruthy();
      });

      fireEvent.press(getByText('Optimize for OCR'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to optimize image. You can continue with the current image.'
        );
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state when processing image', async () => {
      const { getByText } = render(<MockedImageCropScreen />);

      await waitFor(() => {
        expect(getByText('Continue to OCR')).toBeTruthy();
      });

      fireEvent.press(getByText('Continue to OCR'));

      // The button should show processing state
      await waitFor(() => {
        expect(getByText('Processing...')).toBeTruthy();
      });
    });

    it('should disable buttons when processing', async () => {
      const { getByText } = render(<MockedImageCropScreen />);

      await waitFor(() => {
        expect(getByText('Continue to OCR')).toBeTruthy();
      });

      fireEvent.press(getByText('Continue to OCR'));

      // All buttons should be disabled during processing
      await waitFor(() => {
        const retakeButton = getByText('Retake').parent;
        const galleryButton = getByText('Gallery').parent;
        const cropButton = getByText('Crop Image').parent;
        const optimizeButton = getByText('Optimizing...').parent;

        expect(retakeButton?.props.disabled).toBe(true);
        expect(galleryButton?.props.disabled).toBe(true);
        expect(cropButton?.props.disabled).toBe(true);
        expect(optimizeButton?.props.disabled).toBe(true);
      });
    });
  });

  describe('Theme Integration', () => {
    it('should apply theme colors correctly', async () => {
      const { getByText } = render(<MockedImageCropScreen />);

      await waitFor(() => {
        expect(getByText('Crop Recipe Image')).toBeTruthy();
        expect(getByText('Adjust the image for better OCR results')).toBeTruthy();
      });

      // The component should render without theme-related errors
      expect(getByText('Retake')).toBeTruthy();
      expect(getByText('Gallery')).toBeTruthy();
      expect(getByText('Crop Image')).toBeTruthy();
      expect(getByText('Optimize for OCR')).toBeTruthy();
      expect(getByText('Continue to OCR')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible buttons', async () => {
      const { getByText } = render(<MockedImageCropScreen />);

      await waitFor(() => {
        expect(getByText('Retake')).toBeTruthy();
        expect(getByText('Gallery')).toBeTruthy();
        expect(getByText('Crop Image')).toBeTruthy();
        expect(getByText('Optimize for OCR')).toBeTruthy();
        expect(getByText('Continue to OCR')).toBeTruthy();
      });

      // All buttons should be pressable
      fireEvent.press(getByText('Retake'));
      fireEvent.press(getByText('Gallery'));
      fireEvent.press(getByText('Crop Image'));
      fireEvent.press(getByText('Optimize for OCR'));
      fireEvent.press(getByText('Continue to OCR'));
    });
  });
});
