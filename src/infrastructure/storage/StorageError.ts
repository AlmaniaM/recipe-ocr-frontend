/**
 * Storage Error Types
 * 
 * Defines specific error types for storage operations.
 * This allows for better error handling and user feedback.
 */
export enum StorageErrorType {
  // Database errors
  DATABASE_NOT_INITIALIZED = 'DATABASE_NOT_INITIALIZED',
  DATABASE_CONNECTION_FAILED = 'DATABASE_CONNECTION_FAILED',
  DATABASE_QUERY_FAILED = 'DATABASE_QUERY_FAILED',
  DATABASE_TRANSACTION_FAILED = 'DATABASE_TRANSACTION_FAILED',
  
  // Data errors
  DATA_NOT_FOUND = 'DATA_NOT_FOUND',
  DATA_VALIDATION_FAILED = 'DATA_VALIDATION_FAILED',
  DATA_SERIALIZATION_FAILED = 'DATA_SERIALIZATION_FAILED',
  DATA_DESERIALIZATION_FAILED = 'DATA_DESERIALIZATION_FAILED',
  
  // Permission errors
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  OPERATION_FAILED = 'OPERATION_FAILED'
}

/**
 * Storage Error
 * 
 * Custom error class for storage-related errors.
 * Provides additional context and error type information.
 */
export class StorageError extends Error {
  public readonly type: StorageErrorType;
  public readonly operation: string;
  public readonly repository: string;
  public readonly timestamp: Date;
  public readonly retryable: boolean;

  constructor(
    type: StorageErrorType,
    message: string,
    operation: string,
    repository: string,
    retryable: boolean = false,
    cause?: Error
  ) {
    super(message);
    
    this.name = 'StorageError';
    this.type = type;
    this.operation = operation;
    this.repository = repository;
    this.timestamp = new Date();
    this.retryable = retryable;
    
    // Preserve the original error stack
    if (cause) {
      this.stack = cause.stack;
    }
  }

  /**
   * Creates a user-friendly error message
   */
  public getUserMessage(): string {
    switch (this.type) {
      case StorageErrorType.DATABASE_NOT_INITIALIZED:
        return 'Database is not available. Please try again later.';
      
      case StorageErrorType.DATA_NOT_FOUND:
        return 'The requested data was not found.';
      
      case StorageErrorType.DATA_VALIDATION_FAILED:
        return 'The data is invalid. Please check your input.';
      
      case StorageErrorType.PERMISSION_DENIED:
        return 'You do not have permission to perform this operation.';
      
      case StorageErrorType.STORAGE_QUOTA_EXCEEDED:
        return 'Storage quota exceeded. Please free up some space.';
      
      case StorageErrorType.NETWORK_ERROR:
        return 'Network error. Please check your connection.';
      
      case StorageErrorType.TIMEOUT_ERROR:
        return 'Operation timed out. Please try again.';
      
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Checks if the error is retryable
   */
  public isRetryable(): boolean {
    return this.retryable;
  }

  /**
   * Gets error details for logging
   */
  public getErrorDetails(): Record<string, any> {
    return {
      type: this.type,
      operation: this.operation,
      repository: this.repository,
      timestamp: this.timestamp.toISOString(),
      retryable: this.retryable,
      message: this.message,
      stack: this.stack
    };
  }
}

/**
 * Storage Error Factory
 * 
 * Factory class for creating storage errors with consistent formatting.
 */
export class StorageErrorFactory {
  /**
   * Creates a database not initialized error
   */
  static databaseNotInitialized(operation: string, repository: string): StorageError {
    return new StorageError(
      StorageErrorType.DATABASE_NOT_INITIALIZED,
      `Database not initialized for operation: ${operation}`,
      operation,
      repository,
      false
    );
  }

  /**
   * Creates a data not found error
   */
  static dataNotFound(operation: string, repository: string, id?: string): StorageError {
    const message = id 
      ? `Data not found for ID: ${id} in operation: ${operation}`
      : `Data not found in operation: ${operation}`;
    
    return new StorageError(
      StorageErrorType.DATA_NOT_FOUND,
      message,
      operation,
      repository,
      false
    );
  }

  /**
   * Creates a data validation error
   */
  static dataValidationFailed(operation: string, repository: string, details: string): StorageError {
    return new StorageError(
      StorageErrorType.DATA_VALIDATION_FAILED,
      `Data validation failed in operation: ${operation}. ${details}`,
      operation,
      repository,
      false
    );
  }

  /**
   * Creates a database query error
   */
  static databaseQueryFailed(operation: string, repository: string, cause: Error): StorageError {
    return new StorageError(
      StorageErrorType.DATABASE_QUERY_FAILED,
      `Database query failed in operation: ${operation}. ${cause.message}`,
      operation,
      repository,
      true,
      cause
    );
  }

  /**
   * Creates a serialization error
   */
  static serializationFailed(operation: string, repository: string, cause: Error): StorageError {
    return new StorageError(
      StorageErrorType.DATA_SERIALIZATION_FAILED,
      `Serialization failed in operation: ${operation}. ${cause.message}`,
      operation,
      repository,
      false,
      cause
    );
  }

  /**
   * Creates a deserialization error
   */
  static deserializationFailed(operation: string, repository: string, cause: Error): StorageError {
    return new StorageError(
      StorageErrorType.DATA_DESERIALIZATION_FAILED,
      `Deserialization failed in operation: ${operation}. ${cause.message}`,
      operation,
      repository,
      false,
      cause
    );
  }

  /**
   * Creates a permission denied error
   */
  static permissionDenied(operation: string, repository: string): StorageError {
    return new StorageError(
      StorageErrorType.PERMISSION_DENIED,
      `Permission denied for operation: ${operation}`,
      operation,
      repository,
      false
    );
  }

  /**
   * Creates a storage quota exceeded error
   */
  static storageQuotaExceeded(operation: string, repository: string): StorageError {
    return new StorageError(
      StorageErrorType.STORAGE_QUOTA_EXCEEDED,
      `Storage quota exceeded in operation: ${operation}`,
      operation,
      repository,
      false
    );
  }

  /**
   * Creates a network error
   */
  static networkError(operation: string, repository: string, cause: Error): StorageError {
    return new StorageError(
      StorageErrorType.NETWORK_ERROR,
      `Network error in operation: ${operation}. ${cause.message}`,
      operation,
      repository,
      true,
      cause
    );
  }

  /**
   * Creates a timeout error
   */
  static timeoutError(operation: string, repository: string): StorageError {
    return new StorageError(
      StorageErrorType.TIMEOUT_ERROR,
      `Operation timed out: ${operation}`,
      operation,
      repository,
      true
    );
  }

  /**
   * Creates a generic operation failed error
   */
  static operationFailed(operation: string, repository: string, cause: Error): StorageError {
    return new StorageError(
      StorageErrorType.OPERATION_FAILED,
      `Operation failed: ${operation}. ${cause.message}`,
      operation,
      repository,
      true,
      cause
    );
  }
}
