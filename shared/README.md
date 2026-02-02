Este paquete contiene **infraestructura transversal** reutilizable por todos los microservicios del monorepo.

---

## 🎯 Propósito

- Evitar duplicación de código técnico
- Centralizar decisiones de infraestructura
- Mantener consistencia entre servicios
- Facilitar escalabilidad del sistema

---

## 🚫 Qué NO es shared

❌ No contiene lógica de negocio  
❌ No contiene entidades de dominio  
❌ No contiene casos de uso  
❌ No depende de ningún microservicio  

Si algo pertenece a un dominio, **no va aquí**.

---

## 📦 Qué contiene

- Logging centralizado (Pino)
- Manejo de errores base
- Contexto de request (AsyncLocalStorage)
- Validación transversal
- Configuración base de Swagger
- Decoradores genéricos
- Utilidades puras

---

## 📁 Estructura

```txt
shared/
├── context/        # Contexto por request
├── decorators/     # Decoradores reutilizables
├── errors/         # Excepciones base
├── filters/        # Filtros globales
├── http/           # Contratos HTTP
├── logger/         # Logging estructurado
├── response/       # Respuestas estándar
├── swagger/        # Swagger base
├── utils/          # Utilidades puras
├── validation/     # Validación transversal
├── package.json
├── tsconfig.json
└── README.md
