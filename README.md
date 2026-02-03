# 🏗 SaaS Platform — Arquitectura General

Este repositorio implementa una plataforma SaaS moderna basada en microservicios, organizada como monorepo con PNPM, observabilidad completa y pipelines CI/CD.

---

## 🎯 Objetivo

- Desarrollo local reproducible con Docker  
- Microservicios desplegables de forma independiente  
- Gateway centralizado  
- Observabilidad (logs + métricas + dashboards)  
- Calidad de código automatizada  
- Arquitectura limpia (DDD / Hexagonal)

---

## 📦 Estructura principal

```
saas-platform/
├── .github/
├── docker/
├── scripts/
├── services/
├── shared/
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

---

## 1. CI/CD (.github)

Workflows automatizados:

- CI (lint, test, build)
- CodeQL (seguridad)
- SonarCloud (calidad)

Incluye CODEOWNERS para control de revisiones.

---

## 2. Husky

Git hooks:

- pre-commit
- pre-push
- commit-msg

Evita commits rotos y asegura calidad mínima local.

---

## 3. Docker (Infraestructura)

```
docker/
├── nginx/
├── prometheus/
├── grafana/
├── loki/
├── promtail/
├── docker-compose.dev.yml
└── docker-compose.prod.yml
```

### Componentes

NGINX:
- Reverse proxy
- Punto único de entrada
- Routing hacia API Gateway

Prometheus:
- Recolección de métricas

Grafana:
- Dashboards
- Logs
- Métricas

Loki + Promtail:
- Centralización de logs

---

## 4. Scripts

Automatización:

- build-all.sh
- dev.sh
- lint.sh
- test.sh

---

## 5. Servicios

```
services/
├── api-gateway/
└── auth-service/
```

Cada servicio contiene:

- Dockerfile.dev / Dockerfile.prod
- .env
- package.json
- tsconfig
- README

### API Gateway

Responsable de:

- Punto de entrada
- Seguridad
- Rate limiting
- Proxy interno
- Health checks

### Auth Service

Servicio de autenticación:

- Arquitectura hexagonal
- DDD
- Casos de uso
- Métricas
- Persistencia
- Cache

---

## 6. Shared

Librería común:

- Logger
- Excepciones
- Validaciones
- Swagger
- Builders de respuesta
- Contexto async

---

## 7. Monorepo Root

- PNPM workspaces
- ESLint
- Prettier
- TS base

---

## 🧠 Flujo general

Cliente → NGINX → API Gateway → Servicios

Logs:
Servicios → Promtail → Loki → Grafana

Métricas:
Servicios → Prometheus → Grafana

---

Arquitectura preparada para:

- Escalamiento horizontal
- Despliegue independiente
- Observabilidad completa
- Seguridad avanzada
