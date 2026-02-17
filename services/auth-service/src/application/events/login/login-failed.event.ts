import { LoginContext } from "@domain/value-objects/login-context.vo";

export class LoginFailedEvent {
  constructor(
    public readonly userId: string | null,
    public readonly context: LoginContext,
    public readonly reason: string,
  ) {}
}
