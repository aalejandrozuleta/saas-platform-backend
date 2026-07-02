import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { QUEUE_EMAIL, JOB_EMAIL_SEND } from '../../domain/queues.constants';
import { EmailNotificationPayload } from '../../domain/events/email-notification.event';
import { EmailChannel } from '../channels/email.channel';

@Processor(QUEUE_EMAIL)
export class EmailConsumer extends WorkerHost {
  private readonly logger = new Logger(EmailConsumer.name);

  constructor(private readonly emailChannel: EmailChannel) {
    super();
  }

  async process(job: Job<EmailNotificationPayload>): Promise<void> {
    if (job.name !== JOB_EMAIL_SEND) return;

    this.logger.log(`Procesando job ${job.id} intento ${job.attemptsMade + 1}`);
    // job.id es estable entre reintentos del mismo job: sirve como
    // idempotency key para que Resend deduplique si un reintento ocurre
    // después de que el correo ya se envió (ver EmailChannel.send).
    await this.emailChannel.send(job.data, job.id);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    this.logger.error(`Job ${job.id} falló en intento ${job.attemptsMade}: ${error.message}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    this.logger.log(`Job ${job.id} completado exitosamente`);
  }
}
