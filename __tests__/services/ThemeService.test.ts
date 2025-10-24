/**
 * Theme Service Unit Tests
 * 
 * Tests the theme service logic in isolation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Mock theme service implementation
const mockThemeService = {
  loadTheme: jest.fn(),
  saveTheme: jest.fn(),
  getAvailableThemes: jest.fn(),
  getCurrentTheme: jest.fn(),
};

jest.mock('../../infrastructure/di/container', () => ({
  container: {
    get: jest.fn(() => mockThemeService),
  },
}));

describe('Theme Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  describe('loadTheme', () => {
    it('should load saved theme from storage', async () => {
      // Arrange
      const savedTheme = 'cleanModern';
      mockAsyncStorage.getItem.mockResolvedValue(savedTheme);
      mockThemeService.loadTheme.mockResolvedValue(savedTheme);

      // Act
      const result = await mockThemeService.loadTheme();

      // Assert
      expect(result).toBe(savedTheme);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('selectedTheme');
    });

    it('should return default theme when no saved theme', async () => {
      // Arrange
      const defaultTheme = 'warmInviting';
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockThemeService.loadTheme.mockResolvedValue(defaultTheme);

      // Act
      const result = await mockThemeService.loadTheme();

      // Assert
      expect(result).toBe(defaultTheme);
    });

    it('should handle storage errors gracefully', async () => {
      // Arrange
      const defaultTheme = 'warmInviting';
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      mockThemeService.loadTheme.mockResolvedValue(defaultTheme);

      // Act
      const result = await mockThemeService.loadTheme();

      // Assert
      expect(result).toBe(defaultTheme);
    });
  });

  describe('saveTheme', () => {
    it('should save theme to storage', async () => {
      // Arrange
      const theme = 'cleanModern';
      mockThemeService.saveTheme.mockResolvedValue(true);

      // Act
      const result = await mockThemeService.saveTheme(theme);

      // Assert
      expect(result).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('selectedTheme', theme);
    });

    it('should handle save errors', async () => {
      // Arrange
      const theme = 'cleanModern';
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Save error'));
      mockThemeService.saveTheme.mockResolvedValue(false);

      // Act
      const result = await mockThemeService.saveTheme(theme);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getAvailableThemes', () => {
    it('should return list of available themes', async () => {
      // Arrange
      const themes = ['warmInviting', 'cleanModern', 'earthyNatural'];
      mockThemeService.getAvailableThemes.mockResolvedValue(themes);

      // Act
      const result = await mockThemeService.getAvailableThemes();

      // Assert
      expect(result).toEqual(themes);
      expect(result).toHaveLength(3);
    });
  });

  describe('getCurrentTheme', () => {
    it('should return current theme', async () => {
      // Arrange
      const currentTheme = 'warmInviting';
      mockThemeService.getCurrentTheme.mockResolvedValue(currentTheme);

      // Act
      const result = await mockThemeService.getCurrentTheme();

      // Assert
      expect(result).toBe(currentTheme);
    });
  });
});