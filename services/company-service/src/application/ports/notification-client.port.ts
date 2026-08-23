/** Payload de un email a enviar vía notification-service. */
export interface EmailPayload {
  to: string | string[];
  subject: string;
  template: string;
  variables?: Record<string, unknown>;
}

/**
 * Puerto de salida hacia notification-service.
 *
 * @remarks
 * Envío fire-and-forget: la implementación nunca debe propagar una
 * excepción hacia el caller — un fallo de notificaciones jamás debe
 * interrumpir el flujo de negocio principal (mismo criterio que
 * `NotificationClient` en auth-service).
 */
export interface NotificationClientPort {
  sendEmail(payload: EmailPayload): void;
}
