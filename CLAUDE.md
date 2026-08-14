# saas-platform

Monorepo pnpm (NestJS, TypeScript) con arquitectura hexagonal (domain / application / infrastructure) por servicio, orquestado con Docker Compose.

## Servicios

| Servicio             | Puerto           | Ruta                            |
| -------------------- | ---------------- | ------------------------------- |
| api-gateway          | (via envService) | `services/api-gateway`          |
| auth-service         | 3001             | `services/auth-service`         |
| config-service       | 3002             | `services/config-service`       |
| notification-service | 3003             | `services/notification-service` |

- `shared/` — paquete `@saas/shared` (decorators, filters, http, i18n, logger, metrics, permissions, redis, response, swagger, validation, errors, env, activity-report). Consumido por todos los servicios via `injectWorkspacePackages`.
- `docker/` — compose dev/prod, nginx, prometheus, grafana, loki, alloy.

## Arquitectura por servicio

Cada servicio en `services/*/src/` sigue capas con boundaries reforzados por `eslint-plugin-boundaries`:
`domain` (sin dependencias) → `application` (usa domain) → `infrastructure`/`modules` (usa application + shared). No violar esta dirección de dependencias.

## Comandos

```bash
pnpm dev              # docker compose dev (todo el stack)
pnpm dev:auth         # solo auth-service con watch
pnpm dev:notification # solo notification-service con watch
pnpm test             # todos los paquetes en paralelo
pnpm test:cov         # cobertura, todos los paquetes
pnpm test:auth / test:gateway / test:shared / test:notification
pnpm typecheck        # tsc --noEmit en todos los paquetes
pnpm lint / lint:fix
pnpm build
```

Para un solo paquete: `pnpm --filter <nombre> <script>` (ej. `pnpm --filter auth-service test`).

## Estándares

- **Cobertura 95% global** (jest coverageThreshold) en todos los paquetes — no bajar el umbral para hacer pasar un PR.
- Conventional Commits (commitlint + husky pre-commit corre `lint-staged`).
- No cruzar capas domain/application/infrastructure fuera de las reglas de `eslint.config.*`.

## Notas de contexto (ver memoria de proyecto para detalle completo)

- config-service (puerto 3002): maintenance, feature flags, tenants, IP rules, password policies, rate limits.
- notification-service (puerto 3003): colas BullMQ, email via Resend, WebSocket via Socket.io (expuesto en nginx como `/socket.io/`).
- Auditoría de seguridad completa ya aplicada (dependabot + hardening) — ver memoria `project_security_vuln_fixes`.
