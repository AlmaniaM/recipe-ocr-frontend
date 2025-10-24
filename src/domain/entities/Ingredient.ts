import { Entity } from './Entity';
import { ValueObject } from '../valueObjects/ValueObject';
import { Result } from '../common/Result';
import { IngredientAmount } from '../valueObjects/IngredientAmount';

/**
 * Value object for ingredient text
 */
export class IngredientText extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): Result<IngredientText> {
    if (!value || value.trim().length === 0) {
      return Result.failure('Ingredient text cannot be null or empty');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length > 500) {
      return Result.failure('Ingredient text cannot exceed 500 characters');
    }

    return Result.success(new IngredientText(trimmedValue));
  }

  toString(): string {
    return this.value;
  }
}

/**
 * Ingredient entity representing a single ingredient in a recipe
 */
export class Ingredient extends Entity<string> {
  private constructor(
    id: string,
    public readonly text: IngredientText,
    public readonly amount: IngredientAmount | null,
    public readonly order: number
  ) {
    super(id);
  }

  /**
   * Creates a new ingredient
   */
  static create(
    text: string,
    amount: IngredientAmount | null = null,
    order: number = 1
  ): Result<Ingredient> {
    const textResult = IngredientText.create(text);
    if (textResult.isFailure) {
      return Result.failure(textResult.error);
    }

    if (order < 1) {
      return Result.failure('Ingredient order must be at least 1');
    }

    const id = `ingredient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return Result.success(new Ingredient(id, textResult.value, amount, order));
  }

  /**
   * Creates an ingredient with just text (no amount)
   */
  static createWithText(text: string, order: number = 1): Result<Ingredient> {
    return Ingredient.create(text, null, order);
  }

  /**
   * Creates an ingredient with text and amount
   */
  static createWithAmount(
    text: string,
    amountValue: number,
    amountUnit: string,
    order: number = 1
  ): Result<Ingredient> {
    const amountResult = IngredientAmount.create(amountValue, amountUnit);
    if (amountResult.isFailure) {
      return Result.failure(amountResult.error);
    }

    return Ingredient.create(text, amountResult.value, order);
  }

  /**
   * Updates the ingredient text
   */
  updateText(newText: string): Result<Ingredient> {
    const textResult = IngredientText.create(newText);
    if (textResult.isFailure) {
      return Result.failure(textResult.error);
    }

    return Result.success(new Ingredient(this.id, textResult.value, this.amount, this.order));
  }

  /**
   * Updates the ingredient amount
   */
  updateAmount(amount: IngredientAmount | null): Result<Ingredient> {
    return Result.success(new Ingredient(this.id, this.text, amount, this.order));
  }

  /**
   * Updates the ingredient order
   */
  updateOrder(newOrder: number): Result<Ingredient> {
    if (newOrder < 1) {
      return Result.failure('Ingredient order must be at least 1');
    }

    return Result.success(new Ingredient(this.id, this.text, this.amount, newOrder));
  }

  /**
   * Checks if this ingredient has an amount
   */
  get hasAmount(): boolean {
    return this.amount !== null;
  }

  /**
   * Gets the display text for the ingredient
   */
  get displayText(): string {
    if (this.hasAmount) {
      return `${this.amount!.toString()} ${this.text.value}`;
    }
    return this.text.value;
  }

  /**
   * Returns a formatted string representation
   */
  toString(): string {
    return this.displayText;
  }
}
