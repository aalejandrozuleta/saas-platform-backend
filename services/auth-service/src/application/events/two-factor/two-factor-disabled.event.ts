/**
 * Evento de dominio emitido cuando un usuario desactiva la
 * verificación en dos pasos (2FA) en su cuenta.
 *
 * @remarks
 * Consumido por `TwoFactorListener` (auditoría) y por
 * `NotificationListener`, que envía un correo de alerta
 * ("Verificación en dos pasos desactivada") al usuario.
 */
export class TwoFactorDisabledEvent {
  constructor(
    public readonly userId: string,
    public readonly context: { ip: string; country?: string },
  ) {}
}
