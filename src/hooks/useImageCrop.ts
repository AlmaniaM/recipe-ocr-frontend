import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';
import { Theme } from '../constants/themes';

export interface UseImageCropState {
  isProcessing: boolean;
  isOptimizing: boolean;
  imageUri: string | null;
}

export interface UseImageCropActions {
  setImageUri: (uri: string | null) => void;
  openCropPicker: (imageUri: string, theme: Theme) => Promise<string | null>;
  openGalleryPicker: (theme: Theme) => Promise<string | null>;
  optimizeImageForOCR: (imageUri: string, theme: Theme) => Promise<string | null>;
  processImage: (imageUri: string) => Promise<void>;
}

export interface UseImageCropReturn extends UseImageCropState, UseImageCropActions {}

export const useImageCrop = (initialImageUri?: string): UseImageCropReturn => {
  const [imageUri, setImageUri] = useState<string | null>(initialImageUri || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const openCropPicker = useCallback(async (currentImageUri: string, theme: Theme): Promise<string | null> => {
    try {
      const croppedImage = await ImageCropPicker.openCropper({
        path: currentImageUri,
        mediaType: 'photo',
        width: 800,
        height: 1000,
        cropping: true,
        cropperToolbarTitle: 'Crop Recipe Image',
        cropperChooseText: 'Choose',
        cropperCancelText: 'Cancel',
        cropperRotateButtonsHidden: false,
        cropperStatusBarLight: false,
        cropperToolbarColor: theme.colors.primary,
        cropperActiveWidgetColor: theme.colors.primary,
        cropperToolbarWidgetColor: theme.colors.textPrimary,
        cropperCircleOverlay: false,
        freeStyleCropEnabled: true,
        showCropGuidelines: true,
        hideBottomControls: false,
        enableRotationGesture: true,
        compressImageQuality: 0.8,
        includeBase64: false,
      });

      return croppedImage.path || null;
    } catch (error: any) {
      console.log('Crop picker error:', error);
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', 'Failed to crop image. Please try again.');
      }
      return null;
    }
  }, []);

  const openGalleryPicker = useCallback(async (theme: Theme): Promise<string | null> => {
    try {
      const selectedImage = await ImageCropPicker.openPicker({
        mediaType: 'photo',
        width: 800,
        height: 1000,
        cropping: true,
        cropperToolbarTitle: 'Select Recipe Image',
        cropperChooseText: 'Choose',
        cropperCancelText: 'Cancel',
        cropperRotateButtonsHidden: false,
        cropperStatusBarLight: false,
        cropperToolbarColor: theme.colors.primary,
        cropperActiveWidgetColor: theme.colors.primary,
        cropperToolbarWidgetColor: theme.colors.textPrimary,
        cropperCircleOverlay: false,
        freeStyleCropEnabled: true,
        showCropGuidelines: true,
        hideBottomControls: false,
        enableRotationGesture: true,
        compressImageQuality: 0.8,
        includeBase64: false,
      });

      return selectedImage.path || null;
    } catch (error: any) {
      console.log('Gallery picker error:', error);
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', 'Failed to select image from gallery.');
      }
      return null;
    }
  }, []);

  const optimizeImageForOCR = useCallback(async (currentImageUri: string, theme: Theme): Promise<string | null> => {
    setIsOptimizing(true);
    try {
      const optimizedImage = await ImageCropPicker.openCropper({
        path: currentImageUri,
        mediaType: 'photo',
        width: 1200,
        height: 1600,
        cropping: true,
        cropperToolbarTitle: 'Optimize for OCR',
        cropperChooseText: 'Optimize',
        cropperCancelText: 'Skip',
        cropperRotateButtonsHidden: false,
        cropperStatusBarLight: false,
        cropperToolbarColor: theme.colors.primary,
        cropperActiveWidgetColor: theme.colors.primary,
        cropperToolbarWidgetColor: theme.colors.textPrimary,
        cropperCircleOverlay: false,
        freeStyleCropEnabled: true,
        showCropGuidelines: true,
        hideBottomControls: false,
        enableRotationGesture: true,
        compressImageQuality: 0.8,
        includeBase64: false,
      });

      if (optimizedImage.path) {
        Alert.alert(
          'Image Optimized',
          'Your image has been optimized for better OCR results.',
          [{ text: 'OK' }]
        );
        return optimizedImage.path;
      }
      return null;
    } catch (error: any) {
      console.error('Image optimization error:', error);
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', 'Failed to optimize image. You can continue with the current image.');
      }
      return null;
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  const processImage = useCallback(async (currentImageUri: string): Promise<void> => {
    setIsProcessing(true);
    try {
      // This would typically involve OCR processing
      // For now, we'll just simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      Alert.alert('Error', 'Failed to process image');
      console.error('Image processing error:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    imageUri,
    isProcessing,
    isOptimizing,
    setImageUri,
    openCropPicker,
    openGalleryPicker,
    optimizeImageForOCR,
    processImage,
  };
};
