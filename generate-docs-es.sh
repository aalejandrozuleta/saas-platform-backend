#!/usr/bin/env bash

set -e

echo "Creando estructura de documentación..."

mkdir -p docs/architecture
mkdir -p docs/diagrams
mkdir -p docs/flows

echo "Generando documentación de arquitectura..."

cat <<'EOF' > docs/architecture/system-overview.md
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
EOF

cat <<'EOF' > docs/architecture/auth-service.md
# Auth Service

El servicio de autenticación gestiona:

- registro de usuarios
- inicio de sesión
- gestión de dispositivos
- sesiones activas
- refresh tokens
- políticas de seguridad
- auditoría de eventos

## Capas arquitectónicas

El servicio sigue una arquitectura hexagonal dividida en:

### Domain

Contiene las reglas del negocio:

- entidades
- value objects
- repositorios
- políticas

### Application

Implementa los casos de uso:

- RegisterUserUseCase
- LoginUserUseCase

### Infrastructure

Se encarga de los detalles técnicos:

- persistencia con Prisma
- auditoría en MongoDB
- generación de tokens JWT
EOF

echo "Generando documentación de diagramas..."

cat <<'EOF' > docs/diagrams/system-context.md
# Diagrama de Contexto del Sistema

Actores:

- Usuario
- Administrador
- Servicios externos

Sistemas:

- API Gateway
- Auth Service
- Otros microservicios

El API Gateway actúa como punto único de entrada al sistema.
EOF

cat <<'EOF' > docs/diagrams/auth-containers.md
# Contenedores del Auth Service

Contenedores principales:

- API NestJS
- PostgreSQL (usuarios y sesiones)
- MongoDB (eventos de auditoría)
- Redis (cache y control de tokens)

El servicio se comunica con el API Gateway mediante HTTP.
EOF

cat <<'EOF' > docs/diagrams/auth-components.md
# Componentes del Auth Service

Componentes internos:

- Controllers
- Casos de uso
- Entidades de dominio
- Repositorios
- Políticas de seguridad
- Bus de eventos
EOF

echo "Generando documentación de flujos..."

cat <<'EOF' > docs/flows/register-flow.md
# Flujo de Registro de Usuario

1. El usuario envía email y contraseña
2. Se validan como Value Objects
3. Se verifica si el usuario ya existe
4. La contraseña se encripta
5. Se crea la entidad User
6. Se guarda el usuario en el repositorio
7. Se registra un evento de auditoría REGISTER_SUCCESS
EOF

cat <<'EOF' > docs/flows/login-flow.md
# Flujo de Inicio de Sesión

1. El usuario envía sus credenciales
2. Se emite el evento LoginAttempted
3. Se busca el usuario por email
4. Se evalúan las políticas de login
5. Se valida la contraseña
6. Se gestionan intentos fallidos
7. Se valida o crea el dispositivo
8. Se crea una sesión
9. Se genera un refresh token
10. Se emite el evento LoginSucceeded
EOF

echo "Documentación generada correctamente."
