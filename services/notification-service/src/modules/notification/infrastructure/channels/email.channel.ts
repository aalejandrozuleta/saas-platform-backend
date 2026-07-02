import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { EnvService } from '@config/env/env.service';

import { EmailNotificationPayload } from '../../domain/events/email-notification.event';
import { TemplateEngine } from '../templates/template.engine';

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

  async send(payload: EmailNotificationPayload): Promise<void> {
    const html = await this.templateEngine.render(payload.template, payload.variables ?? {});
    const from = this.env.get('RESEND_FROM_EMAIL');
    const to = Array.isArray(payload.to) ? payload.to : [payload.to];

    const { error } = await this.withTimeout(
      this.resend.emails.send({
        from,
        to,
        subject: payload.subject,
        html,
      }),
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
