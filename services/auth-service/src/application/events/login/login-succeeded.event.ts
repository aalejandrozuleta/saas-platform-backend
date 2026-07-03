import { type LoginContext } from '@domain/value-objects/login-context.vo';

/**
 * Evento de dominio emitido cuando un login se completa exitosamente.
 *
 * @remarks
 * Consumido por `AuthActivityListener` (auditoría de login) y por
 * `LoginLoggingListener` (log técnico con `userId`, `ip` y `sessionId`).
 */
export class LoginSucceededEvent {
  constructor(
    public readonly userId: string,
    public readonly context: LoginContext,
    public readonly sessionId: string,
  ) {}
}
