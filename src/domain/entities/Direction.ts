import { Entity } from './Entity';
import { ValueObject } from '../valueObjects/ValueObject';
import { Result } from '../common/Result';

/**
 * Value object for direction text
 */
export class DirectionText extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): Result<DirectionText> {
    if (!value || value.trim().length === 0) {
      return Result.failure('Direction text cannot be null or empty');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length > 1000) {
      return Result.failure('Direction text cannot exceed 1000 characters');
    }

    return Result.success(new DirectionText(trimmedValue));
  }

  toString(): string {
    return this.value;
  }
}

/**
 * Direction entity representing a single step in recipe instructions
 */
export class Direction extends Entity<string> {
  private constructor(
    id: string,
    public readonly text: DirectionText,
    public readonly order: number,
    public readonly isListItem: boolean = false
  ) {
    super(id);
  }

  /**
   * Creates a new direction
   */
  static create(
    text: string,
    order: number = 1,
    isListItem: boolean = false
  ): Result<Direction> {
    const textResult = DirectionText.create(text);
    if (textResult.isFailure) {
      return Result.failure(textResult.error);
    }

    if (order < 1) {
      return Result.failure('Direction order must be at least 1');
    }

    const id = `direction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return Result.success(new Direction(id, textResult.value, order, isListItem));
  }

  /**
   * Creates a direction as a list item
   */
  static createListItem(text: string, order: number = 1): Result<Direction> {
    return Direction.create(text, order, true);
  }

  /**
   * Creates a direction as a paragraph
   */
  static createParagraph(text: string, order: number = 1): Result<Direction> {
    return Direction.create(text, order, false);
  }

  /**
   * Updates the direction text
   */
  updateText(newText: string): Result<Direction> {
    const textResult = DirectionText.create(newText);
    if (textResult.isFailure) {
      return Result.failure(textResult.error);
    }

    return Result.success(new Direction(this.id, textResult.value, this.order, this.isListItem));
  }

  /**
   * Updates the direction order
   */
  updateOrder(newOrder: number): Result<Direction> {
    if (newOrder < 1) {
      return Result.failure('Direction order must be at least 1');
    }

    return Result.success(new Direction(this.id, this.text, newOrder, this.isListItem));
  }

  /**
   * Toggles the list item status
   */
  toggleListItem(): Result<Direction> {
    return Result.success(new Direction(this.id, this.text, this.order, !this.isListItem));
  }

  /**
   * Gets the display text for the direction
   */
  get displayText(): string {
    if (this.isListItem) {
      return `• ${this.text.value}`;
    }
    return this.text.value;
  }

  /**
   * Gets the numbered text for the direction
   */
  get numberedText(): string {
    if (this.isListItem) {
      return `${this.order}. ${this.text.value}`;
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
