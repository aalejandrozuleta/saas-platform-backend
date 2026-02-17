import { LoginContext } from "@domain/value-objects/login-context.vo";

export class LoginSucceededEvent {
  constructor(
    public readonly userId: string,
    public readonly context: LoginContext,
    public readonly sessionId: string,
  ) {}
}
