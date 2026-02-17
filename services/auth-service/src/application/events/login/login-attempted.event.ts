import { LoginContext } from "@domain/value-objects/login-context.vo";

/**
 * Evento emitido cuando se intenta un login
 */
export class LoginAttemptedEvent {
  constructor(
    public readonly email: string,
    public readonly context: LoginContext,
  ) {}
}
