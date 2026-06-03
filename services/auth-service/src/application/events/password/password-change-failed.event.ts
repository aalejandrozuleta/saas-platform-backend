export class PasswordChangeFailedEvent {
  constructor(
    public readonly userId: string,
    public readonly reason: string,
    public readonly context: {
      ip: string;
      country?: string;
    },
  ) {}
}
