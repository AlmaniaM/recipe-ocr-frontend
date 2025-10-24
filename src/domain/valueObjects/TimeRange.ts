import { ValueObject } from './ValueObject';
import { Result } from '../common/Result';

/**
 * Value object representing a time range (e.g., prep time, cook time)
 * Contains minimum and maximum time in minutes
 */
export class TimeRange extends ValueObject<{ minMinutes: number; maxMinutes?: number }> {
  private constructor(minMinutes: number, maxMinutes?: number) {
    super({ minMinutes, maxMinutes });
  }

  /**
   * Creates a TimeRange with a specific duration
   */
  static create(minutes: number): Result<TimeRange> {
    if (minutes < 0) {
      return Result.failure('Time cannot be negative');
    }

    if (minutes > 1440) { // 24 hours
      return Result.failure('Time cannot exceed 24 hours');
    }

    return Result.success(new TimeRange(minutes));
  }

  /**
   * Creates a TimeRange with a range (min and max)
   */
  static createRange(minMinutes: number, maxMinutes: number): Result<TimeRange> {
    if (minMinutes < 0) {
      return Result.failure('Minimum time cannot be negative');
    }

    if (maxMinutes < 0) {
      return Result.failure('Maximum time cannot be negative');
    }

    if (minMinutes > maxMinutes) {
      return Result.failure('Minimum time cannot be greater than maximum time');
    }

    if (maxMinutes > 1440) { // 24 hours
      return Result.failure('Maximum time cannot exceed 24 hours');
    }

    return Result.success(new TimeRange(minMinutes, maxMinutes));
  }

  /**
   * Gets the minimum time in minutes
   */
  get minMinutes(): number {
    return this._value.minMinutes;
  }

  /**
   * Gets the maximum time in minutes (if specified)
   */
  get maxMinutes(): number | undefined {
    return this._value.maxMinutes;
  }

  /**
   * Checks if this is a range (has both min and max)
   */
  get isRange(): boolean {
    return this._value.maxMinutes !== undefined;
  }

  /**
   * Gets the average time in minutes
   */
  get averageMinutes(): number {
    if (this.isRange) {
      return Math.round((this.minMinutes + this.maxMinutes!) / 2);
    }
    return this.minMinutes;
  }

  /**
   * Returns a formatted string representation
   */
  toString(): string {
    if (this.isRange) {
      return `${this.formatMinutes(this.minMinutes)} - ${this.formatMinutes(this.maxMinutes!)}`;
    }
    return this.formatMinutes(this.minMinutes);
  }

  /**
   * Returns a short formatted string (e.g., "15-30 min")
   */
  toShortString(): string {
    if (this.isRange) {
      return `${this.formatMinutesShort(this.minMinutes)}-${this.formatMinutesShort(this.maxMinutes!)}`;
    }
    return this.formatMinutesShort(this.minMinutes);
  }

  /**
   * Formats minutes as a readable string
   */
  private formatMinutes(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return hours === 1 ? '1 hour' : `${hours} hours`;
    }

    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Formats minutes as a short string
   */
  private formatMinutesShort(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h${remainingMinutes}m`;
  }

  /**
   * Converts to total minutes
   */
  toTotalMinutes(): number {
    return this.averageMinutes;
  }

  /**
   * Checks if this time range overlaps with another
   */
  overlaps(other: TimeRange): boolean {
    const thisMax = this.maxMinutes ?? this.minMinutes;
    const otherMax = other.maxMinutes ?? other.minMinutes;

    return this.minMinutes <= otherMax && other.minMinutes <= thisMax;
  }
}
