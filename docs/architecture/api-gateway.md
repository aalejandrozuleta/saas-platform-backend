# API Gateway

Punto único de entrada a la plataforma. No tiene base de datos propia: su
responsabilidad es seguridad de borde, resiliencia y enrutamiento hacia los
servicios internos.

## Responsabilidades

- Autenticación de sesión (`JwtSessionGuard`) — valida el access token JWT y consulta Redis para permisos/revocación.
- Autorización por rol (`RolesGuard`) y por permiso fino (`PermissionGuard`).
- Modo mantenimiento (`MaintenanceGuard`) — consulta `config-service` con cache de 30s en Redis.
- Rate limiting, timeouts, validación de headers y sanitización de rutas (middlewares en `infrastructure/security/`).
- Proxy resiliente hacia `auth-service` y `config-service` (circuit breaker + reintentos vía `opossum`, en `ResilientHttpClient`).
- Métricas (`/metrics`, Prometheus) y health checks.

## Capas

El gateway no sigue domain/application/infrastructure como los demás
servicios (no tiene lógica de negocio propia) — se organiza en:

- **`modules/`** — `AuthModule`, `ConfigModule`: controllers finos que delegan en los proxies.
- **`infrastructure/http/proxies/`** — `AuthProxy`, `ConfigProxy`: reenvían la petición al servicio upstream correspondiente, traducen errores de Axios/upstream a respuestas HTTP estructuradas del gateway.
- **`infrastructure/http/client/`** — `ResilientHttpClient`: combina timeout, reintentos automáticos y circuit breaker (opossum) para cada llamada saliente.
- **`infrastructure/security/`** — guards y middlewares (JWT, roles, permisos, mantenimiento, rate limit, timeout, sanitización de path, validación de headers).
- **`infrastructure/metrics/`** — interceptor + servicio de métricas Prometheus.

## Servicios enrutados

| Servicio             | Base path      | Vía                                                                                                                |
| -------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------ |
| auth-service         | `/auth/v1/*`   | `AuthProxy`                                                                                                        |
| config-service       | `/config/v1/*` | `ConfigProxy`                                                                                                      |
| notification-service | `/socket.io/*` | Nginx directo (no pasa por el gateway; ver [../flows/service-communication.md](../flows/service-communication.md)) |

## Por qué circuit breaker

Si `auth-service` o `config-service` empiezan a fallar o a responder lento, el
circuit breaker (opossum) abre el circuito tras superar el umbral de errores
configurado y responde rápido con un error controlado en vez de acumular
requests colgados esperando un timeout — evita que un servicio caído tumbe
también al gateway por saturación de conexiones.

Ver [../diagrams/api-gateway-containers.md](../diagrams/api-gateway-containers.md) y [../flows/service-communication.md](../flows/service-communication.md).
