/**
 * Unit Tests for ImageApiClient
 * 
 * Tests the image API client functionality including:
 * - Image upload
 * - URL retrieval
 * - Image deletion
 * - Existence checks
 * - Batch operations
 * - Error handling
 */

import { ImageApiClient } from '../../infrastructure/api/ImageApiClient';
import { BaseApiClient } from '../../infrastructure/services/api/BaseApiClient';
import { Result } from '../../domain/common/Result';
import { TestDataFactory } from '../utils/TestDataFactory';

// Mock BaseApiClient
const mockBaseApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
};

jest.mock('../../infrastructure/services/api/BaseApiClient', () => ({
  BaseApiClient: jest.fn().mockImplementation(() => mockBaseApiClient),
}));

describe('ImageApiClient', () => {
  let imageApiClient: ImageApiClient;
  let testDataFactory: TestDataFactory;

  beforeEach(() => {
    imageApiClient = new ImageApiClient();
    testDataFactory = new TestDataFactory();
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockBaseApiClient.get.mockResolvedValue({ data: {}, status: 200 });
    mockBaseApiClient.post.mockResolvedValue({ data: {}, status: 200 });
    mockBaseApiClient.put.mockResolvedValue({ data: {}, status: 200 });
    mockBaseApiClient.delete.mockResolvedValue({ data: {}, status: 200 });
    mockBaseApiClient.patch.mockResolvedValue({ data: {}, status: 200 });
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      // Arrange
      const imageUri = testDataFactory.createImageUri();
      const fileName = testDataFactory.createFileName();
      const contentType = 'image/jpeg';
      const uploadResponse = testDataFactory.createImageUploadResponse({
        fileName,
        contentType
      });

      mockBaseApiClient.post.mockResolvedValue({
        data: uploadResponse,
        status: 200
      });

      // Act
      const result = await imageApiClient.uploadImage(imageUri, fileName, contentType);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(uploadResponse);
      expect(mockBaseApiClient.post).toHaveBeenCalledWith(
        '/images/upload',
        expect.any(FormData),
        expect.any(Object)
      );
    });

    it('should handle upload failure', async () => {
      // Arrange
      const imageUri = testDataFactory.createImageUri();
      const fileName = testDataFactory.createFileName();
      const contentType = 'image/jpeg';

      mockBaseApiClient.post.mockRejectedValue(new Error('Upload failed'));

      // Act
      const result = await imageApiClient.uploadImage(imageUri, fileName, contentType);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Upload failed');
    });

    it('should handle server error response', async () => {
      // Arrange
      const imageUri = testDataFactory.createImageUri();
      const fileName = testDataFactory.createFileName();
      const contentType = 'image/jpeg';

      mockBaseApiClient.post.mockResolvedValue({
        data: { error: 'Server error' },
        status: 500
      });

      // Act
      const result = await imageApiClient.uploadImage(imageUri, fileName, contentType);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Server error');
    });

    it('should handle invalid parameters', async () => {
      // Act & Assert
      await expect(imageApiClient.uploadImage('', 'fileName', 'contentType')).rejects.toThrow();
      await expect(imageApiClient.uploadImage('imageUri', '', 'contentType')).rejects.toThrow();
      await expect(imageApiClient.uploadImage('imageUri', 'fileName', '')).rejects.toThrow();
    });
  });

  describe('getImageUrl', () => {
    it('should get image URL successfully', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();
      const urlResponse = testDataFactory.createImageUrlResponse();

      mockBaseApiClient.get.mockResolvedValue({
        data: urlResponse,
        status: 200
      });

      // Act
      const result = await imageApiClient.getImageUrl(fileName);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(urlResponse);
      expect(mockBaseApiClient.get).toHaveBeenCalledWith(`/images/${fileName}/url`);
    });

    it('should handle URL retrieval failure', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();

      mockBaseApiClient.get.mockRejectedValue(new Error('URL retrieval failed'));

      // Act
      const result = await imageApiClient.getImageUrl(fileName);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('URL retrieval failed');
    });

    it('should handle not found response', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();

      mockBaseApiClient.get.mockResolvedValue({
        data: { error: 'Image not found' },
        status: 404
      });

      // Act
      const result = await imageApiClient.getImageUrl(fileName);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Image not found');
    });

    it('should handle invalid fileName', async () => {
      // Act & Assert
      await expect(imageApiClient.getImageUrl('')).rejects.toThrow();
    });
  });

  describe('deleteImage', () => {
    it('should delete image successfully', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();

      mockBaseApiClient.delete.mockResolvedValue({
        data: { success: true },
        status: 200
      });

      // Act
      const result = await imageApiClient.deleteImage(fileName);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(true);
      expect(mockBaseApiClient.delete).toHaveBeenCalledWith(`/images/${fileName}`);
    });

    it('should handle deletion failure', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();

      mockBaseApiClient.delete.mockRejectedValue(new Error('Deletion failed'));

      // Act
      const result = await imageApiClient.deleteImage(fileName);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Deletion failed');
    });

    it('should handle not found response', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();

      mockBaseApiClient.delete.mockResolvedValue({
        data: { error: 'Image not found' },
        status: 404
      });

      // Act
      const result = await imageApiClient.deleteImage(fileName);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Image not found');
    });

    it('should handle invalid fileName', async () => {
      // Act & Assert
      await expect(imageApiClient.deleteImage('')).rejects.toThrow();
    });
  });

  describe('imageExists', () => {
    it('should return true when image exists', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();

      mockBaseApiClient.get.mockResolvedValue({
        data: { exists: true },
        status: 200
      });

      // Act
      const result = await imageApiClient.imageExists(fileName);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(true);
      expect(mockBaseApiClient.get).toHaveBeenCalledWith(`/images/${fileName}/exists`);
    });

    it('should return false when image does not exist', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();

      mockBaseApiClient.get.mockResolvedValue({
        data: { exists: false },
        status: 200
      });

      // Act
      const result = await imageApiClient.imageExists(fileName);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(false);
    });

    it('should handle existence check failure', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();

      mockBaseApiClient.get.mockRejectedValue(new Error('Existence check failed'));

      // Act
      const result = await imageApiClient.imageExists(fileName);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Existence check failed');
    });

    it('should handle invalid fileName', async () => {
      // Act & Assert
      await expect(imageApiClient.imageExists('')).rejects.toThrow();
    });
  });

  describe('getImageUrls', () => {
    it('should get multiple image URLs successfully', async () => {
      // Arrange
      const fileNames = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
      const urlResponses = fileNames.map(fileName => 
        testDataFactory.createImageUrlResponse({ url: `https://storage.example.com/images/${fileName}` })
      );

      mockBaseApiClient.post.mockResolvedValue({
        data: urlResponses,
        status: 200
      });

      // Act
      const result = await imageApiClient.getImageUrls(fileNames);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(urlResponses);
      expect(mockBaseApiClient.post).toHaveBeenCalledWith(
        '/images/urls',
        { fileNames },
        expect.any(Object)
      );
    });

    it('should handle batch URL retrieval failure', async () => {
      // Arrange
      const fileNames = ['image1.jpg', 'image2.jpg'];

      mockBaseApiClient.post.mockRejectedValue(new Error('Batch URL retrieval failed'));

      // Act
      const result = await imageApiClient.getImageUrls(fileNames);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Batch URL retrieval failed');
    });

    it('should handle empty fileNames array', async () => {
      // Arrange
      const fileNames: string[] = [];

      mockBaseApiClient.post.mockResolvedValue({
        data: [],
        status: 200
      });

      // Act
      const result = await imageApiClient.getImageUrls(fileNames);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual([]);
    });

    it('should handle invalid fileNames array', async () => {
      // Act & Assert
      await expect(imageApiClient.getImageUrls(null as any)).rejects.toThrow();
      await expect(imageApiClient.getImageUrls(undefined as any)).rejects.toThrow();
    });
  });

  describe('getImageMetadata', () => {
    it('should get image metadata successfully', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();
      const metadataResponse = testDataFactory.createImageMetadataResponse({ fileName });

      mockBaseApiClient.get.mockResolvedValue({
        data: metadataResponse,
        status: 200
      });

      // Act
      const result = await imageApiClient.getImageMetadata(fileName);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(metadataResponse);
      expect(mockBaseApiClient.get).toHaveBeenCalledWith(`/images/${fileName}/metadata`);
    });

    it('should handle metadata retrieval failure', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();

      mockBaseApiClient.get.mockRejectedValue(new Error('Metadata retrieval failed'));

      // Act
      const result = await imageApiClient.getImageMetadata(fileName);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Metadata retrieval failed');
    });

    it('should handle not found response', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();

      mockBaseApiClient.get.mockResolvedValue({
        data: { error: 'Image not found' },
        status: 404
      });

      // Act
      const result = await imageApiClient.getImageMetadata(fileName);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Image not found');
    });

    it('should handle invalid fileName', async () => {
      // Act & Assert
      await expect(imageApiClient.getImageMetadata('')).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();
      mockBaseApiClient.get.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await imageApiClient.getImageUrl(fileName);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle timeout errors gracefully', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();
      mockBaseApiClient.get.mockRejectedValue(new Error('Request timeout'));

      // Act
      const result = await imageApiClient.getImageUrl(fileName);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Request timeout');
    });

    it('should handle malformed response data', async () => {
      // Arrange
      const fileName = testDataFactory.createFileName();
      mockBaseApiClient.get.mockResolvedValue({
        data: null,
        status: 200
      });

      // Act
      const result = await imageApiClient.getImageUrl(fileName);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Invalid response data');
    });
  });

  describe('edge cases', () => {
    it('should handle very long fileNames', async () => {
      // Arrange
      const longFileName = 'a'.repeat(1000) + '.jpg';
      const urlResponse = testDataFactory.createImageUrlResponse();

      mockBaseApiClient.get.mockResolvedValue({
        data: urlResponse,
        status: 200
      });

      // Act
      const result = await imageApiClient.getImageUrl(longFileName);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockBaseApiClient.get).toHaveBeenCalledWith(`/images/${longFileName}/url`);
    });

    it('should handle special characters in fileNames', async () => {
      // Arrange
      const specialFileName = 'test-image with spaces & symbols!.jpg';
      const urlResponse = testDataFactory.createImageUrlResponse();

      mockBaseApiClient.get.mockResolvedValue({
        data: urlResponse,
        status: 200
      });

      // Act
      const result = await imageApiClient.getImageUrl(specialFileName);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockBaseApiClient.get).toHaveBeenCalledWith(`/images/${specialFileName}/url`);
    });

    it('should handle concurrent requests', async () => {
      // Arrange
      const fileNames = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
      const urlResponse = testDataFactory.createImageUrlResponse();

      mockBaseApiClient.get.mockResolvedValue({
        data: urlResponse,
        status: 200
      });

      // Act
      const promises = fileNames.map(fileName => imageApiClient.getImageUrl(fileName));
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.isSuccess).toBe(true);
      });
    });
  });
});
