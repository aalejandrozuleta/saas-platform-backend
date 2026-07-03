import { type LoginContext } from '@domain/value-objects/login-context.vo';

/**
 * Evento de dominio emitido cuando un intento de login falla
 * (credenciales inválidas, usuario inexistente, 2FA incorrecto, etc.)
 *
 * @remarks
 * `userId` puede ser `null` y `email` puede ser `undefined` cuando el
 * usuario no existe, para no filtrar información sobre qué credencial
 * fue la incorrecta. `AuthActivityListener` consume este evento para
 * registrar auditoría de login.
 */
export class LoginFailedEvent {
  constructor(
    public readonly userId: string | null,
    public readonly email: string | undefined,
    public readonly context: LoginContext,
    public readonly reason: string,
  ) {}
}
