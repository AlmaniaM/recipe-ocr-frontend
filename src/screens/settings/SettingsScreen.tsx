import React from 'react';
import ComprehensiveSettingsScreen from './ComprehensiveSettingsScreen';

export default function SettingsScreen() {
  // Use the comprehensive settings screen instead of the old implementation
  return <ComprehensiveSettingsScreen />;
}

// Keep the old implementation for reference (commented out)
/*
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function SettingsScreenOld() {
  const { theme, themeName, setTheme, availableThemes } = useTheme();

  const renderThemeOption = (themeKey: string) => {
    const isSelected = themeName === themeKey;
    const themeData = availableThemes.find(key => key === themeKey);
    
    return (
      <TouchableOpacity
        key={themeKey}
        style={[
          styles.themeOption,
          { 
            backgroundColor: theme.colors.surface,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
            borderWidth: isSelected ? 2 : 1,
          }
        ]}
        onPress={() => setTheme(themeKey)}
      >
        <View style={styles.themeInfo}>
          <Text style={[styles.themeName, { color: theme.colors.textPrimary }]}>
            {themeKey}
          </Text>
          <Text style={[styles.themeDescription, { color: theme.colors.textSecondary }]}>
            {themeKey === 'warmInviting' && 'Warm orange and golden tones'}
            {themeKey === 'cleanModern' && 'Blue and emerald accents'}
            {themeKey === 'earthyNatural' && 'Green and amber tones'}
          </Text>
        </View>
        {isSelected && (
          <Icon name="check" size={24} color={theme.colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Theme
        </Text>
        {availableThemes.map(renderThemeOption)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  themeOption: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
  },
});
*/