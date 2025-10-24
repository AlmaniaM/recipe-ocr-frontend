import { RecipeId } from '../../domain/valueObjects/RecipeId';

describe('RecipeId', () => {
  describe('newId', () => {
    it('should create a new RecipeId with random UUID', () => {
      const id = RecipeId.newId();
      
      expect(id).toBeInstanceOf(RecipeId);
      expect(id.value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should create different IDs on multiple calls', () => {
      const id1 = RecipeId.newId();
      const id2 = RecipeId.newId();
      
      expect(id1.value).not.toBe(id2.value);
    });
  });

  describe('from', () => {
    it('should create RecipeId from valid UUID string', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const result = RecipeId.from(uuid);
      
      expect(result.isSuccess).toBe(true);
      expect(result.value.value).toBe(uuid);
    });

    it('should fail with null or empty string', () => {
      expect(RecipeId.from('').isFailure).toBe(true);
      expect(RecipeId.from('   ').isFailure).toBe(true);
    });

    it('should fail with invalid UUID format', () => {
      expect(RecipeId.from('invalid-uuid').isFailure).toBe(true);
      expect(RecipeId.from('123').isFailure).toBe(true);
    });
  });

  describe('fromUnsafe', () => {
    it('should create RecipeId from string without validation', () => {
      const id = RecipeId.fromUnsafe('any-string');
      
      expect(id).toBeInstanceOf(RecipeId);
      expect(id.value).toBe('any-string');
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const id = RecipeId.fromUnsafe('test-id');
      expect(id.toString()).toBe('test-id');
    });
  });

  describe('toStringUpper', () => {
    it('should return uppercase string representation', () => {
      const id = RecipeId.fromUnsafe('test-id');
      expect(id.toStringUpper()).toBe('TEST-ID');
    });
  });

  describe('toStringLower', () => {
    it('should return lowercase string representation', () => {
      const id = RecipeId.fromUnsafe('TEST-ID');
      expect(id.toStringLower()).toBe('test-id');
    });
  });

  describe('equals', () => {
    it('should return true for equal RecipeIds', () => {
      const id1 = RecipeId.fromUnsafe('test-id');
      const id2 = RecipeId.fromUnsafe('test-id');
      
      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false for different RecipeIds', () => {
      const id1 = RecipeId.fromUnsafe('test-id-1');
      const id2 = RecipeId.fromUnsafe('test-id-2');
      
      expect(id1.equals(id2)).toBe(false);
    });

    it('should return false for null or undefined', () => {
      const id = RecipeId.fromUnsafe('test-id');
      
      expect(id.equals(null)).toBe(false);
      expect(id.equals(undefined)).toBe(false);
    });
  });
});
