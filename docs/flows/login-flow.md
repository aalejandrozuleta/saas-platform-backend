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
    A->>A: buscar usuario por email
    A->>Pol: evaluar políticas (lockout, intentos fallidos)
    Pol-->>A: OK / rechazo
    A->>A: validar contraseña (hash)
    alt credenciales inválidas
        A->>Bus: registrar intento fallido
        A-->>GW: 401 Unauthorized
        GW-->>U: 401 Unauthorized
    else credenciales válidas
        A->>Dev: validar o crear dispositivo
        A->>Sess: crear sesión
        A->>Redis: cachear sesión
        A->>A: generar refresh token
        A->>Bus: emit LoginSucceeded
        A-->>GW: 200 OK (access + refresh token)
        GW-->>U: 200 OK
    end
```

## Pasos

1. El usuario envía sus credenciales.
2. Se emite el evento `LoginAttempted`.
3. Se busca el usuario por email.
4. Se evalúan las políticas de login (lockout por intentos fallidos, etc.).
5. Se valida la contraseña.
6. Se gestionan intentos fallidos (si la contraseña es inválida, se corta el flujo aquí).
7. Se valida o crea el dispositivo.
8. Se crea una sesión.
9. Se genera un refresh token.
10. Se emite el evento `LoginSucceeded`.

Ver [../diagrams/auth-components.md](../diagrams/auth-components.md) para los componentes involucrados.
