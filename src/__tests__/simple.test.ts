// Simple test to verify Jest configuration works
describe('Simple Test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });

  it('should have __DEV__ defined', () => {
    expect(global.__DEV__).toBe(true);
  });
});
