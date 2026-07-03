import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { QUEUE_EMAIL, JOB_EMAIL_SEND } from '../../domain/queues.constants';
import { EmailNotificationPayload } from '../../domain/events/email-notification.event';
import { EmailChannel } from '../channels/email.channel';

/**
 * Consumer de la cola `notification.email`: procesa jobs `email.send`.
 *
 * @remarks
 * **Reintentos y backoff**: la política (intentos y delay) la define el
 * producer (`EnqueueEmailUseCase`) al encolar, vía `EMAIL_QUEUE_ATTEMPTS` /
 * `EMAIL_QUEUE_BACKOFF_DELAY`. BullMQ reintenta automáticamente cualquier
 * job cuyo `process` lance una excepción (ver `EmailChannel.send`, que
 * relanza los errores de Resend para activar ese mecanismo).
 *
 * **Idempotencia**: no es garantizada por este consumer en sí, sino por
 * `EmailChannel`, que reenvía el mismo `job.id` como idempotency key a
 * Resend en cada intento. `job.id` es estable entre reintentos del mismo
 * job, así que un reintento causado por un timeout (no por un fallo real de
 * envío) no duplica el correo del lado de Resend.
 *
 * **Fallos**: tras agotar los intentos, BullMQ marca el job como `failed`
 * permanentemente; `onFailed` solo registra el error para observabilidad,
 * no hay dead-letter queue ni reintento manual — el job queda en el set de
 * fallidos de Redis (acotado por `removeOnFail`) para inspección posterior.
 */
@Processor(QUEUE_EMAIL)
export class EmailConsumer extends WorkerHost {
  private readonly logger = new Logger(EmailConsumer.name);

  constructor(private readonly emailChannel: EmailChannel) {
    super();
  }

  /**
   * Ejecuta un intento de envío. Ignora silenciosamente cualquier job cuyo
   * nombre no sea `email.send` (defensivo: esta cola hoy solo tiene un tipo
   * de job, pero evita procesar algo inesperado si eso cambia).
   *
   * @param job - Job de BullMQ; `job.data` es el `EmailNotificationPayload`.
   */
  async process(job: Job<EmailNotificationPayload>): Promise<void> {
    if (job.name !== JOB_EMAIL_SEND) return;

    this.logger.log(`Procesando job ${job.id} intento ${job.attemptsMade + 1}`);
    // job.id es estable entre reintentos del mismo job: sirve como
    // idempotency key para que Resend deduplique si un reintento ocurre
    // después de que el correo ya se envió (ver EmailChannel.send).
    await this.emailChannel.send(job.data, job.id);
  }

  /** Se dispara en cada intento fallido (no solo en el fallo final). */
  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    this.logger.error(`Job ${job.id} falló en intento ${job.attemptsMade}: ${error.message}`);
  }

  /** Se dispara cuando el job se completa sin lanzar excepción. */
  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    this.logger.log(`Job ${job.id} completado exitosamente`);
  }
}
