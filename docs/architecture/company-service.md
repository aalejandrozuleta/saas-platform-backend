# Company Service

Dueño del dominio de **tenant** (`Company`) y de la membresía de trabajadores
(`CompanyMembership`) dentro de una empresa. `auth-service` sigue siendo el
único dueño de la identidad (`User`) — este servicio nunca crea cuentas,
solo referencia usuarios que ya existen ahí.

## Responsabilidades

- Crear una empresa (tenant), con perfil de operación completo — quien la crea queda como `OWNER`/`ACTIVE`.
- Consultar una empresa.
- Subir/reemplazar el logo de la empresa.
- Invitar a un usuario **ya registrado** en auth-service a una empresa, por email.
- Listar y actualizar (rol/estado) los miembros de una empresa.

Fuera de alcance por ahora (ver [[project_saas_entities]] en memoria del
proyecto): `Producto`, `Compra`, `Factura`, `FieldDefinition` (custom fields).

## Capas

Arquitectura hexagonal, igual que `auth-service`:

- **`infrastructure/controllers/`** — `CompanyController` (`POST /companies`, `GET /companies/:id`, `POST /companies/:id/logo`), `CompanyMembershipController` (`POST/GET /companies/:id/members`, `PATCH /companies/:id/members/:membershipId`).
- **`infrastructure/persistence/prisma/`** — única persistencia relacional del servicio (PostgreSQL, `company-postgres`, instancia dedicada). Sin MongoDB/Redis todavía — no hay audit log ni cache.
- **`infrastructure/storage/`** — `S3ImageStorageService` + `SharpImageProcessorService`, mismo patrón que el avatar de usuario en auth-service (bucket propio en la misma instancia de MinIO — ver "Logo de la empresa" abajo).
- **`infrastructure/security/jwt-auth.guard.ts`** — verifica la cookie `accessToken` **localmente**, con el mismo `JWT_ACCESS_SECRET` que auth-service (mismo issuer/audience). Defensa en profundidad: el gateway ya valida la sesión antes de reenviar.
- **`infrastructure/http/auth-service.client.ts`** — cliente HTTP saliente hacia auth-service (ver "Comunicación con auth-service" abajo).

## Perfil de la empresa

`Company` guarda datos de operación reales, no solo el nombre — confirmado
2026-08-14 porque una empresa necesita esta información para facturar y
para que el resto de la plataforma la muestre correctamente:

- **Obligatorios en `POST /v1/companies`**: `email` (contacto de la
  empresa, no del `OWNER`), `phone`, `address`, `city`. `country` es
  opcional con default `'CO'` dado el contexto del proyecto.
- **`taxId`** sigue opcional (ya existía) — no todas las empresas facturan desde el día uno.
- **`logoUrl`** nunca se acepta en el create — se sube después vía su
  propio endpoint (mismo criterio "progresivo" que el avatar de usuario en
  auth-service: subir un archivo no encaja en un POST JSON).

### Logo de la empresa

`POST /v1/companies/:id/logo` (multipart, campo `file`, máx. 5MB,
PNG/JPEG/WEBP) — solo `OWNER`/`MANAGER` de esa empresa pueden subirlo
(`403 FORBIDDEN` si no). Reutiliza la misma instancia de MinIO que
auth-service usa para avatares, en un bucket separado `company-logos`
(`STORAGE_*` env vars propias de company-service, mismas credenciales).
`SharpImageProcessorService` re-decodifica/re-codifica la imagen a WebP
(nunca confía en el `mimetype` reportado por el cliente) con
`fit: 'contain'` — a diferencia del avatar (`fit: 'cover'`), un logo no
debe recortarse.

## Reglas de dominio relevantes

- `Company` no tiene campo `ownerId`: el dueño se deriva consultando `CompanyMembership` con `role=OWNER`, para evitar un campo denormalizado que se desincronice.
- Un `OWNER` no puede degradarse/removerse a sí mismo si es el único `OWNER` de la empresa (`lastOwnerCannotBeDemoted`, 409).
- Invitar requiere que el email pertenezca a un usuario **ya existente** — company-service nunca provisiona cuentas.

## Comunicación con auth-service

Al invitar a un miembro (`InviteMemberUseCase`), company-service llama a un
endpoint interno de auth-service para resolver el `userId` a partir del
email:

```
GET {AUTH_SERVICE_URL}/auth/v1/users/lookup?email=...
Header: x-internal-api-key: INTERNAL_SERVICE_SECRET
```

Mismo patrón de secreto compartido que ya usa
`notification-service`↔`auth-service` (`InternalServiceGuard`). Un 404 del
lookup se traduce a `USER_NOT_FOUND`; cualquier otro fallo (timeout, 5xx) se
traduce a un 503 de dominio (`authServiceUnavailable`) sin filtrar detalles
internos de auth-service. Ver [../flows/service-communication.md](../flows/service-communication.md).

## Consumidores

- **API Gateway** — `CompanyProxy` reenvía `/v1/companies/*` con el mismo patrón de circuit breaker que `AuthProxy`/`ConfigProxy`.

Ver [../diagrams/company-service-containers.md](../diagrams/company-service-containers.md).
