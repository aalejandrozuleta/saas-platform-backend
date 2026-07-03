import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { EnvService } from '@config/env/env.service';

import { EmailNotificationPayload } from '../../domain/events/email-notification.event';
import { TemplateEngine } from '../templates/template.engine';

/**
 * Adaptador del canal de email: renderiza el template solicitado y lo envía
 * vía Resend. Es el punto de integración externo usado por `EmailConsumer`.
 *
 * @remarks
 * No conoce BullMQ ni jobs — solo sabe renderizar + enviar. El manejo de
 * reintentos vive en el consumer (relanzando errores) y en la política de
 * la cola (`EnqueueEmailUseCase`); este canal se limita a fallar rápido
 * (ver `withTimeout`) y a deduplicar del lado de Resend cuando se le pasa
 * un `idempotencyKey`.
 */
@Injectable()
export class EmailChannel {
  private readonly logger = new Logger(EmailChannel.name);
  private readonly resend: Resend;

  constructor(
    private readonly env: EnvService,
    private readonly templateEngine: TemplateEngine,
  ) {
    this.resend = new Resend(this.env.get('RESEND_API_KEY'));
  }

  /**
   * Renderiza `payload.template` con `payload.variables` y envía el email
   * resultante vía la API de Resend.
   *
   * @param payload - Destinatario(s), asunto, template y variables.
   * @param idempotencyKey - Normalmente el id del job de BullMQ. Un reintento
   * de un job con timeout (ver withTimeout) no cancela la petición HTTP en
   * curso: Resend podría haber enviado el correo igual aunque nosotros
   * hayamos marcado el intento como fallido. Pasar la misma idempotencyKey
   * en cada reintento del mismo job hace que Resend deduplique del lado del
   * servidor y nunca envíe el mismo correo dos veces.
   * @throws Error si Resend responde con error, o si se excede `RESEND_TIMEOUT_MS`.
   * BullMQ captura esa excepción y reintenta según la política del job.
   */
  async send(payload: EmailNotificationPayload, idempotencyKey?: string): Promise<void> {
    const html = await this.templateEngine.render(payload.template, payload.variables ?? {});
    const from = this.env.get('RESEND_FROM_EMAIL');
    const to = Array.isArray(payload.to) ? payload.to : [payload.to];

    const { error } = await this.withTimeout(
      this.resend.emails.send(
        {
          from,
          to,
          subject: payload.subject,
          html,
        },
        idempotencyKey ? { idempotencyKey } : undefined,
      ),
      this.env.get('RESEND_TIMEOUT_MS'),
    );

    if (error) {
      this.logger.error(`Resend error para ${to.join(',')}`, error);
      // BullMQ captura el throw y reintenta según la config de backoff
      throw new Error(error.message);
    }

    this.logger.log(`Email enviado a ${to.join(',')} [template: ${payload.template}]`);
  }

  /**
   * El SDK de Resend no soporta AbortSignal/timeout propio; sin un límite,
   * una llamada colgada deja el worker de BullMQ bloqueado indefinidamente.
   * Esto no cancela la petición HTTP en curso, pero libera al worker para
   * que BullMQ pueda reintentar el job.
   *
   * @param promise - Petición a Resend en curso.
   * @param timeoutMs - Límite en milisegundos (`RESEND_TIMEOUT_MS`).
   * @returns El valor resuelto por `promise`, o rechaza si se excede `timeoutMs`.
   */
  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Resend request excedió el timeout de ${timeoutMs}ms`));
      }, timeoutMs);

      promise
        .then((value) => {
          clearTimeout(timer);
          resolve(value);
        })
        .catch((err: unknown) => {
          clearTimeout(timer);
          reject(err instanceof Error ? err : new Error(String(err)));
        });
    });
  }
}
