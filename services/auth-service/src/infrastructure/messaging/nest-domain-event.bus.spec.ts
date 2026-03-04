import { EventEmitter2 } from '@nestjs/event-emitter';

import { NestDomainEventBus } from './nest-domain-event.bus';

describe('NestDomainEventBus', () => {
  let bus: NestDomainEventBus;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(() => {
    eventEmitter = {
      emit: jest.fn(),
    } as unknown as jest.Mocked<EventEmitter2>;

    bus = new NestDomainEventBus(eventEmitter);
  });

  describe('publish', () => {
    it('debería emitir un evento usando el nombre de la clase como canal', () => {
      class TestEvent {
        constructor(public readonly userId: string) {}
      }

      const event = new TestEvent('user-1');

      bus.publish(event);

      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'TestEvent',
        event,
      );
    });

    it('debería emitir diferentes tipos de eventos correctamente', () => {
      class LoginSucceededEvent {
        constructor(public readonly userId: string) {}
      }

      const event = new LoginSucceededEvent('123');

      bus.publish(event);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'LoginSucceededEvent',
        event,
      );
    });

    it('debería permitir cualquier objeto como evento', () => {
      const event = { test: true };

      bus.publish(event);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'Object',
        event,
      );
    });
  });
});