# Config Service

## Descripción

Microservicio de configuración operativa centralizada de la plataforma: feature flags, modo mantenimiento, tenants, reglas de IP, políticas de contraseña y rate limits configurables. Permite a un super-admin cambiar comportamiento de la plataforma sin redesplegar.

## Responsabilidades

- **Feature flags**: activar/desactivar features por entorno (`FeatureFlagController`).
- **Modo mantenimiento**: estado on/off, mensaje, y ventanas de mantenimiento programadas con inicio/fin (`MaintenanceController`). Es la fuente de verdad que consulta el API Gateway en cada request — ver [../../docs/flows/maintenance-mode-flow.md](../../docs/flows/maintenance-mode-flow.md).
- **Estadísticas del sistema** (`StatsController`).
- **Tenants, reglas de IP y políticas de contraseña**: ver los módulos correspondientes bajo `src/domain` y `src/application`.

## Arquitectura

Capas domain / application / infrastructure:

- **`domain/`** — entidades (`FeatureFlag`, `MaintenanceWindow`, ...) y puertos de repositorio.
- **`application/`** — casos de uso (`SetFeatureFlagUseCase`, `SetMaintenanceModeUseCase`, `GetMaintenanceStatusUseCase`, `ScheduleMaintenanceWindowUseCase`, `GetSystemStatsUseCase`, ...) y DTOs.
- **`infrastructure/`** — controllers, adaptadores Prisma sobre PostgreSQL (`config-postgres`, instancia dedicada, separada de `auth-postgres`).

## Variables de entorno

| Variable                                       | Descripción                                                                         |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| `NODE_ENV`                                     | `development` / `test` / `production`. Controla si Swagger queda expuesto.          |
| `PORT`                                         | Puerto HTTP (default 3002).                                                         |
| `DATABASE_URL`                                 | Conexión PostgreSQL (Prisma).                                                       |
| `MONGO_URL`                                    | Conexión MongoDB, usada para el log de auditoría.                                   |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` | Conexión Redis (mín. 16 caracteres el password).                                    |
| `CONFIG_CACHE_TTL`                             | TTL en segundos para las entradas cacheadas de `ConfigCache`.                       |
| `INTERNAL_SERVICE_SECRET`                      | Secreto compartido con el API Gateway (`InternalServiceGuard`), mín. 32 caracteres. |

## Cómo correr localmente

```bash
pnpm --filter config-service dev   # incluye `prisma generate` antes de arrancar
```

También forma parte del stack completo vía `pnpm dev` (docker compose) desde la raíz del monorepo.

## Documentación

- Swagger UI: http://localhost:3002/docs (solo en `development`)
- Spec OpenAPI estático: [../../docs/openapi/config-service.json](../../docs/openapi/config-service.json) (regenerar con `pnpm docs:openapi`)
- TSDoc navegable: `pnpm --filter config-service run docs` → `docs/code/config-service`
- Diagrama: [../../docs/diagrams/config-service-containers.md](../../docs/diagrams/config-service-containers.md)
