import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { QUEUE_WS, JOB_WS_BROADCAST, JOB_WS_SEND_TO_USER } from '../../domain/queues.constants';
import { WsNotificationPayload } from '../../domain/events/ws-notification.event';
import { WsNotificationsGateway } from '../channels/ws.gateway';

/**
 * Consumer de la cola `notification.ws`: procesa jobs `ws.broadcast` y
 * `ws.send-to-user`, reenviándolos al gateway Socket.io en memoria.
 *
 * @remarks
 * **Reintentos y backoff**: política definida por el producer
 * (`EnqueueWsUseCase`) vía `WS_QUEUE_ATTEMPTS` / `WS_QUEUE_BACKOFF_DELAY`,
 * más baja que la de email porque una notificación WS es best-effort.
 *
 * **Idempotencia**: NO hay garantía de exactly-once. `gateway.broadcast` /
 * `gateway.sendToUser` son operaciones fire-and-forget sobre sockets en
 * memoria (no persisten ack de entrega); un reintento tras un fallo parcial
 * puede reenviar el mismo evento a un cliente que ya lo recibió. Aceptable
 * para este dominio (notificaciones informativas, no transaccionales).
 *
 * **Fallos**: si `target.userId` falta en un job `ws.send-to-user`, se lanza
 * un error inmediatamente (no hay forma de recuperarlo reintentando, pero se
 * deja que BullMQ agote los intentos igual para mantener el comportamiento
 * uniforme entre tipos de error).
 *
 * **Nota**: si el gateway corriera en una instancia distinta del worker (no
 * es el caso actual, ambos viven en el mismo proceso Nest), el broadcast
 * solo llegaría a los clientes conectados a esa instancia — Socket.io
 * necesitaría un adapter de Redis para multi-instancia.
 */
@Processor(QUEUE_WS)
export class WsConsumer extends WorkerHost {
  private readonly logger = new Logger(WsConsumer.name);

  constructor(private readonly gateway: WsNotificationsGateway) {
    super();
  }

  /**
   * Despacha el job según su nombre: `ws.broadcast` emite a todos los
   * clientes conectados; `ws.send-to-user` emite solo a la sala personal
   * del usuario (`user:<userId>`), asignada en `WsNotificationsGateway` al
   * verificar el JWT en la conexión.
   *
   * @param job - Job de BullMQ; `job.data` es el `WsNotificationPayload`.
   */
  async process(job: Job<WsNotificationPayload>): Promise<void> {
    const { event, target, data } = job.data;

    if (job.name === JOB_WS_BROADCAST) {
      this.gateway.broadcast(event, data);
      this.logger.log(`Broadcast [${event}] enviado`);
      return;
    }

    if (job.name === JOB_WS_SEND_TO_USER) {
      if (typeof target !== 'object' || !target.userId) {
        throw new Error(`Job ${job.id}: target.userId requerido para ws.send-to-user`);
      }
      this.gateway.sendToUser(target.userId, event, data);
      this.logger.log(`WS [${event}] enviado a userId=${target.userId}`);
    }
  }

  /** Se dispara en cada intento fallido (no solo en el fallo final). */
  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    this.logger.error(`Job WS ${job.id} falló: ${error.message}`);
  }
}
