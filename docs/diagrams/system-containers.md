# Diagrama de Contenedores del Sistema

```mermaid
flowchart TB
    client([Cliente / Browser])

    subgraph edge["Edge"]
        nginx["NGINX<br/>reverse proxy"]
    end

    subgraph platform["SaaS Platform"]
        gateway["API Gateway<br/>:3000"]
        auth["Auth Service<br/>:3001"]
        config["Config Service<br/>:3002"]
        notif["Notification Service<br/>:3003"]
        company["Company Service<br/>:3004"]
    end

    subgraph data["Persistencia"]
        authpg[("PostgreSQL<br/>auth-postgres")]
        configpg[("PostgreSQL<br/>config-postgres")]
        companypg[("PostgreSQL<br/>company-postgres")]
        mongo[("MongoDB<br/>auditoría")]
        redis[("Redis<br/>cache + sesiones + colas BullMQ")]
    end

    subgraph obs["Observabilidad"]
        prometheus["Prometheus"]
        loki["Loki + Promtail"]
        grafana["Grafana"]
    end

    resend["Resend API<br/>(externo)"]

    client --> nginx --> gateway
    gateway -->|"HTTP resiliente<br/>(circuit breaker)"| auth
    gateway -->|"HTTP resiliente<br/>(circuit breaker)"| config
    gateway -->|"HTTP resiliente<br/>(circuit breaker)"| company
    gateway -.->|"cache modo mantenimiento<br/>TTL 30s"| redis
    auth --> authpg
    auth --> mongo
    auth --> redis
    config --> configpg
    company --> companypg
    company -->|"HTTP: lookup por email<br/>x-internal-api-key"| auth
    auth -->|"HTTP: encola email<br/>(bienvenida, OTP, alertas)"| notif
    notif -->|"BullMQ jobs"| redis
    notif --> resend

    gateway -.-> prometheus
    auth -.-> prometheus
    config -.-> prometheus
    notif -.-> prometheus
    company -.-> prometheus
    prometheus --> grafana
    loki --> grafana
```

## Contenedores por servicio

| Servicio             | Puerto | Base de datos                                      | Cache/colas                                                   |
| -------------------- | ------ | -------------------------------------------------- | ------------------------------------------------------------- |
| api-gateway          | 3000   | —                                                  | Redis (cache de estado de mantenimiento)                      |
| auth-service         | 3001   | PostgreSQL (`auth-postgres`) + MongoDB (auditoría) | Redis (sesiones, revocación de tokens)                        |
| config-service       | 3002   | PostgreSQL (`config-postgres`)                     | —                                                             |
| notification-service | 3003   | —                                                  | Redis (colas BullMQ: `notification.email`, `notification.ws`) |
| company-service      | 3004   | PostgreSQL (`company-postgres`)                    | —                                                             |

Cada servicio es independientemente desplegable (`Dockerfile.dev` / `Dockerfile.prod` propios) y se orquesta en desarrollo con [docker/docker-compose.dev.yml](../../docker/docker-compose.dev.yml).

Ver también:

- [auth-containers.md](auth-containers.md) — detalle interno de auth-service
- [config-service-containers.md](config-service-containers.md) — detalle interno de config-service
- [notification-service-containers.md](notification-service-containers.md) — detalle interno de notification-service
- [company-service-containers.md](company-service-containers.md) — detalle interno de company-service
- [../flows/service-communication.md](../flows/service-communication.md) — cómo se comunican entre sí (HTTP resiliente, colas, cache)
