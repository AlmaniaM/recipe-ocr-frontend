/**
 * Result pattern for handling success/failure states without exceptions
 * Provides a clean way to handle errors in functional programming style
 */
export class Result<T> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: string
  ) {}

  /**
   * Creates a successful result with a value
   */
  static success<T>(value: T): Result<T> {
    return new Result<T>(true, value);
  }

  /**
   * Creates a failed result with an error message
   */
  static failure<T>(error: string): Result<T> {
    return new Result<T>(false, undefined, error);
  }

  /**
   * Creates a successful result without a value
   */
  static successEmpty(): Result<void> {
    return new Result<void>(true);
  }

  /**
   * Indicates if the result is successful
   */
  get isSuccess(): boolean {
    return this._isSuccess;
  }

  /**
   * Indicates if the result is a failure
   */
  get isFailure(): boolean {
    return !this._isSuccess;
  }

  /**
   * Gets the value if successful, throws if failed
   */
  get value(): T {
    if (this.isFailure) {
      throw new Error(`Cannot get value from failed result: ${this._error}`);
    }
    return this._value!;
  }

  /**
   * Gets the error message if failed, throws if successful
   */
  get error(): string {
    if (this.isSuccess) {
      throw new Error('Cannot get error from successful result');
    }
    return this._error!;
  }

  /**
   * Maps the value if successful, returns failure if failed
   */
  map<U>(fn: (value: T) => U): Result<U> {
    if (this.isFailure) {
      return Result.failure<U>(this._error!);
    }
    try {
      return Result.success(fn(this._value!));
    } catch (error) {
      return Result.failure<U>(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Maps the value if successful, returns the provided result if failed
   */
  flatMap<U>(fn: (value: T) => Result<U>): Result<U> {
    if (this.isFailure) {
      return Result.failure<U>(this._error!);
    }
    return fn(this._value!);
  }

  /**
   * Executes a function if successful
   */
  onSuccess(fn: (value: T) => void): Result<T> {
    if (this.isSuccess) {
      fn(this._value!);
    }
    return this;
  }

  /**
   * Executes a function if failed
   */
  onFailure(fn: (error: string) => void): Result<T> {
    if (this.isFailure) {
      fn(this._error!);
    }
    return this;
  }

  /**
   * Gets the value or a default value if failed
   */
  getValueOr(defaultValue: T): T {
    return this.isSuccess ? this._value! : defaultValue;
  }

  /**
   * Gets the value or throws the error if failed
   */
  getValueOrThrow(): T {
    if (this.isFailure) {
      throw new Error(this._error!);
    }
    return this._value!;
  }
}
