/**
 * Evento de dominio emitido cuando un usuario activa la
 * verificación en dos pasos (2FA) en su cuenta.
 *
 * @remarks
 * Consumido por `TwoFactorListener` (auditoría) y por
 * `NotificationListener`, que envía un correo de confirmación
 * ("Verificación en dos pasos activada") al usuario.
 */
export class TwoFactorEnabledEvent {
  constructor(
    public readonly userId: string,
    public readonly context: { ip: string; country?: string },
  ) {}
}
