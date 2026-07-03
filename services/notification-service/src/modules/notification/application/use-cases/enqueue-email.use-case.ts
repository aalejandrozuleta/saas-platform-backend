import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EnvService } from '@config/env/env.service';

import { QUEUE_EMAIL, JOB_EMAIL_SEND } from '../../domain/queues.constants';
import { EmailNotificationPayload } from '../../domain/events/email-notification.event';

/**
 * Producer: encola un job de envío de email en la cola `notification.email`.
 *
 * @remarks
 * Se dispara desde `NotificationController.sendEmail` (POST /notifications/email)
 * cada vez que otro servicio interno (p. ej. auth-service) necesita enviar un
 * correo transaccional (bienvenida, cambio de contraseña, OTP, etc.). El
 * envío real ocurre de forma asíncrona en `EmailConsumer`; este caso de uso
 * solo garantiza que el job quede persistido en Redis con la política de
 * reintentos configurada.
 */
@Injectable()
export class EnqueueEmailUseCase {
  constructor(
    @InjectQueue(QUEUE_EMAIL) private readonly queue: Queue,
    private readonly env: EnvService,
  ) {}

  /**
   * Encola el payload como job `email.send`.
   *
   * Backoff exponencial (`EMAIL_QUEUE_BACKOFF_DELAY` como delay base) y hasta
   * `EMAIL_QUEUE_ATTEMPTS` intentos: cubre caídas transitorias de Resend sin
   * bloquear al caller, que solo espera a que el job quede en cola.
   *
   * @param payload - Destinatario(s), template y variables a renderizar.
   */
  async execute(payload: EmailNotificationPayload): Promise<void> {
    await this.queue.add(JOB_EMAIL_SEND, payload, {
      attempts: this.env.get('EMAIL_QUEUE_ATTEMPTS'),
      backoff: {
        type: 'exponential',
        delay: this.env.get('EMAIL_QUEUE_BACKOFF_DELAY'),
      },
      removeOnComplete: { count: 100 }, // conserva historial acotado para debugging
      removeOnFail: { count: 500 }, // conserva más fallos para poder investigarlos
    });
  }
}
