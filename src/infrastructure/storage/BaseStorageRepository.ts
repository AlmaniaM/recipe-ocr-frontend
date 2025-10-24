import { Result } from '../../domain/common/Result';

/**
 * Base Storage Repository
 * 
 * Provides common functionality for all storage repositories.
 * This includes error handling, logging, and common utility methods.
 */
export abstract class BaseStorageRepository {
  protected readonly repositoryName: string;

  constructor(repositoryName: string) {
    this.repositoryName = repositoryName;
  }

  /**
   * Handles errors consistently across all repository methods
   * @param operation - The operation that failed
   * @param error - The error that occurred
   * @returns A Result with the error message
   */
  protected handleError(operation: string, error: unknown): Result<void> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const fullMessage = `Failed to ${operation} in ${this.repositoryName}: ${errorMessage}`;
    
    console.error(fullMessage, error);
    return Result.failure(fullMessage);
  }

  /**
   * Handles errors consistently across all repository methods that return data
   * @param operation - The operation that failed
   * @param error - The error that occurred
   * @returns A Result with the error message
   */
  protected handleErrorWithData<T>(operation: string, error: unknown): Result<T> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const fullMessage = `Failed to ${operation} in ${this.repositoryName}: ${errorMessage}`;
    
    console.error(fullMessage, error);
    return Result.failure(fullMessage);
  }

  /**
   * Validates that required parameters are not null or undefined
   * @param params - Object with parameter names and values
   * @returns True if all parameters are valid
   */
  protected validateRequiredParams(params: Record<string, any>): boolean {
    for (const [name, value] of Object.entries(params)) {
      if (value === null || value === undefined) {
        console.error(`Required parameter '${name}' is null or undefined in ${this.repositoryName}`);
        return false;
      }
    }
    return true;
  }

  /**
   * Validates pagination parameters
   * @param page - Page number (1-based)
   * @param pageSize - Number of items per page
   * @returns True if parameters are valid
   */
  protected validatePaginationParams(page: number, pageSize: number): boolean {
    if (page < 1) {
      console.error(`Invalid page number: ${page}. Page must be >= 1 in ${this.repositoryName}`);
      return false;
    }
    
    if (pageSize < 1 || pageSize > 1000) {
      console.error(`Invalid page size: ${pageSize}. Page size must be between 1 and 1000 in ${this.repositoryName}`);
      return false;
    }
    
    return true;
  }

  /**
   * Sanitizes search query to prevent injection attacks
   * @param query - The search query
   * @returns Sanitized query
   */
  protected sanitizeSearchQuery(query: string): string {
    if (!query) return '';
    
    // Remove potentially dangerous characters
    return query
      .trim()
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/['"]/g, '') // Remove quotes
      .substring(0, 100); // Limit length
  }

  /**
   * Logs repository operations for debugging
   * @param operation - The operation being performed
   * @param details - Additional details about the operation
   */
  protected logOperation(operation: string, details?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.repositoryName}] ${operation}`, details || '');
    }
  }

  /**
   * Measures operation performance
   * @param operation - The operation name
   * @param fn - The function to measure
   * @returns The result of the function
   */
  protected async measurePerformance<T>(
    operation: string, 
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    this.logOperation(`Starting ${operation}`);
    
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.logOperation(`Completed ${operation}`, { duration: `${duration}ms` });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logOperation(`Failed ${operation}`, { duration: `${duration}ms`, error });
      throw error;
    }
  }
}
