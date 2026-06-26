export interface EmailNotificationPayload {
  to: string | string[];
  subject: string;
  template: string;
  /** Variables a inyectar en el template HTML */
  variables?: Record<string, unknown>;
}
