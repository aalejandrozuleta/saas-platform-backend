# API Gateway

## Descripción

Punto único de entrada de la plataforma. Recibe todo el tráfico externo (detrás de NGINX), aplica seguridad centralizada y reenvía las peticiones a auth-service y config-service mediante un cliente HTTP resiliente con circuit breaker.

## Responsabilidades

- **Reverse proxy** hacia `auth-service` (`AuthProxy`) y `config-service` (`ConfigProxy`).
- **Seguridad de borde**: validación JWT, CORS, Helmet, sanitización de rutas y headers.
- **Rate limiting** global y reforzado en rutas sensibles (login, registro, refresh, 2FA, cambio de contraseña).
- **Modo mantenimiento**: bloquea todo el tráfico (excepto rutas de bypass) cuando config-service reporta mantenimiento activo — ver [../../docs/flows/maintenance-mode-flow.md](../../docs/flows/maintenance-mode-flow.md).
- **Resiliencia**: reintentos + circuit breaker (Opossum) frente a fallos de los servicios upstream.
- **Health checks** y métricas Prometheus.

## Arquitectura

- **`infrastructure/security/`** — middlewares aplicados en orden en `main.ts`: `method-guard`, `path-sanitizer`, `header-validation`, `rate-limit` (global + específico para auth), `timeout`, además de `helmet` y `MaintenanceGuard`.
- **`infrastructure/http/client/resilient-http.client.ts`** — cliente Axios + circuit breaker (`opossum`) compartido por los proxies: reintentos solo en métodos idempotentes y errores 5xx; el circuito abre al superar 90% de error en una ventana de 10 llamadas.
- **`infrastructure/http/proxies/`** — `AuthProxy`, `ConfigProxy`: reenvían la petición, propagan cookies del upstream y traducen errores (circuito abierto, 5xx, timeouts) a respuestas HTTP estructuradas del gateway.
- **`modules/`** — controllers que exponen las rutas públicas (`auth`, `config`) y delegan en los proxies.

## Seguridad

| Middleware                   | Qué mitiga                                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| `method-guard`               | Métodos HTTP no permitidos                                                                           |
| `path-sanitizer`             | Path traversal / rutas malformadas                                                                   |
| `header-validation`          | Headers manipulados o inválidos                                                                      |
| `rate-limit` (global + auth) | Fuerza bruta y abuso, con límite más estricto en rutas de login/registro/2FA                         |
| `timeout`                    | Requests colgadas que agotan conexiones del pool                                                     |
| `helmet`                     | Cabeceras de seguridad HTTP estándar (CSP, etc.)                                                     |
| `MaintenanceGuard`           | Bloquea tráfico cuando la plataforma está en mantenimiento (fail-open si config-service no responde) |

## Resiliencia

`ResilientHttpClient` combina reintentos automáticos (GET/HEAD/OPTIONS + 5xx) con un circuit breaker por servicio downstream. Si el circuito está abierto, el gateway responde `503` inmediatamente en vez de esperar timeouts repetidos contra un servicio caído.

## Variables de entorno

| Variable                                                                                              | Descripción                                                                           |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `NODE_ENV` / `PORT`                                                                                   | Entorno y puerto HTTP (requerido, sin default).                                       |
| `AUTH_SERVICE_URL` / `AUTH_SERVICE_TIMEOUT` / `AUTH_SERVICE_RETRIES` / `AUTH_SERVICE_CIRCUIT_TIMEOUT` | Configuración del proxy hacia auth-service.                                           |
| `CONFIG_SERVICE_URL` / `CONFIG_SERVICE_TIMEOUT` / `CONFIG_SERVICE_CIRCUIT_TIMEOUT`                    | Configuración del proxy hacia config-service.                                         |
| `INTERNAL_SERVICE_SECRET`                                                                             | Secreto compartido para llamadas internas autenticadas.                               |
| `JWT_ACCESS_SECRET`                                                                                   | Validación de tokens de acceso.                                                       |
| `CORS_ORIGINS`                                                                                        | Lista de orígenes permitidos, separados por coma.                                     |
| `TRUST_PROXY`                                                                                         | `0` o `1` — cuántos hops de proxy confiar para resolver `req.ip`.                     |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD`                                                        | Cache de estado de mantenimiento.                                                     |
| `SMTP_*`                                                                                              | Configuración SMTP (verificar si sigue en uso activo antes de asumir comportamiento). |

## Cómo correr localmente

```bash
pnpm --filter api-gateway dev
```

También forma parte del stack completo vía `pnpm dev` (docker compose) desde la raíz del monorepo.

## Documentación

- Swagger UI: http://localhost:3000/docs (solo en `development`)
- Spec OpenAPI estático: [../../docs/openapi/api-gateway.json](../../docs/openapi/api-gateway.json) (regenerar con `pnpm docs:openapi`)
- TSDoc navegable: `pnpm --filter api-gateway run docs` → `docs/code/api-gateway`
- Flujo de mantenimiento: [../../docs/flows/maintenance-mode-flow.md](../../docs/flows/maintenance-mode-flow.md)
- Diagramas: [../../docs/diagrams/system-containers.md](../../docs/diagrams/system-containers.md)
