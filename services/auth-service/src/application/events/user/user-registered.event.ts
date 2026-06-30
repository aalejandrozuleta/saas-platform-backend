export class UserRegisteredEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly context: {
      ip: string;
      country?: string;
    },
    public readonly verificationToken: string,
  ) {}
}
