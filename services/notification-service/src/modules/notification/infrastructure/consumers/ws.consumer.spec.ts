import { type Job } from 'bullmq';

import { type WsNotificationsGateway } from '../channels/ws.gateway';
import { JOB_WS_BROADCAST, JOB_WS_SEND_TO_USER } from '../../domain/queues.constants';
import { type WsNotificationPayload } from '../../domain/events/ws-notification.event';

import { WsConsumer } from './ws.consumer';

describe('WsConsumer', () => {
  let consumer: WsConsumer;
  let gateway: jest.Mocked<WsNotificationsGateway>;

  beforeEach(() => {
    gateway = {
      broadcast: jest.fn(),
      sendToUser: jest.fn(),
    } as any;

    consumer = new WsConsumer(gateway);
  });

  describe('process', () => {
    it('debe hacer broadcast cuando el job es ws.broadcast', async () => {
      const payload: WsNotificationPayload = {
        event: 'maintenance.scheduled',
        target: 'broadcast',
        data: { message: 'hola' },
      };

      const job = {
        id: 'job-1',
        name: JOB_WS_BROADCAST,
        data: payload,
      } as Job<WsNotificationPayload>;

      await consumer.process(job);

      expect(gateway.broadcast).toHaveBeenCalledWith('maintenance.scheduled', {
        message: 'hola',
      });
      expect(gateway.sendToUser).not.toHaveBeenCalled();
    });

    it('debe enviar al usuario cuando el job es ws.send-to-user con userId válido', async () => {
      const payload: WsNotificationPayload = {
        event: 'security.alert',
        target: { userId: 'user-1' },
        data: { message: 'alerta' },
      };

      const job = {
        id: 'job-2',
        name: JOB_WS_SEND_TO_USER,
        data: payload,
      } as Job<WsNotificationPayload>;

      await consumer.process(job);

      expect(gateway.sendToUser).toHaveBeenCalledWith('user-1', 'security.alert', {
        message: 'alerta',
      });
    });

    it('debe lanzar error si el job es ws.send-to-user con target que no es un objeto', async () => {
      const job = {
        id: 'job-3',
        name: JOB_WS_SEND_TO_USER,
        data: {
          event: 'security.alert',
          target: 'broadcast',
          data: {},
        },
      } as Job<WsNotificationPayload>;

      await expect(consumer.process(job)).rejects.toThrow(
        "Job job-3: target.userId requerido para ws.send-to-user",
      );
      expect(gateway.sendToUser).not.toHaveBeenCalled();
    });

    it('debe lanzar error si el job es ws.send-to-user con target objeto pero sin userId', async () => {
      const job = {
        id: 'job-5',
        name: JOB_WS_SEND_TO_USER,
        data: {
          event: 'security.alert',
          target: { userId: '' },
          data: {},
        },
      } as Job<WsNotificationPayload>;

      await expect(consumer.process(job)).rejects.toThrow(
        "Job job-5: target.userId requerido para ws.send-to-user",
      );
      expect(gateway.sendToUser).not.toHaveBeenCalled();
    });

    it('no debe hacer nada si el job no coincide con ningún nombre conocido', async () => {
      const job = {
        id: 'job-6',
        name: 'otro.job',
        data: {
          event: 'security.alert',
          target: 'broadcast',
          data: {},
        },
      } as Job<WsNotificationPayload>;

      await consumer.process(job);

      expect(gateway.broadcast).not.toHaveBeenCalled();
      expect(gateway.sendToUser).not.toHaveBeenCalled();
    });
  });

  describe('onFailed', () => {
    it('no debe lanzar al registrar un job fallido', () => {
      const job = { id: 'job-4' } as Job;

      expect(() => consumer.onFailed(job, new Error('boom'))).not.toThrow();
    });
  });
});
