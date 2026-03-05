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
