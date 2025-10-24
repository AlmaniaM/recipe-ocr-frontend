import { ValueObject } from './ValueObject';
import { Result } from '../common/Result';

/**
 * Value object representing an ingredient amount
 * Contains both the numeric value and unit of measurement
 */
export class IngredientAmount extends ValueObject<{ value: number; unit: string }> {
  private constructor(value: number, unit: string) {
    super({ value, unit });
  }

  /**
   * Creates an IngredientAmount from a value and unit
   */
  static create(value: number, unit: string): Result<IngredientAmount> {
    if (value < 0) {
      return Result.failure('Ingredient amount cannot be negative');
    }

    if (!unit || unit.trim().length === 0) {
      return Result.failure('Ingredient unit cannot be null or empty');
    }

    const trimmedUnit = unit.trim();
    if (trimmedUnit.length > 20) {
      return Result.failure('Ingredient unit cannot exceed 20 characters');
    }

    return Result.success(new IngredientAmount(value, trimmedUnit));
  }

  /**
   * Creates an IngredientAmount with just a value (no unit)
   */
  static fromValue(value: number): Result<IngredientAmount> {
    if (value < 0) {
      return Result.failure('Ingredient amount cannot be negative');
    }

    return Result.success(new IngredientAmount(value, ''));
  }

  /**
   * Gets the numeric value
   */
  get amount(): number {
    return this._value.value;
  }

  /**
   * Gets the unit of measurement
   */
  get unit(): string {
    return this._value.unit;
  }

  /**
   * Checks if this amount has a unit
   */
  get hasUnit(): boolean {
    return this._value.unit.length > 0;
  }

  /**
   * Returns a formatted string representation
   */
  toString(): string {
    if (this.hasUnit) {
      return `${this.amount} ${this.unit}`;
    }
    return this.amount.toString();
  }

  /**
   * Returns a formatted string with pluralization
   */
  toStringPlural(): string {
    if (this.hasUnit) {
      const pluralUnit = this.getPluralUnit();
      return `${this.amount} ${pluralUnit}`;
    }
    return this.amount.toString();
  }

  /**
   * Gets the plural form of the unit
   */
  private getPluralUnit(): string {
    if (this.amount === 1) {
      return this.unit;
    }

    // Simple pluralization rules
    if (this.unit.endsWith('y')) {
      return this.unit.slice(0, -1) + 'ies';
    }
    
    if (this.unit.endsWith('s') || this.unit.endsWith('sh') || this.unit.endsWith('ch')) {
      return this.unit + 'es';
    }

    return this.unit + 's';
  }

  /**
   * Converts to a different unit (simplified conversion)
   */
  convertTo(newUnit: string): Result<IngredientAmount> {
    // This is a simplified conversion - in a real app, you'd have a proper conversion system
    return IngredientAmount.create(this.amount, newUnit);
  }
}
