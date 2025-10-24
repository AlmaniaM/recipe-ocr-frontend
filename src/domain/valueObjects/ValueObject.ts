/**
 * Base class for value objects
 * Value objects are immutable objects that are defined by their attributes
 * rather than their identity
 */
export abstract class ValueObject<T> {
  protected readonly _value: T;

  constructor(value: T) {
    this._value = value;
  }

  /**
   * Gets the value
   */
  get value(): T {
    return this._value;
  }

  /**
   * Checks if this value object equals another
   */
  equals(other: ValueObject<T> | null | undefined): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    
    if (this.constructor !== other.constructor) {
      return false;
    }

    return this.deepEquals(this._value, other._value);
  }

  /**
   * Deep equality check for the underlying values
   */
  protected deepEquals(a: any, b: any): boolean {
    if (a === b) {
      return true;
    }

    if (a === null || b === null || a === undefined || b === undefined) {
      return false;
    }

    if (typeof a !== typeof b) {
      return false;
    }

    if (typeof a === 'object') {
      if (Array.isArray(a) !== Array.isArray(b)) {
        return false;
      }

      if (Array.isArray(a)) {
        if (a.length !== b.length) {
          return false;
        }
        for (let i = 0; i < a.length; i++) {
          if (!this.deepEquals(a[i], b[i])) {
            return false;
          }
        }
        return true;
      }

      const keysA = Object.keys(a);
      const keysB = Object.keys(b);

      if (keysA.length !== keysB.length) {
        return false;
      }

      for (const key of keysA) {
        if (!keysB.includes(key)) {
          return false;
        }
        if (!this.deepEquals(a[key], b[key])) {
          return false;
        }
      }

      return true;
    }

    return false;
  }

  /**
   * Returns a string representation of the value object
   */
  toString(): string {
    return String(this._value);
  }

  /**
   * Returns a hash code for the value object
   */
  hashCode(): number {
    return this.hashCodeForValue(this._value);
  }

  /**
   * Generates a hash code for a value
   */
  private hashCodeForValue(value: any): number {
    if (value === null || value === undefined) {
      return 0;
    }

    if (typeof value === 'string') {
      let hash = 0;
      for (let i = 0; i < value.length; i++) {
        const char = value.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return hash;
    }

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }

    if (Array.isArray(value)) {
      let hash = 1;
      for (const item of value) {
        hash = 31 * hash + this.hashCodeForValue(item);
      }
      return hash;
    }

    if (typeof value === 'object') {
      let hash = 1;
      for (const key of Object.keys(value).sort()) {
        hash = 31 * hash + this.hashCodeForValue(key);
        hash = 31 * hash + this.hashCodeForValue(value[key]);
      }
      return hash;
    }

    return 0;
  }
}
