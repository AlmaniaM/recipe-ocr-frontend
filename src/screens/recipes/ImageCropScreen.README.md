# ImageCropScreen Implementation

## Overview

The `ImageCropScreen` is a comprehensive image processing screen that allows users to crop, optimize, and process recipe images for OCR (Optical Character Recognition). It provides a user-friendly interface for image manipulation before sending images to the OCR processing pipeline.

## Features

### Core Functionality
- **Image Preview**: Displays the captured or selected image with proper aspect ratio
- **Crop Image**: Allows users to crop the image using react-native-image-crop-picker
- **Gallery Selection**: Enables users to select images from their photo gallery
- **OCR Optimization**: Provides specialized cropping for better OCR results
- **Retake Photo**: Allows users to go back and capture a new photo
- **Continue to OCR**: Processes the image and navigates to the next step

### User Experience
- **Theme Integration**: Fully integrated with the app's theme system
- **Loading States**: Shows appropriate loading indicators during processing
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Accessibility**: Proper accessibility support for all interactive elements
- **Tips Section**: Provides helpful tips for better OCR results

## Technical Implementation

### Architecture
The screen follows a clean architecture pattern with separation of concerns:

- **UI Layer**: `ImageCropScreen.tsx` - Handles presentation and user interactions
- **Business Logic**: `useImageCrop.ts` - Custom hook containing all image processing logic
- **Navigation**: Properly typed navigation with route parameters

### Key Components

#### ImageCropScreen Component
```typescript
// Main screen component with theme integration
export default function ImageCropScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<ImageCropScreenRouteProp>();
  
  const {
    imageUri,
    isProcessing,
    isOptimizing,
    setImageUri,
    openCropPicker,
    openGalleryPicker,
    optimizeImageForOCR,
    processImage,
  } = useImageCrop(route.params?.imageUri);
  
  // ... component implementation
}
```

#### useImageCrop Hook
```typescript
// Custom hook for image processing logic
export const useImageCrop = (initialImageUri?: string): UseImageCropReturn => {
  // State management
  const [imageUri, setImageUri] = useState<string | null>(initialImageUri || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  // Image processing functions
  const openCropPicker = useCallback(async (currentImageUri: string, theme: Theme): Promise<string | null> => {
    // Implementation
  }, []);
  
  // ... other functions
};
```

### Image Processing Features

#### 1. Image Cropping
- **Free-style cropping**: Users can crop images in any aspect ratio
- **Rotation support**: Built-in rotation capabilities
- **Quality optimization**: Compresses images to 80% quality for better performance
- **Theme integration**: Cropper UI matches app theme

#### 2. OCR Optimization
- **Specialized dimensions**: Optimizes images to 1200x1600 for better OCR results
- **Enhanced cropping**: Provides specific cropping options for text recognition
- **Quality settings**: Optimized compression and processing for OCR

#### 3. Gallery Integration
- **Photo selection**: Direct access to device photo gallery
- **Consistent UI**: Same cropping interface as camera capture
- **Error handling**: Graceful handling of permission and selection errors

### Error Handling

The implementation includes comprehensive error handling:

```typescript
// Example error handling in crop picker
.catch(error => {
  console.log('Crop picker error:', error);
  if (error.code !== 'E_PICKER_CANCELLED') {
    Alert.alert('Error', 'Failed to crop image. Please try again.');
  }
});
```

**Error Scenarios Handled:**
- User cancellation (no error shown)
- Permission denied
- Image processing failures
- Navigation errors
- Invalid image formats

### Theme Integration

The screen is fully integrated with the app's theme system:

```typescript
// Theme-aware styling
<View style={[styles.container, { backgroundColor: theme.colors.background }]}>
  <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
    Crop Recipe Image
  </Text>
</View>
```

**Theme Properties Used:**
- `colors.background` - Screen background
- `colors.surface` - Card and container backgrounds
- `colors.textPrimary` - Primary text color
- `colors.textSecondary` - Secondary text color
- `colors.primary` - Accent and button colors
- `colors.border` - Border colors
- `colors.error` - Error state colors

### Navigation Integration

The screen integrates with React Navigation:

```typescript
// Navigation types
export type RecipesStackParamList = {
  ImageCrop: {
    imageUri: string;
  };
  RecipeReview: {
    recipe?: Recipe;
    imageUri?: string;
    source?: 'camera' | 'gallery';
  };
};
```

**Navigation Flow:**
1. **From Camera**: `CameraScreen` → `ImageCropScreen` (with imageUri)
2. **To OCR**: `ImageCropScreen` → `RecipeReviewScreen` (with processed image)

## Testing

### Test Coverage

The implementation includes comprehensive test coverage:

#### Unit Tests
- **Component rendering**: Tests all UI elements render correctly
- **Theme integration**: Verifies theme colors are applied properly
- **Button interactions**: Tests all button press handlers
- **Error states**: Tests error handling scenarios

#### Hook Tests
- **State management**: Tests state initialization and updates
- **Function calls**: Tests all hook functions work correctly
- **Error handling**: Tests error scenarios in hook functions

#### Test Files
- `ImageCropScreen.simple.test.tsx` - Component tests
- `useImageCrop.simple.test.ts` - Hook tests

### Running Tests

```bash
# Run all ImageCropScreen tests
npm test -- --testPathPattern="ImageCropScreen|useImageCrop"

# Run specific test files
npm test -- --testPathPattern="ImageCropScreen.simple.test.tsx"
npm test -- --testPathPattern="useImageCrop.simple.test.ts"
```

## Usage

### Basic Usage

```typescript
// Navigation to ImageCropScreen
navigation.navigate('ImageCrop', {
  imageUri: 'file://path/to/image.jpg'
});
```

### Hook Usage

```typescript
// Using the hook in other components
const {
  imageUri,
  isProcessing,
  isOptimizing,
  setImageUri,
  openCropPicker,
  openGalleryPicker,
  optimizeImageForOCR,
  processImage,
} = useImageCrop(initialImageUri);
```

## Dependencies

### Required Packages
- `react-native-image-crop-picker` - Image cropping functionality
- `@react-navigation/native` - Navigation
- `react-native-vector-icons` - Icons
- `react-native-safe-area-context` - Safe area handling

### Installation
```bash
npm install react-native-image-crop-picker
```

## Performance Considerations

### Image Optimization
- **Compression**: Images are compressed to 80% quality
- **Dimensions**: Optimized dimensions for OCR processing
- **Memory management**: Proper cleanup of image resources

### Loading States
- **Processing indicators**: Shows loading states during operations
- **Button disabling**: Prevents multiple simultaneous operations
- **Error recovery**: Graceful error handling and recovery

## Accessibility

### Accessibility Features
- **Screen reader support**: Proper accessibility labels
- **Touch targets**: Adequate touch target sizes (48dp minimum)
- **Color contrast**: Meets WCAG guidelines
- **Keyboard navigation**: Support for keyboard navigation

### Accessibility Implementation
```typescript
<TouchableOpacity
  accessibilityLabel="Crop image"
  accessibilityHint="Opens image cropper to adjust image"
  onPress={handleCropImage}
>
  <Icon name="crop" size={20} color={theme.colors.textPrimary} />
  <Text>Crop Image</Text>
</TouchableOpacity>
```

## Future Enhancements

### Planned Features
- **Batch processing**: Process multiple images at once
- **Advanced filters**: Image enhancement filters
- **Cloud processing**: Integration with cloud OCR services
- **AI suggestions**: AI-powered cropping suggestions

### Technical Improvements
- **Performance optimization**: Further image processing optimizations
- **Caching**: Image caching for better performance
- **Offline support**: Enhanced offline functionality
- **Analytics**: User interaction analytics

## Troubleshooting

### Common Issues

#### 1. Image Not Loading
- **Check file path**: Ensure imageUri is valid
- **Permissions**: Verify camera/gallery permissions
- **File format**: Ensure supported image formats

#### 2. Cropping Not Working
- **Library installation**: Verify react-native-image-crop-picker is installed
- **Platform setup**: Check platform-specific setup requirements
- **Permissions**: Ensure proper permissions are granted

#### 3. Navigation Issues
- **Route parameters**: Verify navigation parameters are correct
- **Navigation setup**: Check navigation stack configuration

### Debug Tips
- **Console logs**: Check console for error messages
- **Network requests**: Monitor network requests for API calls
- **State updates**: Use React DevTools to monitor state changes

## Contributing

### Code Style
- Follow the existing code style and patterns
- Use TypeScript for type safety
- Include proper error handling
- Write comprehensive tests

### Pull Request Process
1. Create feature branch
2. Implement changes with tests
3. Run test suite
4. Submit pull request with description
5. Address review feedback

## License

This implementation is part of the Recipe OCR app and follows the same license terms.
