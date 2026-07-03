/**
 * Destino de una notificación WebSocket: a todos los clientes conectados
 * (`'broadcast'`) o a la sala personal de un usuario específico.
 */
export type WsTarget = 'broadcast' | { userId: string };

/**
 * Payload de un job de la cola `notification.ws`.
 * Es el `job.data` que recibe `WsConsumer.process` y que reenvía tal cual
 * a `WsNotificationsGateway` (broadcast o sala `user:<userId>`).
 */
export interface WsNotificationPayload {
  /** Nombre del evento Socket.io emitido al cliente (p. ej. `maintenance.scheduled`). */
  event: string;
  target: WsTarget;
  data: Record<string, unknown>;
}
