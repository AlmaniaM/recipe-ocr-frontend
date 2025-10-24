import { ValueObject } from './ValueObject';
import { Result } from '../common/Result';

/**
 * Value object representing a serving size
 * Contains the number of servings and optional serving description
 */
export class ServingSize extends ValueObject<{ count: number; description?: string }> {
  private constructor(count: number, description?: string) {
    super({ count, description });
  }

  /**
   * Creates a ServingSize with a count
   */
  static create(count: number): Result<ServingSize> {
    if (count <= 0) {
      return Result.failure('Serving count must be greater than 0');
    }

    if (count > 1000) {
      return Result.failure('Serving count cannot exceed 1000');
    }

    return Result.success(new ServingSize(count));
  }

  /**
   * Creates a ServingSize with a count and description
   */
  static createWithDescription(count: number, description: string): Result<ServingSize> {
    if (count <= 0) {
      return Result.failure('Serving count must be greater than 0');
    }

    if (count > 1000) {
      return Result.failure('Serving count cannot exceed 1000');
    }

    if (!description || description.trim().length === 0) {
      return Result.failure('Serving description cannot be null or empty');
    }

    const trimmedDescription = description.trim();
    if (trimmedDescription.length > 50) {
      return Result.failure('Serving description cannot exceed 50 characters');
    }

    return Result.success(new ServingSize(count, trimmedDescription));
  }

  /**
   * Gets the number of servings
   */
  get count(): number {
    return this._value.count;
  }

  /**
   * Gets the serving description (if specified)
   */
  get description(): string | undefined {
    return this._value.description;
  }

  /**
   * Checks if this serving size has a description
   */
  get hasDescription(): boolean {
    return this._value.description !== undefined && this._value.description.length > 0;
  }

  /**
   * Returns a formatted string representation
   */
  toString(): string {
    if (this.hasDescription) {
      return `${this.count} ${this.description}`;
    }
    return this.count.toString();
  }

  /**
   * Returns a formatted string with proper pluralization
   */
  toStringPlural(): string {
    if (this.hasDescription) {
      const pluralDescription = this.getPluralDescription();
      return `${this.count} ${pluralDescription}`;
    }
    return this.count.toString();
  }

  /**
   * Gets the plural form of the description
   */
  private getPluralDescription(): string {
    if (this.count === 1) {
      return this.description!;
    }

    // Simple pluralization rules
    if (this.description!.endsWith('y')) {
      return this.description!.slice(0, -1) + 'ies';
    }
    
    if (this.description!.endsWith('s') || this.description!.endsWith('sh') || this.description!.endsWith('ch')) {
      return this.description! + 'es';
    }

    return this.description! + 's';
  }

  /**
   * Scales the serving size by a factor
   */
  scale(factor: number): Result<ServingSize> {
    if (factor <= 0) {
      return Result.failure('Scaling factor must be greater than 0');
    }

    const newCount = Math.round(this.count * factor);
    
    if (this.hasDescription) {
      return ServingSize.createWithDescription(newCount, this.description!);
    }
    
    return ServingSize.create(newCount);
  }

  /**
   * Calculates the serving size per person
   */
  getPerPerson(): number {
    return 1 / this.count;
  }
}
