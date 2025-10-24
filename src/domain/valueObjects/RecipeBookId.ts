import { ValueObject } from './ValueObject';
import { Result } from '../common/Result';

/**
 * Strongly-typed identifier for RecipeBook entities
 * Provides type safety and prevents mixing up different types of IDs
 */
export class RecipeBookId extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  /**
   * Creates a new RecipeBookId with a random UUID
   */
  static newId(): RecipeBookId {
    return new RecipeBookId(RecipeBookId.generateUUID());
  }

  /**
   * Creates a RecipeBookId from an existing string
   */
  static from(value: string): Result<RecipeBookId> {
    if (!value || value.trim().length === 0) {
      return Result.failure('RecipeBookId cannot be null or empty');
    }

    const trimmedValue = value.trim();
    
    // Basic UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(trimmedValue)) {
      return Result.failure(`Invalid RecipeBookId format: ${trimmedValue}`);
    }

    return Result.success(new RecipeBookId(trimmedValue));
  }

  /**
   * Creates a RecipeBookId from an existing string (unsafe version)
   * Use only when you're certain the string is valid
   */
  static fromUnsafe(value: string): RecipeBookId {
    return new RecipeBookId(value);
  }

  /**
   * Generates a UUID v4
   */
  private static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Returns the string representation
   */
  toString(): string {
    return this.value;
  }

  /**
   * Returns the string representation in uppercase
   */
  toStringUpper(): string {
    return this.value.toUpperCase();
  }

  /**
   * Returns the string representation in lowercase
   */
  toStringLower(): string {
    return this.value.toLowerCase();
  }
}
