import { type Queue } from 'bullmq';

import { type EnvService } from '@config/env/env.service';

import { JOB_EMAIL_SEND } from '../../domain/queues.constants';
import { type EmailNotificationPayload } from '../../domain/events/email-notification.event';

import { EnqueueEmailUseCase } from './enqueue-email.use-case';

describe('EnqueueEmailUseCase', () => {
  let useCase: EnqueueEmailUseCase;
  let queue: jest.Mocked<Queue>;
  let env: jest.Mocked<EnvService>;

  beforeEach(() => {
    queue = {
      add: jest.fn(),
    } as any;

    env = {
      get: jest.fn((key: string) => {
        if (key === 'EMAIL_QUEUE_ATTEMPTS') return 5;
        if (key === 'EMAIL_QUEUE_BACKOFF_DELAY') return 5000;
        return undefined;
      }),
    } as any;

    useCase = new EnqueueEmailUseCase(queue, env);
  });

  it('debe encolar el job con el nombre y payload correctos', async () => {
    const payload: EmailNotificationPayload = {
      to: 'user@example.com',
      subject: 'Bienvenido',
      template: 'welcome',
      variables: { name: 'Juan' },
    };

    await useCase.execute(payload);

    expect(queue.add).toHaveBeenCalledWith(
      JOB_EMAIL_SEND,
      payload,
      expect.objectContaining({
        attempts: 5,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 500 },
      }),
    );
  });

  it('debe leer los valores de reintentos y backoff desde EnvService', async () => {
    await useCase.execute({
      to: 'a@b.com',
      subject: 'x',
      template: 'welcome',
    });

    expect(env.get).toHaveBeenCalledWith('EMAIL_QUEUE_ATTEMPTS');
    expect(env.get).toHaveBeenCalledWith('EMAIL_QUEUE_BACKOFF_DELAY');
  });
});
