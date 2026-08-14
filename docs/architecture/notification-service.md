# Notification Service

Envío asíncrono de notificaciones: emails transaccionales (Resend) y
notificaciones en tiempo real (WebSocket / Socket.io). No expone lógica de
negocio propia — es un worker que otros servicios encolan.

## Responsabilidades

- Encolar y enviar emails transaccionales (bienvenida, verificación, reset de contraseña, alertas de seguridad).
- Encolar y emitir notificaciones en tiempo real por WebSocket.
- Reintentos con backoff exponencial ante fallos del proveedor (Resend) o de la entrega WS.

## Capas

- **`modules/notification/infrastructure/controllers/`** — `NotificationController`, expone `POST /notifications/v1/notifications/email` y `.../ws`. Responde `202 Accepted` de inmediato; el envío real es asíncrono.
- **`modules/notification/infrastructure/consumers/`** — `EmailConsumer`, `WsConsumer`: workers BullMQ que procesan los jobs de las colas `notification.email` y `notification.ws`.
- **`modules/notification/infrastructure/channels/`** — `WsNotificationsGateway` (Socket.io, namespace `/notifications`): autentica al cliente vía cookie `accessToken` (JWT) en el handshake y lo une a una sala privada `user:<id>`.
- **`infrastructure/persistence/cache/`** — Redis, backend de las colas BullMQ.

## Por qué colas en vez de envío síncrono

Desacopla al llamante (ej. `auth-service` tras un registro, un reset de
contraseña o una activación de 2FA) de la disponibilidad de Resend o de los
websockets: si el proveedor de email falla momentáneamente, el job reintenta
con backoff sin bloquear ni fallar la operación que lo originó.

## Exposición

A diferencia de `auth-service` y `config-service`, el WebSocket de este
servicio **no pasa por el API Gateway** — Nginx lo expone directamente en
`/socket.io/` (ver `docker/nginx/sites/prod.conf`) porque el gateway no está
pensado para mantener conexiones persistentes de larga duración.

Ver [../diagrams/notification-service-containers.md](../diagrams/notification-service-containers.md) y [../flows/notification-flows.md](../flows/notification-flows.md).
