# Diagrama de Contexto del Sistema

```mermaid
C4Context
  title Contexto del sistema — SaaS Platform

  Person(user, "Usuario", "Cliente final de la plataforma")
  Person(admin, "Super-admin", "Gestiona feature flags, mantenimiento y tenants")

  System_Boundary(platform, "SaaS Platform") {
    System(gateway, "API Gateway", "Punto único de entrada, seguridad, proxy resiliente")
    System(auth, "Auth Service", "Registro, login, sesiones, 2FA, tokens")
    System(config, "Config Service", "Feature flags, mantenimiento, tenants, políticas")
    System(notification, "Notification Service", "Email transaccional y WebSocket en tiempo real")
    System(company, "Company Service", "Empresas (tenant) y membresía de trabajadores")
  }

  System_Ext(resend, "Resend", "Proveedor de envío de emails")
  System_Ext(observability, "Prometheus / Grafana / Loki", "Métricas y logs centralizados")

  Rel(user, gateway, "HTTPS")
  Rel(admin, gateway, "HTTPS (rutas de administración)")
  Rel(gateway, auth, "HTTP interno /auth/v1/*")
  Rel(gateway, config, "HTTP interno /config/v1/*")
  Rel(gateway, company, "HTTP interno /company/v1/*")
  Rel(company, auth, "HTTP interno — lookup de userId por email")
  Rel(auth, notification, "HTTP interno — dispara emails transaccionales")
  Rel(notification, resend, "API HTTPS")
  Rel(gateway, observability, "métricas + logs")
  Rel(auth, observability, "métricas + logs")
  Rel(config, observability, "métricas + logs")
  Rel(notification, observability, "métricas + logs")
  Rel(company, observability, "métricas + logs")
```

## Actores

- **Usuario**: consume la plataforma a través del API Gateway (único punto de entrada expuesto).
- **Super-admin**: usa las rutas de `config-service` (vía gateway) para activar/desactivar feature flags y modo mantenimiento.

## Sistemas

- **API Gateway** — reverse proxy con seguridad centralizada (JWT, rate limiting, circuit breaker) hacia auth-service y config-service.
- **Auth Service** — dueño del dominio de identidad y sesiones.
- **Config Service** — configuración operativa transversal, consultada por el gateway (ej. modo mantenimiento) y por otros servicios.
- **Notification Service** — desacoplado vía colas BullMQ; otros servicios lo invocan por HTTP para encolar un email o notificación WS, y el envío real ocurre de forma asíncrona.
- **Company Service** — dueño del tenant (`Company`) y de la membresía de trabajadores (`CompanyMembership`); referencia usuarios de Auth Service por `userId`, nunca crea cuentas.

Ver [system-containers.md](system-containers.md) para el detalle de infraestructura por contenedor.
