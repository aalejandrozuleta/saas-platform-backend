# Comunicación entre servicios

Resumen de los cuatro mecanismos que usan los servicios para hablar entre sí.

## 1. HTTP resiliente (proxy síncrono)

**Quién lo usa**: API Gateway → auth-service / config-service.

`ResilientHttpClient` (Axios + circuit breaker `opossum`):

- **Reintentos**: hasta 2, solo en métodos idempotentes (`GET`/`HEAD`/`OPTIONS`) y errores `5xx` o de red. Nunca reintenta si el circuito está abierto.
- **Circuit breaker**: se abre al superar 90% de error en una ventana de 10 llamadas; permanece abierto 5 segundos (`resetTimeout`) antes de pasar a _half-open_ y probar de nuevo.
- **Manejo de errores**: cada proxy (`AuthProxy`, `ConfigProxy`) traduce el fallo (circuito abierto, 5xx del upstream, timeout, error desconocido) a una respuesta HTTP estructurada y logueada con el `event` correspondiente (`auth.upstream.circuit_open`, `auth.upstream.5xx`, ...).

## 2. HTTP fire-and-forget (notificación desacoplada)

**Quién lo usa**: auth-service → notification-service.

`NotificationClient.sendEmail(...)` hace un `fetch` con `AbortSignal.timeout(NOTIFICATION_SERVICE_TIMEOUT)` y **nunca propaga la excepción** al llamador — solo loguea. Se invoca desde `NotificationListener`, que reacciona a eventos de dominio (`UserRegisteredEvent`, `PasswordChangedEvent`, `LoginBlockedEvent`, `TwoFactorEnabledEvent`, `TwoFactorDisabledEvent`, `VerificationEmailRequestedEvent`) vía `@nestjs/event-emitter`, no a una llamada directa desde el caso de uso. Esto garantiza que un fallo de notificaciones nunca revierte ni bloquea la operación de negocio que lo originó.

Autenticación: header `x-internal-api-key` con el valor de `INTERNAL_SERVICE_SECRET` (compartido entre servicios).

## 3. Colas BullMQ (procesamiento asíncrono)

**Quién lo usa**: dentro de notification-service, entre el endpoint HTTP (producer) y los workers (consumers).

Ver [notification-flows.md](notification-flows.md) para el detalle de colas, reintentos y backoff.

## 4. Cache Redis (estado compartido)

- **Sesiones** (auth-service): revocación inmediata de tokens sin esperar expiración natural del JWT.
- **Estado de mantenimiento** (api-gateway): `MaintenanceGuard` cachea la respuesta de `config-service` por 30s (`gateway:maintenance:status`) para no consultarlo en cada request.

## Eventos de dominio (intra-servicio)

Dentro de auth-service, `DomainEventBus` desacopla casos de uso de sus efectos secundarios (auditoría, notificaciones) — no es un bus distribuido entre servicios, vive en el proceso del propio auth-service.

## Política de fallos

| Comunicación                          | Si falla el destino                                                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Gateway → auth/config (proxy)         | `503` al cliente tras agotar reintentos / circuito abierto                                                                                  |
| Gateway → config (`MaintenanceGuard`) | **Fail-open**: se permite el tráfico (no se puede bloquear la plataforma porque config-service esté caído)                                  |
| auth → notification (fire-and-forget) | Se loguea el error; el flujo de negocio (registro, login, etc.) **no se ve afectado**                                                       |
| notification: producer → cola         | El endpoint HTTP responde `202` solo si el job se encoló correctamente; si Redis no está disponible, la petición falla                      |
| notification: cola → consumer         | Reintentos con backoff exponencial (ver [notification-flows.md](notification-flows.md)); tras agotar los intentos, el job queda en `failed` |
