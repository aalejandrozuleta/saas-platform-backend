# Flujos del Notification Service

## Email transaccional

```mermaid
sequenceDiagram
    participant Caller as Servicio llamante<br/>(ej. auth-service)
    participant API as NotificationController
    participant UC as EnqueueEmailUseCase
    participant Q as Redis (cola notification.email)
    participant W as EmailConsumer
    participant T as TemplateEngine
    participant R as Resend API

    Caller->>API: POST /notifications/v1/notifications/email
    API->>UC: execute(payload)
    UC->>Q: queue.add('email.send', payload, {attempts, backoff exponencial})
    Q-->>UC: job encolado
    UC-->>API: OK
    API-->>Caller: 202 Accepted

    Q->>W: entrega job (asíncrono)
    W->>T: render(template, variables)
    T-->>W: HTML
    W->>R: emails.send({..., idempotencyKey: job.id})
    alt éxito
        R-->>W: OK
        W->>W: log "Job completado"
    else error / timeout
        R-->>W: error
        W->>W: throw → BullMQ reintenta con backoff exponencial
    end
```

**Idempotencia**: `EmailChannel.send` pasa `job.id` (estable entre reintentos del mismo job) como `idempotencyKey` a Resend. Si un reintento ocurre después de que el correo ya se envió (por ejemplo, un timeout del lado nuestro que no canceló la petición HTTP en curso), Resend deduplica del lado del servidor y nunca envía el mismo correo dos veces.

**Timeout propio**: el SDK de Resend no soporta `AbortSignal`. `EmailChannel.withTimeout` corta la espera del lado del worker tras `RESEND_TIMEOUT_MS` para no dejar el worker de BullMQ bloqueado indefinidamente — no cancela la petición HTTP real, solo libera el worker para que BullMQ pueda reintentar.

## Notificación WebSocket

```mermaid
sequenceDiagram
    participant Caller as Servicio llamante
    participant API as NotificationController
    participant UC as EnqueueWsUseCase
    participant Q as Redis (cola notification.ws)
    participant W as WsConsumer
    participant GW as WsNotificationsGateway
    participant C as Clientes conectados

    Caller->>API: POST /notifications/v1/notifications/ws {event, target, data}
    API->>UC: execute(payload)
    UC->>Q: queue.add('ws.broadcast' | 'ws.send-to-user', payload)
    UC-->>API: OK
    API-->>Caller: 202 Accepted

    Q->>W: entrega job (asíncrono)
    alt target = broadcast
        W->>GW: broadcast(event, data)
        GW->>C: emit a todos los sockets conectados
    else target = {userId}
        W->>GW: sendToUser(userId, event, data)
        GW->>C: emit solo a la sala user:<userId>
    end
```

### Autenticación de la conexión WebSocket

```mermaid
sequenceDiagram
    actor Client as Cliente
    participant GW as WsNotificationsGateway

    Client->>GW: connect (namespace /notifications, cookie accessToken)
    GW->>GW: extraer accessToken de la cookie del handshake
    alt token válido (firma, issuer=auth-service, audience=api-gateway)
        GW->>GW: join room "user:<sub>"
        GW-->>Client: conectado, recibe broadcast + mensajes dirigidos
    else sin token o token inválido
        GW-->>Client: conectado anónimo, recibe solo broadcast
    end
```

El `userId` de la sala se deriva **siempre** del JWT verificado — nunca de un valor que el cliente declare — para que nadie pueda unirse a la sala de otro usuario e interceptar sus notificaciones dirigidas.

Ver también [service-communication.md](service-communication.md) y [../diagrams/notification-service-containers.md](../diagrams/notification-service-containers.md).
