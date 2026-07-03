/**
 * Nombres de colas BullMQ y de los jobs que cada una procesa.
 *
 * Centralizados aquí para que producers (`EnqueueEmailUseCase`,
 * `EnqueueWsUseCase`) y consumers (`EmailConsumer`, `WsConsumer`) usen
 * siempre el mismo literal — un typo en el nombre de la cola o del job
 * haría que el job se encole pero nunca sea recogido por ningún worker.
 */

/** Cola de envío de emails transaccionales vía Resend. */
export const QUEUE_EMAIL = 'notification.email';
/** Cola de notificaciones en tiempo real vía WebSocket (Socket.io). */
export const QUEUE_WS = 'notification.ws';

/** Job único de la cola de email: renderiza el template y envía vía Resend. */
export const JOB_EMAIL_SEND = 'email.send';
/** Job de la cola WS: emite el evento a todos los clientes conectados. */
export const JOB_WS_BROADCAST = 'ws.broadcast';
/** Job de la cola WS: emite el evento solo a la sala `user:<userId>`. */
export const JOB_WS_SEND_TO_USER = 'ws.send-to-user';
