# Auth Service

El servicio de autenticación gestiona:

- registro y verificación de email
- inicio de sesión (con step-up auth: nuevo dispositivo, dispositivo/país no confiable, 2FA)
- autenticación de dos factores (TOTP) y recovery codes
- recuperación y cambio de contraseña
- gestión de dispositivos y países confiables
- sesiones activas y su revocación
- refresh tokens
- políticas de seguridad (lockout progresivo, anti-enumeración)
- auditoría de eventos

## Capas arquitectónicas

El servicio sigue una arquitectura hexagonal dividida en:

### Domain

Contiene las reglas del negocio:

- entidades (`User`, `Session`, `Device`)
- value objects (`EmailVO`, `PasswordVO`, `LoginContext`, ...)
- repositorios (puertos)
- políticas (`LoginPolicy`)

### Application

Implementa los casos de uso, agrupados por área:

**Registro y sesión**

- `RegisterUserUseCase`
- `VerifyEmailUseCase` / `ResendVerificationUseCase`
- `LoginUserUseCase` — evalúa el `LoginPolicy` y, si corresponde, corta el login con el error de dominio `SECURITY_CHALLENGE_REQUIRED` en vez de emitir tokens directamente
- `VerifyLoginChallengeUseCase` — resuelve el challenge (TOTP o recovery code) y completa el login
- `RefreshTokenUseCase`, `LogoutUseCase`, `LogoutAllUseCase`
- `GetSessionsUseCase`, `RevokeSessionUseCase`

**Contraseña**

- `ChangePasswordUseCase` (usuario autenticado)
- `ForgotPasswordUseCase` — genera token de reset con TTL, respuesta silenciosa si el email no existe (anti-enumeración)
- `ResetPasswordUseCase` — consume el token, revoca todas las sesiones/refresh tokens/cache activos

**2FA y recovery codes**

- `Enable2faUseCase` — genera secreto TOTP pendiente (2FA aún no activo)
- `Verify2faUseCase` — confirma el TOTP, activa 2FA y devuelve el lote inicial de recovery codes (texto plano, una sola vez)
- `Disable2faUseCase`
- `RegenerateRecoveryCodesUseCase` — requiere contraseña + TOTP vigente; invalida el lote anterior

**Dispositivos y países confiables**

- `AddTrustedCountryUseCase` / `RemoveTrustedCountryUseCase` / `GetTrustedCountriesUseCase`

**Perfil de usuario**

- `CreateUserProfileUseCase` — "paso 2" del registro: nombre, teléfono, documento (CC/CE/Pasaporte), requiere haber aceptado tratamiento de datos (Ley 1581 de 2012) y términos y condiciones.
- `GetUserProfileUseCase` / `UpdateUserProfileUseCase`
- `UploadProfileImageUseCase` — valida y re-codifica la imagen desde sus bytes reales (no confía en el `Content-Type` declarado por el cliente, para descartar polyglots) antes de subirla al storage tipo S3 (MinIO en dev, S3/R2 en prod).

`UserProfile` es una entidad de dominio separada de `User`: `User` guarda
credenciales/seguridad, `UserProfile` guarda datos de exhibición/contacto.
Vive en `auth-service` por ser identidad general, no específica de ningún rol.

Los casos de uso no conocen detalles de infraestructura (Prisma, Redis): solo dependen de los puertos que el dominio define, inyectados vía tokens (`USER_REPOSITORY`, `SESSION_CACHE`, `TOTP_SERVICE`, etc.).

### Infrastructure

Se encarga de los detalles técnicos:

- persistencia con Prisma (PostgreSQL)
- auditoría en MongoDB
- generación/verificación de tokens JWT y de challenge tokens de corta duración
- `AuthController` — expone `/auth/v1/*` (ver rutas abajo)

## Rutas principales (`AuthController`)

| Método          | Ruta                                     | Descripción                                                      |
| --------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| POST            | `/auth/v1/register`                      | Registro de usuario                                              |
| POST            | `/auth/v1/verify-email`                  | Confirma el email con el token enviado                           |
| POST            | `/auth/v1/forgot-password`               | Solicita recuperación de contraseña                              |
| POST            | `/auth/v1/reset-password`                | Completa la recuperación con el token                            |
| POST            | `/auth/v1/login`                         | Login — puede devolver tokens o un `SECURITY_CHALLENGE_REQUIRED` |
| POST            | `/auth/v1/login/verify-2fa`              | Resuelve el challenge (TOTP o recovery code)                     |
| POST            | `/auth/v1/change-password`               | Cambio de contraseña (usuario autenticado)                       |
| POST            | `/auth/v1/2fa/enable`                    | Inicia activación de 2FA (requiere contraseña)                   |
| POST            | `/auth/v1/2fa/verify`                    | Confirma el TOTP y activa 2FA                                    |
| POST            | `/auth/v1/2fa/disable`                   | Desactiva 2FA                                                    |
| POST            | `/auth/v1/2fa/recovery-codes/regenerate` | Regenera recovery codes                                          |
| GET/POST/DELETE | `/auth/v1/trusted-countries`             | Lista, agrega o elimina países confiables                        |

## Rutas de perfil (`UserProfileController`)

| Método | Ruta                               | Descripción                               |
| ------ | ---------------------------------- | ----------------------------------------- |
| POST   | `/auth/v1/users/me/profile`        | Crea el perfil (paso 2 del registro)      |
| GET    | `/auth/v1/users/me/profile`        | Obtiene el perfil del usuario autenticado |
| PATCH  | `/auth/v1/users/me/profile`        | Actualiza el perfil                       |
| POST   | `/auth/v1/users/me/profile/avatar` | Sube/reemplaza la foto de perfil          |

Ver [../flows/login-flow.md](../flows/login-flow.md) y [../flows/two-factor-and-recovery-flow.md](../flows/two-factor-and-recovery-flow.md) para el detalle secuencial de estos flujos.
