# Visión General del Sistema

Esta plataforma SaaS sigue una **arquitectura de microservicios** utilizando **NestJS**, **DDD (Domain Driven Design)** y **Arquitectura Hexagonal**.

## Principios principales

- Domain Driven Design
- Arquitectura Hexagonal
- Aislamiento de microservicios
- Procesos orientados a eventos
- Observabilidad fuerte

## Servicios principales

- api-gateway
- auth-service
- tenant-service
- order-service
- payment-service
- notification-service

El sistema utiliza PostgreSQL, MongoDB, Redis y una infraestructura basada en eventos.
