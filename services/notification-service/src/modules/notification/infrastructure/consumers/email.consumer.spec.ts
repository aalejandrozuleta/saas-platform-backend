import { type Job } from 'bullmq';

import { type EmailChannel } from '../channels/email.channel';
import { JOB_EMAIL_SEND } from '../../domain/queues.constants';
import { type EmailNotificationPayload } from '../../domain/events/email-notification.event';

import { EmailConsumer } from './email.consumer';

describe('EmailConsumer', () => {
  let consumer: EmailConsumer;
  let emailChannel: jest.Mocked<EmailChannel>;

  beforeEach(() => {
    emailChannel = {
      send: jest.fn(),
    } as any;

    consumer = new EmailConsumer(emailChannel);
  });

  describe('process', () => {
    it('debe delegar el envío al EmailChannel cuando el job es email.send', async () => {
      const payload: EmailNotificationPayload = {
        to: 'user@example.com',
        subject: 'Hola',
        template: 'welcome',
      };

      const job = {
        id: 'job-1',
        name: JOB_EMAIL_SEND,
        data: payload,
        attemptsMade: 0,
      } as Job<EmailNotificationPayload>;

      await consumer.process(job);

      expect(emailChannel.send).toHaveBeenCalledWith(payload);
    });

    it('no debe procesar jobs con un nombre distinto a email.send', async () => {
      const job = {
        id: 'job-2',
        name: 'otro.job',
        data: {} as EmailNotificationPayload,
        attemptsMade: 0,
      } as Job<EmailNotificationPayload>;

      await consumer.process(job);

      expect(emailChannel.send).not.toHaveBeenCalled();
    });
  });

  describe('onFailed', () => {
    it('no debe lanzar al registrar un job fallido', () => {
      const job = { id: 'job-3', attemptsMade: 2 } as Job;

      expect(() => consumer.onFailed(job, new Error('boom'))).not.toThrow();
    });
  });

  describe('onCompleted', () => {
    it('no debe lanzar al registrar un job completado', () => {
      const job = { id: 'job-4' } as Job;

      expect(() => consumer.onCompleted(job)).not.toThrow();
    });
  });
});
