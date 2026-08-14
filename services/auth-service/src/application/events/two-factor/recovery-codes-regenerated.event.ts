/**
 * Evento de dominio emitido cuando un usuario regenera su lote de
 * recovery codes de 2FA (el lote anterior queda invalidado).
 *
 * @remarks
 * Consumido por `TwoFactorListener` (auditoría) y por
 * `NotificationListener`, que envía una alerta de seguridad al usuario.
 */
export class RecoveryCodesRegeneratedEvent {
  constructor(
    public readonly userId: string,
    public readonly context: { ip: string; country?: string },
  ) {}
}
