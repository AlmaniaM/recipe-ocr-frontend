import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { LoadingSpinner } from './LoadingSpinner';

export interface LoadingScreenProps {
  message?: string;
  style?: ViewStyle;
  testID?: string;
}

/**
 * Full-screen loading component
 * Used for initial app loading or major operations
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  style,
  testID = 'loading-screen',
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }, style]} testID={testID}>
      <LoadingSpinner
        size="large"
        message={message}
        testID={`${testID}-spinner`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LoadingScreen;
