# Visión General del Sistema

Esta plataforma SaaS sigue una **arquitectura de microservicios** utilizando **NestJS**, **DDD (Domain Driven Design)** y **Arquitectura Hexagonal**.

## Principios principales

- Domain Driven Design
- Arquitectura Hexagonal
- Aislamiento de microservicios
- Procesos orientados a eventos
- Observabilidad fuerte

## Servicios principales (implementados)

- **api-gateway** — punto único de entrada, proxy resiliente, validación JWT, rate limiting.
- **auth-service** — registro, login, sesiones, 2FA, tokens.
- **config-service** — feature flags, modo mantenimiento, políticas de contraseña, reglas de IP, rate limits.
- **notification-service** — envío de emails (Resend) y notificaciones WebSocket vía colas BullMQ.
- **shared** — librería común (logger, excepciones, validación, Swagger, métricas, contexto async).

> Los servicios `tenant-service`, `order-service` y `payment-service` mencionados en versiones anteriores de este documento **no están implementados**. Forman parte del roadmap a futuro — ver [README-SaaS-Platform.md](../../README-SaaS-Platform.md) (Fase 4 en adelante).

El sistema utiliza PostgreSQL (Prisma), MongoDB (auditoría), Redis (cache/sesiones/colas) y BullMQ como mecanismo de procesamiento asíncrono orientado a eventos.

## Comunicación entre servicios

Ver [docs/flows/service-communication.md](../flows/service-communication.md) para el detalle de cómo se comunican los servicios (HTTP resiliente, colas, eventos de dominio, cache).
