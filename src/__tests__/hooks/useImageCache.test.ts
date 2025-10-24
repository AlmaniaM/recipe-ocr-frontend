import { renderHook, act } from '@testing-library/react-native';
import { useImageCache } from '../../hooks/useImageCache';
import * as FileSystem from 'expo-file-system';

// Mock FileSystem
jest.mock('expo-file-system', () => ({
  getUriAsync: jest.fn(),
  getInfoAsync: jest.fn(),
}));

const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;

describe('useImageCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFileSystem.getUriAsync.mockResolvedValue('file://resolved-uri');
    mockFileSystem.getInfoAsync.mockResolvedValue({
      exists: true,
      size: 1024,
    } as any);
  });

  it('should initialize with empty cache', () => {
    const { result } = renderHook(() => useImageCache());

    expect(result.current.getCacheSize()).toBe(0);
    expect(result.current.isImageCached('test-path')).toBe(false);
    expect(result.current.getCachedUri('test-path')).toBeNull();
  });

  it('should cache image URIs', async () => {
    const { result } = renderHook(() => useImageCache());

    const imagePath = 'test-image.jpg';
    const uri = await act(async () => {
      return await result.current.getImageUri(imagePath);
    });

    expect(uri).toBe('file://resolved-uri');
    expect(result.current.isImageCached(imagePath)).toBe(true);
    expect(result.current.getCachedUri(imagePath)).toBe('file://resolved-uri');
  });

  it('should return cached URI for subsequent calls', async () => {
    const { result } = renderHook(() => useImageCache());

    const imagePath = 'test-image.jpg';

    // First call
    await act(async () => {
      await result.current.getImageUri(imagePath);
    });

    // Second call should use cache
    mockFileSystem.getUriAsync.mockClear();
    
    const uri = await act(async () => {
      return await result.current.getImageUri(imagePath);
    });

    expect(uri).toBe('file://resolved-uri');
    expect(mockFileSystem.getUriAsync).not.toHaveBeenCalled();
  });

  it('should handle remote URLs', async () => {
    const { result } = renderHook(() => useImageCache());

    const remoteUrl = 'https://example.com/image.jpg';
    const uri = await act(async () => {
      return await result.current.getImageUri(remoteUrl);
    });

    expect(uri).toBe(remoteUrl);
    expect(mockFileSystem.getUriAsync).not.toHaveBeenCalled();
  });

  it('should handle file:// URLs', async () => {
    const { result } = renderHook(() => useImageCache());

    const fileUrl = 'file://local-image.jpg';
    const uri = await act(async () => {
      return await result.current.getImageUri(fileUrl);
    });

    expect(uri).toBe(fileUrl);
    expect(mockFileSystem.getUriAsync).not.toHaveBeenCalled();
  });

  it('should preload multiple images', async () => {
    const { result } = renderHook(() => useImageCache());

    const imagePaths = ['image1.jpg', 'image2.jpg', 'image3.jpg'];

    await act(async () => {
      await result.current.preloadImages(imagePaths);
    });

    imagePaths.forEach(path => {
      expect(result.current.isImageCached(path)).toBe(true);
    });
  });

  it('should clear cache', async () => {
    const { result } = renderHook(() => useImageCache());

    const imagePath = 'test-image.jpg';

    // Cache an image
    await act(async () => {
      await result.current.getImageUri(imagePath);
    });

    expect(result.current.isImageCached(imagePath)).toBe(true);

    // Clear cache
    act(() => {
      result.current.clearCache();
    });

    expect(result.current.isImageCached(imagePath)).toBe(false);
    expect(result.current.getCacheSize()).toBe(0);
  });

  it('should handle file system errors gracefully', async () => {
    const { result } = renderHook(() => useImageCache());

    mockFileSystem.getUriAsync.mockRejectedValue(new Error('File system error'));

    const imagePath = 'invalid-path.jpg';

    await expect(
      act(async () => {
        await result.current.getImageUri(imagePath);
      })
    ).rejects.toThrow('Failed to load image: invalid-path.jpg');
  });

  it('should handle missing file info', async () => {
    const { result } = renderHook(() => useImageCache());

    mockFileSystem.getInfoAsync.mockResolvedValue({
      exists: false,
    } as any);

    const imagePath = 'missing-file.jpg';
    const uri = await act(async () => {
      return await result.current.getImageUri(imagePath);
    });

    expect(uri).toBe('file://resolved-uri');
    expect(result.current.isImageCached(imagePath)).toBe(true);
  });

  it('should update cache size correctly', async () => {
    const { result } = renderHook(() => useImageCache());

    const imagePath = 'test-image.jpg';
    mockFileSystem.getInfoAsync.mockResolvedValue({
      exists: true,
      size: 2048,
    } as any);

    await act(async () => {
      await result.current.getImageUri(imagePath);
    });

    expect(result.current.getCacheSize()).toBe(2048);
  });

  it('should handle preload errors gracefully', async () => {
    const { result } = renderHook(() => useImageCache());

    mockFileSystem.getUriAsync
      .mockResolvedValueOnce('file://resolved-uri-1')
      .mockRejectedValueOnce(new Error('File system error'))
      .mockResolvedValueOnce('file://resolved-uri-3');

    const imagePaths = ['image1.jpg', 'image2.jpg', 'image3.jpg'];

    // Should not throw even if some images fail
    await act(async () => {
      await result.current.preloadImages(imagePaths);
    });

    expect(result.current.isImageCached('image1.jpg')).toBe(true);
    expect(result.current.isImageCached('image2.jpg')).toBe(false);
    expect(result.current.isImageCached('image3.jpg')).toBe(true);
  });
});
