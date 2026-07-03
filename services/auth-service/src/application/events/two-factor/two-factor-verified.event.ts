/**
 * Evento de dominio emitido cuando un usuario completa exitosamente
 * la verificación del código TOTP de 2FA (por ejemplo, al confirmar
 * la activación mostrando los códigos de recuperación).
 *
 * @remarks
 * Consumido por `TwoFactorListener` para registrar auditoría.
 */
export class TwoFactorVerifiedEvent {
  constructor(
    public readonly userId: string,
    public readonly context: { ip: string; country?: string },
  ) {}
}
