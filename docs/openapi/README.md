# Specs OpenAPI estáticos

Este directorio contiene el spec OpenAPI 3.0 exportado de cada microservicio, generado en tiempo de ejecución por `@nestjs/swagger` (ver [shared/swagger/swagger.setup.ts](../../shared/swagger/swagger.setup.ts)).

## Cómo regenerarlos

1. Levanta los servicios en modo `development` (el endpoint `/docs` / `/docs-json` solo se registra en ese entorno):
   ```bash
   pnpm dev
   ```
2. Con los servicios respondiendo, exporta los specs:
   ```bash
   pnpm docs:openapi
   ```
   Esto escribe/actualiza `api-gateway.json`, `auth-service.json`, `config-service.json`, `notification-service.json` y `company-service.json` en este directorio.
3. Para exportar un único servicio: `node scripts/export-openapi.mjs auth-service`.

## Uso

- **Swagger UI en vivo**: cada servicio expone su UI interactiva en `http://localhost:<puerto>/docs` en desarrollo.
- **Importar en Postman/Insomnia**: importa directamente cualquiera de estos `.json`.
- **Detectar breaking changes de API**: compara el `.json` exportado contra el commit anterior en el PR.

| Servicio             | Puerto | Prefijo          |
| -------------------- | ------ | ---------------- |
| api-gateway          | 3000   | `/`              |
| auth-service         | 3001   | `/auth`          |
| config-service       | 3002   | `/config`        |
| notification-service | 3003   | `/notifications` |
| company-service      | 3004   | `/company`       |
