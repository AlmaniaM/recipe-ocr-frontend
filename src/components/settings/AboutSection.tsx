/**
 * About Section Component
 * 
 * Displays app information, version, and other about details.
 */

import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';

interface AboutSectionProps {
  onResetSettings?: () => void;
}

export function AboutSection({ onResetSettings }: AboutSectionProps) {
  const { theme } = useTheme();

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open link:', err));
  };

  const handleResetSettings = () => {
    onResetSettings?.();
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.appInfo,
        { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }
      ]}>
        <View style={styles.appIcon}>
          <Icon name="restaurant" size={48} color={theme.colors.primary} />
        </View>
        
        <View style={styles.appDetails}>
          <Text style={[
            styles.appName,
            { color: theme.colors.textPrimary }
          ]}>
            Recipe OCR
          </Text>
          <Text style={[
            styles.appVersion,
            { color: theme.colors.textSecondary }
          ]}>
            Version 1.0.0
          </Text>
          <Text style={[
            styles.appDescription,
            { color: theme.colors.textSecondary }
          ]}>
            Digitize and manage your recipes with AI-powered OCR technology
          </Text>
        </View>
      </View>

      <View style={styles.linksContainer}>
        <TouchableOpacity
          style={[
            styles.linkItem,
            { 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            }
          ]}
          onPress={() => handleOpenLink('https://github.com/your-repo')}
        >
          <Icon name="code" size={20} color={theme.colors.textSecondary} />
          <Text style={[
            styles.linkText,
            { color: theme.colors.textPrimary }
          ]}>
            View Source Code
          </Text>
          <Icon name="open-in-new" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.linkItem,
            { 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            }
          ]}
          onPress={() => handleOpenLink('https://github.com/your-repo/issues')}
        >
          <Icon name="bug-report" size={20} color={theme.colors.textSecondary} />
          <Text style={[
            styles.linkText,
            { color: theme.colors.textPrimary }
          ]}>
            Report a Bug
          </Text>
          <Icon name="open-in-new" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.linkItem,
            { 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            }
          ]}
          onPress={() => handleOpenLink('https://github.com/your-repo/blob/main/PRIVACY.md')}
        >
          <Icon name="privacy-tip" size={20} color={theme.colors.textSecondary} />
          <Text style={[
            styles.linkText,
            { color: theme.colors.textPrimary }
          ]}>
            Privacy Policy
          </Text>
          <Icon name="open-in-new" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { 
              backgroundColor: theme.colors.error + '20',
              borderColor: theme.colors.error,
            }
          ]}
          onPress={handleResetSettings}
        >
          <Icon name="restore" size={20} color={theme.colors.error} />
          <Text style={[
            styles.actionText,
            { color: theme.colors.error }
          ]}>
            Reset All Settings
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  appInfo: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  appIcon: {
    marginRight: 16,
  },
  appDetails: {
    flex: 1,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 16,
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  linksContainer: {
    gap: 8,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
