import React, { ReactNode } from 'react';
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  refreshing: boolean;
  refreshTitle?: string;
  refreshSubtitle?: string;
  testID?: string;
}

/**
 * PullToRefresh wrapper component for scrollable content
 * 
 * Features:
 * - Custom refresh control with themed colors
 * - Customizable refresh messages
 * - Accessibility support
 * - Performance optimized
 */
export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshing,
  refreshTitle = 'Pull to refresh',
  refreshSubtitle = 'Release to refresh',
  testID = 'pull-to-refresh',
}) => {
  const { theme } = useTheme();

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={theme.colors.primary}
      colors={[theme.colors.primary]}
      title={refreshing ? refreshTitle : refreshSubtitle}
      titleColor={theme.colors.textSecondary}
      progressBackgroundColor={theme.colors.surface}
      testID={`${testID}-control`}
    />
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={refreshControl}
      testID={testID}
      showsVerticalScrollIndicator={false}
      bounces={true}
      alwaysBounceVertical={true}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});
