# Flujo de 2FA, Recovery Codes y Recuperación de Contraseña

## Activación de 2FA (TOTP)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant GW as API Gateway
    participant A as Auth Service
    participant Bus as DomainEventBus

    U->>GW: POST /auth/v1/2fa/enable (password)
    GW->>A: forward
    A->>A: validar contraseña actual
    A->>A: generar secreto TOTP (pendiente, 2FA aún NO activo)
    A->>Bus: emit TwoFactorEnabled
    A-->>GW: 200 OK (secret, QR/otpauth URI)
    GW-->>U: 200 OK

    U->>GW: POST /auth/v1/2fa/verify (totpCode)
    GW->>A: forward
    A->>A: verificar TOTP contra secreto pendiente
    A->>A: activar 2FA
    A->>A: generar y hashear lote de recovery codes
    A->>Bus: emit TwoFactorVerified
    A-->>GW: 200 OK (recoveryCodes en texto plano — una sola vez)
    GW-->>U: 200 OK
```

- El secreto TOTP queda en estado "pendiente" hasta confirmarse con `2fa/verify`; 2FA no se activa solo con `2fa/enable`.
- Los recovery codes se devuelven en texto plano **una única vez**, en la respuesta de `2fa/verify` (y de `2fa/recovery-codes/regenerate`). El backend solo guarda sus hashes.

## Login con 2FA activo (resolución del challenge)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant GW as API Gateway
    participant A as Auth Service
    participant Sess as Session

    U->>GW: POST /auth/v1/login
    GW->>A: forward
    A-->>GW: 200 OK — SECURITY_CHALLENGE_REQUIRED (reason=TWO_FACTOR_REQUIRED, challengeToken)
    GW-->>U: 200 OK — challenge

    U->>GW: POST /auth/v1/login/verify-2fa (challengeToken, totpCode | recoveryCode)
    GW->>A: forward
    A->>A: verificar challengeToken (userId, deviceFingerprint, country)
    A->>A: verificar EXACTAMENTE un factor (TOTP xor recovery code)
    A->>A: marcar dispositivo y país como confiables<br/>(superar el challenge es prueba suficiente)
    A->>Sess: crear sesión + refresh token (igual que login directo)
    A-->>GW: 200 OK (access + refresh token)
    GW-->>U: 200 OK
```

- `VerifyLoginChallengeUseCase` acepta un TOTP **o** un recovery code, nunca ambos a la vez.
- Un recovery code es de un solo uso: se invalida al consumirse.
- Al superar el challenge, el dispositivo/fingerprint y el país quedan marcados como confiables — logins futuros desde ese mismo origen no repiten el challenge por esa razón (aunque sí lo repetirán mientras 2FA siga activo, ya que `TWO_FACTOR_REQUIRED` no se "recuerda").

## Desactivar 2FA / regenerar recovery codes

- `POST /auth/v1/2fa/disable` y `POST /auth/v1/2fa/recovery-codes/regenerate` exigen **contraseña + TOTP vigente** (no basta con estar autenticado), ya que son operaciones que reducen o rotan la superficie de recuperación de la cuenta.
- Regenerar invalida completamente el lote anterior de recovery codes.

## Recuperación de contraseña (forgot / reset)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant GW as API Gateway
    participant A as Auth Service
    participant Notif as Notification Service
    participant Bus as DomainEventBus

    U->>GW: POST /auth/v1/forgot-password (email)
    GW->>A: forward
    A->>A: buscar usuario por email
    alt usuario no existe
        A-->>GW: 200 OK (respuesta silenciosa, anti-enumeración)
    else usuario existe
        A->>A: generar token de reset (TTL configurable), invalidar token anterior
        A->>Bus: emit PasswordResetRequested
        Bus->>Notif: encolar email con enlace de recuperación
        A-->>GW: 200 OK
    end
    GW-->>U: 200 OK (mismo response en ambos casos)

    U->>GW: POST /auth/v1/reset-password (token, newPassword)
    GW->>A: forward
    A->>A: validar token (existe y no expiró)
    A->>A: validar fortaleza y que sea distinta de la actual
    A->>A: actualizar hash de contraseña
    A->>A: consumir token (un solo uso)
    A->>A: revocar TODAS las sesiones + refresh tokens + cache Redis
    A->>Bus: emit PasswordChanged
    Bus->>Notif: encolar alerta de seguridad por email
    A-->>GW: 200 OK
    GW-->>U: 200 OK
```

- `forgot-password` responde igual exista o no el email, para no revelar qué cuentas están registradas.
- `reset-password` reutiliza el mismo evento `PasswordChangedEvent` que `change-password` (mismo hecho de negocio desde la perspectiva de auditoría), y revoca todas las sesiones activas como medida de contención si el reset se debió a una cuenta comprometida.

Ver [../architecture/auth-service.md](../architecture/auth-service.md) para la lista completa de casos de uso y rutas, y [login-flow.md](login-flow.md) para el flujo de login base.
