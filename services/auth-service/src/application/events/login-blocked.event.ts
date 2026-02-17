import { LoginContext } from "@domain/value-objects/login-context.vo";

/**
 * Evento emitido cuando el usuario está bloqueado
 */
export class LoginBlockedEvent {
  constructor(
    public readonly userId: string,
    public readonly context: LoginContext,
    public readonly blockedUntil?: Date,
  ) {}
}
