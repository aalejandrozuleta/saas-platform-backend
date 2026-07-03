/**
 * Payload de un job de la cola `notification.email`.
 * Es el `job.data` que recibe `EmailConsumer.process` y que `EmailChannel.send`
 * usa para renderizar el template y armar la petición a Resend.
 */
export interface EmailNotificationPayload {
  /** Uno o varios destinatarios. Se normaliza a array antes de llamar a Resend. */
  to: string | string[];
  subject: string;
  /** Nombre del template registrado en `TemplateEngine` (p. ej. `welcome`). */
  template: string;
  /** Variables a inyectar en el template HTML */
  variables?: Record<string, unknown>;
}
