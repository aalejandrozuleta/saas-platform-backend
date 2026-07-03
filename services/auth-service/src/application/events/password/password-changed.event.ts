/**
 * Evento de dominio emitido cuando un usuario cambia su contraseña
 * exitosamente.
 *
 * @remarks
 * Consumido por `PasswordChangeListener` (auditoría) y por
 * `NotificationListener`, que envía un correo de alerta de seguridad
 * ("Contraseña cambiada") al email del usuario.
 */
export class PasswordChangedEvent {
  constructor(
    public readonly userId: string,
    public readonly context: {
      ip: string;
      country?: string;
    },
  ) {}
}
