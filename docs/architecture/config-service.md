# Config Service

Configuración operativa centralizada de la plataforma: los demás servicios
(sobre todo el API Gateway) consultan este servicio en vez de tener flags o
políticas hardcodeadas o repetidas por servicio.

## Responsabilidades

- Feature flags — activar/desactivar funcionalidades sin redesplegar.
- Modo mantenimiento — estado global, con ventanas programadas (activar/desactivar/cancelar).
- Tenants.
- Reglas de IP.
- Políticas de contraseña.
- Rate limits configurables.
- Estadísticas del sistema.

## Capas

Arquitectura hexagonal, igual que `auth-service`:

- **`infrastructure/controllers/`** — `FeatureFlagController`, `MaintenanceController`, `StatsController`.
- **`infrastructure/persistence/prisma/`** — persistencia transaccional principal (PostgreSQL, `config-postgres`, instancia dedicada separada de `auth-postgres`).
- **`infrastructure/persistence/mongo/`** — colección adicional en MongoDB (vía Mongoose) para datos no relacionales del servicio.
- **`infrastructure/persistence/cache/`** — Redis, usado por los consumidores (ej. cache de 30s del gateway sobre `/maintenance/status`) más que por el propio servicio.

## Consumidores

- **API Gateway** — el consumidor principal: `MaintenanceGuard` llama a `/config/v1/maintenance/status` en cada request (con cache Redis de 30s) para decidir si la plataforma está en mantenimiento. Ver [../flows/maintenance-mode-flow.md](../flows/maintenance-mode-flow.md).

Ver [../diagrams/config-service-containers.md](../diagrams/config-service-containers.md).
