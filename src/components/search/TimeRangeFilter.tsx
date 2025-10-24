import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface TimeRangeFilterProps {
  minPrepTime: number | null;
  maxPrepTime: number | null;
  minCookTime: number | null;
  maxCookTime: number | null;
  onTimeRangeChange: (field: keyof TimeRangeFilterProps, value: number | null) => void;
}

export function TimeRangeFilter({
  minPrepTime,
  maxPrepTime,
  minCookTime,
  maxCookTime,
  onTimeRangeChange,
}: TimeRangeFilterProps) {
  const { theme } = useTheme();

  const handleTimeChange = (field: keyof TimeRangeFilterProps, text: string) => {
    const value = text.trim() === '' ? null : parseInt(text, 10);
    if (value === null || (!isNaN(value) && value >= 0)) {
      onTimeRangeChange(field, value);
    }
  };

  const clearTimeRange = (field: keyof TimeRangeFilterProps) => {
    onTimeRangeChange(field, null);
  };

  return (
    <View style={styles.container}>
      {/* Prep Time Range */}
      <View style={styles.timeSection}>
        <Text style={[styles.sectionLabel, { color: theme.colors.textPrimary }]}>
          Prep Time (minutes)
        </Text>
        <View style={styles.timeInputs}>
          <View style={styles.timeInputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Min
            </Text>
            <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
              <TextInput
                style={[styles.timeInput, { color: theme.colors.textPrimary }]}
                value={minPrepTime?.toString() || ''}
                onChangeText={(text) => handleTimeChange('minPrepTime', text)}
                placeholder="0"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
                returnKeyType="done"
              />
              {minPrepTime !== null && (
                <TouchableOpacity
                  onPress={() => clearTimeRange('minPrepTime')}
                  style={styles.clearButton}
                >
                  <Text style={[styles.clearText, { color: theme.colors.textSecondary }]}>
                    ×
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <Text style={[styles.dash, { color: theme.colors.textSecondary }]}>-</Text>
          
          <View style={styles.timeInputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Max
            </Text>
            <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
              <TextInput
                style={[styles.timeInput, { color: theme.colors.textPrimary }]}
                value={maxPrepTime?.toString() || ''}
                onChangeText={(text) => handleTimeChange('maxPrepTime', text)}
                placeholder="∞"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
                returnKeyType="done"
              />
              {maxPrepTime !== null && (
                <TouchableOpacity
                  onPress={() => clearTimeRange('maxPrepTime')}
                  style={styles.clearButton}
                >
                  <Text style={[styles.clearText, { color: theme.colors.textSecondary }]}>
                    ×
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Cook Time Range */}
      <View style={styles.timeSection}>
        <Text style={[styles.sectionLabel, { color: theme.colors.textPrimary }]}>
          Cook Time (minutes)
        </Text>
        <View style={styles.timeInputs}>
          <View style={styles.timeInputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Min
            </Text>
            <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
              <TextInput
                style={[styles.timeInput, { color: theme.colors.textPrimary }]}
                value={minCookTime?.toString() || ''}
                onChangeText={(text) => handleTimeChange('minCookTime', text)}
                placeholder="0"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
                returnKeyType="done"
              />
              {minCookTime !== null && (
                <TouchableOpacity
                  onPress={() => clearTimeRange('minCookTime')}
                  style={styles.clearButton}
                >
                  <Text style={[styles.clearText, { color: theme.colors.textSecondary }]}>
                    ×
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <Text style={[styles.dash, { color: theme.colors.textSecondary }]}>-</Text>
          
          <View style={styles.timeInputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Max
            </Text>
            <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
              <TextInput
                style={[styles.timeInput, { color: theme.colors.textPrimary }]}
                value={maxCookTime?.toString() || ''}
                onChangeText={(text) => handleTimeChange('maxCookTime', text)}
                placeholder="∞"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
                returnKeyType="done"
              />
              {maxCookTime !== null && (
                <TouchableOpacity
                  onPress={() => clearTimeRange('maxCookTime')}
                  style={styles.clearButton}
                >
                  <Text style={[styles.clearText, { color: theme.colors.textSecondary }]}>
                    ×
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  timeSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeInputContainer: {
    flex: 1,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    minWidth: 60,
  },
  timeInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    paddingVertical: 6,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  clearText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  dash: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginHorizontal: 8,
  },
});
