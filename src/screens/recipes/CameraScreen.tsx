import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Text,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Camera } from 'expo-camera';
import type { CameraType, FlashMode } from 'expo-camera';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RecipesStackParamList } from '../../types/navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCamera, useCameraUI } from '../../hooks/useCamera';

const { width, height } = Dimensions.get('window');

type CameraScreenNavigationProp = StackNavigationProp<RecipesStackParamList, 'Camera'>;

interface CameraScreenProps {}

export default function CameraScreen({}: CameraScreenProps) {
  const { theme } = useTheme();
  const navigation = useNavigation<CameraScreenNavigationProp>();
  
  const {
    hasPermission,
    cameraType,
    flashMode,
    isCapturing,
    isReady,
    error,
    takePicture,
    switchCamera,
    toggleFlash,
    requestPermissions,
    clearError,
    setCameraReady,
    cameraRef,
  } = useCamera();

  const { getFlashIcon, getFlashColor } = useCameraUI(flashMode, theme);

  const handleTakePicture = useCallback(async () => {
    const photo = await takePicture();
    if (photo?.uri) {
      navigation.navigate('ImageCrop', { imageUri: photo.uri });
    }
  }, [takePicture, navigation]);

  const handleCameraReady = useCallback(() => {
    setCameraReady(true);
  }, [setCameraReady]);

  const handleCameraError = useCallback((error: any) => {
    console.error('Camera error:', error);
    setCameraReady(false);
  }, [setCameraReady]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleRetryPermissions = useCallback(async () => {
    await requestPermissions();
  }, [requestPermissions]);

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]} testID="camera-screen">
        <ActivityIndicator size="large" color={theme.colors.primary} testID="camera-permission-loading" />
        <Text style={[styles.loadingText, { color: theme.colors.textPrimary }]}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]} testID="camera-screen">
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <View style={styles.permissionContainer} testID="camera-permission-container">
          <Icon name="camera-alt" size={80} color={theme.colors.textSecondary} />
          <Text style={[styles.permissionTitle, { color: theme.colors.textPrimary }]}>
            Camera Permission Required
          </Text>
          <Text style={[styles.permissionMessage, { color: theme.colors.textSecondary }]}>
            Recipe OCR needs access to your camera to capture recipe photos. Please enable camera permission in your device settings.
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleRetryPermissions}
            testID="camera-permission-button"
          >
            <Text style={[styles.permissionButtonText, { color: 'white' }]}>
              Grant Permission
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.backButton, { borderColor: theme.colors.border }]}
            onPress={goBack}
            testID="camera-back-button"
          >
            <Text style={[styles.backButtonText, { color: theme.colors.textPrimary }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="camera-screen">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={cameraType}
        flashMode={flashMode}
        ratio="4:3"
        onCameraReady={handleCameraReady}
        onMountError={handleCameraError}
        testID="camera-view"
      >
        <View style={styles.overlay}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
              onPress={goBack}
              testID="camera-back-button"
            >
              <Icon name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.topRightControls}>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                onPress={switchCamera}
                testID="camera-switch-button"
              >
                <Icon name="flip-camera-android" size={24} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                onPress={toggleFlash}
                testID="camera-flash-button"
              >
                <Icon 
                  name={getFlashIcon()} 
                  size={24} 
                  color={getFlashColor()} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Capture Area Frame */}
          <View style={styles.captureFrame} testID="camera-capture-frame">
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              Position the recipe within the frame
            </Text>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity
              style={[styles.captureButton, isCapturing && styles.capturing]}
              onPress={handleTakePicture}
              disabled={isCapturing || !isReady}
              testID="camera-capture-button"
            >
              <View style={[styles.captureButtonInner, { backgroundColor: isReady ? theme.colors.primary : theme.colors.textSecondary }]} />
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer} testID="camera-error">
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Loading Overlay */}
          {isCapturing && (
            <View style={styles.loadingOverlay} testID="camera-capturing">
              <ActivityIndicator size="large" color="white" />
              <Text style={styles.loadingText}>Capturing...</Text>
            </View>
          )}
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  topRightControls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureFrame: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -150,
    marginLeft: -150,
    width: 300,
    height: 300,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderColor: 'white',
  },
  topLeft: {
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    top: 'auto',
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  instructionsContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    marginTop: 180,
    alignItems: 'center',
  },
  instructionsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  capturing: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionMessage: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  permissionButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  errorContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
