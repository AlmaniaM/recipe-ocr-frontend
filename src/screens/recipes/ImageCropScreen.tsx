import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';
import { RecipesStackParamList } from '../../types/navigation';
import { useImageCrop } from '../../hooks/useImageCrop';

type ImageCropScreenRouteProp = RouteProp<RecipesStackParamList, 'ImageCrop'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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

  useEffect(() => {
    if (route.params?.imageUri) {
      setImageUri(route.params.imageUri);
    }
  }, [route.params, setImageUri]);

  const handleCropImage = useCallback(async () => {
    if (!imageUri) return;

    const croppedImagePath = await openCropPicker(imageUri, theme);
    if (croppedImagePath) {
      setImageUri(croppedImagePath);
    }
  }, [imageUri, openCropPicker, theme, setImageUri]);

  const handleOptimizeImage = useCallback(async () => {
    if (!imageUri) return;

    const optimizedImagePath = await optimizeImageForOCR(imageUri, theme);
    if (optimizedImagePath) {
      setImageUri(optimizedImagePath);
    }
  }, [imageUri, optimizeImageForOCR, theme, setImageUri]);

  const handleProcessImage = useCallback(async () => {
    if (!imageUri) return;

    try {
      await processImage(imageUri);
      // Navigate to RecipeReview screen with the processed image
      (navigation as any).navigate('RecipeReview', {
        imageUri: imageUri,
        source: 'camera'
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [imageUri, processImage, navigation]);

  const retakePhoto = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSelectFromGallery = useCallback(async () => {
    const selectedImagePath = await openGalleryPicker(theme);
    if (selectedImagePath) {
      setImageUri(selectedImagePath);
    }
  }, [openGalleryPicker, theme, setImageUri]);

  if (!imageUri) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={64} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.textPrimary }]}>
            No image available
          </Text>
          <Text style={[styles.errorSubtext, { color: theme.colors.textSecondary }]}>
            Please go back and capture a photo
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={retakePhoto}
          >
            <Text style={[styles.buttonText, { color: 'white' }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Crop Recipe Image
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Adjust the image for better OCR results
        </Text>
      </View>

      {/* Image Preview */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.controls}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, { borderColor: theme.colors.border }]}
            onPress={retakePhoto}
            disabled={isProcessing || isOptimizing}
          >
            <Icon name="camera-alt" size={20} color={theme.colors.textPrimary} />
            <Text style={[styles.buttonText, { color: theme.colors.textPrimary }]}>
              Retake
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, { borderColor: theme.colors.border }]}
            onPress={handleSelectFromGallery}
            disabled={isProcessing || isOptimizing}
          >
            <Icon name="photo-library" size={20} color={theme.colors.textPrimary} />
            <Text style={[styles.buttonText, { color: theme.colors.textPrimary }]}>
              Gallery
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, { borderColor: theme.colors.border }]}
          onPress={handleCropImage}
          disabled={isProcessing || isOptimizing}
        >
          <Icon name="crop" size={20} color={theme.colors.textPrimary} />
          <Text style={[styles.buttonText, { color: theme.colors.textPrimary }]}>
            Crop Image
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, { borderColor: theme.colors.border }]}
          onPress={handleOptimizeImage}
          disabled={isProcessing || isOptimizing}
        >
          {isOptimizing ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Icon name="tune" size={20} color={theme.colors.textPrimary} />
          )}
          <Text style={[styles.buttonText, { color: theme.colors.textPrimary }]}>
            {isOptimizing ? 'Optimizing...' : 'Optimize for OCR'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleProcessImage}
          disabled={isProcessing || isOptimizing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Icon name="arrow-forward" size={20} color="white" />
          )}
          <Text style={[styles.buttonText, { color: 'white' }]}>
            {isProcessing ? 'Processing...' : 'Continue to OCR'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tips */}
      <View style={[styles.tipsContainer, { backgroundColor: theme.colors.surface }]}>
        <Icon name="lightbulb-outline" size={20} color={theme.colors.primary} />
        <Text style={[styles.tipsText, { color: theme.colors.textSecondary }]}>
          Tip: Ensure the recipe text is clearly visible and well-lit for better OCR results
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: screenWidth - 40,
    height: (screenWidth - 40) * 1.2, // 4:5 aspect ratio
    borderRadius: 8,
  },
  controls: {
    padding: 20,
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: '#FF6B35',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 20,
    borderRadius: 8,
    gap: 12,
  },
  tipsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
