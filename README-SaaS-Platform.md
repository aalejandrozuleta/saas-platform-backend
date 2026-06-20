# SaaS Platform

## Descripción General

Estamos construyendo una plataforma SaaS empresarial moderna utilizando una arquitectura basada en microservicios, siguiendo estándares enterprise y buenas prácticas de ingeniería de software.

### Objetivo General

El objetivo no es únicamente desarrollar una aplicación funcional, sino construir una plataforma escalable, mantenible y preparada para crecimiento empresarial.

Principios principales:

- Domain Driven Design (DDD)
- Arquitectura Hexagonal (Ports & Adapters)
- Clean Architecture
- Monorepo con PNPM
- Observabilidad completa
- CI/CD automatizado
- Seguridad desde el diseño
- Alta mantenibilidad y estandarización

---

# Stack Tecnológico

## Backend

- NestJS (última versión)
- TypeScript
- PNPM Workspaces

## Bases de Datos

- PostgreSQL
- MongoDB
- Redis

## Infraestructura

- Docker
- Docker Compose
- NGINX

## Observabilidad

- Prometheus
- Grafana
- Loki
- Promtail

## Calidad

- ESLint
- Prettier
- Husky
- Commitlint
- GitHub Actions
- CodeQL
- SonarCloud

---

# Arquitectura General

```text
Cliente
   │
   ▼
NGINX
   │
   ▼
API Gateway
   │
   ├── Auth Service
   ├── User Service
   ├── Notification Service
   ├── Billing Service
   └── Otros servicios
```

Todos los servicios deben ser desplegables independientemente.

---

# Estado Actual del Proyecto

Actualmente estamos en la fase de construcción de la plataforma base.

Ya está definida la arquitectura global y la estructura organizacional del monorepo.

El primer dominio a desarrollar es la autenticación.

---

# Fase 1: Foundation

## Objetivo

Crear toda la base técnica del proyecto.

## Entregables

### Monorepo

- Configuración PNPM Workspaces
- Configuración TypeScript base
- ESLint
- Prettier
- Husky
- Commitlint

### Docker

- docker-compose.dev
- docker-compose.prod

### Observabilidad

- Prometheus
- Grafana
- Loki
- Promtail

### CI/CD

- GitHub Actions
- CodeQL
- SonarCloud

### Shared Libraries

- Logger
- Exceptions
- Response Builders
- Validation
- Swagger
- Async Context

---

# Fase 2: API Gateway

## Objetivo

Crear el punto único de entrada del ecosistema.

## Responsabilidades

- Reverse Proxy
- JWT Validation
- Rate Limiting
- Request Tracing
- Health Checks
- Centralized Security
- API Versioning

---

# Fase 3: Auth Service

Primer microservicio de negocio.

## Lineamientos

- DDD
- Arquitectura Hexagonal
- CQRS cuando sea necesario
- Principios SOLID

## Funcionalidades

### Usuarios

- Registro
- Login
- Logout

### Seguridad

- JWT Access Token
- Refresh Token
- Rotación de tokens

### Autorización

- Roles
- Permissions
- RBAC

### Infraestructura

- PostgreSQL
- Redis
- Swagger
- Métricas Prometheus
- Logging estructurado

---

# Fase 4: User Service

## Objetivo

Separar la gestión de usuarios de la autenticación.

## Funcionalidades

- Perfil
- Preferencias
- Configuración
- Gestión administrativa

---

# Fase 5: Servicios Core

## Notification Service

- Email
- SMS
- Push Notifications

## File Service

- Upload
- Storage
- Versioning

## Billing Service

- Suscripciones
- Planes
- Facturación

## Audit Service

- Auditoría
- Trazabilidad
- Eventos de seguridad

---

# Fase 6: Arquitectura Event Driven

## Tecnologías candidatas

- RabbitMQ
- Kafka
- Redis Streams

## Objetivos

- Desacoplamiento
- Escalabilidad
- Resiliencia

---

# Fase 7: Cloud & Production

## Objetivos

- Kubernetes
- Helm
- Secrets Management
- Auto Scaling
- Disaster Recovery
- Multi Environment Deployments

---

# Reglas de Desarrollo

Todo el código debe:

- Estar en TypeScript.
- Utilizar NestJS.
- Tener documentación TSDoc.
- Seguir principios SOLID.
- Aplicar DDD cuando corresponda.
- Mantener separación estricta entre Domain, Application, Infrastructure y Presentation.
- Evitar soluciones rápidas o hacks.
- Priorizar mantenibilidad a largo plazo.
- Mantener estándares enterprise.

---

# Rol Esperado del Asistente

Cuando propongas soluciones, actúa como un arquitecto de software senior enfocado en sistemas empresariales escalables y mantenibles.

No propongas implementaciones simplificadas si existe una alternativa más robusta y profesional.
