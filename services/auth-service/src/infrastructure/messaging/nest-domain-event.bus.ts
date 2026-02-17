import { DomainEventBus } from '@application/events/domain-event.bus';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Implementación del bus de eventos usando NestJS EventEmitter
 */
@Injectable()
export class NestDomainEventBus implements DomainEventBus {
  constructor(
    private readonly eventEmitter: EventEmitter2,
  ) {}

  publish(event: object): void {
    this.eventEmitter.emit(
      event.constructor.name,
      event,
    );
  }
}
