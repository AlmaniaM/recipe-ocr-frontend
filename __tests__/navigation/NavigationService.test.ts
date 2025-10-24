/**
 * Navigation Service Unit Tests
 * 
 * Tests the navigation service logic in isolation
 */

// Mock navigation service implementation
const mockNavigationService = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  canGoBack: jest.fn(),
  getCurrentRoute: jest.fn(),
};

jest.mock('../../infrastructure/di/container', () => ({
  container: {
    get: jest.fn(() => mockNavigationService),
  },
}));

describe('Navigation Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('navigate', () => {
    it('should navigate to specified screen', () => {
      // Arrange
      const screenName = 'RecipeDetail';
      const params = { recipeId: '123' };

      // Act
      mockNavigationService.navigate(screenName, params);

      // Assert
      expect(mockNavigationService.navigate).toHaveBeenCalledWith(screenName, params);
    });

    it('should navigate without parameters', () => {
      // Arrange
      const screenName = 'RecipesList';

      // Act
      mockNavigationService.navigate(screenName);

      // Assert
      expect(mockNavigationService.navigate).toHaveBeenCalledWith(screenName);
    });
  });

  describe('goBack', () => {
    it('should go back to previous screen', () => {
      // Act
      mockNavigationService.goBack();

      // Assert
      expect(mockNavigationService.goBack).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should reset navigation stack', () => {
      // Arrange
      const resetConfig = {
        index: 0,
        routes: [{ name: 'RecipesList' }],
      };

      // Act
      mockNavigationService.reset(resetConfig);

      // Assert
      expect(mockNavigationService.reset).toHaveBeenCalledWith(resetConfig);
    });
  });

  describe('canGoBack', () => {
    it('should return true when can go back', () => {
      // Arrange
      mockNavigationService.canGoBack.mockReturnValue(true);

      // Act
      const result = mockNavigationService.canGoBack();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when cannot go back', () => {
      // Arrange
      mockNavigationService.canGoBack.mockReturnValue(false);

      // Act
      const result = mockNavigationService.canGoBack();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getCurrentRoute', () => {
    it('should return current route information', () => {
      // Arrange
      const currentRoute = {
        name: 'RecipeDetail',
        params: { recipeId: '123' },
      };
      mockNavigationService.getCurrentRoute.mockReturnValue(currentRoute);

      // Act
      const result = mockNavigationService.getCurrentRoute();

      // Assert
      expect(result).toEqual(currentRoute);
    });
  });
});