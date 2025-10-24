/**
 * Marker interface for domain events
 * Domain events represent something important that happened in the domain
 */
export interface DomainEvent {
  readonly occurredOn: Date;
  readonly eventType: string;
}

/**
 * Base class for domain events
 * Provides common functionality for all domain events
 */
export abstract class BaseDomainEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventType: string;

  constructor(eventType: string) {
    this.occurredOn = new Date();
    this.eventType = eventType;
  }
}

/**
 * Recipe-specific domain events
 */
export class RecipeCreatedEvent extends BaseDomainEvent {
  constructor(
    public readonly recipeId: string,
    public readonly title: string
  ) {
    super('RecipeCreated');
  }
}

export class RecipeUpdatedEvent extends BaseDomainEvent {
  constructor(
    public readonly recipeId: string,
    public readonly title: string
  ) {
    super('RecipeUpdated');
  }
}

export class RecipeDeletedEvent extends BaseDomainEvent {
  constructor(
    public readonly recipeId: string
  ) {
    super('RecipeDeleted');
  }
}

export class RecipeArchivedEvent extends BaseDomainEvent {
  constructor(
    public readonly recipeId: string,
    public readonly title: string
  ) {
    super('RecipeArchived');
  }
}

export class RecipeBookCreatedEvent extends BaseDomainEvent {
  constructor(
    public readonly recipeBookId: string,
    public readonly title: string
  ) {
    super('RecipeBookCreated');
  }
}

export class RecipeBookUpdatedEvent extends BaseDomainEvent {
  constructor(
    public readonly recipeBookId: string,
    public readonly title: string
  ) {
    super('RecipeBookUpdated');
  }
}

export class RecipeBookDeletedEvent extends BaseDomainEvent {
  constructor(
    public readonly recipeBookId: string
  ) {
    super('RecipeBookDeleted');
  }
}
