import { Entity } from './Entity';
import { ValueObject } from '../valueObjects/ValueObject';
import { Result } from '../common/Result';

/**
 * Value object for tag name
 */
export class TagName extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): Result<TagName> {
    if (!value || value.trim().length === 0) {
      return Result.failure('Tag name cannot be null or empty');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length > 50) {
      return Result.failure('Tag name cannot exceed 50 characters');
    }

    // Check for valid characters (alphanumeric, spaces, hyphens, underscores)
    const validNameRegex = /^[a-zA-Z0-9\s\-_]+$/;
    if (!validNameRegex.test(trimmedValue)) {
      return Result.failure('Tag name can only contain letters, numbers, spaces, hyphens, and underscores');
    }

    return Result.success(new TagName(trimmedValue));
  }

  toString(): string {
    return this.value;
  }
}

/**
 * Tag entity representing a tag that can be applied to recipes
 */
export class Tag extends Entity<string> {
  private constructor(
    id: string,
    public readonly name: TagName,
    public readonly color: string | null = null,
    public readonly createdAt: Date = new Date()
  ) {
    super(id);
  }

  /**
   * Creates a new tag
   */
  static create(name: string, color: string | null = null): Result<Tag> {
    const nameResult = TagName.create(name);
    if (nameResult.isFailure) {
      return Result.failure(nameResult.error);
    }

    if (color && !Tag.isValidColor(color)) {
      return Result.failure('Invalid color format. Use hex color (e.g., #FF0000)');
    }

    const id = `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return Result.success(new Tag(id, nameResult.value, color));
  }

  /**
   * Creates a tag with just a name (no color)
   */
  static createWithName(name: string): Result<Tag> {
    return Tag.create(name, null);
  }

  /**
   * Creates a tag with name and color
   */
  static createWithColor(name: string, color: string): Result<Tag> {
    return Tag.create(name, color);
  }

  /**
   * Updates the tag name
   */
  updateName(newName: string): Result<Tag> {
    const nameResult = TagName.create(newName);
    if (nameResult.isFailure) {
      return Result.failure(nameResult.error);
    }

    return Result.success(new Tag(this.id, nameResult.value, this.color, this.createdAt));
  }

  /**
   * Updates the tag color
   */
  updateColor(newColor: string | null): Result<Tag> {
    if (newColor && !Tag.isValidColor(newColor)) {
      return Result.failure('Invalid color format. Use hex color (e.g., #FF0000)');
    }

    return Result.success(new Tag(this.id, this.name, newColor, this.createdAt));
  }

  /**
   * Removes the color from the tag
   */
  removeColor(): Result<Tag> {
    return Result.success(new Tag(this.id, this.name, null, this.createdAt));
  }

  /**
   * Checks if this tag has a color
   */
  get hasColor(): boolean {
    return this.color !== null && this.color.length > 0;
  }

  /**
   * Gets the display name for the tag
   */
  get displayName(): string {
    return this.name.value;
  }

  /**
   * Gets the color or a default color
   */
  get displayColor(): string {
    return this.color || '#6B7280'; // Default gray color
  }

  /**
   * Validates if a color string is a valid hex color
   */
  private static isValidColor(color: string): boolean {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(color);
  }

  /**
   * Returns a formatted string representation
   */
  toString(): string {
    return this.displayName;
  }
}
