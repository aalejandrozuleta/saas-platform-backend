# Docker – Infraestructura SaaS Platform

Este directorio contiene TODA la infraestructura del entorno local y productivo.

Incluye reverse proxy, observabilidad, logging, dashboards y orquestación de servicios.

---

## Estructura

docker/
├── grafana/
│   └── provisioning/
│       ├── dashboards/
│       │   ├── auth-service.json
│       │   ├── saas-overview.json
│       │   └── dashboards.yml
│       └── datasources/
│           ├── loki.yml
│           └── prometheus.yml
│
├── loki/
│   └── loki.yml
│
├── nginx/
│   ├── nginx.conf
│   └── sites/
│       ├── default.conf
│       └── gateway.conf
│
├── prometheus/
│   └── prometheus.yml
│
├── promtail/
│   └── promtail.yml
│
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── .dockerignore
└── README.md

---

# docker-compose.dev.yml

Levanta el entorno completo de desarrollo:

- nginx (reverse proxy)
- api-gateway
- auth-service
- postgres
- redis
- mongo
- prometheus
- loki
- promtail
- grafana
- mailpit
- pgadmin
- redis-commander
- mongo-express

Arranque:

docker compose -f docker/docker-compose.dev.yml up --build

Apagar:

docker compose -f docker/docker-compose.dev.yml down

Reset completo:

docker compose -f docker/docker-compose.dev.yml down -v

---

# docker-compose.prod.yml

Versión productiva:

- sin mailpit
- sin commanders
- sin volúmenes de código
- usa imágenes ya construidas

Pensado para VPS / cloud.

---

# .dockerignore

Evita copiar basura al build:

- node_modules
- dist
- .git
- coverage

Reduce tamaño y acelera builds.

---

# NGINX

Ruta:

docker/nginx

nginx.conf:
Configuración global del proxy (workers, gzip, includes).

sites/default.conf:
Fallback server.

sites/gateway.conf:
Reverse proxy principal hacia api-gateway.

Flujo:

Browser → NGINX → API Gateway → Microservicios

---

# PROMETHEUS

Ruta:

docker/prometheus/prometheus.yml

Define targets y scrape intervals.

Recolecta métricas desde /metrics de:

- api-gateway
- auth-service

Acceso web:

http://localhost:9090

---

# LOKI

Ruta:

docker/loki/loki.yml

Backend de logs.

Recibe logs enviados por promtail.

No tiene UI propia.

---

# PROMTAIL

Ruta:

docker/promtail/promtail.yml

Agente recolector:

- lee stdout de Docker
- etiqueta contenedores
- envía logs a Loki

Pipeline:

Containers → Promtail → Loki → Grafana

---

# GRAFANA

Ruta:

docker/grafana

## provisioning/datasources

prometheus.yml:
Conecta Grafana con Prometheus.

loki.yml:
Conecta Grafana con Loki.

## provisioning/dashboards

auth-service.json:
Dashboard del microservicio auth (latencias, requests, errores).

saas-overview.json:
Vista general del sistema (CPU, RAM, tráfico, estado).

dashboards.yml:
Declara qué dashboards cargar al iniciar Grafana.

Grafana arranca con todo precargado.

Acceso:

http://localhost:3005

Usuario por defecto:
admin
admin

---

# MAILPIT

Servidor SMTP falso para desarrollo.

Todos los correos llegan aquí:

http://localhost:8025

---

# COMMANDERS / ADMIN UI

---

## PostgreSQL – PGAdmin

UI web para administrar auth-postgres.

Acceso:

http://localhost:5050  (si expones puerto)

Credenciales:

admin@local.dev
admin

Host interno al crear conexión:

auth-postgres
Puerto:
5432

---

## Redis – Redis Commander

UI web para Redis.

Acceso:

http://localhost:8081

Redis interno:

redis:6379

---

## MongoDB – Mongo Express

UI web para Mongo.

Acceso:

http://localhost:8082

Mongo interno:

mongo

---

# RED INTERNA

Todos los servicios están conectados a:

saas-dev

Comunicación usando nombres de servicio:

auth-service
api-gateway
redis
mongo
auth-postgres

Nunca usar localhost entre contenedores.

---

# VOLUMENES

Persistencia real:

auth-postgres-data
mongo-data

Listar:

docker volume ls

Eliminar:

docker volume rm docker_auth-postgres-data docker_mongo-data

---

# DESARROLLO

Solo se monta el código fuente:

services/auth-service/src
services/api-gateway/src

node_modules vive dentro del contenedor.

Hot reload activo con:

nest start --watch

---

# RESUMEN

Este directorio representa un mini cloud local:

- Reverse proxy
- Microservicios
- PostgreSQL + Redis + Mongo
- Métricas (Prometheus)
- Logs (Loki + Promtail)
- Dashboards (Grafana)
- Mail sandbox
- Admin UIs
- Dev y Prod separados

Infraestructura SaaS real.

Nada aquí es decorativo.

EOF
