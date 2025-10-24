import { Result } from '../../domain/common/Result';

/**
 * Storage Service Interface
 * 
 * Defines the contract for local storage operations.
 * This allows for different storage implementations (AsyncStorage, SQLite, etc.)
 */
export interface IStorageService {
  /**
   * Stores a value with the given key
   * @param key - The storage key
   * @param value - The value to store
   * @returns Promise containing success or error
   */
  setItem(key: string, value: string): Promise<Result<void>>;
  
  /**
   * Retrieves a value by key
   * @param key - The storage key
   * @returns Promise containing the value or null if not found
   */
  getItem(key: string): Promise<Result<string | null>>;
  
  /**
   * Removes a value by key
   * @param key - The storage key
   * @returns Promise containing success or error
   */
  removeItem(key: string): Promise<Result<void>>;
  
  /**
   * Clears all stored values
   * @returns Promise containing success or error
   */
  clear(): Promise<Result<void>>;
  
  /**
   * Gets all keys
   * @returns Promise containing array of keys
   */
  getAllKeys(): Promise<Result<string[]>>;
  
  /**
   * Checks if a key exists
   * @param key - The storage key
   * @returns Promise containing existence status
   */
  hasKey(key: string): Promise<Result<boolean>>;
}
