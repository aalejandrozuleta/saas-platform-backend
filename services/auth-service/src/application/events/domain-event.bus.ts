export interface DomainEventBus {
  publish(event: unknown): void;
}
