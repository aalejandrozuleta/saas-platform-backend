# Notification Service

## Descripción

Microservicio de notificaciones asíncronas: envío de email transaccional vía [Resend](https://resend.com) y notificaciones en tiempo real vía WebSocket (Socket.io). Procesa todo el trabajo mediante colas BullMQ (Redis) — los endpoints HTTP solo encolan el trabajo y responden `202 Accepted` de inmediato.

## Responsabilidades

- **Email transaccional**: `POST /notifications/v1/notifications/email` encola un job renderizado con templates (bienvenida, OTP, cambio de contraseña, 2FA activado/desactivado, cuenta bloqueada, mantenimiento).
- **Notificaciones WebSocket**: `POST /notifications/v1/notifications/ws` encola un `broadcast` a todos los clientes conectados o un envío dirigido a `user:<userId>`.
- **Preview de templates**: `GET /notifications/v1/notifications/preview` y `/preview/:template` para revisar el HTML de cada email en el navegador durante desarrollo.

## Arquitectura

```
modules/notification/
├── application/
│   ├── dtos/            # SendEmailDto, SendWsDto
│   └── use-cases/       # EnqueueEmailUseCase, EnqueueWsUseCase (producers)
├── domain/
│   ├── events/           # payloads de email y WS
│   └── queues.constants.ts  # nombres de colas y jobs, centralizados
└── infrastructure/
    ├── channels/         # EmailChannel (Resend), WsNotificationsGateway (Socket.io)
    ├── consumers/        # EmailConsumer, WsConsumer (workers BullMQ)
    ├── controllers/       # NotificationController
    └── templates/          # motor de templates + templates de email
```

## Colas (BullMQ)

| Cola                 | Job(s)                            | Reintentos                         | Backoff                                                   |
| -------------------- | --------------------------------- | ---------------------------------- | --------------------------------------------------------- |
| `notification.email` | `email.send`                      | `EMAIL_QUEUE_ATTEMPTS` (default 5) | exponencial, `EMAIL_QUEUE_BACKOFF_DELAY` (default 5000ms) |
| `notification.ws`    | `ws.broadcast`, `ws.send-to-user` | `WS_QUEUE_ATTEMPTS` (default 3)    | exponencial, `WS_QUEUE_BACKOFF_DELAY` (default 2000ms)    |

`EmailConsumer` pasa el `job.id` como `idempotencyKey` a Resend para que un reintento tras timeout no reenvíe un correo que en realidad sí llegó a salir. Ver [../../docs/flows/notification-flows.md](../../docs/flows/notification-flows.md).

## WebSocket Gateway

Namespace `/notifications`. En el handshake se verifica el JWT de la cookie `accessToken` (emitido por auth-service); si es válido, el socket se une a la sala privada `user:<id>` — nunca a partir de un `userId` que declare el propio cliente, para evitar que alguien se una a la sala de otro usuario. Sin token válido, la conexión queda anónima y solo recibe eventos de `broadcast`.

## Variables de entorno

| Variable                                                     | Descripción                                                                                            |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `NODE_ENV` / `PORT`                                          | Entorno y puerto HTTP (default 3003).                                                                  |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD`               | Backend de las colas BullMQ.                                                                           |
| `INTERNAL_SERVICE_SECRET`                                    | Secreto compartido para llamadas internas autenticadas.                                                |
| `JWT_ACCESS_SECRET`                                          | Verifica el `accessToken` en el handshake del WS gateway; debe coincidir con auth-service/api-gateway. |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` / `RESEND_TIMEOUT_MS` | Configuración del proveedor de email.                                                                  |
| `EMAIL_QUEUE_ATTEMPTS` / `EMAIL_QUEUE_BACKOFF_DELAY`         | Política de reintentos de la cola de email.                                                            |
| `WS_QUEUE_ATTEMPTS` / `WS_QUEUE_BACKOFF_DELAY`               | Política de reintentos de la cola de WebSocket.                                                        |

## Cómo correr localmente

```bash
pnpm --filter notification-service dev
```

También forma parte del stack completo vía `pnpm dev` (docker compose) desde la raíz del monorepo.

## Documentación

- Swagger UI: http://localhost:3003/docs (solo en `development`)
- Spec OpenAPI estático: [../../docs/openapi/notification-service.json](../../docs/openapi/notification-service.json) (regenerar con `pnpm docs:openapi`)
- TSDoc navegable: `pnpm --filter notification-service run docs` → `docs/code/notification-service`
- Diagrama: [../../docs/diagrams/notification-service-containers.md](../../docs/diagrams/notification-service-containers.md)
- Flujos: [../../docs/flows/notification-flows.md](../../docs/flows/notification-flows.md)
