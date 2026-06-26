export class TwoFactorEnabledEvent {
  constructor(
    public readonly userId: string,
    public readonly context: { ip: string; country?: string },
  ) {}
}
