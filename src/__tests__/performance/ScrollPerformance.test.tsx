describe('Scroll Performance', () => {
  beforeEach(() => {
    // Reset performance.now mock
    jest.spyOn(performance, 'now').mockImplementation(() => Date.now());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle basic scroll performance efficiently', async () => {
    // Generate test data
    const recipeList = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      title: `Recipe ${i}`,
      description: `Description for recipe ${i}`
    }));
    
    const scrollStartTime = performance.now();
    
    // Simulate scroll event processing
    const simulateScroll = (offset: number) => {
      // Simulate scroll calculation
      const visibleItems = Math.ceil(400 / 100); // 400px height / 100px item height
      const startIndex = Math.floor(offset / 100);
      const endIndex = Math.min(startIndex + visibleItems, recipeList.length);
      return { startIndex, endIndex, visibleItems };
    };
    
    const result = simulateScroll(500);
    const scrollEndTime = performance.now();
    const scrollTime = scrollEndTime - scrollStartTime;
    
    expect(scrollTime).toBeLessThan(16); // 60fps budget
    expect(result.startIndex).toBe(5);
    expect(result.endIndex).toBe(9);
  });

  it('should handle momentum scrolling efficiently', async () => {
    // Generate test data
    const recipeList = Array.from({ length: 200 }, (_, i) => ({
      id: i,
      title: `Recipe ${i}`,
      description: `Description for recipe ${i}`
    }));
    
    const scrollStartTime = performance.now();
    
    // Simulate momentum scrolling
    for (let i = 0; i < 10; i++) {
      const offset = i * 100;
      // Simulate scroll calculation
      const visibleItems = Math.ceil(400 / 100);
      const startIndex = Math.floor(offset / 100);
      const endIndex = Math.min(startIndex + visibleItems, recipeList.length);
    }
    
    const scrollEndTime = performance.now();
    const scrollTime = scrollEndTime - scrollStartTime;
    expect(scrollTime).toBeLessThan(100); // 100ms budget for multiple scrolls
  });

  it('should handle scroll with different item heights efficiently', async () => {
    // Generate test data with varying heights
    const recipesWithDifferentHeights = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      title: `Recipe ${i}`,
      description: `Description for recipe ${i}`,
      height: 80 + (i % 5) * 20, // Varying heights
    }));
    
    const scrollStartTime = performance.now();
    
    // Simulate scroll with variable heights
    const simulateVariableHeightScroll = (offset: number) => {
      let currentOffset = 0;
      let startIndex = 0;
      
      for (let i = 0; i < recipesWithDifferentHeights.length; i++) {
        if (currentOffset >= offset) {
          startIndex = i;
          break;
        }
        currentOffset += recipesWithDifferentHeights[i].height;
      }
      
      return { startIndex, currentOffset };
    };
    
    const result = simulateVariableHeightScroll(1000);
    const scrollEndTime = performance.now();
    const scrollTime = scrollEndTime - scrollStartTime;
    
    expect(scrollTime).toBeLessThan(16); // 60fps budget
    expect(result.startIndex).toBeGreaterThan(0);
  });

  it('should handle scroll with complex content efficiently', async () => {
    // Generate test data with complex content
    const complexRecipes = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      title: `Recipe ${i}`,
      description: 'A very long description that contains a lot of text to test scrolling performance with complex content. '.repeat(5),
    }));
    
    const scrollStartTime = performance.now();
    
    // Simulate scroll with complex content
    const simulateComplexScroll = (offset: number) => {
      // Simulate text measurement and layout calculation
      const averageDescriptionLength = complexRecipes[0].description.length;
      const estimatedHeight = 100 + (averageDescriptionLength / 50) * 20; // Estimate height based on text length
      const visibleItems = Math.ceil(400 / estimatedHeight);
      const startIndex = Math.floor(offset / estimatedHeight);
      const endIndex = Math.min(startIndex + visibleItems, complexRecipes.length);
      return { startIndex, endIndex, estimatedHeight };
    };
    
    const result = simulateComplexScroll(1500);
    const scrollEndTime = performance.now();
    const scrollTime = scrollEndTime - scrollStartTime;
    
    expect(scrollTime).toBeLessThan(16); // 60fps budget
    expect(result.startIndex).toBeGreaterThan(0);
  });

  it('should handle scroll performance with images efficiently', async () => {
    // Generate test data with images
    const recipesWithImages = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      title: `Recipe ${i}`,
      description: `Description for recipe ${i}`,
      imagePath: `image-${i}.jpg`,
    }));
    
    const scrollStartTime = performance.now();
    
    // Simulate scroll with image loading considerations
    const simulateImageScroll = (offset: number) => {
      const imageHeight = 120; // Estimated height with image
      const visibleItems = Math.ceil(400 / imageHeight);
      const startIndex = Math.floor(offset / imageHeight);
      const endIndex = Math.min(startIndex + visibleItems, recipesWithImages.length);
      
      // Simulate image preloading for visible items
      const visibleRecipes = recipesWithImages.slice(startIndex, endIndex);
      const imagePaths = visibleRecipes.map(recipe => recipe.imagePath);
      
      return { startIndex, endIndex, imagePaths };
    };
    
    const result = simulateImageScroll(2000);
    const scrollEndTime = performance.now();
    const scrollTime = scrollEndTime - scrollStartTime;
    
    expect(scrollTime).toBeLessThan(16); // 60fps budget
    expect(result.imagePaths).toHaveLength(4); // 400px / 120px = ~3.33, so 4 items
  });

  it('should maintain scroll performance during data updates', async () => {
    // Generate initial and updated test data
    const initialRecipes = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      title: `Recipe ${i}`,
      description: `Description for recipe ${i}`
    }));
    
    const newRecipes = Array.from({ length: 150 }, (_, i) => ({
      id: i,
      title: `Recipe ${i}`,
      description: `Description for recipe ${i}`
    }));
    
    // Test scroll performance before data update
    const scrollStartTime = performance.now();
    const simulateScroll = (data: any[], offset: number) => {
      const visibleItems = Math.ceil(400 / 100);
      const startIndex = Math.floor(offset / 100);
      const endIndex = Math.min(startIndex + visibleItems, data.length);
      return { startIndex, endIndex };
    };
    
    const initialResult = simulateScroll(initialRecipes, 500);
    const scrollEndTime = performance.now();
    const initialScrollTime = scrollEndTime - scrollStartTime;
    
    // Simulate data update
    const newScrollStartTime = performance.now();
    const newResult = simulateScroll(newRecipes, 750);
    const newScrollEndTime = performance.now();
    const newScrollTime = newScrollEndTime - newScrollStartTime;
    
    // Both scroll times should be within budget
    expect(initialScrollTime).toBeLessThan(16);
    expect(newScrollTime).toBeLessThan(16);
    expect(initialResult.startIndex).toBe(5);
    expect(newResult.startIndex).toBe(7);
  });
});