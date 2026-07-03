# Contenedores del Notification Service

```mermaid
flowchart TB
    caller["Servicios llamantes<br/>(auth-service, ...)"] -->|"HTTP POST /notifications/v1/notifications/email|ws"| api["API NestJS<br/>notification-service :3003"]

    subgraph notification-service
        api -->|"enqueue"| redis[("Redis<br/>colas BullMQ")]
        redis -->|"notification.email"| emailConsumer["EmailConsumer"]
        redis -->|"notification.ws"| wsConsumer["WsConsumer"]
        emailConsumer --> templates["TemplateEngine<br/>(templates React Email)"]
        wsConsumer --> gateway["WsNotificationsGateway<br/>(Socket.io, namespace /notifications)"]
    end

    emailConsumer -->|"HTTPS"| resend["Resend API"]
    gateway -->|"WebSocket"| browser["Clientes conectados"]
```

## Contenedores principales

- **API NestJS** — expone endpoints para _encolar_ trabajo (`POST /notifications/email`, `POST /notifications/ws`) — la respuesta es inmediata (`202 Accepted`), el envío real es asíncrono.
- **Redis** — backend de las colas BullMQ (`notification.email`, `notification.ws`).
- **Consumers** — workers que procesan los jobs con reintentos y backoff exponencial (ver [../flows/notification-flows.md](../flows/notification-flows.md)).
- **Resend API** (externo) — proveedor de envío de emails transaccionales.
- **Socket.io Gateway** — namespace `/notifications`; autentica al cliente vía cookie `accessToken` (JWT) en el handshake y lo une a una sala privada `user:<id>`.

## Por qué colas en vez de envío síncrono

Desacopla al llamante (ej. auth-service tras un registro) de la disponibilidad de Resend/websockets: si el proveedor de email falla momentáneamente, el job reintenta con backoff sin bloquear ni fallar la operación que lo originó.
