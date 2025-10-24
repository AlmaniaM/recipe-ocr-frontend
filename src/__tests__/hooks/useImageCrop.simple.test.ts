import { renderHook, act } from '@testing-library/react-native';
import { useImageCrop } from '../../hooks/useImageCrop';
import ImageCropPicker from 'react-native-image-crop-picker';

// Mock react-native-image-crop-picker
jest.mock('react-native-image-crop-picker', () => ({
  openCropper: jest.fn(),
  openPicker: jest.fn(),
}));

// Mock Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

const mockTheme = {
  colors: {
    primary: '#FF6B35',
    textPrimary: '#2D1B1B',
  },
};

describe('useImageCrop - Basic Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it('should update imageUri when setImageUri is called', () => {
    const { result } = renderHook(() => useImageCrop());

    act(() => {
      result.current.setImageUri('file://new-image.jpg');
    });

    expect(result.current.imageUri).toBe('file://new-image.jpg');
  });

  it('should have all required methods', () => {
    const { result } = renderHook(() => useImageCrop());

    expect(typeof result.current.setImageUri).toBe('function');
    expect(typeof result.current.openCropPicker).toBe('function');
    expect(typeof result.current.openGalleryPicker).toBe('function');
    expect(typeof result.current.optimizeImageForOCR).toBe('function');
    expect(typeof result.current.processImage).toBe('function');
  });
});
