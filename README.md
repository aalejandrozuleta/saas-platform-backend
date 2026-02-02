# SaaS Platform Backend

Backend profesional para una plataforma SaaS basada en **microservicios**, diseñado con **arquitectura hexagonal**, **monorepo**, y **estándares enterprise**.

Este proyecto está pensado como **portafolio técnico**, demostrando buenas prácticas reales usadas en entornos de producción.

---

## 📊 Estado del proyecto

![CI](https://github.com/aalejandrozuleta/saas-platform-backend/actions/workflows/ci.yml/badge.svg)
[![Quality Gate Status](https://sonarcloud.io/project/overview?id=aalejandrozuleta_saas-platform-backend)]
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=aalejandrozuleta_saas-platform-backend&metric=bugs)](https://sonarcloud.io/summary/new_code?id=aalejandrozuleta_saas-platform-backend)
![CodeQL](https://github.com/aalejandrozuleta/saas-platform-backend/actions/workflows/codeql.yml/badge.svg)
![Node.js](https://img.shields.io/badge/node-24.x-brightgreen)

---

## 🧱 Arquitectura

- **Monorepo con pnpm workspaces**
- **Microservicios desacoplados**
- **Arquitectura hexagonal (clean architecture)**
- **Infraestructura transversal compartida**
- **CI/CD con GitHub Actions**
- **Análisis de calidad y seguridad automatizado**

---

## 📁 Estructura general

```txt
saas-platform/
├── docker/               # Docker y docker-compose
├── scripts/              # Scripts de automatización
├── services/             # Microservicios
│   └── auth-service/     # Servicio de autenticación
├── shared/               # Infraestructura transversal
├── tsconfig.base.json    # Configuración TS base
└── README.md
