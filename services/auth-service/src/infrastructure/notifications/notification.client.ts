import { Injectable, Logger } from '@nestjs/common';
import { EnvService } from '@config/env/env.service';

interface EmailPayload {
  to: string | string[];
  subject: string;
  template: string;
  variables?: Record<string, unknown>;
}

/**
 * Cliente HTTP hacia el notification-service.
 * Todos los métodos son fire-and-forget: jamás lanzan excepción
 * hacia el llamador, de modo que un fallo en notificaciones
 * nunca interrumpe el flujo principal de negocio.
 */
@Injectable()
export class NotificationClient {
  private readonly logger = new Logger(NotificationClient.name);
  private readonly baseUrl: string;

  constructor(private readonly env: EnvService) {
    this.baseUrl = this.env.get('NOTIFICATION_SERVICE_URL');
  }

  sendEmail(payload: EmailPayload): void {
    const url = `${this.baseUrl}/notifications/v1/notifications/email`;

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          this.logger.warn(`Notificación email rechazada [${res.status}] template=${payload.template}`);
        }
      })
      .catch((err: unknown) => {
        this.logger.error(
          `Error enviando email [template=${payload.template}]: ${(err as Error).message}`,
        );
      });
  }
}
