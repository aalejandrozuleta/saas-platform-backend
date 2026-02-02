# 🐳 Docker – Infraestructura de Desarrollo (DEV)

Este directorio contiene **toda la infraestructura Docker** necesaria para levantar el entorno de desarrollo de la plataforma **SaaS**, incluyendo:

- API Gateway
- Auth Service
- Bases de datos
- Cache
- Observabilidad (métricas + logs)
- Reverse proxy (Nginx)
- Admin UIs
- Mail catcher (DEV)

👉 **No se requiere configuración del sistema** (`/etc/hosts`, DNS, etc.).

---

## 📁 Estructura del directorio

docker/
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── .dockerignore
│
├── nginx/
│   ├── nginx.conf
│   └── sites/
│       └── default.conf
│
├── prometheus/
│   └── prometheus.yml
│
├── grafana/
│   └── provisioning/
│       ├── datasources/
│       │   ├── prometheus.yml
│       │   └── loki.yml
│       └── dashboards/
│           ├── dashboards.yml
│           ├── saas-overview.json
│           └── auth-service.json
│
├── loki/
│   └── loki.yml
│
├── promtail/
│   └── promtail.yml
│
└── README.md

---

## 🧠 Arquitectura (resumen)

Browser
  ↓
NGINX (localhost)
  ↓
/api    → API Gateway
/auth   → Auth Service
/admin  → Admin UIs

Infraestructura compartida:

- PostgreSQL (Auth)
- Redis (cache / rate-limit)
- MongoDB (incidencias / auditoría)
- Prometheus (métricas)
- Grafana (dashboards)
- Loki (logs)
- Promtail (shipper de logs)
- Mailpit (SMTP fake DEV)

---

## 🚀 Cómo levantar el entorno (DEV)

Desde la raíz del proyecto:

docker compose -f docker/docker-compose.dev.yml up --build

En segundo plano:

docker compose -f docker/docker-compose.dev.yml up -d --build

Ver contenedores:

docker compose -f docker/docker-compose.dev.yml ps

Ver logs de un servicio:

docker compose -f docker/docker-compose.dev.yml logs -f api-gateway

Parar todo:

docker compose -f docker/docker-compose.dev.yml down

---

## 🌐 URLs disponibles en DEV

API Gateway:
http://localhost/api

Auth Service:
http://localhost/auth

Grafana:
http://localhost/admin/grafana

Prometheus:
http://localhost:9090

Mailpit:
http://localhost:8025

---

## 📊 Observabilidad

### Métricas
- Prometheus scrapea /metrics
- Grafana carga dashboards automáticamente

### Logs
- Pino → stdout
- Promtail → Loki
- Grafana → Explore (logs por service y requestId)

---

## 🧪 Bases de datos (DEV)

PostgreSQL (Auth):
HOST=auth-postgres
PORT=5432
DB=auth_db
USER=auth_user
PASS=auth_pass

Redis:
HOST=redis
PORT=6379

MongoDB:
HOST=mongo
PORT=27017

---

## 📬 Correos (DEV)

Mailpit se usa como SMTP fake.

Configuración típica:

SMTP_HOST=mailpit
SMTP_PORT=1025
SMTP_SECURE=false

UI:
http://localhost:8025

---

## 🔐 Buenas prácticas aplicadas

- Node 24 en contenedores
- PNPM workspaces
- Sin volúmenes de node_modules
- Un DB por microservicio
- Infra desacoplada
- Observabilidad desde el día 1
- DEV ≈ PROD (arquitecturalmente)

---

## 🛑 Errores comunes (evitados)

- docker-compose up (legacy)
- localhost entre contenedores
- montar node_modules
- editar /etc/hosts
- logs sin requestId

---

## 🔄 Flujo típico de trabajo

docker compose -f docker/docker-compose.dev.yml up -d
pnpm dev
open http://localhost/admin/grafana

---

## 🧭 Roadmap

- Docker PROD
- TLS + hardening Nginx
- Alertas Prometheus
- CI/CD
- Runbook de incidentes

---

## ✅ Estado del stack

Arquitectura:   OK
Observabilidad: OK
Escalabilidad:  OK
Nivel técnico:  Senior / Lead
EOF
