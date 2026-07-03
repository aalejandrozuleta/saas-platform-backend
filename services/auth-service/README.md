# Auth Service

## Descripción

Microservicio responsable de la identidad de los usuarios: registro, login, gestión de sesiones y dispositivos, autenticación de dos factores (2FA/TOTP) y emisión/rotación de tokens JWT. Es el único servicio con clientes HTTP directos limitados (el API Gateway), por lo que confía en un único hop de proxy (`trust proxy: 1`).

## Responsabilidades

- **Cuentas**: registro, verificación de email, reenvío de verificación.
- **Sesión**: login, logout, logout de todas las sesiones, refresh de tokens, listado y revocación de sesiones activas.
- **Seguridad**: cambio de contraseña, 2FA (habilitar/deshabilitar/verificar), países de confianza (trusted countries), políticas de lockout por intentos fallidos.
- **Auditoría**: cada evento de seguridad relevante (login, logout, cambios de 2FA, cambios de contraseña) se registra en MongoDB.

Casos de uso implementados (`src/application/use-cases`): `register-user`, `login-user`, `logout`, `logout-all`, `refresh-token`, `change-password`, `enable-2fa`, `disable-2fa`, `verify-2fa`, `verify-email`, `resend-verification`, `get-sessions`, `revoke-session`, `add-trusted-country`, `remove-trusted-country`, `get-trusted-countries`.

## Arquitectura

Arquitectura hexagonal (Ports & Adapters) + DDD, en tres capas:

- **`domain/`** — entidades (`User`, `Device`, ...), value objects, políticas de seguridad y puertos de repositorio (interfaces). Sin dependencias de infraestructura.
- **`application/`** — casos de uso, DTOs, eventos de dominio (`user-registered`, `login-succeeded`, `login-failed`, `password-changed`, `two-factor-enabled`, ...) despachados vía `DomainEventBus`.
- **`infrastructure/`** — controllers, guards (`JwtAuthGuard`), adaptadores de persistencia (Prisma sobre PostgreSQL, MongoDB para auditoría), cache de sesiones (Redis) y el cliente HTTP hacia notification-service.

Ver [../../docs/architecture/auth-service.md](../../docs/architecture/auth-service.md) y [../../docs/diagrams/auth-components.md](../../docs/diagrams/auth-components.md) para el detalle visual.

## Seguridad

- **Tokens**: JWT de acceso + refresh token, con rotación y revocación vía cache Redis (invalidación inmediata sin esperar expiración natural).
- **2FA**: TOTP, con clave de cifrado dedicada (`TOTP_ENCRYPTION_KEY`) para las claves TOTP en reposo.
- **Lockout**: políticas de intentos fallidos evaluadas antes de validar la contraseña (ver [../../docs/flows/login-flow.md](../../docs/flows/login-flow.md)).
- **Comunicación interna**: las llamadas salientes a notification-service usan un secreto compartido (`INTERNAL_SERVICE_SECRET`).

## Variables de entorno

| Variable                                                    | Descripción                                                                   |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `NODE_ENV`                                                  | `development` / `test` / `production`. Controla si Swagger queda expuesto.    |
| `PORT`                                                      | Puerto HTTP (default 3001).                                                   |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`                  | Secretos de firma de tokens (mín. 32 caracteres).                             |
| `TOTP_ENCRYPTION_KEY`                                       | Clave de cifrado de secretos TOTP en reposo.                                  |
| `ACCESS_TOKEN_TTL` / `REFRESH_TOKEN_TTL`                    | TTL en segundos de cada token.                                                |
| `REDIS_SESSION_TTL`                                         | TTL de la cache de sesión en Redis.                                           |
| `DATABASE_URL`                                              | Conexión PostgreSQL (Prisma).                                                 |
| `MONGO_URL`                                                 | Conexión MongoDB (auditoría).                                                 |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD`              | Conexión Redis.                                                               |
| `NOTIFICATION_SERVICE_URL` / `NOTIFICATION_SERVICE_TIMEOUT` | Dirección interna del notification-service.                                   |
| `INTERNAL_SERVICE_SECRET`                                   | Secreto compartido para llamadas de servicio a servicio (mín. 32 caracteres). |
| `APP_URL`                                                   | URL del frontend, usada en links de verificación de email.                    |
| `EMAIL_VERIFICATION_TTL`                                    | TTL del token de verificación de email.                                       |

Sin valores por defecto secretos aquí — usa tu `.env` local (no versionado).

## Cómo correr localmente

```bash
pnpm --filter auth-service dev   # incluye `prisma generate` antes de arrancar
```

También forma parte del stack completo vía `pnpm dev` (docker compose) desde la raíz del monorepo.

## Documentación

- Swagger UI: http://localhost:3001/docs (solo en `development`)
- Spec OpenAPI estático: [../../docs/openapi/auth-service.json](../../docs/openapi/auth-service.json) (regenerar con `pnpm docs:openapi`)
- TSDoc navegable: `pnpm --filter auth-service run docs` → `docs/code/auth-service`
- Flujos: [../../docs/flows/login-flow.md](../../docs/flows/login-flow.md), [../../docs/flows/register-flow.md](../../docs/flows/register-flow.md)
- Diagramas: [../../docs/diagrams/auth-containers.md](../../docs/diagrams/auth-containers.md), [../../docs/diagrams/auth-components.md](../../docs/diagrams/auth-components.md)
