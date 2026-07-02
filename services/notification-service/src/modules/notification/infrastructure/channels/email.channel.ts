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

    const { error } = await this.resend.emails.send({
      from,
      to,
      subject: payload.subject,
      html,
    });

    if (error) {
      this.logger.error(`Resend error para ${to.join(',')}`, error);
      // BullMQ captura el throw y reintenta según la config de backoff
      throw new Error(error.message);
    }

    this.logger.log(`Email enviado a ${to.join(',')} [template: ${payload.template}]`);
  }
}
