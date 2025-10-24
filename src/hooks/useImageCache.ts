import { useState, useCallback, useRef, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';

export interface UseImageCacheReturn {
  getImageUri: (imagePath: string) => Promise<string>;
  preloadImages: (imagePaths: string[]) => Promise<void>;
  clearCache: () => void;
  getCacheSize: () => number;
  isImageCached: (imagePath: string) => boolean;
  getCachedUri: (imagePath: string) => string | null;
}

interface CacheEntry {
  uri: string;
  timestamp: number;
  size: number;
}

/**
 * Custom hook for image caching and optimization
 * 
 * Features:
 * - Image URI resolution
 * - Image preloading
 * - Cache management with LRU eviction
 * - Memory optimization
 * - Error handling
 * - Cache size monitoring
 */
export function useImageCache(): UseImageCacheReturn {
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());
  const maxCacheSize = 50 * 1024 * 1024; // 50MB cache limit
  const maxCacheEntries = 100; // Maximum number of cached images
  
  // Use refs to prevent stale closures
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const currentCacheSizeRef = useRef(0);

  // Update refs when cache changes
  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  /**
   * Get image URI with caching
   */
  const getImageUri = useCallback(async (imagePath: string): Promise<string> => {
    // Check if image is already cached
    const cachedEntry = cacheRef.current.get(imagePath);
    if (cachedEntry) {
      // Update access timestamp for LRU
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.set(imagePath, {
          ...cachedEntry,
          timestamp: Date.now(),
        });
        return newCache;
      });
      return cachedEntry.uri;
    }

    try {
      // Resolve image URI
      let uri: string;
      
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        // Remote URL - use as is
        uri = imagePath;
      } else if (imagePath.startsWith('file://')) {
        // Local file path - use as is
        uri = imagePath;
      } else {
        // Relative path - resolve using FileSystem
        uri = await FileSystem.getUriAsync(imagePath);
      }

      // Get file size for cache management
      let size = 0;
      try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (fileInfo.exists && fileInfo.size) {
          size = fileInfo.size;
        }
      } catch (error) {
        console.warn('Could not get file size for cache:', error);
        size = 1024; // Default size estimate
      }

      // Add to cache
      const cacheEntry: CacheEntry = {
        uri,
        timestamp: Date.now(),
        size,
      };

      setCache(prev => {
        const newCache = new Map(prev);
        newCache.set(imagePath, cacheEntry);
        currentCacheSizeRef.current += size;
        
        // Evict old entries if cache is too large
        return evictOldEntries(newCache);
      });

      return uri;
    } catch (error) {
      console.error('Failed to load image:', error);
      throw new Error(`Failed to load image: ${imagePath}`);
    }
  }, []);

  /**
   * Preload multiple images
   */
  const preloadImages = useCallback(async (imagePaths: string[]): Promise<void> => {
    const promises = imagePaths.map(path => getImageUri(path).catch(error => {
      console.warn(`Failed to preload image ${path}:`, error);
      return null;
    }));
    
    await Promise.all(promises);
  }, [getImageUri]);

  /**
   * Clear all cached images
   */
  const clearCache = useCallback(() => {
    setCache(new Map());
    currentCacheSizeRef.current = 0;
  }, []);

  /**
   * Get current cache size in bytes
   */
  const getCacheSize = useCallback(() => {
    return currentCacheSizeRef.current;
  }, []);

  /**
   * Check if image is cached
   */
  const isImageCached = useCallback((imagePath: string): boolean => {
    return cacheRef.current.has(imagePath);
  }, []);

  /**
   * Get cached URI without loading
   */
  const getCachedUri = useCallback((imagePath: string): string | null => {
    const cachedEntry = cacheRef.current.get(imagePath);
    return cachedEntry ? cachedEntry.uri : null;
  }, []);

  /**
   * Evict old entries when cache is too large
   */
  const evictOldEntries = (cache: Map<string, CacheEntry>): Map<string, CacheEntry> => {
    // If we're under limits, return as is
    if (cache.size <= maxCacheEntries && currentCacheSizeRef.current <= maxCacheSize) {
      return cache;
    }

    // Convert to array and sort by timestamp (oldest first)
    const entries = Array.from(cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const newCache = new Map<string, CacheEntry>();
    let currentSize = 0;
    let entriesAdded = 0;

    // Add entries until we hit limits
    for (const [key, entry] of entries) {
      if (entriesAdded >= maxCacheEntries || currentSize + entry.size > maxCacheSize) {
        break;
      }
      
      newCache.set(key, entry);
      currentSize += entry.size;
      entriesAdded++;
    }

    currentCacheSizeRef.current = currentSize;
    return newCache;
  };

  return {
    getImageUri,
    preloadImages,
    clearCache,
    getCacheSize,
    isImageCached,
    getCachedUri,
  };
}
