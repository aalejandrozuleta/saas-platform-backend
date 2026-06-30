export class VerificationEmailRequestedEvent {
  constructor(
    public readonly email: string,
    public readonly verificationToken: string,
  ) {}
}
