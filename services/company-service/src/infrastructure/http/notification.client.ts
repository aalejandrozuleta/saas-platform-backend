import { Injectable, Logger } from '@nestjs/common';
import axios, { type AxiosInstance } from 'axios';
import { EnvService } from '@config/env/env.service';
import {
  type EmailPayload,
  type NotificationClientPort,
} from '@application/ports/notification-client.port';

/** Ruta del endpoint interno de notification-service que encola un email. */
const SEND_EMAIL_PATH = '/notifications/v1/notifications/email';

/**
 * Cliente HTTP interno hacia notification-service.
 *
 * @remarks
 * Fire-and-forget: nunca propaga una excepción hacia el caller — un fallo
 * al notificar (notification-service caído, timeout) no debe interrumpir
 * el flujo de negocio principal (ej. invitar a un miembro). Mismo criterio
 * que `NotificationClient` en auth-service.
 */
@Injectable()
export class NotificationHttpClient implements NotificationClientPort {
  private readonly logger = new Logger(NotificationHttpClient.name);
  private readonly http: AxiosInstance;

  constructor(private readonly envService: EnvService) {
    this.http = axios.create({
      baseURL: this.envService.get('NOTIFICATION_SERVICE_URL'),
      timeout: this.envService.get('NOTIFICATION_SERVICE_TIMEOUT'),
      headers: {
        'x-internal-api-key': this.envService.get('INTERNAL_SERVICE_SECRET'),
      },
    });
  }

  sendEmail(payload: EmailPayload): void {
    this.http
      .post(SEND_EMAIL_PATH, payload)
      .then((response) => {
        if (response.status >= 300) {
          this.logger.warn(
            `Notificación email rechazada [${response.status}] template=${payload.template}`,
          );
        }
      })
      .catch((error: unknown) => {
        this.logger.error(
          `Error enviando email [template=${payload.template}]: ${(error as Error).message}`,
        );
      });
  }
}
