import { DomainEvent } from '../events/DomainEvent';

/**
 * Base class for all domain entities
 * Provides common functionality for entities with strongly-typed IDs
 */
export abstract class Entity<TId> {
  private readonly _domainEvents: DomainEvent[] = [];

  constructor(public readonly id: TId) {}

  /**
   * Gets all domain events that have been raised by this entity
   */
  get domainEvents(): readonly DomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * Adds a domain event to be published later
   */
  protected addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  /**
   * Removes a domain event from the collection
   */
  protected removeDomainEvent(domainEvent: DomainEvent): void {
    const index = this._domainEvents.indexOf(domainEvent);
    if (index > -1) {
      this._domainEvents.splice(index, 1);
    }
  }

  /**
   * Clears all domain events (typically called after publishing)
   */
  public clearDomainEvents(): void {
    this._domainEvents.length = 0;
  }

  /**
   * Checks if this entity equals another
   */
  equals(other: Entity<TId> | null | undefined): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    if (this.constructor !== other.constructor) {
      return false;
    }

    return this.id === other.id;
  }

  /**
   * Returns a string representation of the entity
   */
  toString(): string {
    return `${this.constructor.name}[Id=${this.id}]`;
  }
}
