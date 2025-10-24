/**
 * Comprehensive Settings Screen
 * 
 * A complete settings screen with all 6 categories as specified in the planning document.
 * This replaces the existing SettingsScreen with a more comprehensive implementation.
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  RefreshControl 
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import {
  SettingsSection,
  ThemeSelector,
  OCRQualitySelector,
  AIProviderSelector,
  StoragePreferenceSelector,
  ExportFormatSelector,
  SwitchSetting,
  AboutSection,
} from '../../components/settings';
import { Result } from '../../domain/common/Result';

export default function ComprehensiveSettingsScreen() {
  const { theme } = useTheme();
  const { 
    settings, 
    resetToDefaults, 
    isLoading, 
    error, 
    clearError 
  } = useSettings();
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Settings will be reloaded automatically by the context
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to their default values? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const result = await resetToDefaults();
            if (!result.isSuccess) {
              Alert.alert('Error', `Failed to reset settings: ${result.error}`);
            }
          },
        },
      ]
    );
  };

  const handleSettingChange = (settingName: string, value: any) => {
    console.log(`Setting ${settingName} changed to:`, value);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textPrimary }]}>
            Loading settings...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: theme.colors.error + '20' }]}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
          <Text 
            style={[styles.dismissText, { color: theme.colors.error }]}
            onPress={clearError}
          >
            Dismiss
          </Text>
        </View>
      )}

      {/* Appearance Section */}
      <SettingsSection 
        title="Appearance" 
        description="Customize the look and feel of the app"
      >
        <ThemeSelector onThemeChange={(theme) => handleSettingChange('theme', theme)} />
      </SettingsSection>

      {/* OCR Settings Section */}
      <SettingsSection 
        title="OCR Settings" 
        description="Configure text recognition quality and behavior"
      >
        <OCRQualitySelector onQualityChange={(quality) => handleSettingChange('ocrQuality', quality)} />
      </SettingsSection>

      {/* AI Parsing Section */}
      <SettingsSection 
        title="AI Parsing" 
        description="Choose how recipes are parsed and processed"
      >
        <AIProviderSelector onProviderChange={(provider) => handleSettingChange('aiProvider', provider)} />
      </SettingsSection>

      {/* Storage Section */}
      <SettingsSection 
        title="Storage" 
        description="Manage data storage and synchronization"
      >
        <StoragePreferenceSelector onPreferenceChange={(preference) => handleSettingChange('storagePreference', preference)} />
        <SwitchSetting
          settingKey="autoSync"
          title="Auto Sync"
          description="Automatically sync recipes to cloud when connected"
          icon="sync"
          onValueChange={(value) => handleSettingChange('autoSync', value)}
        />
      </SettingsSection>

      {/* Export Section */}
      <SettingsSection 
        title="Export" 
        description="Set default export formats and preferences"
      >
        <ExportFormatSelector onFormatChange={(format) => handleSettingChange('exportFormat', format)} />
      </SettingsSection>

      {/* Notifications Section */}
      <SettingsSection 
        title="Notifications" 
        description="Control app notifications and alerts"
      >
        <SwitchSetting
          settingKey="notifications"
          title="Enable Notifications"
          description="Receive notifications for recipe processing and sync"
          icon="notifications"
          onValueChange={(value) => handleSettingChange('notifications', value)}
        />
      </SettingsSection>

      {/* Advanced Section */}
      <SettingsSection 
        title="Advanced" 
        description="Developer and debugging options"
        collapsible={true}
        defaultCollapsed={true}
      >
        <SwitchSetting
          settingKey="debugMode"
          title="Debug Mode"
          description="Enable detailed logging and debugging features"
          icon="bug-report"
          onValueChange={(value) => handleSettingChange('debugMode', value)}
        />
        <SwitchSetting
          settingKey="analyticsEnabled"
          title="Analytics"
          description="Help improve the app by sharing anonymous usage data"
          icon="analytics"
          onValueChange={(value) => handleSettingChange('analyticsEnabled', value)}
        />
        <SwitchSetting
          settingKey="crashReportingEnabled"
          title="Crash Reporting"
          description="Automatically report crashes to help fix issues"
          icon="report-problem"
          onValueChange={(value) => handleSettingChange('crashReportingEnabled', value)}
        />
      </SettingsSection>

      {/* About Section */}
      <SettingsSection 
        title="About" 
        description="App information and support"
      >
        <AboutSection onResetSettings={handleResetSettings} />
      </SettingsSection>

      {/* Bottom spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  dismissText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 32,
  },
});
