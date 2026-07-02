import { type Queue } from 'bullmq';
import { type EnvService } from '@config/env/env.service';

import { JOB_WS_BROADCAST, JOB_WS_SEND_TO_USER } from '../../domain/queues.constants';
import { type WsNotificationPayload } from '../../domain/events/ws-notification.event';

import { EnqueueWsUseCase } from './enqueue-ws.use-case';

describe('EnqueueWsUseCase', () => {
  let useCase: EnqueueWsUseCase;
  let queue: jest.Mocked<Queue>;
  let env: jest.Mocked<EnvService>;

  beforeEach(() => {
    queue = {
      add: jest.fn(),
    } as any;

    env = {
      get: jest.fn((key: string) => {
        if (key === 'WS_QUEUE_ATTEMPTS') return 3;
        if (key === 'WS_QUEUE_BACKOFF_DELAY') return 2000;
        return undefined;
      }),
    } as any;

    useCase = new EnqueueWsUseCase(queue, env);
  });

  it('debe usar el job de broadcast cuando target es "broadcast"', async () => {
    const payload: WsNotificationPayload = {
      event: 'maintenance.scheduled',
      target: 'broadcast',
      data: { message: 'hola' },
    };

    await useCase.execute(payload);

    expect(queue.add).toHaveBeenCalledWith(
      JOB_WS_BROADCAST,
      payload,
      expect.objectContaining({
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { count: 200 },
        removeOnFail: { count: 200 },
      }),
    );
  });

  it('debe usar el job de send-to-user cuando target es un objeto con userId', async () => {
    const payload: WsNotificationPayload = {
      event: 'security.alert',
      target: { userId: 'user-1' },
      data: { message: 'alerta' },
    };

    await useCase.execute(payload);

    expect(queue.add).toHaveBeenCalledWith(JOB_WS_SEND_TO_USER, payload, expect.any(Object));
  });
});
