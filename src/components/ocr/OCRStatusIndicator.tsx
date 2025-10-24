import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useOCR } from '../../hooks/useOCR';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface OCRStatusIndicatorProps {
  onPress?: () => void;
  showDetails?: boolean;
  compact?: boolean;
}

/**
 * OCR Status Indicator Component
 * 
 * Shows the current status of OCR services with theme integration.
 * Displays availability, last used service, and confidence score.
 */
export const OCRStatusIndicator: React.FC<OCRStatusIndicatorProps> = ({
  onPress,
  showDetails = false,
  compact = false,
}) => {
  const { theme } = useTheme();
  const { serviceStatus, lastUsedService, confidence, getServiceStatus } = useOCR();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!serviceStatus) {
      loadServiceStatus();
    }
  }, []);

  const loadServiceStatus = async () => {
    setIsLoading(true);
    try {
      await getServiceStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!serviceStatus) return theme.colors.textSecondary;
    
    const hasAvailableService = serviceStatus.mlKit.available || serviceStatus.cloud.available;
    return hasAvailableService ? theme.colors.success : theme.colors.error;
  };

  const getStatusIcon = () => {
    if (!serviceStatus) return 'help';
    
    const hasAvailableService = serviceStatus.mlKit.available || serviceStatus.cloud.available;
    return hasAvailableService ? 'check-circle' : 'error';
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
        return 'On-Device';
      case 'cloud':
        return 'Cloud';
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

  const renderCompactView = () => (
    <TouchableOpacity
      style={[styles.compactContainer, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Icon 
        name={getStatusIcon()} 
        size={16} 
        color={getStatusColor()} 
      />
      {lastUsedService !== 'none' && (
        <Icon 
          name={getServiceIcon(lastUsedService)} 
          size={12} 
          color={theme.colors.textSecondary}
          style={styles.serviceIcon}
        />
      )}
    </TouchableOpacity>
  );

  const renderDetailedView = () => (
    <TouchableOpacity
      style={[styles.detailedContainer, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.statusHeader}>
        <Icon 
          name={getStatusIcon()} 
          size={20} 
          color={getStatusColor()} 
        />
        <Text style={[styles.statusText, { color: theme.colors.textPrimary }]}>
          OCR Status
        </Text>
        {isLoading && (
          <Icon name="refresh" size={16} color={theme.colors.textSecondary} />
        )}
      </View>

      {serviceStatus && (
        <View style={styles.serviceList}>
          <View style={styles.serviceItem}>
            <Icon 
              name={serviceStatus.mlKit.available ? 'check-circle' : 'error'} 
              size={14} 
              color={serviceStatus.mlKit.available ? theme.colors.success : theme.colors.error}
            />
            <Text style={[styles.serviceText, { color: theme.colors.textSecondary }]}>
              On-Device
            </Text>
          </View>
          <View style={styles.serviceItem}>
            <Icon 
              name={serviceStatus.cloud.available ? 'check-circle' : 'error'} 
              size={14} 
              color={serviceStatus.cloud.available ? theme.colors.success : theme.colors.error}
            />
            <Text style={[styles.serviceText, { color: theme.colors.textSecondary }]}>
              Cloud
            </Text>
          </View>
        </View>
      )}

      {lastUsedService !== 'none' && (
        <View style={styles.lastUsedContainer}>
          <Icon 
            name={getServiceIcon(lastUsedService)} 
            size={14} 
            color={theme.colors.primary}
          />
          <Text style={[styles.lastUsedText, { color: theme.colors.textSecondary }]}>
            Last: {getServiceName(lastUsedService)}
          </Text>
        </View>
      )}

      {confidence > 0 && (
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
        </View>
      )}
    </TouchableOpacity>
  );

  if (compact) {
    return renderCompactView();
  }

  return renderDetailedView();
};

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceIcon: {
    marginLeft: 4,
  },
  detailedContainer: {
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  serviceList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceText: {
    fontSize: 12,
  },
  lastUsedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  lastUsedText: {
    fontSize: 12,
  },
  confidenceContainer: {
    marginTop: 4,
  },
  confidenceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  confidenceBar: {
    height: 4,
    borderRadius: 2,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 2,
  },
});
