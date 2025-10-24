import React, { ReactNode } from 'react';
import {
  VirtualizedList as RNVirtualizedList,
  View,
  StyleSheet,
} from 'react-native';

export interface VirtualizedListProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => ReactNode;
  keyExtractor: (item: T, index: number) => string;
  getItemCount: (data: T[]) => number;
  getItem: (data: T[], index: number) => T;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  ListEmptyComponent?: ReactNode;
  ListFooterComponent?: ReactNode;
  testID?: string;
}

/**
 * VirtualizedList wrapper component for large datasets
 * 
 * Features:
 * - Virtualization for memory efficiency
 * - Infinite scroll support
 * - Pull-to-refresh support
 * - Performance optimizations
 * - Accessibility support
 */
export function VirtualizedList<T>({
  data,
  renderItem,
  keyExtractor,
  getItemCount,
  getItem,
  onEndReached,
  onEndReachedThreshold = 0.5,
  refreshing = false,
  onRefresh,
  ListEmptyComponent,
  ListFooterComponent,
  testID = 'virtualized-list',
}: VirtualizedListProps<T>) {
  return (
    <RNVirtualizedList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemCount={getItemCount}
      getItem={getItem}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      testID={testID}
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      updateCellsBatchingPeriod={50}
      disableVirtualization={false}
      legacyImplementation={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});
