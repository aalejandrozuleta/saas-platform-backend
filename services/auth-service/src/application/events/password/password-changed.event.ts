export class PasswordChangedEvent {
  constructor(
    public readonly userId: string,
    public readonly context: {
      ip: string;
      country?: string;
    },
  ) {}
}
