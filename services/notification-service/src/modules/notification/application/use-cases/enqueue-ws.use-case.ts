import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EnvService } from '@config/env/env.service';

import { QUEUE_WS, JOB_WS_BROADCAST, JOB_WS_SEND_TO_USER } from '../../domain/queues.constants';
import { WsNotificationPayload } from '../../domain/events/ws-notification.event';

/**
 * Producer: encola un job de notificación WebSocket en la cola `notification.ws`.
 *
 * @remarks
 * Se dispara desde `NotificationController.sendWs` (POST /notifications/ws).
 * El nombre del job se decide según `payload.target`: `broadcast` emite a
 * todos los clientes conectados, cualquier otro valor se trata como envío
 * dirigido a la sala `user:<userId>` (ver `WsConsumer` y `WsNotificationsGateway`).
 * Encolar en vez de emitir directo desde el controller permite reintentar si
 * el gateway aún no tiene clientes conectados o si el broadcast falla.
 */
@Injectable()
export class EnqueueWsUseCase {
  constructor(
    @InjectQueue(QUEUE_WS) private readonly queue: Queue,
    private readonly env: EnvService,
  ) {}

  /**
   * Encola el payload como job `ws.broadcast` o `ws.send-to-user`.
   *
   * Backoff exponencial más agresivo y menos intentos que la cola de email
   * (`WS_QUEUE_ATTEMPTS`/`WS_QUEUE_BACKOFF_DELAY`): una notificación WS es de
   * naturaleza best-effort (el cliente puede no estar conectado), así que no
   * vale la pena reintentar tan agresivamente como con un email transaccional.
   *
   * @param payload - Evento, destino (`broadcast` o `{ userId }`) y datos.
   */
  async execute(payload: WsNotificationPayload): Promise<void> {
    const jobName = payload.target === 'broadcast' ? JOB_WS_BROADCAST : JOB_WS_SEND_TO_USER;

    await this.queue.add(jobName, payload, {
      attempts: this.env.get('WS_QUEUE_ATTEMPTS'),
      backoff: {
        type: 'exponential',
        delay: this.env.get('WS_QUEUE_BACKOFF_DELAY'),
      },
      removeOnComplete: { count: 200 },
      removeOnFail: { count: 200 },
    });
  }
}
