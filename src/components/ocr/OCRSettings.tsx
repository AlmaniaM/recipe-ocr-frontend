import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useOCR } from '../../hooks/useOCR';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OCRSettingsProps {
  onSettingsChange?: (settings: OCRSettings) => void;
}

interface OCRSettings {
  preferMLKit: boolean;
  enableCloudFallback: boolean;
  autoProcess: boolean;
  confidenceThreshold: number;
}

const DEFAULT_SETTINGS: OCRSettings = {
  preferMLKit: true,
  enableCloudFallback: true,
  autoProcess: true,
  confidenceThreshold: 0.6,
};

/**
 * OCR Settings Component
 * 
 * Provides settings for OCR behavior with theme integration.
 * Allows users to configure OCR preferences and service selection.
 */
export const OCRSettings: React.FC<OCRSettingsProps> = ({ onSettingsChange }) => {
  const { theme } = useTheme();
  const { serviceStatus, getServiceStatus } = useOCR();
  const [settings, setSettings] = useState<OCRSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    getServiceStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('ocr_settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.warn('Failed to load OCR settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: OCRSettings) => {
    try {
      await AsyncStorage.setItem('ocr_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
      onSettingsChange?.(newSettings);
    } catch (error) {
      console.warn('Failed to save OCR settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const updateSetting = <K extends keyof OCRSettings>(
    key: K,
    value: OCRSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset OCR settings to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => saveSettings(DEFAULT_SETTINGS)
        },
      ]
    );
  };

  const getServiceAvailability = (service: 'mlkit' | 'cloud') => {
    if (!serviceStatus) return false;
    return service === 'mlkit' ? serviceStatus.mlKit.available : serviceStatus.cloud.available;
  };

  const getServiceError = (service: 'mlkit' | 'cloud') => {
    if (!serviceStatus) return null;
    return service === 'mlkit' ? serviceStatus.mlKit.error : serviceStatus.cloud.error;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.loadingCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading OCR settings...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          OCR Settings
        </Text>

        {/* Service Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Service Selection
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon 
                name="phone-android" 
                size={20} 
                color={getServiceAvailability('mlkit') ? theme.colors.success : theme.colors.error}
              />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
                  Prefer On-Device OCR
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  {getServiceAvailability('mlkit') 
                    ? 'Faster and more private' 
                    : 'Not available on this device'
                  }
                </Text>
                {getServiceError('mlkit') && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {getServiceError('mlkit')}
                  </Text>
                )}
              </View>
            </View>
            <Switch
              value={settings.preferMLKit}
              onValueChange={(value) => updateSetting('preferMLKit', value)}
              disabled={!getServiceAvailability('mlkit')}
              trackColor={{ 
                false: theme.colors.border, 
                true: theme.colors.primary 
              }}
              thumbColor={settings.preferMLKit ? theme.colors.surface : theme.colors.textSecondary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon 
                name="cloud" 
                size={20} 
                color={getServiceAvailability('cloud') ? theme.colors.success : theme.colors.error}
              />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
                  Enable Cloud Fallback
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  {getServiceAvailability('cloud') 
                    ? 'Use cloud OCR when on-device fails' 
                    : 'Cloud service not available'
                  }
                </Text>
                {getServiceError('cloud') && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {getServiceError('cloud')}
                  </Text>
                )}
              </View>
            </View>
            <Switch
              value={settings.enableCloudFallback}
              onValueChange={(value) => updateSetting('enableCloudFallback', value)}
              disabled={!getServiceAvailability('cloud')}
              trackColor={{ 
                false: theme.colors.border, 
                true: theme.colors.primary 
              }}
              thumbColor={settings.enableCloudFallback ? theme.colors.surface : theme.colors.textSecondary}
            />
          </View>
        </View>

        {/* Processing Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Processing Options
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="auto-fix-high" size={20} color={theme.colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
                  Auto-Process Images
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Automatically start OCR when image is captured
                </Text>
              </View>
            </View>
            <Switch
              value={settings.autoProcess}
              onValueChange={(value) => updateSetting('autoProcess', value)}
              trackColor={{ 
                false: theme.colors.border, 
                true: theme.colors.primary 
              }}
              thumbColor={settings.autoProcess ? theme.colors.surface : theme.colors.textSecondary}
            />
          </View>
        </View>

        {/* Quality Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Quality Settings
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="tune" size={20} color={theme.colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
                  Confidence Threshold
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Minimum confidence for accepting OCR results
                </Text>
              </View>
            </View>
            <View style={styles.confidenceContainer}>
              <Text style={[styles.confidenceValue, { color: theme.colors.textPrimary }]}>
                {Math.round(settings.confidenceThreshold * 100)}%
              </Text>
            </View>
          </View>
          
          <View style={styles.confidenceSlider}>
            <View style={[styles.confidenceBar, { backgroundColor: theme.colors.border }]}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { 
                    backgroundColor: theme.colors.primary,
                    width: `${settings.confidenceThreshold * 100}%`
                  }
                ]} 
              />
            </View>
            <View style={styles.confidenceLabels}>
              <Text style={[styles.confidenceLabel, { color: theme.colors.textSecondary }]}>
                Low
              </Text>
              <Text style={[styles.confidenceLabel, { color: theme.colors.textSecondary }]}>
                High
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.resetButton, { borderColor: theme.colors.border }]}
            onPress={resetToDefaults}
          >
            <Icon name="refresh" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.resetButtonText, { color: theme.colors.textSecondary }]}>
              Reset to Defaults
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  settingsCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  errorText: {
    fontSize: 12,
    marginTop: 2,
  },
  confidenceContainer: {
    alignItems: 'center',
    minWidth: 50,
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  confidenceSlider: {
    marginTop: 8,
  },
  confidenceBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 3,
  },
  confidenceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confidenceLabel: {
    fontSize: 12,
  },
  actions: {
    marginTop: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
