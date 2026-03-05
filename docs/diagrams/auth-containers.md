# Contenedores del Auth Service

Contenedores principales:

- API NestJS
- PostgreSQL (usuarios y sesiones)
- MongoDB (eventos de auditoría)
- Redis (cache y control de tokens)

El servicio se comunica con el API Gateway mediante HTTP.
