import React from 'react';
import { render } from '@testing-library/react-native';
import ImageCropScreen from '../../../screens/recipes/ImageCropScreen';
import { ThemeProvider } from '../../../context/ThemeContext';

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

// Mock SafeAreaView
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: any) => children,
}));

const MockedImageCropScreen = () => (
  <ThemeProvider>
    <ImageCropScreen />
  </ThemeProvider>
);

describe('ImageCropScreen - Basic Rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { getByText } = render(<MockedImageCropScreen />);
    
    expect(getByText('Crop Recipe Image')).toBeTruthy();
    expect(getByText('Adjust the image for better OCR results')).toBeTruthy();
  });

  it('should render all action buttons', () => {
    const { getByText } = render(<MockedImageCropScreen />);
    
    expect(getByText('Retake')).toBeTruthy();
    expect(getByText('Gallery')).toBeTruthy();
    expect(getByText('Crop Image')).toBeTruthy();
    expect(getByText('Optimize for OCR')).toBeTruthy();
    expect(getByText('Continue to OCR')).toBeTruthy();
  });

  it('should render tips section', () => {
    const { getByText } = render(<MockedImageCropScreen />);
    
    expect(getByText('Tip: Ensure the recipe text is clearly visible and well-lit for better OCR results')).toBeTruthy();
  });
});
