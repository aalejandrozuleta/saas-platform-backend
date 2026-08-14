# Flujo de Inicio de Sesión

```mermaid
sequenceDiagram
    actor U as Usuario
    participant GW as API Gateway
    participant A as Auth Service
    participant Pol as Políticas de login
    participant Dev as Device
    participant Sess as Session
    participant Redis
    participant Bus as DomainEventBus

    U->>GW: POST /auth/v1/login
    GW->>A: forward (circuit breaker)
    A->>Bus: emit LoginAttempted
    A->>A: buscar usuario por email (hash dummy si no existe, anti-timing)
    A->>Pol: evaluar políticas (lockout progresivo 5→15→30→60 min)
    Pol-->>A: OK / rechazo
    A->>A: validar contraseña (hash)
    alt credenciales inválidas
        A->>Bus: registrar intento fallido
        A-->>GW: 401 Unauthorized
        GW-->>U: 401 Unauthorized
    else credenciales válidas
        A->>A: evaluar step-up auth<br/>(2FA activo / dispositivo nuevo o no confiable / país no confiable)
        alt requiere verificación adicional
            A->>A: generar challengeToken (corta duración)
            A->>Bus: emit LoginBlocked
            A-->>GW: 200 OK — SECURITY_CHALLENGE_REQUIRED<br/>(reason, availableMethods, challengeToken)
            GW-->>U: 200 OK — challenge
            Note over U,A: ver two-factor-and-recovery-flow.md<br/>para POST /auth/v1/login/verify-2fa
        else login directo
            A->>Dev: validar o crear dispositivo
            A->>Sess: crear sesión
            A->>Redis: cachear sesión
            A->>A: generar refresh token
            A->>Bus: emit LoginSucceeded
            A-->>GW: 200 OK (access + refresh token)
            GW-->>U: 200 OK
        end
    end
```

## Pasos

1. El usuario envía sus credenciales.
2. Se emite el evento `LoginAttempted`.
3. Se busca el usuario por email (con hash dummy si no existe, para no filtrar por timing si la cuenta existe).
4. Se evalúan las políticas de login (lockout progresivo por intentos fallidos).
5. Se valida la contraseña.
6. Se gestionan intentos fallidos (si la contraseña es inválida, se corta el flujo aquí).
7. Se evalúa si el intento requiere step-up auth (`LoginChallengeReason`): `TWO_FACTOR_REQUIRED`, `NEW_DEVICE`, `UNTRUSTED_DEVICE` o `UNTRUSTED_COUNTRY`.
8. Si requiere verificación adicional, se corta el login con el error de dominio `SECURITY_CHALLENGE_REQUIRED` — la respuesta incluye `availableMethods` (TOTP, recovery code, ...) y un `challengeToken` de un solo uso para completar el login sin repetir la contraseña. Ver [two-factor-and-recovery-flow.md](two-factor-and-recovery-flow.md).
9. Si no requiere verificación adicional: se valida o crea el dispositivo, se crea una sesión, se cachea en Redis y se genera un refresh token.
10. Se emite el evento `LoginSucceeded`.

Ver [../diagrams/auth-components.md](../diagrams/auth-components.md) para los componentes involucrados.
