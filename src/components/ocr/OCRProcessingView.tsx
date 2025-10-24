import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useOCR } from '../../hooks/useOCR';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface OCRProcessingViewProps {
  imageUri: string;
  onTextExtracted: (text: string) => void;
  onError: (error: string) => void;
  onRetry?: () => void;
}

/**
 * OCR Processing View Component
 * 
 * Displays OCR processing status with theme integration.
 * Shows loading states, progress, and error handling.
 */
export const OCRProcessingView: React.FC<OCRProcessingViewProps> = ({
  imageUri,
  onTextExtracted,
  onError,
  onRetry,
}) => {
  const { theme } = useTheme();
  const {
    isProcessing,
    extractedText,
    confidence,
    error,
    lastUsedService,
    serviceStatus,
    extractText,
    getServiceStatus,
    clearError,
  } = useOCR();

  useEffect(() => {
    // Get service status when component mounts
    getServiceStatus();
  }, [getServiceStatus]);

  useEffect(() => {
    // Start OCR processing when image URI is provided
    if (imageUri) {
      processImage();
    }
  }, [imageUri]);

  const processImage = async () => {
    clearError();
    const result = await extractText(imageUri);
    
    if (result.isSuccess) {
      onTextExtracted(result.value);
    } else {
      onError(result.error);
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      processImage();
    }
  };

  const getServiceIcon = (service: 'mlkit' | 'cloud' | 'none') => {
    switch (service) {
      case 'mlkit':
        return 'phone-android';
      case 'cloud':
        return 'cloud';
      default:
        return 'help';
    }
  };

  const getServiceName = (service: 'mlkit' | 'cloud' | 'none') => {
    switch (service) {
      case 'mlkit':
        return 'On-Device OCR';
      case 'cloud':
        return 'Cloud OCR';
      default:
        return 'Unknown';
    }
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return theme.colors.success;
    if (conf >= 0.6) return theme.colors.warning;
    return theme.colors.error;
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 0.8) return 'High';
    if (conf >= 0.6) return 'Medium';
    return 'Low';
  };

  if (isProcessing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.processingCard, { backgroundColor: theme.colors.surface }]}>
          <ActivityIndicator 
            size="large" 
            color={theme.colors.primary} 
            style={styles.spinner}
          />
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            Processing Image
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Extracting text from your recipe image...
          </Text>
          
          {serviceStatus && (
            <View style={styles.serviceStatus}>
              <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>
                OCR Services:
              </Text>
              <View style={styles.serviceList}>
                <View style={styles.serviceItem}>
                  <Icon 
                    name={serviceStatus.mlKit.available ? 'check-circle' : 'error'} 
                    size={16} 
                    color={serviceStatus.mlKit.available ? theme.colors.success : theme.colors.error}
                  />
                  <Text style={[styles.serviceText, { color: theme.colors.textSecondary }]}>
                    On-Device OCR
                  </Text>
                </View>
                <View style={styles.serviceItem}>
                  <Icon 
                    name={serviceStatus.cloud.available ? 'check-circle' : 'error'} 
                    size={16} 
                    color={serviceStatus.cloud.available ? theme.colors.success : theme.colors.error}
                  />
                  <Text style={[styles.serviceText, { color: theme.colors.textSecondary }]}>
                    Cloud OCR
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.errorCard, { backgroundColor: theme.colors.surface }]}>
          <Icon name="error-outline" size={48} color={theme.colors.error} />
          <Text style={[styles.errorTitle, { color: theme.colors.textPrimary }]}>
            OCR Processing Failed
          </Text>
          <Text style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>
            {error}
          </Text>
          
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleRetry}
          >
            <Icon name="refresh" size={20} color="white" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (extractedText) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.successCard, { backgroundColor: theme.colors.surface }]}>
          <Icon name="check-circle" size={48} color={theme.colors.success} />
          <Text style={[styles.successTitle, { color: theme.colors.textPrimary }]}>
            Text Extracted Successfully
          </Text>
          
          <View style={styles.confidenceContainer}>
            <Text style={[styles.confidenceLabel, { color: theme.colors.textSecondary }]}>
              Confidence: {getConfidenceLabel(confidence)}
            </Text>
            <View style={[styles.confidenceBar, { backgroundColor: theme.colors.border }]}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { 
                    backgroundColor: getConfidenceColor(confidence),
                    width: `${confidence * 100}%`
                  }
                ]} 
              />
            </View>
            <Text style={[styles.confidenceValue, { color: theme.colors.textSecondary }]}>
              {Math.round(confidence * 100)}%
            </Text>
          </View>

          <View style={styles.serviceInfo}>
            <Icon 
              name={getServiceIcon(lastUsedService)} 
              size={16} 
              color={theme.colors.primary}
            />
            <Text style={[styles.serviceInfoText, { color: theme.colors.textSecondary }]}>
              Processed with {getServiceName(lastUsedService)}
            </Text>
          </View>

          <View style={[styles.textPreview, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.previewLabel, { color: theme.colors.textSecondary }]}>
              Extracted Text Preview:
            </Text>
            <Text 
              style={[styles.previewText, { color: theme.colors.textPrimary }]}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {extractedText}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  spinner: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  serviceStatus: {
    marginTop: 16,
    width: '100%',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  serviceList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceText: {
    fontSize: 12,
  },
  confidenceContainer: {
    width: '100%',
    marginBottom: 16,
  },
  confidenceLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  confidenceBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: 12,
    textAlign: 'right',
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  serviceInfoText: {
    fontSize: 12,
  },
  textPreview: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
